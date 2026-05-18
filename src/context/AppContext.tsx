import { createContext, useContext, useState, ReactNode } from 'react'
import { mockProfiles, mockCurrentUser, mockActivity } from '../lib/mockData'
import type { ProfileWithScore, Activity } from '../types'

const INCOMING_LIKE_IDS = ['user-001', 'user-002']

type AppContextType = {
  currentUser: ProfileWithScore
  profiles: ProfileWithScore[]
  activities: Activity[]
  likedIds: string[]
  incomingLikeIds: string[]
  mutualMatchIds: string[]
  unreadCount: number
  toggleLike: (profileId: string) => void
  markActivitiesRead: () => void
  updateCurrentUser: (updates: Partial<ProfileWithScore>) => void
  togglePause: () => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [profiles] = useState<ProfileWithScore[]>(mockProfiles)
  const [currentUser, setCurrentUser] = useState<ProfileWithScore>(mockCurrentUser)
  const [likedIds, setLikedIds] = useState<string[]>(['user-001'])
  const [activities, setActivities] = useState<Activity[]>(mockActivity)

  const mutualMatchIds = likedIds.filter(id => INCOMING_LIKE_IDS.includes(id))
  const unreadCount = activities.filter(a => !a.is_read).length

  const toggleLike = (profileId: string) => {
    setLikedIds(prev =>
      prev.includes(profileId)
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    )
  }

  const markActivitiesRead = () => {
    setActivities(prev => prev.map(a => ({ ...a, is_read: true })))
  }

  const updateCurrentUser = (updates: Partial<ProfileWithScore>) => {
    setCurrentUser(prev => ({ ...prev, ...updates }))
  }

  const togglePause = () => {
    setCurrentUser(prev => ({ ...prev, is_paused: !prev.is_paused }))
  }

  return (
    <AppContext.Provider
      value={{
        currentUser,
        profiles,
        activities,
        likedIds,
        incomingLikeIds: INCOMING_LIKE_IDS,
        mutualMatchIds,
        unreadCount,
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
