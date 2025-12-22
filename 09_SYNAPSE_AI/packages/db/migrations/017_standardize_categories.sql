-- Migration: 017_standardize_categories.sql
-- Purpose: Standardize AI model categories to use consistent naming
-- 
-- Old names: coding, vision
-- New names: code, image
-- 
-- This ensures consistency between frontend filters and database values

-- ═══════════════════════════════════════════════════════════════
-- STEP 1: Update the CHECK constraint to include new values
-- ═══════════════════════════════════════════════════════════════

-- Drop the old constraint
ALTER TABLE ai_models DROP CONSTRAINT IF EXISTS ai_models_category_check;

-- Add new constraint with ALL valid values (old + new)
-- This allows both old and new values during transition
ALTER TABLE ai_models ADD CONSTRAINT ai_models_category_check 
CHECK (category = ANY (ARRAY[
    'pro'::text, 
    'flash'::text, 
    'chat'::text, 
    'coding'::text,  -- legacy
    'code'::text,    -- new standardized
    'vision'::text,  -- legacy
    'image'::text,   -- new standardized
    'audio'::text, 
    'general'::text, 
    'assistant'::text, 
    'fast'::text
]));

-- ═══════════════════════════════════════════════════════════════
-- STEP 2: Update existing data to use new values
-- ═══════════════════════════════════════════════════════════════

-- Update 'coding' to 'code'
UPDATE ai_models 
SET category = 'code' 
WHERE category = 'coding';

-- Update 'vision' to 'image'
UPDATE ai_models 
SET category = 'image' 
WHERE category = 'vision';

-- ═══════════════════════════════════════════════════════════════
-- STEP 3 (Optional): Tighten constraint after migration
-- Run this AFTER all sync jobs have been updated to use new values
-- ═══════════════════════════════════════════════════════════════

-- Uncomment these lines after verifying no old values remain:
-- ALTER TABLE ai_models DROP CONSTRAINT ai_models_category_check;
-- ALTER TABLE ai_models ADD CONSTRAINT ai_models_category_check 
-- CHECK (category = ANY (ARRAY[
--     'chat'::text, 
--     'code'::text,
--     'image'::text,
--     'audio'::text, 
--     'general'::text
-- ]));

-- ═══════════════════════════════════════════════════════════════
-- VERIFICATION: Log category distribution
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
    cat_counts RECORD;
BEGIN
    RAISE NOTICE 'Category distribution after migration:';
    FOR cat_counts IN 
        SELECT category, COUNT(*) as count 
        FROM ai_models 
        GROUP BY category 
        ORDER BY count DESC
    LOOP
        RAISE NOTICE '  %: %', cat_counts.category, cat_counts.count;
    END LOOP;
END $$;
