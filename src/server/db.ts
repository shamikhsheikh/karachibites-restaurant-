import fs from 'fs';
import path from 'path';
import { User, hashPassword } from './auth.ts';
import { isSupabaseConfigured, getSupabaseClient } from './supabase.ts';

// ---------------- STORAGE CONFIGURATION ---------------- //
const isProduction = process.env.NODE_ENV === 'production';

export const DATA_DIR =
  process.env.DATA_DIR ||
  (process.env.VERCEL ? path.join('/tmp', 'karachi_bites_data') : path.join(process.cwd(), 'data'));

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Ensure local fallback directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('[DB] Could not create DATA_DIR:', err);
  }
}

// In-memory fallback caches for local development
let memoryUsers: User[] = [];
let memoryOrders: any[] = [];

// ---------------- ORIGINAL KARACHI BITES MENU (DO NOT MODIFY) ---------------- //
export const MENU_ITEMS = [
  {
    id: 1,
    name: 'Chicken Malai Boti',
    category: 'BBQ',
    price: 850,
    tags: ['mild'],
    available: true,
    description: 'Tender boneless chicken marinated in a creamy blend of mild spices, grilled to smoky perfection.',
    image: '/images/dish_malai_boti_1791648671107.jpg',
  },
  {
    id: 2,
    name: 'Beef Seekh Kebab',
    category: 'BBQ',
    price: 780,
    tags: ['spicy'],
    available: true,
    description: 'Spiced minced beef skewers prepared with traditional herbs and roasted over charcoal.',
    image: '/images/dish_seekh_kebab_1791648685182.jpg',
  },
  {
    id: 3,
    name: 'Mutton Karahi (half)',
    category: 'KARAHI',
    price: 1650,
    tags: ['spicy'],
    available: true,
    description: 'Fresh tender mutton simmered in a rich tomato, ginger and crushed spice reduction in a traditional wok.',
    image: '/images/special_mutton_karahi_1791648611986.jpg',
  },
  {
    id: 4,
    name: 'Chicken Karahi (half)',
    category: 'KARAHI',
    price: 1250,
    tags: ['spicy'],
    available: true,
    description: 'Succulent bone-in chicken slow-cooked with fresh tomatoes, green chilies, and julienne ginger.',
    image: '/images/dish_chicken_karahi_1791648696527.jpg',
  },
  {
    id: 5,
    name: 'Chicken Biryani',
    category: 'RICE',
    price: 550,
    tags: ['spicy'],
    available: true,
    description: 'Authentic Karachi dum biryani layered with fragrant aged basmati rice, tender chicken, and saffron aromas.',
    image: '/images/dish_chicken_biryani_1791648623964.jpg',
  },
  {
    id: 6,
    name: 'Vegetable Pulao',
    category: 'RICE',
    price: 420,
    tags: ['veg'],
    available: true,
    description: 'Fragrant basmati rice gently simmered with garden vegetables, cumin, and whole roasted spices.',
    image: '/images/dish_veg_pulao_1791648764948.jpg',
  },
  {
    id: 7,
    name: 'Zinger Paratha Roll',
    category: 'ROLLS',
    price: 450,
    tags: ['spicy'],
    available: true,
    description: 'Crispy fried chicken breast fillet wrapped in a golden layered paratha with spicy garlic cream sauce.',
    image: '/images/dish_paratha_roll_1791648709001.jpg',
  },
  {
    id: 8,
    name: 'Paneer Tikka Roll',
    category: 'ROLLS',
    price: 480,
    tags: ['veg'],
    available: true,
    description: 'Chargrilled marinated cottage cheese cubes rolled in crisp paratha with fresh mint chutney.',
    image: '/images/dish_paneer_roll_1791648778859.jpg',
  },
  {
    id: 9,
    name: 'Mint Margarita',
    category: 'DRINKS',
    price: 220,
    tags: ['veg'],
    available: true,
    description: 'Refreshing frosty cooler made with freshly muddled garden mint leaves, tangy lime juice, and soda.',
    image: '/images/dish_mint_margarita_1791648792040.jpg',
  },
  {
    id: 10,
    name: 'Doodh Patti Chai',
    category: 'DRINKS',
    price: 150,
    tags: ['veg'],
    available: true,
    description: 'Traditional Pakistani karak chai brewed purely in whole milk with crushed green cardamom pods.',
    image: '/images/dish_doodh_patti_chai_1791648803039.jpg',
  },
  {
    id: 11,
    name: 'Gulab Jamun (2 pcs)',
    category: 'DESSERTS',
    price: 250,
    tags: ['veg'],
    available: true,
    description: 'Warm, soft milk dumplings soaked in fragrant rose-cardamom syrup and dusted with crushed pistachios.',
    image: '/images/dish_gulab_jamun_1791806796117.jpg',
  },
  {
    id: 12,
    name: 'Kheer',
    category: 'DESSERTS',
    price: 300,
    tags: ['veg'],
    available: true,
    description: 'Slow-cooked artisanal rice pudding infused with saffron, milk, and garnished with slivered almonds.',
    image: '/images/dish_kheer_1791806206708.jpg',
  },
];

