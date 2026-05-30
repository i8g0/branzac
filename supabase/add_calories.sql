-- Add calories column to menu_items (run in Supabase SQL Editor)
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS calories integer DEFAULT 0;

COMMENT ON COLUMN menu_items.calories IS 'Number of calories (سعرات) per serving';
