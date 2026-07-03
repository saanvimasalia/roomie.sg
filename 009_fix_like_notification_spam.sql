-- ============================================================
-- Migration 009: fix notification-spam bypass in send_like
--
-- The activity table has no unique constraint, so the 'new_like'
-- insert's `ON CONFLICT DO NOTHING` was dead code — it always
-- inserted, even when the like itself was a duplicate (blocked by
-- the real unique constraint on public.likes). That let repeat calls
-- to send_like against the SAME target spam unlimited "X liked you"
-- notifications while never tripping the rate limit added in 007
-- (which counts rows in `likes`, and duplicate likes never add rows).
--
-- Fixed by only creating notifications when the like was genuinely
-- new, using PL/pgSQL's FOUND variable (true only if the preceding
-- INSERT ... ON CONFLICT DO NOTHING actually inserted a row).
-- ============================================================

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

  IF FOUND THEN
    -- Only notify/check for a match on a genuinely new like — repeat
    -- calls against an already-liked target must not spam notifications.
    INSERT INTO public.activity (user_id, type, actor_id)
    VALUES (p_liked_id, 'new_like', p_liker_id);

    v_is_mutual := public.is_mutual_match(p_liker_id, p_liked_id);

    IF v_is_mutual THEN
      INSERT INTO public.activity (user_id, type, actor_id)
      VALUES
        (p_liked_id, 'new_match', p_liker_id),
        (p_liker_id, 'new_match', p_liked_id);
    END IF;
  ELSE
    v_is_mutual := public.is_mutual_match(p_liker_id, p_liked_id);
  END IF;

  RETURN json_build_object(
    'success', true,
    'is_mutual_match', v_is_mutual
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
