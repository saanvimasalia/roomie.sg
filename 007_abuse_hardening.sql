-- ============================================================
-- Migration 007: abuse hardening
-- Run after 006_security_fixes.sql, in the Supabase SQL Editor
--
-- Fixes three abuse-at-scale issues found in review:
--   1. Plus-addressed emails (me+1@e.ntu.edu.sg) let one real mailbox
--      register unlimited "distinct" verified accounts — blocked.
--   2. send_like / log_connect had no rate limit — one account could
--      spam-like or spam-connect an entire university in seconds.
--   3. Avatars bucket was fully public, so paused/hidden profiles'
--      photos stayed world-readable forever via direct URL — bucket
--      is now private, RLS-gated, and served via short-lived signed
--      URLs instead of permanent public URLs.
-- ============================================================


-- ── 1. Block plus-addressed sockpuppet signups ─────────────────────────

CREATE OR REPLACE FUNCTION public.check_university_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email LIKE '%+%@%' THEN
    RAISE EXCEPTION 'Plus-addressed emails are not allowed. Please use your primary university email.';
  END IF;

  IF NEW.email NOT LIKE '%@e.nus.edu.sg'
    AND NEW.email NOT LIKE '%@u.nus.edu.sg'
    AND NEW.email NOT LIKE '%@nus.edu.sg'
    AND NEW.email NOT LIKE '%@e.ntu.edu.sg'
    AND NEW.email NOT LIKE '%@ntu.edu.sg'
  THEN
    RAISE EXCEPTION 'Only NUS and NTU student emails are allowed to sign up.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- (trigger `enforce_university_email` from 004 already points at this
-- function by name, no need to recreate it)


-- ── 2. Rate-limit send_like and log_connect ────────────────────────────

CREATE OR REPLACE FUNCTION public.send_like(
  p_liker_id UUID,
  p_liked_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_is_mutual BOOLEAN := FALSE;
  v_recent_likes INT;
BEGIN
  IF p_liker_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF p_liker_id = p_liked_id THEN
    RAISE EXCEPTION 'Cannot like yourself';
  END IF;

  SELECT COUNT(*) INTO v_recent_likes
  FROM public.likes
  WHERE liker_id = p_liker_id AND created_at > NOW() - INTERVAL '1 hour';

  IF v_recent_likes >= 50 THEN
    RAISE EXCEPTION 'You are liking too fast — please try again later.';
  END IF;

  INSERT INTO public.likes (liker_id, liked_id)
  VALUES (p_liker_id, p_liked_id)
  ON CONFLICT (liker_id, liked_id) DO NOTHING;

  INSERT INTO public.activity (user_id, type, actor_id)
  VALUES (p_liked_id, 'new_like', p_liker_id)
  ON CONFLICT DO NOTHING;

  v_is_mutual := public.is_mutual_match(p_liker_id, p_liked_id);

  IF v_is_mutual THEN
    INSERT INTO public.activity (user_id, type, actor_id)
    VALUES
      (p_liked_id, 'new_match', p_liker_id),
      (p_liker_id, 'new_match', p_liked_id)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN json_build_object(
    'success', true,
    'is_mutual_match', v_is_mutual
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION public.log_connect(
  p_connector_id UUID,
  p_connected_to_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_recent_connects INT;
BEGIN
  IF p_connector_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT COUNT(*) INTO v_recent_connects
  FROM public.activity
  WHERE actor_id = p_connector_id AND type = 'connected' AND created_at > NOW() - INTERVAL '1 hour';

  IF v_recent_connects >= 20 THEN
    RAISE EXCEPTION 'Too many connect attempts — please try again later.';
  END IF;

  INSERT INTO public.activity (user_id, type, actor_id)
  VALUES (p_connected_to_id, 'connected', p_connector_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── 3. Make avatars private, gated by the same visibility rule as profiles ──

DROP POLICY IF EXISTS "avatars_read" ON storage.objects;

CREATE POLICY "avatars_read" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'avatars'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id::text = (storage.foldername(name))[1]
          AND p.is_paused = FALSE
          AND p.is_verified = TRUE
          AND p.university = public.current_user_university()
      )
    )
  );

UPDATE storage.buckets SET public = false WHERE id = 'avatars';
