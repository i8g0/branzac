-- White-Label Site Settings Table
-- Stores all dynamic branding/theming configuration per tenant

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Branding
  site_name text DEFAULT 'محاصيل الشاي',
  site_name_en text DEFAULT 'Mahaseel Tea',
  logo_light_url text,
  logo_dark_url text,
  favicon_url text,
  font_family text DEFAULT 'Tajawal',
  
  -- Colors (HEX)
  primary_color text DEFAULT '#2d6a4f',
  secondary_color text DEFAULT '#8a7850',
  accent_color text DEFAULT '#d4a843',
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

-- Only one settings row needed (single-tenant for now)
-- For multi-tenant: add tenant_id uuid and UNIQUE(tenant_id)

-- RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (public site)
CREATE POLICY "Public read access" ON site_settings
  FOR SELECT USING (true);

-- Only authenticated users can update settings
CREATE POLICY "Auth write access" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert default row if empty
INSERT INTO site_settings (id) 
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1);

-- Index
CREATE INDEX IF NOT EXISTS idx_site_settings_updated ON site_settings(updated_at DESC);
