-- ═══════════════════════════════════════════════════════════════
-- SYNAPSE_AI - NEWS LIKES & CATEGORIES MIGRATION
-- Adds like_count and category column for proper filtering
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Add like_count column for news likes
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'news_articles' AND column_name = 'like_count') THEN
    ALTER TABLE news_articles ADD COLUMN like_count integer DEFAULT 0;
  END IF;
END $$;

-- Add category column for simple filtering (models, research, tools, business)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'news_articles' AND column_name = 'category') THEN
    ALTER TABLE news_articles ADD COLUMN category text DEFAULT 'general';
  END IF;
END $$;

-- Create index for like-based sorting
CREATE INDEX IF NOT EXISTS idx_news_like_count ON news_articles(like_count DESC);

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_news_category ON news_articles(category);

-- RPC function to increment like count
CREATE OR REPLACE FUNCTION increment_news_likes(p_article_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE news_articles
  SET like_count = COALESCE(like_count, 0) + 1
  WHERE id = p_article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to public
GRANT EXECUTE ON FUNCTION increment_news_likes(uuid) TO anon, authenticated;

-- Update existing articles: map topic_id to category
UPDATE news_articles
SET category = CASE
  WHEN topic_id ILIKE '%model%' OR topic_id ILIKE '%gpt%' OR topic_id ILIKE '%llm%' OR topic_id ILIKE '%claude%' OR topic_id ILIKE '%gemini%' THEN 'models'
  WHEN topic_id ILIKE '%research%' OR topic_id ILIKE '%paper%' OR topic_id ILIKE '%study%' THEN 'research'
  WHEN topic_id ILIKE '%tool%' OR topic_id ILIKE '%api%' OR topic_id ILIKE '%sdk%' OR topic_id ILIKE '%library%' THEN 'tools'
  WHEN topic_id ILIKE '%business%' OR topic_id ILIKE '%funding%' OR topic_id ILIKE '%acquisition%' OR topic_id ILIKE '%startup%' THEN 'business'
  ELSE 'general'
END
WHERE category IS NULL OR category = 'general';

-- ═══════════════════════════════════════════════════════════════
-- DONE - Migration Complete!
-- ═══════════════════════════════════════════════════════════════
