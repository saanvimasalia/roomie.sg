-- ============================================================
-- Migration 002: likes table
-- Run after 001_profiles.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liker_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  liked_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate likes
  CONSTRAINT no_duplicate_likes UNIQUE (liker_id, liked_id),

  -- Prevent self-likes
  CONSTRAINT no_self_like CHECK (liker_id != liked_id)
);

-- Index for fast lookup of "who did I like"
CREATE INDEX IF NOT EXISTS likes_liker_idx ON public.likes(liker_id);

-- Index for fast lookup of "who liked me"
CREATE INDEX IF NOT EXISTS likes_liked_idx ON public.likes(liked_id);
