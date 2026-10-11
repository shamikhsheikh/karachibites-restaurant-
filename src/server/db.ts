import fs from 'fs';
import path from 'path';
import { User, hashPassword } from './auth.ts';

// ---------------- DUAL-MODE STORAGE CONFIGURATION ---------------- //
// MODE 1: Local / Filesystem Storage using DATA_DIR
// MODE 2: Production Cloud Storage using Vercel KV / Upstash REST API

export const DATA_DIR =
  process.env.DATA_DIR ||
  (process.env.VERCEL ? path.join('/tmp', 'karachi_bites_data') : path.join(process.cwd(), 'data'));

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Vercel KV / Upstash Redis REST API credentials (auto-injected by Vercel KV integration)
const KV_REST_API_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const isCloudModeEnabled = Boolean(KV_REST_API_URL && KV_REST_API_TOKEN);

if (isCloudModeEnabled) {
  console.log('[DB] Dual-Mode Storage: Production Vercel KV / Cloud persistence ACTIVE');
} else {
  console.log(`[DB] Dual-Mode Storage: Local filesystem persistence ACTIVE (DATA_DIR="${DATA_DIR}")`);
}

// Ensure data directory exists if writable
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('[DB] Could not create DATA_DIR, using fallback memory storage', err);
  }
}

// In-memory active cache
let memoryUsers: User[] = [];
let memoryOrders: any[] = [];
let hasHydratedFromCloud = false;

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
    image: '/src/assets/images/dish_malai_boti_1791648671107.jpg',
  },
  {
    id: 2,
    name: 'Beef Seekh Kebab',
    category: 'BBQ',
    price: 780,
    tags: ['spicy'],
    available: true,
    description: 'Spiced minced beef skewers prepared with traditional herbs and roasted over charcoal.',
    image: '/src/assets/images/dish_seekh_kebab_1791648685182.jpg',
  },
  {
    id: 3,
    name: 'Mutton Karahi (half)',
    category: 'KARAHI',
    price: 1650,
    tags: ['spicy'],
    available: true,
    description: 'Fresh tender mutton simmered in a rich tomato, ginger and crushed spice reduction in a traditional wok.',
    image: '/src/assets/images/special_mutton_karahi_1791648611986.jpg',
  },
  {
    id: 4,
    name: 'Chicken Karahi (half)',
    category: 'KARAHI',
    price: 1250,
    tags: ['spicy'],
    available: true,
    description: 'Succulent bone-in chicken slow-cooked with fresh tomatoes, green chilies, and julienne ginger.',
    image: '/src/assets/images/dish_chicken_karahi_1791648696527.jpg',
  },
  {
    id: 5,
    name: 'Chicken Biryani',
    category: 'RICE',
    price: 550,
    tags: ['spicy'],
    available: true,
    description: 'Authentic Karachi dum biryani layered with fragrant aged basmati rice, tender chicken, and saffron aromas.',
    image: '/src/assets/images/dish_chicken_biryani_1791648623964.jpg',
  },
  {
    id: 6,
    name: 'Vegetable Pulao',
    category: 'RICE',
    price: 420,
    tags: ['veg'],
    available: true,
    description: 'Fragrant basmati rice gently simmered with garden vegetables, cumin, and whole roasted spices.',
    image: '/src/assets/images/dish_veg_pulao_1791648764948.jpg',
  },
  {
    id: 7,
    name: 'Zinger Paratha Roll',
    category: 'ROLLS',
    price: 450,
    tags: ['spicy'],
    available: true,
    description: 'Crispy fried chicken breast fillet wrapped in a golden layered paratha with spicy garlic cream sauce.',
    image: '/src/assets/images/dish_paratha_roll_1791648709001.jpg',
  },
  {
    id: 8,
    name: 'Paneer Tikka Roll',
    category: 'ROLLS',
    price: 480,
    tags: ['veg'],
    available: true,
    description: 'Chargrilled marinated cottage cheese cubes rolled in crisp paratha with fresh mint chutney.',
    image: '/src/assets/images/dish_paneer_roll_1791648778859.jpg',
  },
  {
    id: 9,
    name: 'Mint Margarita',
    category: 'DRINKS',
    price: 220,
    tags: ['veg'],
    available: true,
    description: 'Refreshing frosty cooler made with freshly muddled garden mint leaves, tangy lime juice, and soda.',
    image: '/src/assets/images/dish_mint_margarita_1791648792040.jpg',
  },
  {
    id: 10,
    name: 'Doodh Patti Chai',
    category: 'DRINKS',
    price: 150,
    tags: ['veg'],
    available: true,
    description: 'Traditional Pakistani karak chai brewed purely in whole milk with crushed green cardamom pods.',
    image: '/src/assets/images/dish_doodh_patti_chai_1791648803039.jpg',
  },
  {
    id: 11,
    name: 'Gulab Jamun (2 pcs)',
    category: 'DESSERTS',
    price: 250,
    tags: ['veg'],
    available: true,
    description: 'Warm, soft milk dumplings soaked in fragrant rose-cardamom syrup and dusted with crushed pistachios.',
    image: '/src/assets/images/dessert_gulab_jamun_kheer_1791648636566.jpg',
  },
  {
    id: 12,
    name: 'Kheer',
    category: 'DESSERTS',
    price: 300,
    tags: ['veg'],
    available: true,
    description: 'Slow-cooked artisanal rice pudding infused with saffron, milk, and garnished with slivered almonds.',
    image: '/src/assets/images/dessert_gulab_jamun_kheer_1791648636566.jpg',
  },
];

export const VALID_BRANCHES = ['Clifton', 'Gulshan-e-Iqbal', 'North Nazimabad'];
export const STATUS_STEPS = ['Received', 'Preparing', 'Out for Delivery', 'Delivered'];
export const DELIVERY_FEE = 150;

