-- Allow anonymous users to read menu_items
DROP POLICY IF EXISTS "Allow all menu_items" ON menu_items;
CREATE POLICY "anon_read_menu_items" ON menu_items
  FOR SELECT USING (true);
CREATE POLICY "anon_insert_menu_items" ON menu_items
  FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_menu_items" ON menu_items
  FOR UPDATE USING (true);
CREATE POLICY "anon_delete_menu_items" ON menu_items
  FOR DELETE USING (true);

-- Allow anonymous users to read menu_categories
DROP POLICY IF EXISTS "Allow all menu_categories" ON menu_categories;
CREATE POLICY "anon_read_menu_categories" ON menu_categories
  FOR SELECT USING (true);
CREATE POLICY "anon_insert_menu_categories" ON menu_categories
  FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_menu_categories" ON menu_categories
  FOR UPDATE USING (true);
CREATE POLICY "anon_delete_menu_categories" ON menu_categories
  FOR DELETE USING (true);

-- Allow anonymous users full access to contact_messages
DROP POLICY IF EXISTS "Allow all contact_messages" ON contact_messages;
CREATE POLICY "anon_all_contact_messages" ON contact_messages
  FOR ALL USING (true);

-- Make sure RLS is enabled
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
