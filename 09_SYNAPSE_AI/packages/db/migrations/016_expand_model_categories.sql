-- ═══════════════════════════════════════════════════════════════
-- SYNAPSE_AI - Migration 016: Expand AI Models Categories
-- Updates category constraint to support leaderboard categories
-- ═══════════════════════════════════════════════════════════════

-- Drop the old constraint
ALTER TABLE ai_models DROP CONSTRAINT IF EXISTS ai_models_category_check;

-- Add new constraint with expanded categories
ALTER TABLE ai_models ADD CONSTRAINT ai_models_category_check 
  CHECK (category IN (
    -- Original categories
    'pro', 
    'flash',
    -- New leaderboard categories
    'chat',
    'coding',
    'vision',
    'audio',
    'general',
    -- Legacy categories (compatibility)
    'assistant',
    'fast'
  ));

-- Add columns for scores if they don't exist
DO $$ 
BEGIN
  -- Add score columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'score_overall') THEN
    ALTER TABLE ai_models ADD COLUMN score_overall decimal DEFAULT 75;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'score_reasoning') THEN
    ALTER TABLE ai_models ADD COLUMN score_reasoning decimal;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'score_coding') THEN
    ALTER TABLE ai_models ADD COLUMN score_coding decimal;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'score_creative') THEN
    ALTER TABLE ai_models ADD COLUMN score_creative decimal;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'score_speed') THEN
    ALTER TABLE ai_models ADD COLUMN score_speed decimal;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'trend') THEN
    ALTER TABLE ai_models ADD COLUMN trend text DEFAULT 'stable';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_models' AND column_name = 'is_new') THEN
    ALTER TABLE ai_models ADD COLUMN is_new boolean DEFAULT false;
  END IF;
END $$;

-- Update unique constraint on ai_benchmarks to allow duplicates from different sources
ALTER TABLE ai_benchmarks DROP CONSTRAINT IF EXISTS ai_benchmarks_model_id_category_source_key;
ALTER TABLE ai_benchmarks DROP CONSTRAINT IF EXISTS ai_benchmarks_model_id_category_key;

-- Create new unique constraint
ALTER TABLE ai_benchmarks ADD CONSTRAINT ai_benchmarks_model_id_category_key UNIQUE (model_id, category);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_ai_models_score ON ai_models(score_overall DESC);
CREATE INDEX IF NOT EXISTS idx_ai_models_category_score ON ai_models(category, score_overall DESC);

-- Comment
COMMENT ON TABLE ai_models IS 'AI models catalog with leaderboard scores from LMSYS, OpenLLM, BigCode, etc.';
