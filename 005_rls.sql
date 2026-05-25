-- ============================================================
-- Migration 005: Row Level Security (RLS)
-- Run last, after all other migrations
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity ENABLE ROW LEVEL SECURITY;


-- ── PROFILES ─────────────────────────────────────────────────

-- Anyone logged in can read non-paused profiles from their own university
CREATE POLICY "profiles_read" ON public.profiles
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (
      is_paused = FALSE
      OR id = auth.uid() -- users can always read their own profile even if paused
    )
  );

-- Users can only insert their own profile
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Users can only update their own profile
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Users can delete their own profile
CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE
  USING (id = auth.uid());


-- ── LIKES ────────────────────────────────────────────────────

-- Users can see likes involving themselves
CREATE POLICY "likes_read" ON public.likes
  FOR SELECT
  USING (
    liker_id = auth.uid()
    OR liked_id = auth.uid()
  );

-- Users can only create likes where they are the liker
CREATE POLICY "likes_insert" ON public.likes
  FOR INSERT
  WITH CHECK (liker_id = auth.uid());

-- Users can delete (unlike) only their own likes
CREATE POLICY "likes_delete" ON public.likes
  FOR DELETE
  USING (liker_id = auth.uid());


-- ── ACTIVITY ─────────────────────────────────────────────────

-- Users can only see their own activity
CREATE POLICY "activity_read" ON public.activity
  FOR SELECT
  USING (user_id = auth.uid());

-- Activity is inserted by server functions (SECURITY DEFINER), not directly
-- No insert policy needed for client


-- ── STORAGE ──────────────────────────────────────────────────
-- Run these in Supabase Dashboard → Storage → Policies
-- (or paste into the SQL editor) after creating a public bucket called "avatars"

CREATE POLICY "avatars_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
