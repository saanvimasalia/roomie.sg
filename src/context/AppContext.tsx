import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { getMatchReasons } from '../lib/utils'
import { mockCurrentUser, mockProfiles, mockActivity } from '../lib/mockData'
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<ProfileWithScore | null>(
    localStorage.getItem('dev_bypass') === 'true' ? mockCurrentUser : null
  )
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

    if (localStorage.getItem('dev_bypass') === 'true') {
      setCurrentUser(mockCurrentUser)
      setProfiles(mockProfiles)
      setActivities(mockActivity)
      setLikedIds(['user-001'])
      setIncomingLikeIds(['user-001', 'user-002'])
      setLoading(false)
      return
    }

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

    if (currentUserData) {
      setCurrentUser({
        ...currentUserData,
        score: 100,
        label: 'Great match',
        match_reasons: [],
        is_mutual_match: false,
      })
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
    if (actorIds.length > 0) {
      const { data: actorData } = await supabase
        .from('profiles')
        .select('id, name, photo_url')
        .in('id', actorIds)
      if (actorData) {
        setActorProfileMap(
          Object.fromEntries((actorData as ActorProfile[]).map(p => [p.id, p]))
        )
      }
    }

    // Fetch full profiles for the feed
    if (feedData && feedData.length > 0) {
      const profileIds = feedData.map((r: { profile_id: string }) => r.profile_id)
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', profileIds)

      if (profilesData && currentUserData) {
        type FeedRow = { profile_id: string; score: number; is_mutual: boolean }
        const scoreMap = new Map(
          (feedData as FeedRow[]).map(r => [r.profile_id, { score: r.score, is_mutual: r.is_mutual }])
        )

        const merged: ProfileWithScore[] = profilesData.map((p: UserProfile) => {
          const s = scoreMap.get(p.id) ?? { score: 0, is_mutual: false }
          return {
            ...p,
            score: s.score,
            label: scoreToLabel(s.score),
            is_mutual_match: s.is_mutual,
            match_reasons: getMatchReasons(currentUserData as UserProfile, p),
          }
        })

        setProfiles(merged)
      }
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
