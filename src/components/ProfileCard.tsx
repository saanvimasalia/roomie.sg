import { useState } from 'react'
import type { ProfileWithScore } from '../types'
import Avatar from './Avatar'

type Props = {
  profile: ProfileWithScore
  isLiked: boolean
  isMutualMatch: boolean
  onLike: () => void
  onPress: () => void
}

const LABEL_STYLES: Record<string, string> = {
  'Great match': 'bg-terra text-white',
  'Good match':  'bg-sage text-white',
  'Decent match': 'bg-wb2 text-white',
}

export default function ProfileCard({ profile, isLiked, isMutualMatch, onLike, onPress }: Props) {
  const [popKey, setPopKey] = useState(0)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLiked) setPopKey(k => k + 1) // retrigger animation
    onLike()
  }

  return (
    <button
      onClick={onPress}
      className="w-full text-left bg-sand rounded-3xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform"
    >
      {/* Photo */}
      <div className="relative w-full aspect-[3/4]">
        {profile.photo_url ? (
          <img
            src={profile.photo_url}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Avatar
            photoUrl={null}
            name={profile.name}
            userId={profile.id}
            size={0}
            className="!rounded-none !w-full !h-full"
          />
        )}

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Match badge */}
        <div className={`absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full ${LABEL_STYLES[profile.label]}`}>
          <span className="font-dm text-xs font-bold">{profile.score}%</span>
          <span className="font-dm text-xs">{profile.label}</span>
        </div>

        {/* Mutual match badge */}
        {isMutualMatch && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="text-xs">🎉</span>
            <span className="font-dm text-xs font-medium text-wb">Match!</span>
          </div>
        )}

        {/* Like button */}
        <button
          onClick={handleLike}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow"
          aria-label={isLiked ? 'Unlike' : 'Like'}
        >
          {isLiked ? (
            <svg
              key={popKey}
              className="w-5 h-5 text-terra animate-heart-pop"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-wb2"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="px-4 py-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-syne text-lg font-bold text-wb leading-tight">
              {profile.name}, {profile.age}
            </p>
            <p className="font-dm text-sm text-wb2 mt-0.5">
              {profile.year} · {profile.faculty}
            </p>
          </div>
          <span className="font-dm text-xs text-wb3 mt-1">{profile.university}</span>
        </div>

        <div className="flex items-center gap-1.5 mt-2">
          <svg className="w-3.5 h-3.5 text-wb3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span className="font-dm text-xs text-wb3">
            {profile.hall_preference} · {profile.move_in_semester}
          </span>
        </div>
      </div>
    </button>
  )
}
