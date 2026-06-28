-- Create a function that bypasses RLS to update settings
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION update_site_settings(payload jsonb)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  row_id uuid;
BEGIN
  -- Get existing row id
  SELECT id INTO row_id FROM site_settings LIMIT 1;
  
  IF row_id IS NULL THEN
    -- Insert new row
    INSERT INTO site_settings (id, site_name, primary_color, secondary_color, accent_color,
      success_color, warning_color, danger_color, info_color,
      navbar_color, sidebar_color, card_color, theme_preset, font_family,
      hero_title, footer_text, site_name_en, logo_light_url, logo_dark_url, updated_at)
    SELECT
      gen_random_uuid(),
      COALESCE(payload->>'site_name', 'محاصيل الشاي'),
      COALESCE(payload->>'primary_color', '#2d6a4f'),
      COALESCE(payload->>'secondary_color', '#8a7850'),
      COALESCE(payload->>'accent_color', '#d4a843'),
      COALESCE(payload->>'success_color', '#16a34a'),
      COALESCE(payload->>'warning_color', '#d97706'),
      COALESCE(payload->>'danger_color', '#dc2626'),
      COALESCE(payload->>'info_color', '#2563eb'),
      COALESCE(payload->>'navbar_color', '#1a2e1a'),
      COALESCE(payload->>'sidebar_color', '#2d6a4f'),
      COALESCE(payload->>'card_color', '#ffffff'),
      COALESCE(payload->>'theme_preset', 'forest'),
      COALESCE(payload->>'font_family', 'Tajawal'),
      COALESCE(payload->>'hero_title', ''),
      COALESCE(payload->>'footer_text', ''),
      COALESCE(payload->>'site_name_en', ''),
      COALESCE(payload->>'logo_light_url', ''),
      COALESCE(payload->>'logo_dark_url', ''),
      now()
    RETURNING * INTO result;
  ELSE
    -- Update existing row
    UPDATE site_settings SET
      site_name = COALESCE(payload->>'site_name', site_name),
      site_name_en = COALESCE(payload->>'site_name_en', site_name_en),
      primary_color = COALESCE(payload->>'primary_color', primary_color),
      secondary_color = COALESCE(payload->>'secondary_color', secondary_color),
      accent_color = COALESCE(payload->>'accent_color', accent_color),
      success_color = COALESCE(payload->>'success_color', success_color),
      warning_color = COALESCE(payload->>'warning_color', warning_color),
      danger_color = COALESCE(payload->>'danger_color', danger_color),
      info_color = COALESCE(payload->>'info_color', info_color),
      navbar_color = COALESCE(payload->>'navbar_color', navbar_color),
      sidebar_color = COALESCE(payload->>'sidebar_color', sidebar_color),
      card_color = COALESCE(payload->>'card_color', card_color),
      theme_preset = COALESCE(payload->>'theme_preset', theme_preset),
      font_family = COALESCE(payload->>'font_family', font_family),
      hero_title = COALESCE(payload->>'hero_title', hero_title),
      footer_text = COALESCE(payload->>'footer_text', footer_text),
      logo_light_url = COALESCE(payload->>'logo_light_url', logo_light_url),
      logo_dark_url = COALESCE(payload->>'logo_dark_url', logo_dark_url),
      updated_at = now()
    WHERE id = row_id
    RETURNING * INTO result;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users ONLY (not anon)
-- SECURITY DEFINER means the function runs as the owner, bypassing RLS
REVOKE EXECUTE ON FUNCTION update_site_settings(jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION update_site_settings(jsonb) TO authenticated;
