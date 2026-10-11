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
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  MENU_ITEMS,
  VALID_BRANCHES,
  DELIVERY_FEE,
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
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
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

    // Lookup user by username or email from database
    const user = await findUserByIdentifier(identifier);

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
  } catch (err: any) {
    console.error('[API Login Error]:', err.message);
    return res.status(500).json({ error: 'Authentication service temporarily unavailable' });
  }
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
app.post('/api/orders', async (req: Request, res: Response) => {
  try {
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

    const newOrderPayload = {
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

    const savedOrder = await createOrder(newOrderPayload);

    return res.status(201).json({
      orderId: savedOrder.orderId,
      total: savedOrder.total,
      status: savedOrder.status,
      customer: savedOrder.customer,
      branch: savedOrder.branch,
      items: savedOrder.items,
    });
  } catch (err: any) {
    console.error('[API Create Order Error]:', err.message);
    return res.status(500).json({ error: 'Unable to process order. Please try again.' });
  }
});

// GET /api/orders/:id
app.get('/api/orders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const phone = req.query.phone as string | undefined;

    const order = await getOrderById(id);

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
  } catch (err: any) {
    console.error('[API Get Order Error]:', err.message);
    return res.status(500).json({ error: 'Unable to retrieve order details.' });
  }
});

// ---------------- PROTECTED ADMIN ENDPOINTS ---------------- //

// GET /api/admin/orders?branch=&date=
app.get('/api/admin/orders', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { branch, date } = req.query;
    const orders = await getOrders({
      branch: typeof branch === 'string' ? branch : undefined,
      date: typeof date === 'string' ? date : undefined,
    });

    return res.status(200).json(orders);
  } catch (err: any) {
    console.error('[API Admin Orders Error]:', err.message);
    return res.status(500).json({ error: 'Unable to retrieve orders queue' });
  }
});

// PATCH /api/admin/orders/:id/status
app.patch('/api/admin/orders/:id/status', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status: nextStatus } = req.body || {};

    if (!nextStatus) {
      return res.status(400).json({ error: 'Target status is required' });
    }

    const updated = await updateOrderStatus(id, nextStatus);
    return res.status(200).json(updated);
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    if (statusCode !== 500) {
      return res.status(statusCode).json({ error: err.message });
    }
    console.error('[API Admin Status Error]:', err.message);
    return res.status(500).json({ error: 'Failed to update order status' });
  }
});