export const VALID_BRANCHES = ['Clifton', 'Gulshan-e-Iqbal', 'North Nazimabad'];
export const STATUS_STEPS = ['Received', 'Preparing', 'Out for Delivery', 'Delivered'];
export const DELIVERY_FEE = 150;

// ---------------- LOCAL DEVELOPMENT JSON HELPERS ---------------- //

function loadUsersFromDisk(): User[] {
  if (fs.existsSync(USERS_FILE)) {
    try {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
}

function saveUsersToDisk(users: User[]): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[DB] Failed to persist users to disk', err);
  }
}

function loadOrdersFromDisk(): any[] {
  if (fs.existsSync(ORDERS_FILE)) {
    try {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
}

function saveOrdersToDisk(orders: any[]): void {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[DB] Failed to persist orders to disk', err);
  }
}

function seedLocalDevOrders(): any[] {
  return [
    {
      orderId: 'KB-1001',
      customer: {
        name: 'Hamza Khan',
        phone: '0300-1234567',
        address: 'House 42, Street 8, Block 4, Clifton',
      },
      branch: 'Clifton',
      items: [
        { id: 1, name: 'Chicken Malai Boti', price: 850, qty: 2 },
        { id: 5, name: 'Chicken Biryani', price: 550, qty: 1 },
      ],
      subtotal: 2250,
      deliveryFee: 150,
      total: 2400,
      status: 'Out for Delivery',
      notes: 'Please bring mint chutney extra.',
      createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    },
    {
      orderId: 'KB-1002',
      customer: {
        name: 'Ayesha Siddiqui',
        phone: '0321-9876543',
        address: 'Apartment 5B, Al-Noor Heights, Gulshan-e-Iqbal',
      },
      branch: 'Gulshan-e-Iqbal',
      items: [
        { id: 3, name: 'Mutton Karahi (half)', price: 1650, qty: 1 },
        { id: 10, name: 'Doodh Patti Chai', price: 150, qty: 2 },
      ],
      subtotal: 1950,
      deliveryFee: 150,
      total: 2100,
      status: 'Preparing',
      notes: 'Make it medium spicy.',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
  ];
}

// ---------------- USER OPERATIONS (SUPABASE + LOCAL) ---------------- //

/**
 * Find user by username or email (case-insensitive)
 */
export async function findUserByIdentifier(identifier: string): Promise<User | null> {
  const clean = identifier.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`username.ilike.${clean},email.ilike.${clean}`)
        .limit(1)
        .maybeSingle();

      if (error) {
        if (
          error.code === 'PGRST205' ||
          error.code === '42P01' ||
          error.message?.includes('schema cache') ||
          error.message?.includes('does not exist')
        ) {
          console.warn('[DB Supabase] Table "public.users" not found in Supabase schema cache. Falling back to local store.');
          const users = loadUsersSync();
          return users.find((u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean) || null;
        }
        console.error('[DB Supabase] Error querying user:', error.message);
        throw new Error('Database query failure');
      }

      if (!data) {
        if (process.env.NODE_ENV !== 'production') {
          const users = loadUsersSync();
          return users.find((u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean) || null;
        }
        return null;
      }

      return {
        id: data.id,
        username: data.username,
        email: data.email,
        passwordHash: data.password_hash,
        salt: data.salt,
        role: data.role as 'admin' | 'customer',
        isActive: data.is_active,
        createdAt: data.created_at,
      };
    } catch (err: any) {
      if (isProduction && !err.message?.includes('schema cache')) {
        throw err;
      }
      console.warn('[DB] Falling back to local users for query failure:', err.message);
    }
  }

  // Local development fallback
  const users = loadUsersSync();
  return users.find((u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean) || null;
}

/**
 * Synchronous local users helper (for local dev fallback)
 */
export function loadUsersSync(): User[] {
  if (memoryUsers.length > 0) return memoryUsers;
  const disk = loadUsersFromDisk();
  if (disk.length > 0) {
    memoryUsers = disk;
    return memoryUsers;
  }
  return memoryUsers;
}

/**
 * Synchronous local save helper (for local dev fallback)
 */
export function saveUsersSync(users: User[]): void {
  memoryUsers = users;
  saveUsersToDisk(users);
}

/**
 * Helper to ensure local admin account exists
 */
function ensureLocalAdmin(effectivePassword: string, adminUsername: string, adminEmail: string) {
  const users = loadUsersSync();
  let adminUser = users.find((u) => u.role === 'admin');

  if (!adminUser) {
    const { hash, salt } = hashPassword(effectivePassword);
    adminUser = {
      id: 'usr_admin_kb',
      username: adminUsername,
      email: adminEmail,
      passwordHash: hash,
      salt,
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    users.push(adminUser);
    console.log(`[DB Local] Provisioned local admin "${adminUsername}"`);
  } else {
    let modified = false;
    if (adminUser.username !== adminUsername) {
      adminUser.username = adminUsername;
      modified = true;
    }
    if (adminUser.email !== adminEmail) {
      adminUser.email = adminEmail;
      modified = true;
    }
    if (process.env.ADMIN_PASSWORD) {
      const { hash, salt } = hashPassword(process.env.ADMIN_PASSWORD);
      adminUser.passwordHash = hash;
      adminUser.salt = salt;
      modified = true;
    }
    if (modified) {
      console.log(`[DB Local] Updated administrator record for "${adminUsername}"`);
    }
  }

  // Seed test customer account only in development
  const customerEmail = 'customer@karachibites.pk';
  if (!users.some((u) => u.email === customerEmail)) {
    const { hash, salt } = hashPassword('CustomerPass123!');
    users.push({
      id: 'usr_customer_demo',
      username: 'customer_ali',
      email: customerEmail,
      passwordHash: hash,
      salt,
      role: 'customer',
      isActive: true,
      createdAt: new Date().toISOString(),
    });
  }

  saveUsersSync(users);
}

/**
 * Idempotently initialize the Karachi Bites administrator in Supabase or local storage
 */
export async function initializeAdminAccount(): Promise<void> {
  const adminUsername = process.env.ADMIN_USERNAME || 'Karachi Bites';
  const adminEmail = (process.env.ADMIN_EMAIL || 'karachibites@gmail.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;

  const effectivePassword = adminPassword || 'KarachiBites@2026!';

  // Always prepare local storage so app works offline / locally
  ensureLocalAdmin(effectivePassword, adminUsername, adminEmail);

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      const { data: existingAdmin, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin')
        .limit(1)
        .maybeSingle();

      if (queryError) {
        if (
          queryError.code === 'PGRST205' ||
          queryError.code === '42P01' ||
          queryError.message.includes('schema cache') ||
          queryError.message.includes('does not exist')
        ) {
          console.warn(
            '[DB Supabase Notice] Table "public.users" not found in Supabase schema cache. Run "supabase/schema.sql" in your Supabase SQL Editor to enable full cloud database features.'
          );
          return;
        }
        console.error('[DB Supabase] Error checking admin account:', queryError.message);
        return;
      }

      if (!existingAdmin) {
        // Hash password securely
        const { hash, salt } = hashPassword(effectivePassword);
        const { error: insertError } = await supabase.from('users').insert({
          id: 'usr_admin_kb',
          username: adminUsername,
          email: adminEmail,
          password_hash: hash,
          salt: salt,
          role: 'admin',
          is_active: true,
        });

        if (insertError) {
          console.error('[DB Supabase] Error inserting admin account:', insertError.message);
        } else {
          console.log(`[DB Supabase] Successfully provisioned administrator "${adminUsername}" (${adminEmail}) in Supabase`);
        }
      } else {
        let needsUpdate = false;
        const updates: any = {};

        if (existingAdmin.username !== adminUsername) {
          updates.username = adminUsername;
          needsUpdate = true;
        }
        if (existingAdmin.email !== adminEmail) {
          updates.email = adminEmail;
          needsUpdate = true;
        }
        if (adminPassword) {
          const { hash, salt } = hashPassword(adminPassword);
          updates.password_hash = hash;
          updates.salt = salt;
          needsUpdate = true;
        }

        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from('users')
            .update(updates)
            .eq('id', existingAdmin.id);

          if (updateError) {
            console.error('[DB Supabase] Error updating admin account:', updateError.message);
          } else {
            console.log(`[DB Supabase] Updated administrator credentials for "${adminUsername}"`);
          }
        }
      }
    } catch (err: any) {
      console.warn('[DB Supabase] Admin sync warning:', err.message);
    }
  }
}

// ---------------- ORDER OPERATIONS (SUPABASE + LOCAL) ---------------- //

function mapRowToOrder(row: any) {
  return {
    orderId: row.order_id,
    customer: {
      name: row.customer_name,
      phone: row.customer_phone,
      address: row.customer_address,
    },
    branch: row.branch,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    status: row.status,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Fetch orders with optional branch and date filters
 */
export async function getOrders(filter?: { branch?: string; date?: string }): Promise<any[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

      if (filter?.branch && filter.branch !== 'All') {
        query = query.eq('branch', filter.branch);
      }

      if (filter?.date) {
        const startDate = `${filter.date}T00:00:00.000Z`;
        const endDate = `${filter.date}T23:59:59.999Z`;
        query = query.gte('created_at', startDate).lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) {
        if (
          error.code === 'PGRST205' ||
          error.code === '42P01' ||
          error.message?.includes('schema cache') ||
          error.message?.includes('does not exist')
        ) {
          console.warn('[DB Supabase] Table "public.orders" not found in Supabase schema cache. Using local orders.');
        } else {
          console.error('[DB Supabase] Error fetching orders:', error.message);
        }
      } else if (data) {
        return data.map(mapRowToOrder);
      }
    } catch (err: any) {
      console.warn('[DB Supabase] Orders query fallback:', err.message);
    }
  }

  // Local development fallback
  let orders = loadOrdersSync();
  if (filter?.branch && filter.branch !== 'All') {
    orders = orders.filter((o: any) => o.branch === filter.branch);
  }
  if (filter?.date) {
    orders = orders.filter((o: any) => {
      const d = new Date(o.createdAt).toISOString().split('T')[0];
      return d === filter.date;
    });
  }
  return orders;
}

/**
 * Fetch a single order by ID
 */
export async function getOrderById(orderId: string): Promise<any | null> {
  const cleanId = orderId.trim();

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .ilike('order_id', cleanId)
        .limit(1)
        .maybeSingle();

      if (error) {
        if (
          error.code === 'PGRST205' ||
          error.code === '42P01' ||
          error.message?.includes('schema cache') ||
          error.message?.includes('does not exist')
        ) {
          console.warn('[DB Supabase] Table "public.orders" not found in Supabase schema cache. Using local store.');
        } else {
          console.error('[DB Supabase] Error fetching order by ID:', error.message);
        }
      } else if (data) {
        return mapRowToOrder(data);
      }
    } catch (err: any) {
      console.warn('[DB Supabase] Order query fallback:', err.message);
    }
  }

  // Local fallback
  const orders = loadOrdersSync();
  return orders.find((o: any) => o.orderId.toLowerCase() === cleanId.toLowerCase()) || null;
}

