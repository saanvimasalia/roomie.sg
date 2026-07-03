import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { getMatchReasons } from '../lib/utils'
import type { ProfileWithScore, Activity, UserProfile, MatchLabel } from '../types'

type ActorProfile = { id: string; name: string; photo_url: string | null }

type AppContextType = {
  currentUser: ProfileWithScore | null
  profiles: ProfileWithScore[]
  activities: Activity[]
  actorProfileMap: Record<string, ActorProfile>
  likedIds: string[]
  incomingLikeIds: string[]
  mutualMatchIds: string[]
  unreadCount: number
  loading: boolean
  toggleLike: (profileId: string) => Promise<{ isMutual: boolean }>
  markActivitiesRead: () => void
  updateCurrentUser: (updates: Partial<ProfileWithScore>) => void
  togglePause: () => void
}

const AppContext = createContext<AppContextType | null>(null)

function scoreToLabel(score: number): MatchLabel {
  if (score >= 75) return 'Great match'
  if (score >= 50) return 'Good match'
  return 'Decent match'
}

// The avatars bucket is private — `photo_url` in the DB is a storage path,
// not a usable URL. Batch-resolve every path referenced in one fetch into
// short-lived signed URLs (single API call instead of one per profile).
async function resolvePhotoUrlMap(paths: (string | null)[]): Promise<Map<string, string>> {
  const unique = [...new Set(paths.filter((p): p is string => !!p))]
  if (unique.length === 0) return new Map()

  const { data } = await supabase.storage.from('avatars').createSignedUrls(unique, 60 * 60 * 24)
  return new Map(
    (data ?? [])
      .filter((d): d is typeof d & { path: string; signedUrl: string } => !!d.path && !!d.signedUrl)
      .map(d => [d.path, d.signedUrl])
  )
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<ProfileWithScore | null>(null)
  const [profiles, setProfiles] = useState<ProfileWithScore[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [actorProfileMap, setActorProfileMap] = useState<Record<string, ActorProfile>>({})
  const [likedIds, setLikedIds] = useState<string[]>([])
  const [incomingLikeIds, setIncomingLikeIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    // Fetch current user's profile first — don't let feed failures block this
    const { data: currentUserData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Failed to load profile:', profileError.message)
    }

    // Fetch feed, likes and activity in parallel
    const [
      { data: feedData },
      { data: likedData },
      { data: incomingData },
      { data: activityData },
    ] = await Promise.all([
      supabase.rpc('get_for_you_feed', { p_user_id: user.id }),
      supabase.from('likes').select('liked_id').eq('liker_id', user.id),
      supabase.from('likes').select('liker_id').eq('liked_id', user.id),
      supabase.from('activity').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ])

    const likedIdList = (likedData ?? []).map((r: { liked_id: string }) => r.liked_id)
    const incomingIdList = (incomingData ?? []).map((r: { liker_id: string }) => r.liker_id)
    setLikedIds(likedIdList)
    setIncomingLikeIds(incomingIdList)
    const resolvedActivities = activityData ?? []
    setActivities(resolvedActivities)

    // Fetch profiles for activity actors (may include paused users not in Discover feed)
    const actorIds = [...new Set(resolvedActivities.map((a: Activity) => a.actor_id))]
    let actorData: ActorProfile[] | null = null
    if (actorIds.length > 0) {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, photo_url')
        .in('id', actorIds)
      actorData = data
    }

    // Fetch full profiles for the feed
    let profilesData: UserProfile[] | null = null
    let scoreMap = new Map<string, { score: number; is_mutual: boolean }>()
    if (feedData && feedData.length > 0) {
      const profileIds = feedData.map((r: { profile_id: string }) => r.profile_id)
      const { data } = await supabase.from('profiles').select('*').in('id', profileIds)
      profilesData = data
      type FeedRow = { profile_id: string; score: number; is_mutual: boolean }
      scoreMap = new Map(
        (feedData as FeedRow[]).map(r => [r.profile_id, { score: r.score, is_mutual: r.is_mutual }])
      )
    }

    // Batch-resolve every photo path referenced anywhere into signed URLs
    // in a single call, then apply before touching state
    const urlMap = await resolvePhotoUrlMap([
      currentUserData?.photo_url ?? null,
      ...(actorData ?? []).map(a => a.photo_url),
      ...(profilesData ?? []).map(p => p.photo_url),
    ])
    const resolveUrl = (path: string | null) => (path ? urlMap.get(path) ?? null : null)

    if (currentUserData) {
      setCurrentUser({
        ...currentUserData,
        photo_url: resolveUrl(currentUserData.photo_url),
        score: 100,
        label: 'Great match',
        match_reasons: [],
        is_mutual_match: false,
      })
    }

    if (actorData) {
      setActorProfileMap(
        Object.fromEntries(
          actorData.map(p => [p.id, { ...p, photo_url: resolveUrl(p.photo_url) }])
        )
      )
    }

    if (profilesData && currentUserData) {
      const merged: ProfileWithScore[] = profilesData.map((p: UserProfile) => {
        const s = scoreMap.get(p.id) ?? { score: 0, is_mutual: false }
        return {
          ...p,
          photo_url: resolveUrl(p.photo_url),
          score: s.score,
          label: scoreToLabel(s.score),
          is_mutual_match: s.is_mutual,
          match_reasons: getMatchReasons(currentUserData as UserProfile, p),
        }
      })

      setProfiles(merged)
    }

    setLoading(false)
  }

  const mutualMatchIds = likedIds.filter(id => incomingLikeIds.includes(id))
  const unreadCount = activities.filter(a => !a.is_read).length

  const toggleLike = async (profileId: string): Promise<{ isMutual: boolean }> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { isMutual: false }

    const isLiked = likedIds.includes(profileId)

    if (isLiked) {
      setLikedIds(prev => prev.filter(id => id !== profileId))
      const { error } = await supabase
        .from('likes')
        .delete()
        .match({ liker_id: user.id, liked_id: profileId })
      if (error) setLikedIds(prev => [...prev, profileId]) // revert on failure
      return { isMutual: false }
    } else {
      setLikedIds(prev => [...prev, profileId])
      const { data, error } = await supabase.rpc('send_like', {
        p_liker_id: user.id,
        p_liked_id: profileId,
      })
      if (error) {
        setLikedIds(prev => prev.filter(id => id !== profileId)) // revert on failure
        return { isMutual: false }
      }
      const isMutual = (data as { is_mutual_match: boolean })?.is_mutual_match ?? false
      if (isMutual) {
        setIncomingLikeIds(prev => [...prev, profileId])
        setProfiles(prev => prev.map(p =>
          p.id === profileId ? { ...p, is_mutual_match: true } : p
        ))
      }
      return { isMutual }
    }
  }

  const markActivitiesRead = () => {
    setActivities(prev => prev.map(a => ({ ...a, is_read: true })))
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) supabase.rpc('mark_activity_read', { p_user_id: user.id })
    })
  }

  const updateCurrentUser = (updates: Partial<ProfileWithScore>) => {
    setCurrentUser(prev => prev ? { ...prev, ...updates } : prev)
  }

  const togglePause = () => {
    setCurrentUser(prev => {
      if (!prev) return prev
      const next = !prev.is_paused
      supabase.from('profiles').update({ is_paused: next }).eq('id', prev.id)
      return { ...prev, is_paused: next }
    })
  }

  return (
    <AppContext.Provider
      value={{
        currentUser,
        profiles,
        activities,
        actorProfileMap,
        likedIds,
        incomingLikeIds,
        mutualMatchIds,
        unreadCount,
        loading,
        toggleLike,
        markActivitiesRead,
        updateCurrentUser,
        togglePause,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
