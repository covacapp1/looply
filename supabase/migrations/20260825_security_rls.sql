-- ============================================================
-- SECURITY MIGRATION: RLS + merchant_id for loyalty tables
-- Execute this in Supabase SQL Editor
-- ============================================================

-- 1. Add merchant_id to loyalty_rewards
ALTER TABLE loyalty_rewards ADD COLUMN IF NOT EXISTS merchant_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_merchant ON loyalty_rewards(merchant_id);

-- 2. Add merchant_id to customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS merchant_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_customers_merchant ON customers(merchant_id);

-- ============================================================
-- 3. ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stamp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuenta_corriente ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY; -- table does not exist
-- notifications: table does not exist, skip
-- user_notifications: table does not exist, skip

-- ============================================================
-- 4. DROP EXISTING POLICIES (clean slate, ignore errors)
-- ============================================================
DO $$ BEGIN
  -- loyalty_rewards
  DROP POLICY IF EXISTS "loyalty_rewards_select_public" ON loyalty_rewards;
  DROP POLICY IF EXISTS "loyalty_rewards_insert_auth" ON loyalty_rewards;
  DROP POLICY IF EXISTS "loyalty_rewards_update_auth" ON loyalty_rewards;
  DROP POLICY IF EXISTS "loyalty_rewards_delete_auth" ON loyalty_rewards;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "customers_select_public" ON customers;
  DROP POLICY IF EXISTS "customers_insert_public" ON customers;
  DROP POLICY IF EXISTS "customers_update_public" ON customers;
  DROP POLICY IF EXISTS "customers_delete_auth" ON customers;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "stamp_history_insert_public" ON stamp_history;
  DROP POLICY IF EXISTS "stamp_history_select_auth" ON stamp_history;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "shop_customers_select_public" ON shop_customers;
  DROP POLICY IF EXISTS "shop_customers_insert_public" ON shop_customers;
  DROP POLICY IF EXISTS "shop_customers_update_auth" ON shop_customers;
  DROP POLICY IF EXISTS "shop_customers_delete_auth" ON shop_customers;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "menu_items_select_public" ON menu_items;
  DROP POLICY IF EXISTS "menu_items_insert_auth" ON menu_items;
  DROP POLICY IF EXISTS "menu_items_update_auth" ON menu_items;
  DROP POLICY IF EXISTS "menu_items_delete_auth" ON menu_items;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "orders_select_public" ON orders;
  DROP POLICY IF EXISTS "orders_insert_public" ON orders;
  DROP POLICY IF EXISTS "orders_update_auth" ON orders;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "sales_select_auth" ON sales;
  DROP POLICY IF EXISTS "sales_insert_auth" ON sales;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "daily_registers_select_auth" ON daily_registers;
  DROP POLICY IF EXISTS "daily_registers_insert_auth" ON daily_registers;
  DROP POLICY IF EXISTS "daily_registers_update_auth" ON daily_registers;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "cuenta_corriente_select_auth" ON cuenta_corriente;
  DROP POLICY IF EXISTS "cuenta_corriente_insert_auth" ON cuenta_corriente;
  DROP POLICY IF EXISTS "cuenta_corriente_update_auth" ON cuenta_corriente;
  DROP POLICY IF EXISTS "cuenta_corriente_delete_auth" ON cuenta_corriente;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "business_settings_select_public" ON business_settings;
  DROP POLICY IF EXISTS "business_settings_insert_auth" ON business_settings;
  DROP POLICY IF EXISTS "business_settings_update_auth" ON business_settings;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "app_users_select_public" ON app_users;
  DROP POLICY IF EXISTS "app_users_insert_public" ON app_users;
  DROP POLICY IF EXISTS "app_users_update_public" ON app_users;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  -- DROP POLICY IF EXISTS "push_subscriptions_all" ON push_subscriptions; -- table does not exist
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- notifications: table does not exist, skip

-- user_notifications: table does not exist, skip

-- ============================================================
-- 5. CREATE RLS POLICIES
-- ============================================================

-- ---------- menu_items ----------
-- Public can read (shop needs it), auth scoped by merchant can write
CREATE POLICY "menu_items_select_public" ON menu_items
  FOR SELECT USING (true);
CREATE POLICY "menu_items_insert_auth" ON menu_items
  FOR INSERT WITH CHECK (auth.uid() = merchant_id);
CREATE POLICY "menu_items_update_auth" ON menu_items
  FOR UPDATE USING (auth.uid() = merchant_id);
CREATE POLICY "menu_items_delete_auth" ON menu_items
  FOR DELETE USING (auth.uid() = merchant_id);

