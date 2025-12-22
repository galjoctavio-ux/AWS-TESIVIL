-- ═══════════════════════════════════════════════════════════════
-- SYNAPSE AI - Hot Score Algorithm (Time Decay)
-- Similar to Hacker News / Reddit ranking
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Drop existing function if exists
DROP FUNCTION IF EXISTS calculate_hot_score(integer, timestamp with time zone);

-- Function to calculate hot score with time decay
-- Formula: score = upvotes / (hours_since_posted + 2) ^ gravity
-- Higher gravity = faster decay (1.8 is similar to Hacker News)
CREATE OR REPLACE FUNCTION calculate_hot_score(
    p_upvotes integer,
    p_created_at timestamp with time zone
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    hours_diff numeric;
    gravity numeric := 1.8;  -- Decay factor (higher = faster decay)
    base_offset numeric := 2; -- Prevents division issues for very new posts
BEGIN
    -- Calculate hours since creation
    hours_diff := EXTRACT(EPOCH FROM (NOW() - p_created_at)) / 3600.0;
    
    -- Prevent negative or zero hours
    IF hours_diff < 0 THEN
        hours_diff := 0;
    END IF;
    
    -- Calculate hot score
    -- Adding 1 to upvotes ensures posts with 0 upvotes still get ranked by time
    RETURN (COALESCE(p_upvotes, 0) + 1) / POWER(hours_diff + base_offset, gravity);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION calculate_hot_score(integer, timestamp with time zone) TO anon;
GRANT EXECUTE ON FUNCTION calculate_hot_score(integer, timestamp with time zone) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_hot_score(integer, timestamp with time zone) TO service_role;

-- ═══════════════════════════════════════════════════════════════
-- Add hot_score column to projects table (computed on-the-fly or cached)
-- ═══════════════════════════════════════════════════════════════

-- Option 1: Add a cached hot_score column (requires periodic updates)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS hot_score numeric DEFAULT 0;

-- Create index for faster hot sorting
CREATE INDEX IF NOT EXISTS idx_projects_hot_score ON projects(hot_score DESC);

-- ═══════════════════════════════════════════════════════════════
-- Function to update hot scores (run periodically via cron)
-- ═══════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS update_all_hot_scores();

CREATE OR REPLACE FUNCTION update_all_hot_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE projects
    SET hot_score = calculate_hot_score(upvotes_count, created_at)
    WHERE is_hidden = false;
END;
$$;

GRANT EXECUTE ON FUNCTION update_all_hot_scores() TO service_role;

-- ═══════════════════════════════════════════════════════════════
-- Trigger to update hot_score on upvote changes
-- ═══════════════════════════════════════════════════════════════

DROP TRIGGER IF EXISTS trigger_update_hot_score ON projects;
DROP FUNCTION IF EXISTS update_hot_score_trigger();

CREATE OR REPLACE FUNCTION update_hot_score_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.hot_score := calculate_hot_score(NEW.upvotes_count, NEW.created_at);
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_hot_score
    BEFORE INSERT OR UPDATE OF upvotes_count ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_hot_score_trigger();

-- ═══════════════════════════════════════════════════════════════
-- Initialize hot_score for existing projects
-- ═══════════════════════════════════════════════════════════════

UPDATE projects
SET hot_score = calculate_hot_score(upvotes_count, created_at)
WHERE hot_score IS NULL OR hot_score = 0;

-- ═══════════════════════════════════════════════════════════════
-- VERIFICATION: Check hot scores
-- ═══════════════════════════════════════════════════════════════

-- Uncomment to verify:
-- SELECT id, title, upvotes_count, created_at, hot_score
-- FROM projects
-- ORDER BY hot_score DESC
-- LIMIT 10;
