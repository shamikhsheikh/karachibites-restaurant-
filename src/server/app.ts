import express, { Request, Response, NextFunction } from 'express';
import {
  createSession,
  verifySession,
  revokeSession,
  checkRateLimit,
  recordFailedLogin,
  resetRateLimit,
  verifyPassword,
  Session,
} from './auth.ts';
import {
  findUserByIdentifier,
  MENU_ITEMS,
  VALID_BRANCHES,
  STATUS_STEPS,
  DELIVERY_FEE,
  loadOrders,
  saveOrders,
} from './db.ts';

export const app = express();

app.use(express.json());

// Basic Security Headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Helper: Extract session token from Authorization header or HttpOnly cookie
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)kb_session=([^;]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}

// Extend Request type with session
declare global {
  namespace Express {
    interface Request {
      session?: Session;
    }
  }
}

// Authentication Middleware
function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (token) {
    const session = verifySession(token);
    if (session) {
      req.session = session;
    }
  }
  next();
}

app.use(authenticate);

// Middleware: Require any valid authenticated session
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }
  next();
}

// Middleware: Require strict Administrator role
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }

  if (req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Administrator privileges required' });
  }

  next();
}

// Helper to get client IP for rate limiting
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

// ---------------- AUTHENTICATION ENDPOINTS ---------------- //

