import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import ProfileCard from '../../components/ProfileCard'
import MatchMoment from '../../components/MatchMoment'
import ConnectModal from '../../components/ConnectModal'
import FilterSheet, { type FilterCategory } from '../../components/FilterSheet'
import type { ProfileWithScore } from '../../types'

type SubTab = 'matches' | 'for-you' | 'all'

// ─── Filter logic ────────────────────────────────────────────────────────────

function timeDiff(a: number, b: number): number {
  const d = Math.abs(a - b)
  return Math.min(d, 24 - d)
}

const DIET_ORDER = ['vegetarian', 'halal', 'no_pork_beef', 'none'] as const
const CLEAN_ORDER = ['relaxed', 'average', 'tidy'] as const
const SOCIAL_ORDER = ['introvert', 'ambivert', 'extrovert'] as const

function applyFilters(
  profiles: ProfileWithScore[],
  me: ProfileWithScore,
  active: FilterCategory[],
): ProfileWithScore[] {
  if (active.length === 0) return profiles

  return profiles.filter(p => {
    for (const cat of active) {
      if (cat === 'routine') {
        if (timeDiff(p.wake_time, me.wake_time) > 3) return false
        if (timeDiff(p.sleep_time, me.sleep_time) > 3) return false
      }
      if (cat === 'age') {
        if (Math.abs(p.age - me.age) > 3) return false
      }
      if (cat === 'faculty') {
        if (p.faculty !== me.faculty) return false
      }
      if (cat === 'smoking') {
        if (p.smoking !== me.smoking) return false
      }
      if (cat === 'diet') {
        const myIdx = DIET_ORDER.indexOf(me.diet as typeof DIET_ORDER[number])
        const theirIdx = DIET_ORDER.indexOf(p.diet as typeof DIET_ORDER[number])
        // They must be at same restriction level or stricter (lower index)
        if (theirIdx > myIdx) return false
      }
      if (cat === 'cleanliness') {
        const myIdx = CLEAN_ORDER.indexOf(me.cleanliness as typeof CLEAN_ORDER[number])
        const theirIdx = CLEAN_ORDER.indexOf(p.cleanliness as typeof CLEAN_ORDER[number])
        if (Math.abs(theirIdx - myIdx) > 1) return false
      }
      if (cat === 'social') {
        const myIdx = SOCIAL_ORDER.indexOf(me.social_style as typeof SOCIAL_ORDER[number])
        const theirIdx = SOCIAL_ORDER.indexOf(p.social_style as typeof SOCIAL_ORDER[number])
        if (Math.abs(theirIdx - myIdx) > 1) return false
      }
      if (cat === 'ac') {
        if (p.needs_ac !== me.needs_ac) return false
      }
      if (cat === 'quiet') {
        if (p.prefers_quiet !== me.prefers_quiet) return false
      }
      if (cat === 'cooking') {
        if (p.cooks !== me.cooks) return false
      }
    }
    return true
  })
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Discover() {
  const navigate = useNavigate()
  const {
    profiles,
    currentUser,
    likedIds,
    mutualMatchIds,
    toggleLike,
    loading,
  } = useAppContext()

  const [activeTab, setActiveTab] = useState<SubTab>('for-you')
  const [matchMomentProfile, setMatchMomentProfile] = useState<ProfileWithScore | null>(null)
  const [connectProfile, setConnectProfile] = useState<ProfileWithScore | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<FilterCategory[]>([])
  const [seenMatchIds, setSeenMatchIds] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('seenMatchIds') ?? '[]')) } catch { return new Set() }
  })

  const handleTabChange = (tab: SubTab) => {
    setActiveTab(tab)
    if (tab === 'matches') {
      setSeenMatchIds(prev => {
        const next = new Set([...prev, ...mutualMatchIds])
        localStorage.setItem('seenMatchIds', JSON.stringify([...next]))
        return next
      })
    }
  }

  const handleLike = async (profile: ProfileWithScore) => {
    const wasLiked = likedIds.includes(profile.id)
    const { isMutual } = await toggleLike(profile.id)
    if (!wasLiked && isMutual) {
      setMatchMomentProfile(profile)
    }
  }

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-dm text-wb2">Loading…</p>
      </div>
    )
  }

  // Apply active filters
  const filtersActive = activeFilters.length > 0
  const filtered = applyFilters(profiles, currentUser, activeFilters)

  // Feed derivations
  const matchesFeed = filtered
    .filter(p => mutualMatchIds.includes(p.id))
    .sort((a, b) => b.score - a.score)

  const forYouFeed = filtered
    .filter(p => !mutualMatchIds.includes(p.id) && p.score >= 50)
    .sort((a, b) => b.score - a.score)

  const allFeed = [...filtered].sort((a, b) => b.score - a.score)

  const feeds: Record<SubTab, ProfileWithScore[]> = {
    matches: matchesFeed,
    'for-you': forYouFeed,
    all: allFeed,
  }
  const currentFeed = feeds[activeTab]

  const tabs: { value: SubTab; label: string }[] = [
    { value: 'matches', label: 'Matches' },
    { value: 'for-you', label: 'For You' },
    { value: 'all', label: `All ${currentUser.university}` },
  ]

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-5 pt-10 pb-4 flex items-center justify-between flex-shrink-0">
        <h1 className="font-syne text-2xl font-bold text-wb">roomie.sg</h1>
        <button
          onClick={() => setFilterOpen(true)}
          className={`relative w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform ${
            filtersActive ? 'bg-terra text-white' : 'bg-sand text-wb2'
          }`}
          aria-label="Filter"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          {filtersActive && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <span className="font-dm text-[9px] font-bold text-terra">{activeFilters.length}</span>
            </span>
          )}
        </button>
      </div>

      {/* Sub-tab bar */}
      <div className="px-5 mb-4 flex-shrink-0">
        <div className="flex bg-sand rounded-2xl p-1 gap-0.5">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`flex-1 py-2.5 rounded-xl font-dm text-sm font-medium transition-all relative ${
                activeTab === tab.value ? 'bg-white text-wb shadow-sm' : 'text-wb3'
              }`}
            >
              {tab.label}
              {/* Unread dot for Matches tab */}
              {tab.value === 'matches' && mutualMatchIds.some(id => !seenMatchIds.has(id)) && activeTab !== 'matches' && (
                <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-terra rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 px-5 pb-4">
        {currentFeed.length === 0 ? (
          <EmptyState
            tab={activeTab}
            filtersActive={filtersActive}
            onSwitch={() => setActiveTab('for-you')}
            onClearFilters={() => setActiveFilters([])}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {currentFeed.map(profile => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isLiked={likedIds.includes(profile.id)}
                isMutualMatch={mutualMatchIds.includes(profile.id)}
                onLike={() => handleLike(profile)}
                onPress={() => navigate(`/app/user/${profile.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Match moment overlay */}
      {matchMomentProfile && currentUser && (
        <MatchMoment
          profile={matchMomentProfile}
          currentUser={currentUser}
          onSayHello={() => {
            setMatchMomentProfile(null)
            setConnectProfile(matchMomentProfile)
          }}
          onDismiss={() => setMatchMomentProfile(null)}
        />
      )}

      {/* Connect modal */}
      {connectProfile && currentUser && (
        <ConnectModal
          profile={connectProfile}
          currentUser={currentUser}
          onClose={() => setConnectProfile(null)}
        />
      )}

      {/* Filter sheet */}
      {filterOpen && (
        <FilterSheet
          currentUser={currentUser}
          active={activeFilters}
          onApply={(cats) => { setActiveFilters(cats); setFilterOpen(false) }}
          onClose={() => setFilterOpen(false)}
        />
      )}
    </div>
  )
}

function EmptyState({ tab, filtersActive, onSwitch, onClearFilters }: {
  tab: SubTab
  filtersActive: boolean
  onSwitch: () => void
  onClearFilters: () => void
}) {
  if (filtersActive) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <span className="text-5xl mb-4">🔍</span>
        <p className="font-syne text-lg font-bold text-wb">No matches for these filters</p>
        <p className="font-dm text-sm text-wb2 mt-1 mb-5">Try removing a category to see more people.</p>
        <button
          onClick={onClearFilters}
          className="bg-terra text-white font-dm font-medium px-5 py-3 rounded-2xl"
        >
          Clear filters
        </button>
      </div>
    )
  }
  if (tab === 'matches') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <span className="text-5xl mb-4">💛</span>
        <p className="font-syne text-lg font-bold text-wb">No matches yet</p>
        <p className="font-dm text-sm text-wb2 mt-1 mb-5">
          Like profiles in For You to get mutual matches.
        </p>
        <button
          onClick={onSwitch}
          className="bg-terra text-white font-dm font-medium px-5 py-3 rounded-2xl"
        >
          Browse For You
        </button>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <span className="text-5xl mb-4">🔍</span>
      <p className="font-syne text-lg font-bold text-wb">You've seen everyone</p>
      <p className="font-dm text-sm text-wb2 mt-1">Check back when more students sign up.</p>
    </div>
  )
}