/**
 * Create a new customer order
 */
export async function createOrder(order: any): Promise<any> {
  // Always persist to local storage first for resilience
  const localOrders = loadOrdersSync();
  localOrders.unshift(order);
  saveOrdersSync(localOrders);

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      const row = {
        order_id: order.orderId,
        customer_name: order.customer.name,
        customer_phone: order.customer.phone,
        customer_address: order.customer.address,
        branch: order.branch,
        items: order.items,
        subtotal: order.subtotal,
        delivery_fee: order.deliveryFee,
        total: order.total,
        status: order.status || 'Received',
        notes: order.notes || '',
        created_at: order.createdAt || new Date().toISOString(),
      };

      const { data, error } = await supabase.from('orders').insert(row).select().single();

      if (error) {
        if (
          error.code === 'PGRST205' ||
          error.code === '42P01' ||
          error.message?.includes('schema cache') ||
          error.message?.includes('does not exist')
        ) {
          console.warn('[DB Supabase] Table "public.orders" not found in Supabase schema cache. Order saved locally.');
        } else {
          console.error('[DB Supabase] Error creating order in Supabase:', error.message);
        }
      } else if (data) {
        return mapRowToOrder(data);
      }
    } catch (err: any) {
      console.warn('[DB Supabase] Order insert fallback:', err.message);
    }
  }

  return order;
}

