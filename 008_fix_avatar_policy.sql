-- ============================================================
-- Migration 008: fix column-shadowing bug in avatars_read
--
-- 007_abuse_hardening.sql's avatars_read policy referenced `name`
-- inside a subquery against public.profiles, which also has a `name`
-- column (the user's display name). Postgres resolved the unqualified
-- reference to profiles.name instead of storage.objects.name, so the
-- EXISTS branch never matched — only your own avatar was ever visible.
-- Fixed by explicitly qualifying storage.objects.name.
-- ============================================================

DROP POLICY IF EXISTS "avatars_read" ON storage.objects;

CREATE POLICY "avatars_read" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'avatars'
    AND (
      auth.uid()::text = (storage.foldername(storage.objects.name))[1]
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id::text = (storage.foldername(storage.objects.name))[1]
          AND p.is_paused = FALSE
          AND p.is_verified = TRUE
          AND p.university = public.current_user_university()
      )
    )
  );