-- ---------- business_settings ----------
-- Public can read (shop needs name, hours, etc.), auth scoped by user_id
CREATE POLICY "business_settings_select_public" ON business_settings
  FOR SELECT USING (true);
CREATE POLICY "business_settings_insert_auth" ON business_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "business_settings_update_auth" ON business_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- ---------- shop_customers ----------
-- Public read/write needed for shop registration and orders
CREATE POLICY "shop_customers_select_public" ON shop_customers
  FOR SELECT USING (true);
CREATE POLICY "shop_customers_insert_public" ON shop_customers
  FOR INSERT WITH CHECK (true);
CREATE POLICY "shop_customers_update_public" ON shop_customers
  FOR UPDATE USING (true);

-- ---------- orders ----------
-- Public can insert (shop ordering), public read (app filters by merchant_id in code)
CREATE POLICY "orders_select_public" ON orders
  FOR SELECT USING (true);
CREATE POLICY "orders_insert_public" ON orders
  FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update_public" ON orders
  FOR UPDATE USING (true);

-- ---------- loyalty_rewards ----------
-- Public read (QR page needs reward details), auth write scoped by merchant
CREATE POLICY "loyalty_rewards_select_public" ON loyalty_rewards
  FOR SELECT USING (true);
CREATE POLICY "loyalty_rewards_insert_auth" ON loyalty_rewards
  FOR INSERT WITH CHECK (auth.uid() = merchant_id);
CREATE POLICY "loyalty_rewards_update_auth" ON loyalty_rewards
  FOR UPDATE USING (auth.uid() = merchant_id);
CREATE POLICY "loyalty_rewards_delete_auth" ON loyalty_rewards
  FOR DELETE USING (auth.uid() = merchant_id);

-- ---------- customers ----------
-- Public read/write (QR flow: registration, stamp addition)
CREATE POLICY "customers_select_public" ON customers
  FOR SELECT USING (true);
CREATE POLICY "customers_insert_public" ON customers
  FOR INSERT WITH CHECK (true);
CREATE POLICY "customers_update_public" ON customers
  FOR UPDATE USING (true);
CREATE POLICY "customers_delete_public" ON customers
  FOR DELETE USING (true);

-- ---------- stamp_history ----------
-- Public insert (stamp addition from QR), public read (app filters in code)
CREATE POLICY "stamp_history_insert_public" ON stamp_history
  FOR INSERT WITH CHECK (true);
CREATE POLICY "stamp_history_select_public" ON stamp_history
  FOR SELECT USING (true);

-- ---------- sales ----------
-- Auth only, scoped by merchant_id
CREATE POLICY "sales_select_auth" ON sales
  FOR SELECT USING (auth.uid() = merchant_id);
CREATE POLICY "sales_insert_auth" ON sales
  FOR INSERT WITH CHECK (auth.uid() = merchant_id);

-- ---------- daily_registers ----------
-- Auth only, scoped by merchant_id
CREATE POLICY "daily_registers_select_auth" ON daily_registers
  FOR SELECT USING (auth.uid() = merchant_id);
CREATE POLICY "daily_registers_insert_auth" ON daily_registers
  FOR INSERT WITH CHECK (auth.uid() = merchant_id);
CREATE POLICY "daily_registers_update_auth" ON daily_registers
  FOR UPDATE USING (auth.uid() = merchant_id);

-- ---------- cuenta_corriente ----------
-- Auth only, scoped by merchant_id
CREATE POLICY "cuenta_corriente_select_auth" ON cuenta_corriente
  FOR SELECT USING (auth.uid() = merchant_id);
CREATE POLICY "cuenta_corriente_insert_auth" ON cuenta_corriente
  FOR INSERT WITH CHECK (auth.uid() = merchant_id);
CREATE POLICY "cuenta_corriente_update_auth" ON cuenta_corriente
  FOR UPDATE USING (auth.uid() = merchant_id);
CREATE POLICY "cuenta_corriente_delete_auth" ON cuenta_corriente
  FOR DELETE USING (auth.uid() = merchant_id);

-- ---------- app_users ----------
-- Public read (needed for auth lookup), public insert (signup)
CREATE POLICY "app_users_select_public" ON app_users
  FOR SELECT USING (true);
CREATE POLICY "app_users_insert_public" ON app_users
  FOR INSERT WITH CHECK (true);
CREATE POLICY "app_users_update_public" ON app_users
  FOR UPDATE USING (true);

-- push_subscriptions: table does not exist, skip

-- notifications: table does not exist, skip

-- user_notifications: table does not exist, skip
