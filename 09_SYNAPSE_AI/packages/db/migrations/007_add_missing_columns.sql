-- ═══════════════════════════════════════════════════════════════
-- SYNAPSE_AI - Migration: Add Missing Columns
-- Run this to add columns required by the API
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- AI_MODELS: Add scoring and display columns
-- ───────────────────────────────────────────────────────────────

ALTER TABLE ai_models 
ADD COLUMN IF NOT EXISTS score_overall numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_reasoning numeric,
ADD COLUMN IF NOT EXISTS score_coding numeric,
ADD COLUMN IF NOT EXISTS score_creative numeric,
ADD COLUMN IF NOT EXISTS score_speed numeric,
ADD COLUMN IF NOT EXISTS trend text DEFAULT 'stable',
ADD COLUMN IF NOT EXISTS is_new boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS provider_id text;

-- Update provider_id from brand for existing records
UPDATE ai_models SET provider_id = brand WHERE provider_id IS NULL;

-- ───────────────────────────────────────────────────────────────
-- NEWS_ARTICLES: Add processed content columns
-- ───────────────────────────────────────────────────────────────

ALTER TABLE news_articles 
ADD COLUMN IF NOT EXISTS original_title text,
ADD COLUMN IF NOT EXISTS processed_title text,
ADD COLUMN IF NOT EXISTS original_content text,
ADD COLUMN IF NOT EXISTS bullets text[],
ADD COLUMN IF NOT EXISTS why_it_matters text,
ADD COLUMN IF NOT EXISTS is_breaking boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS read_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS comment_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT true;

-- Migrate existing data: copy title to original_title and processed_title
UPDATE news_articles 
SET original_title = title, 
    processed_title = title 
WHERE original_title IS NULL;

-- ───────────────────────────────────────────────────────────────
-- NEWS_COMMENTS: Add moderation columns
-- ───────────────────────────────────────────────────────────────

ALTER TABLE news_comments
ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT true;

-- ───────────────────────────────────────────────────────────────
-- MODEL_REVIEWS: Alternative table name used by API
-- (Create view if needed to map ai_reviews -> model_reviews)
-- ───────────────────────────────────────────────────────────────

-- Create view to alias ai_reviews as model_reviews (used by some API endpoints)
CREATE OR REPLACE VIEW model_reviews AS
SELECT 
    id,
    model_id,
    user_id,
    stars_speed as creativity,
    stars_precision as speed,
    stars_hallucination as accuracy,
    use_case_tag as tag,
    comment,
    is_helpful_count,
    created_at
FROM ai_reviews;

-- ───────────────────────────────────────────────────────────────
-- INDEXES for better query performance
-- ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_ai_models_score ON ai_models(score_overall DESC);
CREATE INDEX IF NOT EXISTS idx_ai_models_provider ON ai_models(provider_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_topic ON news_articles(topic_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_published ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_breaking ON news_articles(is_breaking) WHERE is_breaking = true;

-- ───────────────────────────────────────────────────────────────
-- HELPER FUNCTIONS
-- ───────────────────────────────────────────────────────────────

-- Function to increment news read count
CREATE OR REPLACE FUNCTION increment_news_read_count(article_uuid uuid)
RETURNS void AS $$
BEGIN
    UPDATE news_articles 
    SET read_count = read_count + 1 
    WHERE id = article_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to increment news comment count
CREATE OR REPLACE FUNCTION increment_news_comment_count()
RETURNS trigger AS $$
BEGIN
    UPDATE news_articles 
    SET comment_count = comment_count + 1 
    WHERE id = NEW.article_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-increment comment count
DROP TRIGGER IF EXISTS news_comment_count_trigger ON news_comments;
CREATE TRIGGER news_comment_count_trigger
    AFTER INSERT ON news_comments
    FOR EACH ROW EXECUTE FUNCTION increment_news_comment_count();

-- ───────────────────────────────────────────────────────────────
-- Done! You can now run the sync jobs
-- ───────────────────────────────────────────────────────────────