// POST /api/auth/login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, email, identifier: rawId, password } = req.body || {};
  const identifier = (rawId || username || email || '').trim();

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username/email and password are required' });
  }

  const clientIp = getClientIp(req);
  const rateLimitKey = `${clientIp}_${identifier.toLowerCase()}`;

  // Check rate limit
  const { limited, retryAfterSeconds } = checkRateLimit(rateLimitKey);
  if (limited) {
    return res.status(429).json({
      error: `Too many failed login attempts. Please try again after ${retryAfterSeconds} seconds.`,
      retryAfterSeconds,
    });
  }

  // Lookup user by username or email
  const user = findUserByIdentifier(identifier);

  // Constant-time dummy verification if user not found to prevent timing enumeration
  const dummyHash = '0'.repeat(128);
  const dummySalt = '0'.repeat(32);
  const isMatch = user
    ? verifyPassword(password, user.passwordHash, user.salt)
    : verifyPassword(password, dummyHash, dummySalt);

  if (!user || !isMatch || !user.isActive) {
    recordFailedLogin(rateLimitKey);
    // Generic error message: do not disclose existence of account
    return res.status(401).json({ error: 'Invalid username, email, or password' });
  }

  // Successful login: reset rate limit & issue session
  resetRateLimit(rateLimitKey);
  const session = createSession(user);

  // Set HttpOnly, SameSite cookie
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('kb_session', session.token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });

  return res.status(200).json({
    token: session.token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const token = extractToken(req);
  if (token) {
    revokeSession(token);
  }
  res.clearCookie('kb_session', { path: '/' });
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/me
app.get('/api/auth/me', (req: Request, res: Response) => {
  if (!req.session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  return res.status(200).json({
    user: {
      id: req.session.userId,
      username: req.session.username,
      email: req.session.email,
      role: req.session.role,
    },
  });
});

// ---------------- MENU ENDPOINT ---------------- //

// GET /api/menu
app.get('/api/menu', (_req: Request, res: Response) => {
  res.status(200).json(MENU_ITEMS);
});

// ---------------- ORDERS ENDPOINTS ---------------- //

// POST /api/orders
app.post('/api/orders', (req: Request, res: Response) => {
  const { customer, branch, items, notes } = req.body || {};

  if (!customer || !customer.name || !customer.phone || !customer.address) {
    return res.status(400).json({ error: 'Customer name, phone, and delivery address are required.' });
  }

  const cleanedPhone = customer.phone.replace(/[\s-]/g, '');
  const pkPhoneRegex = /^((\+92)|(0092)|(0))?3[0-9]{9}$/;
  if (!pkPhoneRegex.test(cleanedPhone)) {
    return res.status(400).json({ error: 'Please enter a valid Pakistani mobile number (e.g. 0300-1234567).' });
  }

  if (!VALID_BRANCHES.includes(branch)) {
    return res.status(400).json({ error: `Please select a valid branch (${VALID_BRANCHES.join(', ')}).` });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item.' });
  }

  let subtotal = 0;
  const verifiedItems: any[] = [];

  for (const it of items) {
    const menuItem = MENU_ITEMS.find((m) => m.id === it.id);
    if (!menuItem) {
      return res.status(400).json({ error: `Invalid menu item ID: ${it.id}` });
    }
    const qty = parseInt(it.qty, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: `Invalid quantity for item ${menuItem.name}` });
    }
    subtotal += menuItem.price * qty;
    verifiedItems.push({
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      qty,
    });
  }

  const total = subtotal + DELIVERY_FEE;
  const orderId = `KB-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder = {
    orderId,
    customer: {
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      address: customer.address.trim(),
    },
    branch,
    items: verifiedItems,
    subtotal,
    deliveryFee: DELIVERY_FEE,
    total,
    status: 'Received',
    notes: notes ? notes.trim() : '',
    createdAt: new Date().toISOString(),
  };

  const orders = loadOrders();
  orders.unshift(newOrder);
  saveOrders(orders);

  return res.status(201).json({
    orderId: newOrder.orderId,
    total: newOrder.total,
    status: newOrder.status,
    customer: newOrder.customer,
    branch: newOrder.branch,
    items: newOrder.items,
  });
});

// GET /api/orders/:id
app.get('/api/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const phone = req.query.phone as string | undefined;

  const orders = loadOrders();
  const order = orders.find(
    (o: any) => o.orderId.toLowerCase() === id.toLowerCase()
  );

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const isAdminCaller = req.session && req.session.role === 'admin';

  // If phone query parameter is provided, verify match
  if (phone) {
    const cleanReqPhone = phone.replace(/[\s-]/g, '');
    const cleanOrderPhone = order.customer.phone.replace(/[\s-]/g, '');
    if (!cleanOrderPhone.endsWith(cleanReqPhone.slice(-7)) && !isAdminCaller) {
      return res.status(404).json({ error: 'Order not found or phone number does not match.' });
    }
  }

  // If requester is not verified with phone and not an administrator, mask private address
  const safeCustomer =
    phone || isAdminCaller
      ? order.customer
      : {
          name: order.customer.name,
          phone: '••••••••' + order.customer.phone.slice(-4),
          address: 'Verified Karachi Address (Protected)',
        };

  return res.status(200).json({
    orderId: order.orderId,
    status: order.status,
    items: order.items,
    total: order.total,
    branch: order.branch,
    createdAt: order.createdAt,
    customer: safeCustomer,
    deliveryFee: order.deliveryFee,
  });
});

// ---------------- PROTECTED ADMIN ENDPOINTS ---------------- //

// GET /api/admin/orders?branch=&date=
app.get('/api/admin/orders', requireAdmin, (req: Request, res: Response) => {
  const { branch, date } = req.query;
  let orders = loadOrders();

  if (branch && branch !== 'All') {
    orders = orders.filter((o: any) => o.branch === branch);
  }

  if (date) {
    const filterDateStr = String(date);
    orders = orders.filter((o: any) => {
      const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
      return orderDate === filterDateStr;
    });
  }

  return res.status(200).json(orders);
});

// PATCH /api/admin/orders/:id/status
app.patch('/api/admin/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status: nextStatus } = req.body || {};

  const orders = loadOrders();
  const orderIndex = orders.findIndex(
    (o: any) => o.orderId.toLowerCase() === id.toLowerCase()
  );

  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const order = orders[orderIndex];
  const currentIndex = STATUS_STEPS.indexOf(order.status);
  const targetIndex = STATUS_STEPS.indexOf(nextStatus);

  if (targetIndex === -1) {
    return res.status(400).json({ error: `Invalid status: ${nextStatus}` });
  }

  if (order.status === 'Delivered') {
    return res.status(400).json({ error: 'Order is already Delivered and cannot be modified.' });
  }

  // Strict step-by-step enforcement: must be exactly next step
  if (targetIndex !== currentIndex + 1) {
    return res.status(400).json({
      error: `Invalid status transition from "${order.status}" to "${nextStatus}". Next valid status is "${STATUS_STEPS[currentIndex + 1]}".`,
    });
  }

  order.status = nextStatus;
  order.updatedAt = new Date().toISOString();
  orders[orderIndex] = order;
  saveOrders(orders);

  return res.status(200).json(order);
});
