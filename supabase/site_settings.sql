-- White-Label Site Settings Table — FULL Brand Identity
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Branding
  site_name text DEFAULT 'محاصيل الشاي',
  site_name_en text DEFAULT 'Mahaseel Tea',
  logo_light_url text,
  logo_dark_url text,
  favicon_url text,
  font_family text DEFAULT 'Tajawal',
  
  -- FULL Brand Identity Colors (HEX)
  primary_color text DEFAULT '#2d6a4f',
  secondary_color text DEFAULT '#8a7850',
  accent_color text DEFAULT '#d4a843',
  success_color text DEFAULT '#16a34a',
  warning_color text DEFAULT '#d97706',
  danger_color text DEFAULT '#dc2626',
  info_color text DEFAULT '#2563eb',
  navbar_color text DEFAULT '#1a2e1a',
  sidebar_color text DEFAULT '#2d6a4f',
  card_color text DEFAULT '#ffffff',
  
  -- Legacy
  background_color text DEFAULT '#f5f0e8',
  surface_color text DEFAULT '#ffffff',
  text_base_color text DEFAULT '#1a1a2e',
  
  -- Content
  hero_title text DEFAULT 'حيث تلتقي أصالة الشاي بالتجربة الاستثنائية',
  hero_subtitle text DEFAULT 'مرحباً بكم في',
  hero_tagline text DEFAULT 'استمتع بتشكيلة فريدة من الشاي المغربي',
  footer_text text DEFAULT 'نقدّم لكم أجود أنواع الشاي المغربي والكرك في أجواء تراثية دافئة.',
  social_links jsonb DEFAULT '{}',
  
  -- UI Flags
  is_hero_image_enabled boolean DEFAULT true,
  layout_style text DEFAULT 'default',
  theme_preset text DEFAULT 'forest',
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Auth write access" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert default row if empty
INSERT INTO site_settings (id) 
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1);

-- If table already exists, add missing columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='site_settings' AND column_name='success_color') THEN
    ALTER TABLE site_settings ADD COLUMN success_color text DEFAULT '#16a34a';
    ALTER TABLE site_settings ADD COLUMN warning_color text DEFAULT '#d97706';
    ALTER TABLE site_settings ADD COLUMN danger_color text DEFAULT '#dc2626';
    ALTER TABLE site_settings ADD COLUMN info_color text DEFAULT '#2563eb';
    ALTER TABLE site_settings ADD COLUMN navbar_color text DEFAULT '#1a2e1a';
    ALTER TABLE site_settings ADD COLUMN sidebar_color text DEFAULT '#2d6a4f';
    ALTER TABLE site_settings ADD COLUMN card_color text DEFAULT '#ffffff';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_site_settings_updated ON site_settings(updated_at DESC);
