-- ============================================
-- BRANZAG Database Reset - Full Schema
-- ============================================

-- 1. menu_categories
CREATE TABLE IF NOT EXISTS menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  icon text DEFAULT '☕',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 2. menu_items (used for everything: menu, hero, settings, etc.)
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  description text,
  price numeric DEFAULT 0,
  category text NOT NULL DEFAULT 'drinks',
  image text,
  blur_data text,
  calories integer DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 3. orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_ref text,
  table_number integer NOT NULL,
  customer_name text,
  notes text,
  items jsonb DEFAULT '[]',
  total_price numeric DEFAULT 0,
  status text DEFAULT 'new',
  payment_method text DEFAULT 'cash',
  created_at timestamptz DEFAULT now()
);

-- 4. contact_messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text,
  phone text,
  message text,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- Enable realtime (skip if already added)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'orders') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'menu_items') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'menu_categories') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE menu_categories;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'contact_messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE contact_messages;
  END IF;
END $$;

-- ============================================
-- RLS Policies (LOCKED DOWN)
-- ============================================

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- menu_items: anon can read, only authenticated can write
DROP POLICY IF EXISTS "Allow all menu_items" ON menu_items;
DROP POLICY IF EXISTS "menu_items_select" ON menu_items;
DROP POLICY IF EXISTS "menu_items_insert" ON menu_items;
DROP POLICY IF EXISTS "menu_items_update" ON menu_items;
DROP POLICY IF EXISTS "menu_items_delete" ON menu_items;
CREATE POLICY "menu_items_select" ON menu_items FOR SELECT USING (true);
CREATE POLICY "menu_items_insert" ON menu_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "menu_items_update" ON menu_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "menu_items_delete" ON menu_items FOR DELETE USING (auth.role() = 'authenticated');

-- menu_categories: anon can read, only authenticated can write
DROP POLICY IF EXISTS "Allow all menu_categories" ON menu_categories;
DROP POLICY IF EXISTS "menu_categories_select" ON menu_categories;
DROP POLICY IF EXISTS "menu_categories_insert" ON menu_categories;
DROP POLICY IF EXISTS "menu_categories_update" ON menu_categories;
DROP POLICY IF EXISTS "menu_categories_delete" ON menu_categories;
CREATE POLICY "menu_categories_select" ON menu_categories FOR SELECT USING (true);
CREATE POLICY "menu_categories_insert" ON menu_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "menu_categories_update" ON menu_categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "menu_categories_delete" ON menu_categories FOR DELETE USING (auth.role() = 'authenticated');

-- orders: anon can insert (place order) and read, only authenticated can update/delete
DROP POLICY IF EXISTS "Allow all orders" ON orders;
DROP POLICY IF EXISTS "orders_insert" ON orders;
DROP POLICY IF EXISTS "orders_select" ON orders;
DROP POLICY IF EXISTS "orders_update" ON orders;
DROP POLICY IF EXISTS "orders_delete" ON orders;
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_select" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_update" ON orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "orders_delete" ON orders FOR DELETE USING (auth.role() = 'authenticated');

-- contact_messages: anon can insert (send message), only authenticated can read/update/delete
DROP POLICY IF EXISTS "Allow all contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_insert" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_select" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_update" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_delete" ON contact_messages;
CREATE POLICY "contact_messages_insert" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_messages_select" ON contact_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "contact_messages_update" ON contact_messages FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "contact_messages_delete" ON contact_messages FOR DELETE USING (auth.role() = 'authenticated');
