-- ═══════════════════════════════════════════════════════════════
-- SYNAPSE_AI - Migration 009: Push Notifications
-- Module: Push Notifications & User Preferences
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- ADD PUSH NOTIFICATION COLUMNS TO PROFILES
-- ───────────────────────────────────────────────────────────────

-- Add expo push token column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

-- Add notification preferences
-- news_level: 'all' = all news, 'breaking' = only importance >= 9, 'none' = disabled
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_news_level TEXT DEFAULT 'breaking'
  CHECK (notifications_news_level IN ('all', 'breaking', 'none'));

-- Comments notification toggle
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_comments_enabled BOOLEAN DEFAULT true;

-- ───────────────────────────────────────────────────────────────
-- INDEXES FOR EFFICIENT NOTIFICATION QUERIES
-- ───────────────────────────────────────────────────────────────

-- Index for finding users with push tokens
CREATE INDEX IF NOT EXISTS idx_profiles_push_token ON profiles(expo_push_token) 
  WHERE expo_push_token IS NOT NULL;

-- Index for news notification queries (users who want all or breaking news)
CREATE INDEX IF NOT EXISTS idx_profiles_news_notifications ON profiles(notifications_news_level)
  WHERE notifications_news_level != 'none' AND expo_push_token IS NOT NULL;

-- ───────────────────────────────────────────────────────────────
-- UPDATE RLS POLICIES (if needed)
-- ───────────────────────────────────────────────────────────────

-- Users can update their own notification preferences (already covered by existing policy)
-- No additional policies needed since profiles already has user-based RLS
