-- =============================================================================
-- TESIVIL App Hub - Add screenshots column
-- Execute this in Supabase SQL Editor
-- =============================================================================

-- Add screenshots column (array of URLs)
ALTER TABLE apps
ADD COLUMN IF NOT EXISTS screenshots jsonb DEFAULT '[]'::jsonb;

-- Comment for documentation
COMMENT ON COLUMN apps.screenshots IS 'Array of screenshot URLs from Supabase Storage, max 6 images';

-- Example update for an existing app:
-- UPDATE apps SET screenshots = '["url1", "url2", "url3"]'::jsonb WHERE slug = 'my-app';
