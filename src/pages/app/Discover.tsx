import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import ProfileCard from '../../components/ProfileCard'
import MatchMoment from '../../components/MatchMoment'
import ConnectModal from '../../components/ConnectModal'
import type { ProfileWithScore } from '../../types'

type SubTab = 'matches' | 'for-you' | 'all'

export default function Discover() {
  const navigate = useNavigate()
  const {
    profiles,
    currentUser,
    likedIds,
    incomingLikeIds,
    mutualMatchIds,
    toggleLike,
  } = useAppContext()

  const [activeTab, setActiveTab] = useState<SubTab>('for-you')
  const [matchMomentProfile, setMatchMomentProfile] = useState<ProfileWithScore | null>(null)
  const [connectProfile, setConnectProfile] = useState<ProfileWithScore | null>(null)

  const handleLike = (profile: ProfileWithScore) => {
    const wasLiked = likedIds.includes(profile.id)
    toggleLike(profile.id)
    // Show match moment when liking someone who already liked us back
    if (!wasLiked && incomingLikeIds.includes(profile.id)) {
      setMatchMomentProfile(profile)
    }
  }

  // Feed derivations
  const matchesFeed = profiles
    .filter(p => mutualMatchIds.includes(p.id))
    .sort((a, b) => b.score - a.score)

  const forYouFeed = profiles
    .filter(p => !mutualMatchIds.includes(p.id) && p.score >= 50)
    .sort((a, b) => b.score - a.score)

  const allFeed = [...profiles].sort((a, b) => b.score - a.score)

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
      <div className="px-5 pt-14 pb-3 flex items-center justify-between flex-shrink-0">
        <h1 className="font-syne text-2xl font-extrabold text-wb tracking-tight">roomie.sg</h1>
        <button
          className="w-9 h-9 rounded-xl bg-sand flex items-center justify-center text-wb2 active:scale-90 transition-transform"
          aria-label="Filter"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
        </button>
      </div>

      {/* Sub-tab bar */}
      <div className="px-5 mb-4 flex-shrink-0">
        <div className="flex bg-sand rounded-2xl p-1 gap-0.5">
          {tabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 py-2.5 rounded-xl font-dm text-sm font-medium transition-all relative ${
                activeTab === tab.value ? 'bg-white text-wb shadow-sm' : 'text-wb3'
              }`}
            >
              {tab.label}
              {/* Unread dot for Matches tab */}
              {tab.value === 'matches' && matchesFeed.length > 0 && activeTab !== 'matches' && (
                <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-terra rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 px-5 pb-4">
        {currentFeed.length === 0 ? (
          <EmptyState tab={activeTab} onSwitch={() => setActiveTab('for-you')} />
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
      {matchMomentProfile && (
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
      {connectProfile && (
        <ConnectModal
          profile={connectProfile}
          currentUser={currentUser}
          onClose={() => setConnectProfile(null)}
        />
      )}
    </div>
  )
}

function EmptyState({ tab, onSwitch }: { tab: SubTab; onSwitch: () => void }) {
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
