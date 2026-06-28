-- Fix RLS policies for site_settings
-- Public read, authenticated write only

-- Drop old policies
DROP POLICY IF EXISTS "Auth write access" ON site_settings;
DROP POLICY IF EXISTS "Public read access" ON site_settings;
DROP POLICY IF EXISTS "Public write access" ON site_settings;

-- Anyone can read (public site)
CREATE POLICY "site_settings_select" ON site_settings
  FOR SELECT USING (true);

-- Only authenticated users (admin) can write
CREATE POLICY "site_settings_insert" ON site_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "site_settings_update" ON site_settings
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "site_settings_delete" ON site_settings
  FOR DELETE USING (auth.role() = 'authenticated');
