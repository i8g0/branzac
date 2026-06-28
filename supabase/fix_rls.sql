-- Fix RLS policies for site_settings
-- Public read, authenticated write only

-- Drop old policies
DROP POLICY IF EXISTS "Auth write access" ON site_settings;
DROP POLICY IF EXISTS "Public read access" ON site_settings;
DROP POLICY IF EXISTS "Public write access" ON site_settings;

-- Enable RLS if not already
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read (public site settings)
CREATE POLICY "Public read access" ON site_settings
  FOR SELECT USING (true);

-- Only authenticated users can update settings
CREATE POLICY "Authenticated update access" ON site_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users can insert (initial setup)
CREATE POLICY "Authenticated insert access" ON site_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can delete
CREATE POLICY "Authenticated delete access" ON site_settings
  FOR DELETE USING (auth.role() = 'authenticated');
