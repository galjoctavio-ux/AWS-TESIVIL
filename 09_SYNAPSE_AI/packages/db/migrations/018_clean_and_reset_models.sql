-- Migration: 018_clean_and_reset_models.sql
-- Purpose: Clean all existing model data and start fresh with curated dataset
-- 
-- WARNING: This deletes ALL existing model data!
-- Run this before syncing the new curated 30-model dataset.

-- ═══════════════════════════════════════════════════════════════
-- STEP 1: Clear related tables first (foreign key dependencies)
-- ═══════════════════════════════════════════════════════════════

-- Clear benchmarks
DELETE FROM ai_benchmarks;

-- Clear stats
DELETE FROM ai_stats;

-- Clear ranking history
DELETE FROM ai_ranking_history;

-- Clear reviews and votes
DELETE FROM ai_votes;
DELETE FROM ai_reviews;

-- ═══════════════════════════════════════════════════════════════
-- STEP 2: Clear main models table
-- ═══════════════════════════════════════════════════════════════

DELETE FROM ai_models;

-- ═══════════════════════════════════════════════════════════════
-- STEP 3: Verify cleanup
-- ═══════════════════════════════════════════════════════════════

DO $$
BEGIN
    RAISE NOTICE '✅ Database cleaned successfully';
    RAISE NOTICE '   ai_models: % rows', (SELECT COUNT(*) FROM ai_models);
    RAISE NOTICE '   ai_benchmarks: % rows', (SELECT COUNT(*) FROM ai_benchmarks);
    RAISE NOTICE '   ai_stats: % rows', (SELECT COUNT(*) FROM ai_stats);
    RAISE NOTICE '';
    RAISE NOTICE 'Now run the sync script to populate with curated data:';
    RAISE NOTICE '   cd packages/api && npx tsx src/scripts/sync-now.ts';
END $$;
