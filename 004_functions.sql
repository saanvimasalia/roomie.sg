-- ============================================================
-- Migration 004: database functions
-- Run after 003_activity.sql
-- ============================================================


-- ── 1. Email domain check ────────────────────────────────────
-- Blocks non-student emails at DB level
-- Runs on every new user created in auth.users

CREATE OR REPLACE FUNCTION public.check_university_email()
RETURNS TRIGGER AS $$
BEGIN
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

CREATE OR REPLACE TRIGGER enforce_university_email
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.check_university_email();


-- ── 2. Auto-create profile on signup ─────────────────────────
-- When a new user signs up, create their profile row
-- with university inferred from their email domain

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  uni TEXT;
BEGIN
  -- Infer university from email domain
  IF NEW.email LIKE '%@e.nus.edu.sg'
    OR NEW.email LIKE '%@u.nus.edu.sg'
    OR NEW.email LIKE '%@nus.edu.sg'
  THEN
    uni := 'NUS';
  ELSE
    uni := 'NTU';
  END IF;

  INSERT INTO public.profiles (id, email, university)
  VALUES (NEW.id, NEW.email, uni);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ── 3. Mutual match detection ─────────────────────────────────
-- Returns true if both users have liked each other

CREATE OR REPLACE FUNCTION public.is_mutual_match(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
  SELECT
    EXISTS (SELECT 1 FROM public.likes WHERE liker_id = user_a AND liked_id = user_b)
    AND
    EXISTS (SELECT 1 FROM public.likes WHERE liker_id = user_b AND liked_id = user_a);
$$ LANGUAGE SQL STABLE SECURITY DEFINER;


-- ── 4. Send a like + trigger activity + detect mutual match ───
-- Call this from the frontend when a user taps the heart button
-- Returns whether a mutual match was created

CREATE OR REPLACE FUNCTION public.send_like(
  p_liker_id UUID,
  p_liked_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_is_mutual BOOLEAN := FALSE;
BEGIN
  -- Insert the like (ignore if already exists)
  INSERT INTO public.likes (liker_id, liked_id)
  VALUES (p_liker_id, p_liked_id)
  ON CONFLICT (liker_id, liked_id) DO NOTHING;

  -- Notify the liked person
  INSERT INTO public.activity (user_id, type, actor_id)
  VALUES (p_liked_id, 'new_like', p_liker_id)
  ON CONFLICT DO NOTHING;

  -- Check for mutual match
  v_is_mutual := public.is_mutual_match(p_liker_id, p_liked_id);

  IF v_is_mutual THEN
    -- Notify both users of the match
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


-- ── 5. Log a connect event ────────────────────────────────────
-- Called when a user taps "Copy intro + open Telegram/WhatsApp"
-- Creates an activity notification for the other person

CREATE OR REPLACE FUNCTION public.log_connect(
  p_connector_id UUID,
  p_connected_to_id UUID
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.activity (user_id, type, actor_id)
  VALUES (p_connected_to_id, 'connected', p_connector_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── 6. Mark all activity as read ─────────────────────────────

CREATE OR REPLACE FUNCTION public.mark_activity_read(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.activity
  SET is_read = TRUE
  WHERE user_id = p_user_id AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── 7. Matching score function ────────────────────────────────
-- Calculates compatibility score between two users
-- Returns 0-100

CREATE OR REPLACE FUNCTION public.calc_match_score(
  p_user_a UUID,
  p_user_b UUID
)
RETURNS INT AS $$
DECLARE
  a public.profiles%ROWTYPE;
  b public.profiles%ROWTYPE;
  earned INT := 0;
  max_pts INT := 20; -- (4 NN * 3) + (8 pref * 1)
  time_diff INT;
BEGIN
  SELECT * INTO a FROM public.profiles WHERE id = p_user_a;
  SELECT * INTO b FROM public.profiles WHERE id = p_user_b;

  -- ── NON-NEGOTIABLES (3 pts each) ────────────────────
  -- Diet
  IF (a.diet = b.diet) OR (a.diet = 'none' OR b.diet = 'none') THEN
    earned := earned + 3;
  END IF;

  -- Smoking
  IF a.smoking = b.smoking THEN
    earned := earned + 3;
  END IF;

  -- AC
  IF a.needs_ac = b.needs_ac THEN
    earned := earned + 3;
  END IF;

  -- Hall preference
  IF a.hall_preference IS NOT NULL
    AND b.hall_preference IS NOT NULL
    AND (a.hall_preference = b.hall_preference
         OR a.hall_preference = 'Any hall is fine'
         OR b.hall_preference = 'Any hall is fine')
  THEN
    earned := earned + 3;
  END IF;

  -- ── PREFERENCES (1 pt each) ──────────────────────────
  -- Sleep schedule (within 1.5 hours)
  IF a.sleep_time IS NOT NULL AND b.sleep_time IS NOT NULL THEN
    time_diff := ABS(a.sleep_time - b.sleep_time);
    IF time_diff <= 2 OR time_diff >= 22 THEN -- handle midnight wrap
      earned := earned + 1;
    END IF;
  END IF;

  -- Wake time (within 1.5 hours)
  IF a.wake_time IS NOT NULL AND b.wake_time IS NOT NULL THEN
    time_diff := ABS(a.wake_time - b.wake_time);
    IF time_diff <= 2 THEN
      earned := earned + 1;
    END IF;
  END IF;

  -- Social style
  IF a.social_style IS NOT NULL AND b.social_style IS NOT NULL THEN
    IF a.social_style = b.social_style
       OR a.social_style = 'ambivert'
       OR b.social_style = 'ambivert'
    THEN
      earned := earned + 1;
    END IF;
  END IF;

  -- Guest frequency (within 1 level)
  DECLARE
    guest_order TEXT[] := ARRAY['never', 'rarely', 'sometimes', 'often'];
    a_idx INT;
    b_idx INT;
  BEGIN
    a_idx := array_position(guest_order, a.guest_frequency);
    b_idx := array_position(guest_order, b.guest_frequency);
    IF a_idx IS NOT NULL AND b_idx IS NOT NULL AND ABS(a_idx - b_idx) <= 1 THEN
      earned := earned + 1;
    END IF;
  END;

  -- Study location
  IF a.study_location IS NOT NULL AND a.study_location = b.study_location THEN
    earned := earned + 1;
  END IF;

  -- Cleanliness (within 1 level)
  DECLARE
    clean_order TEXT[] := ARRAY['relaxed', 'average', 'tidy'];
    a_idx INT;
    b_idx INT;
  BEGIN
    a_idx := array_position(clean_order, a.cleanliness);
    b_idx := array_position(clean_order, b.cleanliness);
    IF a_idx IS NOT NULL AND b_idx IS NOT NULL AND ABS(a_idx - b_idx) <= 1 THEN
      earned := earned + 1;
    END IF;
  END;

  -- Cooking
  IF a.cooks = b.cooks THEN
    earned := earned + 1;
  END IF;

  -- Quiet preference
  IF a.prefers_quiet = b.prefers_quiet THEN
    earned := earned + 1;
  END IF;

  RETURN ROUND((earned::FLOAT / max_pts::FLOAT) * 100);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- ── 8. Get For You feed ───────────────────────────────────────
-- Returns all compatible profiles ranked by score
-- Hard filters applied, paused profiles excluded

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
    -- Hard filter: diet
    AND (
      NOT p_require_halal
      OR p.diet = 'halal'
      OR p.diet = 'none'
    )
    -- Hard filter: smoking
    AND (
      NOT p_require_non_smoker
      OR p.smoking = FALSE
    )
    -- Hard filter: AC
    AND (
      NOT p_require_ac
      OR p.needs_ac = TRUE
    )
    -- Hard filter: my own deal-breakers
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
