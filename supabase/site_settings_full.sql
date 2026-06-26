-- Create site_settings table with ALL brand identity columns
-- Run this ENTIRE query in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text DEFAULT 'محاصيل الشاي',
  site_name_en text DEFAULT 'Mahaseel Tea',
  logo_light_url text,
  logo_dark_url text,
  favicon_url text,
  font_family text DEFAULT 'Tajawal',
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
  background_color text DEFAULT '#f5f0e8',
  surface_color text DEFAULT '#ffffff',
  text_base_color text DEFAULT '#1a1a2e',
  hero_title text DEFAULT 'حيث تلتقي أصالة الشاي بالتجربة الاستثنائية',
  hero_subtitle text DEFAULT 'مرحباً بكم في',
  hero_tagline text DEFAULT 'استمتع بتشكيلة فريدة من الشاي المغربي',
  footer_text text DEFAULT 'نقدّم لكم أجود أنواع الشاي المغربي والكرك في أجواء تراثية دافئة.',
  social_links jsonb DEFAULT '{}',
  is_hero_image_enabled boolean DEFAULT true,
  layout_style text DEFAULT 'default',
  theme_preset text DEFAULT 'forest',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Auth write access" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated');

INSERT INTO site_settings (id) 
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1);