// ---------------- VERCEL KV CLOUD REST HELPERS ---------------- //

async function cloudKvGet<T>(key: string): Promise<T | null> {
  if (!isCloudModeEnabled || !KV_REST_API_URL || !KV_REST_API_TOKEN) return null;
  try {
    const res = await fetch(`${KV_REST_API_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.result) {
      return typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
    }
  } catch (err) {
    console.warn(`[DB Cloud] Failed to fetch key ${key} from cloud KV:`, err);
  }
  return null;
}

async function cloudKvSet(key: string, value: any): Promise<void> {
  if (!isCloudModeEnabled || !KV_REST_API_URL || !KV_REST_API_TOKEN) return;
  try {
    await fetch(`${KV_REST_API_URL}/set/${key}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(JSON.stringify(value)),
    });
  } catch (err) {
    console.warn(`[DB Cloud] Failed to persist key ${key} to cloud KV:`, err);
  }
}

/**
 * Hydrate in-memory database from Cloud KV if available (asynchronous)
 */
export async function hydrateFromCloud(): Promise<void> {
  if (!isCloudModeEnabled || hasHydratedFromCloud) return;
  try {
    const [cloudOrders, cloudUsers] = await Promise.all([
      cloudKvGet<any[]>('karachi_bites_orders'),
      cloudKvGet<User[]>('karachi_bites_users'),
    ]);

    if (Array.isArray(cloudOrders) && cloudOrders.length > 0) {
      memoryOrders = cloudOrders;
      saveOrdersToDisk(cloudOrders);
      console.log(`[DB Cloud] Successfully hydrated ${cloudOrders.length} orders from Vercel KV`);
    }

    if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
      memoryUsers = cloudUsers;
      saveUsersToDisk(cloudUsers);
      console.log(`[DB Cloud] Successfully hydrated ${cloudUsers.length} users from Vercel KV`);
    }

    hasHydratedFromCloud = true;
  } catch (err) {
    console.warn('[DB Cloud] Hydration error:', err);
  }
}

// ---------------- FILE SYSTEM DISK HELPERS ---------------- //

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

// ---------------- PUBLIC DATABASE OPERATIONS ---------------- //

/**
 * Load users (returns synchronous in-memory cache, hydrated from disk/cloud)
 */
export function loadUsers(): User[] {
  if (memoryUsers.length > 0) {
    return memoryUsers;
  }
  const diskUsers = loadUsersFromDisk();
  if (diskUsers.length > 0) {
    memoryUsers = diskUsers;
    return memoryUsers;
  }
  return memoryUsers;
}

/**
 * Save users (persists to memory, local disk, and Vercel KV if cloud enabled)
 */
export function saveUsers(users: User[]): void {
  memoryUsers = users;
  saveUsersToDisk(users);
  if (isCloudModeEnabled) {
    cloudKvSet('karachi_bites_users', users).catch(() => {});
  }
}

/**
 * Load orders (returns synchronous in-memory cache, hydrated from disk/cloud)
 */
export function loadOrders(): any[] {
  if (memoryOrders.length > 0) {
    return memoryOrders;
  }
  const diskOrders = loadOrdersFromDisk();
  if (diskOrders.length > 0) {
    memoryOrders = diskOrders;
    return memoryOrders;
  }
  return seedDefaultOrders();
}

/**
 * Save orders (persists to memory, local disk, and Vercel KV if cloud enabled)
 */
export function saveOrders(orders: any[]): void {
  memoryOrders = orders;
  saveOrdersToDisk(orders);
  if (isCloudModeEnabled) {
    cloudKvSet('karachi_bites_orders', orders).catch(() => {});
  }
}

/**
 * Idempotently initialize the Karachi Bites administrator and initial accounts
 */
export function initializeAdminAccount(): void {
  const users = loadUsers();

  const adminUsername = process.env.ADMIN_USERNAME || 'Karachi Bites';
  const adminEmail = (process.env.ADMIN_EMAIL || 'karachibites@gmail.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'KarachiBites@2026!';

  // Find existing administrator account
  let adminUser = users.find((u) => u.role === 'admin');

  if (!adminUser) {
    const { hash, salt } = hashPassword(adminPassword);
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
    console.log(`[DB] Securely provisioned Karachi Bites Administrator (${adminUsername} / ${adminEmail})`);
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
      console.log(`[DB] Updated authorized administrator configuration (${adminUsername})`);
    }
  }

  // Seed normal customer account for role verification tests (Case B)
  const customerEmail = 'customer@karachibites.pk';
  const customerUser = users.find((u) => u.email === customerEmail);
  if (!customerUser) {
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

  saveUsers(users);
}

/**
 * Find user by username or email (case-insensitive)
 */
export function findUserByIdentifier(identifier: string): User | null {
  const users = loadUsers();
  const clean = identifier.trim().toLowerCase();
  return (
    users.find(
      (u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
    ) || null
  );
}

function seedDefaultOrders(): any[] {
  const seeds = [
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
    {
      orderId: 'KB-1003',
      customer: {
        name: 'Bilal Farooq',
        phone: '0333-5551234',
        address: 'House B-14, Block D, North Nazimabad',
      },
      branch: 'North Nazimabad',
      items: [
        { id: 7, name: 'Zinger Paratha Roll', price: 450, qty: 2 },
        { id: 9, name: 'Mint Margarita', price: 220, qty: 2 },
      ],
      subtotal: 1340,
      deliveryFee: 150,
      total: 1490,
      status: 'Delivered',
      notes: '',
      createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    },
  ];
  saveOrders(seeds);
  return seeds;
}

// Initial bootstrap
initializeAdminAccount();
loadOrders();
hydrateFromCloud().catch(() => {});
