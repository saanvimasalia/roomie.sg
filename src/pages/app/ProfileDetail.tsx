import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import Avatar from '../../components/Avatar'
import ConnectModal from '../../components/ConnectModal'

const DETAIL_ROWS: { emoji: string; label: string; key: keyof import('../../types').UserProfile }[] = [
  { emoji: '🌙', label: 'Diet',          key: 'diet' },
  { emoji: '⏰', label: 'Wake time',     key: 'wake_time' },
  { emoji: '🛏️', label: 'Bedtime',       key: 'sleep_time' },
  { emoji: '📚', label: 'Studies at',    key: 'study_location' },
  { emoji: '👥', label: 'Social style',  key: 'social_style' },
  { emoji: '🚪', label: 'Guests',        key: 'guest_frequency' },
  { emoji: '✨', label: 'Cleanliness',   key: 'cleanliness' },
]

function formatFieldValue(key: string, value: unknown): string {
  if (key === 'wake_time' || key === 'sleep_time') {
    const h = value as number
    if (h === 0) return '12:00 AM'
    if (h < 12) return `${h}:00 AM`
    if (h === 12) return '12:00 PM'
    return `${h - 12}:00 PM`
  }
  if (key === 'study_location') {
    const map: Record<string, string> = {
      room: 'In my room', library: 'Library', mixed: 'Mixed', cafes: 'Cafes',
    }
    return map[value as string] ?? String(value)
  }
  if (key === 'guest_frequency') {
    const map: Record<string, string> = {
      never: 'Never', rarely: 'Rarely', sometimes: 'Sometimes', often: 'Often',
    }
    return map[value as string] ?? String(value)
  }
  if (key === 'social_style') {
    const s = value as string
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
  if (key === 'diet') {
    const map: Record<string, string> = {
      halal: 'Halal', vegetarian: 'Vegetarian', no_pork_beef: 'No pork / beef', none: 'No restrictions',
    }
    return map[value as string] ?? String(value)
  }
  if (key === 'cleanliness') {
    const s = value as string
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
  return String(value)
}

const LABEL_STYLES: Record<string, string> = {
  'Great match': 'bg-terra text-white',
  'Good match':  'bg-sage text-white',
  'Decent match': 'bg-wb2 text-white',
}

export default function ProfileDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profiles, currentUser, likedIds, mutualMatchIds, incomingLikeIds, toggleLike } = useAppContext()
  const [connectOpen, setConnectOpen] = useState(false)

  const profile = profiles.find(p => p.id === id)

  if (!profile) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-5">
        <p className="font-syne text-lg font-bold text-wb">Profile not found</p>
        <button onClick={() => navigate(-1)} className="font-dm text-sm text-terra mt-3">
          Go back
        </button>
      </div>
    )
  }

  const isLiked = likedIds.includes(profile.id)
  const isMutual = mutualMatchIds.includes(profile.id)

  const handleLike = () => {
    toggleLike(profile.id)
  }

  const booleanHabits: { emoji: string; label: string; value: boolean }[] = [
    { emoji: '🚬', label: 'Smokes',          value: profile.smoking },
    { emoji: '❄️', label: 'Needs AC',         value: profile.needs_ac },
    { emoji: '🍳', label: 'Cooks regularly',  value: profile.cooks },
    { emoji: '🤫', label: 'Prefers quiet',    value: profile.prefers_quiet },
    { emoji: '🐾', label: 'Has a pet',        value: profile.has_pet },
  ].filter(h => h.value)

  return (
    <div className="min-h-screen bg-cream">
      {/* Photo */}
      <div className="relative w-full aspect-[3/4] bg-sand">
        {profile.photo_url ? (
          <img src={profile.photo_url} alt={profile.name} className="w-full h-full object-cover" />
        ) : (
          <Avatar
            photoUrl={null}
            name={profile.name}
            userId={profile.id}
            size={0}
            className="!rounded-none !w-full !h-full"
          />
        )}

        {/* Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow"
          aria-label="Go back"
        >
          <svg className="w-4 h-4 text-wb" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Like button */}
        <button
          onClick={handleLike}
          className="absolute top-12 right-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow"
          aria-label={isLiked ? 'Unlike' : 'Like'}
        >
          {isLiked ? (
            <svg className="w-5 h-5 text-terra" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-wb2" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          )}
        </button>

        {/* Match badge on photo */}
        <div className={`absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full ${LABEL_STYLES[profile.label]}`}>
          <span className="font-dm text-sm font-bold">{profile.score}%</span>
          <span className="font-dm text-sm">{profile.label}</span>
        </div>
      </div>

      {/* Info */}
      <div className="px-5 py-5 pb-10">
        {/* Name + basics */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="font-syne text-2xl font-bold text-wb">
              {profile.name}, {profile.age}
            </h1>
            <p className="font-dm text-sm text-wb2 mt-0.5">
              {profile.year} · {profile.faculty} · {profile.university}
            </p>
            <p className="font-dm text-sm text-wb3 mt-0.5">
              {profile.nationality}
            </p>
          </div>
        </div>

        {/* Why You Match pills */}
        {profile.match_reasons.length > 0 && (
          <div className="mb-5">
            <p className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide mb-2">
              Why you match
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.match_reasons.map(reason => (
                <span
                  key={reason}
                  className="bg-sage-light text-sage-dark font-dm text-xs font-medium px-3 py-1.5 rounded-full"
                >
                  ✓ {reason}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Hall */}
        <div className="bg-sand rounded-2xl px-4 py-3 mb-4 flex items-center gap-3">
          <svg className="w-4 h-4 text-wb2 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span className="font-dm text-sm text-wb">
            {profile.hall_preference} · Moving in {profile.move_in_semester}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-sand mb-4" />

        {/* Lifestyle grid */}
        <p className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide mb-3">
          Lifestyle
        </p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {DETAIL_ROWS.map(row => (
            <div key={row.key} className="bg-sand rounded-xl px-3 py-3 flex items-center gap-2">
              <span className="text-base">{row.emoji}</span>
              <div className="min-w-0">
                <p className="font-dm text-[10px] text-wb3 leading-none">{row.label}</p>
                <p className="font-dm text-sm text-wb font-medium leading-snug mt-0.5 truncate">
                  {formatFieldValue(row.key, profile[row.key])}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Boolean habits */}
        {booleanHabits.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {booleanHabits.map(h => (
              <span key={h.label} className="bg-terra-light text-terra font-dm text-xs font-medium px-3 py-1.5 rounded-full">
                {h.emoji} {h.label}
              </span>
            ))}
          </div>
        )}

        {/* Allergies */}
        {profile.allergies.length > 0 && (
          <div className="mb-5">
            <p className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide mb-2">Allergies</p>
            <div className="flex flex-wrap gap-2">
              {profile.allergies.map(a => (
                <span key={a} className="bg-sand text-wb font-dm text-xs px-3 py-1.5 rounded-full">{a}</span>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-sand mb-5" />

        {/* Prompts */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="bg-sand rounded-2xl px-4 py-4">
            <p className="font-syne text-sm font-bold text-wb mb-2">A little about me…</p>
            <p className="font-dm text-sm text-wb2 leading-relaxed">{profile.prompt_1_answer}</p>
          </div>
          <div className="bg-sand rounded-2xl px-4 py-4">
            <p className="font-syne text-sm font-bold text-wb mb-2">{profile.prompt_2_question}</p>
            <p className="font-dm text-sm text-wb2 leading-relaxed">{profile.prompt_2_answer}</p>
          </div>
        </div>

        {/* Connect button — only for mutual matches */}
        {isMutual ? (
          <button
            onClick={() => setConnectOpen(true)}
            className="w-full bg-terra text-white font-dm font-medium py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
            Connect with {profile.name}
          </button>
        ) : (
          <button
            onClick={handleLike}
            className={`w-full font-dm font-medium py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform ${
              isLiked
                ? 'bg-terra-light text-terra border border-terra'
                : 'bg-terra text-white'
            }`}
          >
            {isLiked ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
                Liked
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                Like {profile.name}
              </>
            )}
          </button>
        )}

        {/* Incoming like note */}
        {incomingLikeIds.includes(profile.id) && !isMutual && (
          <p className="font-dm text-xs text-sage text-center mt-3">
            ✓ {profile.name} already liked you — like back to connect!
          </p>
        )}
      </div>

      {/* Connect modal */}
      {connectOpen && (
        <ConnectModal
          profile={profile}
          currentUser={currentUser}
          onClose={() => setConnectOpen(false)}
        />
      )}
    </div>
  )
}