/**
 * Update order status with strict one-step verification
 */
export async function updateOrderStatus(orderId: string, nextStatus: string): Promise<any> {
  const cleanId = orderId.trim();

  // Retrieve current order to verify status rules
  const currentOrder = await getOrderById(cleanId);
  if (!currentOrder) {
    const notFoundErr: any = new Error('Order not found');
    notFoundErr.statusCode = 404;
    throw notFoundErr;
  }

  const currentIndex = STATUS_STEPS.indexOf(currentOrder.status);
  const targetIndex = STATUS_STEPS.indexOf(nextStatus);

  if (targetIndex === -1) {
    const invalidErr: any = new Error(`Invalid status: ${nextStatus}`);
    invalidErr.statusCode = 400;
    throw invalidErr;
  }

  if (currentOrder.status === 'Delivered') {
    const deliveredErr: any = new Error('Order is already Delivered and cannot be modified.');
    deliveredErr.statusCode = 400;
    throw deliveredErr;
  }

  // Enforce strictly 1-step progression
  if (targetIndex !== currentIndex + 1) {
    const stepErr: any = new Error(
      `Invalid status transition from "${currentOrder.status}" to "${nextStatus}". Next valid status is "${STATUS_STEPS[currentIndex + 1]}".`
    );
    stepErr.statusCode = 400;
    throw stepErr;
  }

  // Update local storage
  const orders = loadOrdersSync();
  const idx = orders.findIndex((o: any) => o.orderId.toLowerCase() === cleanId.toLowerCase());
  let updatedOrder = { ...currentOrder, status: nextStatus, updatedAt: new Date().toISOString() };
  if (idx !== -1) {
    orders[idx].status = nextStatus;
    orders[idx].updatedAt = new Date().toISOString();
    saveOrdersSync(orders);
    updatedOrder = orders[idx];
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .ilike('order_id', cleanId)
        .select()
        .single();

      if (error) {
        if (
          error.code === 'PGRST205' ||
          error.code === '42P01' ||
          error.message?.includes('schema cache') ||
          error.message?.includes('does not exist')
        ) {
          console.warn('[DB Supabase] Table "public.orders" not found in Supabase schema cache. Status updated locally.');
        } else {
          console.error('[DB Supabase] Error updating order status:', error.message);
        }
      } else if (data) {
        return mapRowToOrder(data);
      }
    } catch (err: any) {
      console.warn('[DB Supabase] Status update fallback:', err.message);
    }
  }

  return updatedOrder;
}

/**
 * Synchronous local orders helper (for local dev fallback)
 */
export function loadOrdersSync(): any[] {
  if (memoryOrders.length > 0) return memoryOrders;
  const disk = loadOrdersFromDisk();
  if (disk.length > 0) {
    memoryOrders = disk;
    return memoryOrders;
  }
  if (!isProduction) {
    memoryOrders = seedLocalDevOrders();
    saveOrdersToDisk(memoryOrders);
    return memoryOrders;
  }
  return [];
}

/**
 * Synchronous local save helper (for local dev fallback)
 */
export function saveOrdersSync(orders: any[]): void {
  memoryOrders = orders;
  saveOrdersToDisk(orders);
}

// Initial bootstrap
initializeAdminAccount().catch((err) => {
  console.warn('[DB Startup Notice]:', err.message);
});
