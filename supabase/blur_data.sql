-- Run once in Supabase SQL Editor (optional — improves blur-up loading)
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS blur_data text;

COMMENT ON COLUMN menu_items.blur_data IS 'Tiny base64/jpeg data-URL for image placeholder';
