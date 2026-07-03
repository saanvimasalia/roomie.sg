import { supabase } from './supabase'
import type { UserProfile, Activity } from '../types'

// ─── Auth ──────────────────────────────────────────────────────────────────────

export async function sendOtp(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  })
  if (error) throw error
}

export async function verifyOtp(email: string, token: string): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
  if (error) throw error
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

// ─── Profiles ──────────────────────────────────────────────────────────────────

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data as UserProfile | null
}

export async function fetchProfiles(
  currentUserId: string,
  university: string,
): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('university', university)
    .eq('is_verified', true)
    .eq('is_paused', false)
    .neq('id', currentUserId)
  if (error) throw error
  return (data ?? []) as UserProfile[]
}

export async function upsertProfile(
  profile: Omit<UserProfile, 'created_at'>,
): Promise<void> {
  const { error } = await supabase.from('profiles').upsert(profile)
  if (error) throw error
}

export async function updateProfile(
  userId: string,
  updates: Partial<UserProfile>,
): Promise<void> {
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId)
  if (error) throw error
}

// ─── Likes ─────────────────────────────────────────────────────────────────────

export async function fetchLikedIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('likes')
    .select('liked_id')
    .eq('liker_id', userId)
  if (error) throw error
  return (data ?? []).map(r => r.liked_id as string)
}

export async function fetchIncomingLikeIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('likes')
    .select('liker_id')
    .eq('liked_id', userId)
  if (error) throw error
  return (data ?? []).map(r => r.liker_id as string)
}

export async function addLike(likerId: string, likedId: string): Promise<void> {
  const { error } = await supabase
    .from('likes')
    .insert({ liker_id: likerId, liked_id: likedId })
  // Ignore duplicate key — user double-tapped
  if (error && error.code !== '23505') throw error
}

export async function removeLike(likerId: string, likedId: string): Promise<void> {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('liker_id', likerId)
    .eq('liked_id', likedId)
  if (error) throw error
}

// ─── Activities ────────────────────────────────────────────────────────────────

export async function fetchActivities(userId: string): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activity')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []) as Activity[]
}

export async function markAllActivitiesRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('activity')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
  if (error) throw error
}

export async function createActivity(
  activity: Omit<Activity, 'id' | 'created_at'>,
): Promise<void> {
  const { error } = await supabase.from('activity').insert(activity)
  if (error) throw error
}
