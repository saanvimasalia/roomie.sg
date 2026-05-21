-- ============================================================
-- Migration 001: profiles table
-- Run this first in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  -- Identity (links to Supabase auth)
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT NOT NULL,
  university        TEXT NOT NULL CHECK (university IN ('NUS', 'NTU')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Basic info
  name              TEXT,
  age               INT CHECK (age >= 16 AND age <= 35),
  year              TEXT CHECK (year IN ('Y1', 'Y2', 'Y3', 'Y4', 'Grad')),
  faculty           TEXT,
  nationality       TEXT,
  photo_url         TEXT,

  -- Accommodation
  hall_preference   TEXT,
  move_in_semester  TEXT CHECK (move_in_semester IN ('Sem1', 'Sem2')),

  -- Lifestyle
  diet              TEXT CHECK (diet IN ('halal', 'vegetarian', 'no_pork_beef', 'none')),
  wake_time         INT CHECK (wake_time >= 0 AND wake_time <= 23),
  sleep_time        INT CHECK (sleep_time >= 0 AND sleep_time <= 23),
  study_location    TEXT CHECK (study_location IN ('room', 'library', 'mixed', 'cafes')),
  social_style      TEXT CHECK (social_style IN ('introvert', 'ambivert', 'extrovert')),
  guest_frequency   TEXT CHECK (guest_frequency IN ('never', 'rarely', 'sometimes', 'often')),
  cleanliness       TEXT CHECK (cleanliness IN ('tidy', 'average', 'relaxed')),
  smoking           BOOLEAN NOT NULL DEFAULT FALSE,
  needs_ac          BOOLEAN NOT NULL DEFAULT FALSE,
  cooks             BOOLEAN NOT NULL DEFAULT TRUE,
  prefers_quiet     BOOLEAN NOT NULL DEFAULT FALSE,
  has_pet           BOOLEAN NOT NULL DEFAULT FALSE,

  -- Allergies
  allergies         TEXT[] NOT NULL DEFAULT '{}',
  allergies_other   TEXT,

  -- Prompts
  prompt_1_answer   TEXT,
  prompt_2_question TEXT,
  prompt_2_answer   TEXT,

  -- Connect
  connect_platform  TEXT CHECK (connect_platform IN ('telegram', 'whatsapp')),
  connect_handle    TEXT,

  -- App state
  is_paused         BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified       BOOLEAN NOT NULL DEFAULT FALSE
);

-- Index on university for fast feed queries (we always filter by uni)
CREATE INDEX IF NOT EXISTS profiles_university_idx ON public.profiles(university);

-- Index on is_paused for fast feed filtering
CREATE INDEX IF NOT EXISTS profiles_paused_idx ON public.profiles(is_paused);
