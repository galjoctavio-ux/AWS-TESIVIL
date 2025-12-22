-- ═══════════════════════════════════════════════════════════════
-- SYNAPSE_AI - NEWS COMMENT REPLIES MIGRATION
-- Adds parent_id column for nested replies in news comments
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Add parent_id column to support nested replies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'news_comments' AND column_name = 'parent_id') THEN
    ALTER TABLE news_comments ADD COLUMN parent_id uuid references news_comments(id) on delete cascade;
  END IF;
END $$;

-- Create index for faster reply lookups
CREATE INDEX IF NOT EXISTS idx_news_comments_parent ON news_comments(parent_id) WHERE parent_id IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════
-- DONE - Migration Complete!
-- ═══════════════════════════════════════════════════════════════
