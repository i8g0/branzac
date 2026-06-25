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

-- RLS - allow all for anon (matching existing app behavior)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all menu_items" ON menu_items FOR ALL USING (true);
CREATE POLICY "Allow all menu_categories" ON menu_categories FOR ALL USING (true);
CREATE POLICY "Allow all orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all contact_messages" ON contact_messages FOR ALL USING (true);
