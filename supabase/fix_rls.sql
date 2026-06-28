-- Fix RLS policies for site_settings
-- Allow public read, and public write (protected by admin login in app)

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Auth write access" ON site_settings;
DROP POLICY IF EXISTS "Public read access" ON site_settings;

-- Anyone can read (public site)
CREATE POLICY "Public read access" ON site_settings
  FOR SELECT USING (true);

-- Anyone can update (admin auth handled in app, not Supabase Auth)
CREATE POLICY "Public write access" ON site_settings
  FOR ALL USING (true)
  WITH CHECK (true);
