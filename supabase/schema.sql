-- ====================================================================
-- KARACHI BITES — SUPABASE POSTGRESQL PRODUCTION DATABASE SCHEMA
-- ====================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. USERS TABLE
-- Stores administrator and customer accounts with salted scrypt hashes
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY DEFAULT ('usr_' || substr(md5(random()::text), 1, 12)),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'customer')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast case-insensitive lookups on username and email
CREATE INDEX IF NOT EXISTS idx_users_username_lower ON public.users (LOWER(username));
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON public.users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);

-- --------------------------------------------------------------------
-- 2. ORDERS TABLE
-- Stores customer orders with verified items, server totals & statuses
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  order_id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  branch TEXT NOT NULL CHECK (branch IN ('Clifton', 'Gulshan-e-Iqbal', 'North Nazimabad')),
  items JSONB NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
  total NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Received', 'Preparing', 'Out for Delivery', 'Delivered')) DEFAULT 'Received',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes for dispatch filtering and queries
CREATE INDEX IF NOT EXISTS idx_orders_branch ON public.orders (branch);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders (customer_phone);

-- --------------------------------------------------------------------
-- 3. AUTOMATIC UPDATED_AT TIMESTAMP FUNCTION & TRIGGERS
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- --------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- Enforces backend service-role authorization and shields private data
-- --------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow full access to backend service role (SUPABASE_SERVICE_ROLE_KEY)
DROP POLICY IF EXISTS "Service role has full access to users" ON public.users;
CREATE POLICY "Service role has full access to users"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to orders" ON public.orders;
CREATE POLICY "Service role has full access to orders"
ON public.orders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
