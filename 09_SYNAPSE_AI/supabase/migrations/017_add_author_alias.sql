-- ═══════════════════════════════════════════════════════════════
-- SYNAPSE_AI - ADD AUTHOR ALIAS TO COMMENTS
-- Adds author_alias column to store the user's alias at comment time
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Add author_alias to project_comments
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_comments' AND column_name = 'author_alias') THEN
    ALTER TABLE project_comments ADD COLUMN author_alias text;
  END IF;
END $$;

-- Add author_alias to news_comments
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'news_comments' AND column_name = 'author_alias') THEN
    ALTER TABLE news_comments ADD COLUMN author_alias text;
  END IF;
END $$;

-- Add author_alias to ai_reviews
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_reviews' AND column_name = 'author_alias') THEN
    ALTER TABLE ai_reviews ADD COLUMN author_alias text;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- DONE - Migration Complete!
-- ═══════════════════════════════════════════════════════════════
