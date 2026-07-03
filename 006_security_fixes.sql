-- ============================================================
-- Migration 006: security fixes
-- Run after 005_rls.sql, in the Supabase SQL Editor
--
-- Fixes four issues found in review:
--   1. Client could self-set is_verified/university (fake verification,
--      cross-university spoofing) — locked down via column-level grants
--      + is_verified now driven only by auth.users.email_confirmed_at.
--   2. profiles_read RLS let any authenticated user read every non-paused
--      profile regardless of university or verification — tightened.
--   3. send_like / log_connect / mark_activity_read / get_for_you_feed
--      are SECURITY DEFINER and never checked that the caller was who
--      they claimed to be — added auth.uid() checks to all four.
--   4. Avatars bucket accepted any file type/size — restricted.
-- ============================================================


-- ── 1a. Lock down which columns `authenticated` may write on profiles ──
-- id/email/university/is_verified/created_at become server-controlled only.

REVOKE INSERT, UPDATE ON public.profiles FROM authenticated;

GRANT INSERT (
  id, email, university, name, age, year, faculty, nationality, photo_url,
  hall_points, hall_preference, move_in_semester, diet, wake_time, sleep_time,
  study_location, social_style, guest_frequency, cleanliness, smoking,
  needs_ac, cooks, prefers_quiet, has_pet, allergies, allergies_other,
  prompt_1_answer, prompt_2_question, prompt_2_answer, telegram_handle,
  whatsapp_cc, whatsapp_number, connect_display, is_paused
) ON public.profiles TO authenticated;

GRANT UPDATE (
  name, age, year, faculty, nationality, photo_url,
  hall_points, hall_preference, move_in_semester, diet, wake_time, sleep_time,
  study_location, social_style, guest_frequency, cleanliness, smoking,
  needs_ac, cooks, prefers_quiet, has_pet, allergies, allergies_other,
  prompt_1_answer, prompt_2_question, prompt_2_answer, telegram_handle,
  whatsapp_cc, whatsapp_number, connect_display, is_paused
) ON public.profiles TO authenticated;

-- NOTE: the frontend's onboarding submit was upserting id/email/university/
-- is_verified — that's been changed to a plain UPDATE of only the columns
-- above, since handle_new_user() already creates the row with the right
-- id/email/university at signup time.


-- ── 1b. is_verified is now driven only by Supabase's own email confirmation ──
-- Client can no longer set it (see grants above). Instead, flip it the
-- moment Supabase confirms the user's .edu email via the magic link.

CREATE OR REPLACE FUNCTION public.handle_email_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.profiles SET is_verified = TRUE WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_confirmed();


-- ── 2. Tighten profiles_read: same-university + verified, unless it's you ──

CREATE OR REPLACE FUNCTION public.current_user_university()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT university FROM public.profiles WHERE id = auth.uid();
$$;

DROP POLICY IF EXISTS "profiles_read" ON public.profiles;

CREATE POLICY "profiles_read" ON public.profiles
  FOR SELECT
  USING (
    id = auth.uid()
    OR (
      is_paused = FALSE
      AND is_verified = TRUE
      AND university = public.current_user_university()
    )
  );


-- ── 3. Require the caller to be who they claim to be ──────────────────

CREATE OR REPLACE FUNCTION public.send_like(
  p_liker_id UUID,
  p_liked_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_is_mutual BOOLEAN := FALSE;
BEGIN
  IF p_liker_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF p_liker_id = p_liked_id THEN
    RAISE EXCEPTION 'Cannot like yourself';
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
BEGIN
  IF p_connector_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  INSERT INTO public.activity (user_id, type, actor_id)
  VALUES (p_connected_to_id, 'connected', p_connector_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION public.mark_activity_read(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.activity
  SET is_read = TRUE
  WHERE user_id = p_user_id AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION public.get_for_you_feed(
  p_user_id UUID,
  p_require_halal BOOLEAN DEFAULT FALSE,
  p_require_non_smoker BOOLEAN DEFAULT FALSE,
  p_require_ac BOOLEAN DEFAULT FALSE,
  p_gender_pref TEXT DEFAULT 'any',
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  profile_id UUID,
  score INT,
  is_mutual BOOLEAN
) AS $$
DECLARE
  me public.profiles%ROWTYPE;
BEGIN
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO me FROM public.profiles WHERE id = p_user_id;

  RETURN QUERY
  SELECT
    p.id AS profile_id,
    public.calc_match_score(p_user_id, p.id) AS score,
    public.is_mutual_match(p_user_id, p.id) AS is_mutual
  FROM public.profiles p
  WHERE
    p.id != p_user_id
    AND p.university = me.university
    AND p.is_paused = FALSE
    AND p.is_verified = TRUE
    AND (
      NOT p_require_halal
      OR p.diet = 'halal'
      OR p.diet = 'none'
    )
    AND (
      NOT p_require_non_smoker
      OR p.smoking = FALSE
    )
    AND (
      NOT p_require_ac
      OR p.needs_ac = TRUE
    )
    AND (
      me.diet != 'halal'
      OR p.diet IN ('halal', 'none')
    )
    AND (
      me.smoking = TRUE
      OR p.smoking = FALSE
      OR p.smoking IS NULL
    )
  ORDER BY score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- ── 4. Restrict avatar uploads to images, capped at 5MB ────────────────

UPDATE storage.buckets
SET
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'],
  file_size_limit = 5242880
WHERE id = 'avatars';
