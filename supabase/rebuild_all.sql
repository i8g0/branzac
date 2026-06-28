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

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE contact_messages;

-- RLS - Public read, authenticated write only
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- menu_items: public read, authenticated write
CREATE POLICY "Public read menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Authenticated insert menu_items" ON menu_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update menu_items" ON menu_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete menu_items" ON menu_items FOR DELETE USING (auth.role() = 'authenticated');

-- menu_categories: public read, authenticated write
CREATE POLICY "Public read menu_categories" ON menu_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated insert menu_categories" ON menu_categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated update menu_categories" ON menu_categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete menu_categories" ON menu_categories FOR DELETE USING (auth.role() = 'authenticated');

-- orders: public read + insert (customers place orders), authenticated update/delete
CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated update orders" ON orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete orders" ON orders FOR DELETE USING (auth.role() = 'authenticated');

-- contact_messages: public insert only, authenticated read/update/delete
CREATE POLICY "Authenticated read contact_messages" ON contact_messages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Public insert contact_messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated update contact_messages" ON contact_messages FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated delete contact_messages" ON contact_messages FOR DELETE USING (auth.role() = 'authenticated');
