-- ============================================================
-- Migration 003: activity table
-- Run after 002_likes.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.activity (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('new_like', 'new_match', 'connected')),
  actor_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup of a user's notifications
CREATE INDEX IF NOT EXISTS activity_user_idx ON public.activity(user_id, created_at DESC);

-- Index for unread count badge
CREATE INDEX IF NOT EXISTS activity_unread_idx ON public.activity(user_id, is_read);
