-- ============================================================
-- Migration 011: schema alignment
--
-- 001_profiles.sql, as committed, doesn't match the live database.
-- These columns are used throughout the app (OnboardingContext,
-- EditProfile) and migration 006 already grants column-level
-- permissions on them, but they were never captured in a committed
-- migration — someone added them directly via the Supabase dashboard
-- at some point. This brings the migration history back in sync with
-- reality so 001 through 011 can actually rebuild the schema from
-- scratch, e.g. for a fresh environment.
--
-- Safe to run against the current database too: ADD COLUMN IF NOT
-- EXISTS no-ops (with a notice, not an error) on any column that
-- already exists.
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hall_points      INT,
  ADD COLUMN IF NOT EXISTS telegram_handle  TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_cc      TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_number  TEXT,
  ADD COLUMN IF NOT EXISTS connect_display  TEXT CHECK (connect_display IN ('telegram', 'whatsapp', 'both'));
