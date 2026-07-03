-- ============================================================
-- Migration 010: backfill photo_url from old public URLs to storage paths
--
-- Before today's fix, photo_url stored a permanent public URL. The app
-- now treats photo_url as a bare storage path and resolves it to a
-- signed URL on read. Any row saved before the fix still has the old
-- full-URL format, which fails to resolve — showing the default avatar
-- instead of the real photo, even though the file itself is untouched
-- in storage.
--
-- The path has always been the same fixed convention regardless of what
-- was stored (`{user_id}/avatar`, no extension), so it can be re-derived
-- directly from each row's id — no need to parse the old URL at all.
-- ============================================================

UPDATE public.profiles
SET photo_url = id::text || '/avatar'
WHERE photo_url IS NOT NULL;
