-- ═══════════════════════════════════════════════════════════════
-- SYNAPSE AI - Storage & RPC Functions
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Create storage bucket for uploads (if doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "uploads_public_read" ON storage.objects;
DROP POLICY IF EXISTS "uploads_public_insert" ON storage.objects;

-- Allow public read access to uploads bucket
CREATE POLICY "uploads_public_read" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'uploads');

-- Allow public insert/upload to uploads bucket
CREATE POLICY "uploads_public_insert" ON storage.objects
FOR INSERT TO public
WITH CHECK (bucket_id = 'uploads');

-- ═══════════════════════════════════════════════════════════════
-- RPC Functions for incrementing counters
-- ═══════════════════════════════════════════════════════════════

-- Drop existing functions first
DROP FUNCTION IF EXISTS increment_project_views(UUID);
DROP FUNCTION IF EXISTS increment_project_upvotes(UUID);
DROP FUNCTION IF EXISTS decrement_project_upvotes(UUID);
DROP FUNCTION IF EXISTS increment_project_comments(UUID);

-- Function to increment project views
CREATE OR REPLACE FUNCTION increment_project_views(p_project_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- Required: allows execution with elevated privileges
AS $$
BEGIN
    UPDATE projects
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = p_project_id;
END;
$$;

-- Grant execute permissions to all roles
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
