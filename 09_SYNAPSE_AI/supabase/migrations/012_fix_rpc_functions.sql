-- ═══════════════════════════════════════════════════════════════
-- SYNAPSE AI - FIX: Recreate RPC Functions for View Counter
-- Run this in Supabase SQL Editor if views counter is not working
-- ═══════════════════════════════════════════════════════════════

-- Drop existing functions first (to ensure clean recreation)
DROP FUNCTION IF EXISTS increment_project_views(UUID);
DROP FUNCTION IF EXISTS increment_project_upvotes(UUID);
DROP FUNCTION IF EXISTS decrement_project_upvotes(UUID);
DROP FUNCTION IF EXISTS increment_project_comments(UUID);

-- Function to increment project views
CREATE OR REPLACE FUNCTION increment_project_views(p_project_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- Run with elevated privileges
AS $$
BEGIN
    UPDATE projects
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = p_project_id;
    
    -- Log for debugging (can be removed in production)
    RAISE NOTICE 'View incremented for project %', p_project_id;
END;
$$;

-- Grant execute permission to public (including anon and authenticated)
GRANT EXECUTE ON FUNCTION increment_project_views(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_project_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_project_views(UUID) TO service_role;

-- Function to increment project upvotes
CREATE OR REPLACE FUNCTION increment_project_upvotes(p_project_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE projects
    SET upvotes_count = COALESCE(upvotes_count, 0) + 1
    WHERE id = p_project_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_project_upvotes(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_project_upvotes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_project_upvotes(UUID) TO service_role;

-- Function to decrement project upvotes
CREATE OR REPLACE FUNCTION decrement_project_upvotes(p_project_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE projects
    SET upvotes_count = GREATEST(COALESCE(upvotes_count, 0) - 1, 0)
    WHERE id = p_project_id;
END;
$$;

GRANT EXECUTE ON FUNCTION decrement_project_upvotes(UUID) TO anon;
GRANT EXECUTE ON FUNCTION decrement_project_upvotes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_project_upvotes(UUID) TO service_role;

-- Function to increment comment count
CREATE OR REPLACE FUNCTION increment_project_comments(p_project_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE projects
    SET comment_count = COALESCE(comment_count, 0) + 1
    WHERE id = p_project_id;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_project_comments(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_project_comments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_project_comments(UUID) TO service_role;

-- ═══════════════════════════════════════════════════════════════
-- VERIFICATION: Test that functions work
-- ═══════════════════════════════════════════════════════════════

-- Uncomment to test (replace with a valid project ID from your database):
-- SELECT increment_project_views('your-project-uuid-here'::uuid);
-- SELECT * FROM projects WHERE id = 'your-project-uuid-here'::uuid;
