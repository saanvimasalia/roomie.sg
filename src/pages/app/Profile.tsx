import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import Avatar from '../../components/Avatar'

const DIET_LABELS: Record<string, string> = {
  halal: 'Halal', vegetarian: 'Vegetarian', no_pork_beef: 'No pork / beef', none: 'No restrictions',
}
const STUDY_LABELS: Record<string, string> = {
  room: 'In my room', library: 'Library', mixed: 'Mixed', cafes: 'Cafes',
}
const SOCIAL_LABELS: Record<string, string> = {
  introvert: 'Introvert', ambivert: 'Ambivert', extrovert: 'Extrovert',
}

function ChevronRight() {
  return (
    <svg className="w-4 h-4 text-wb3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const { currentUser, activities, mutualMatchIds, togglePause } = useAppContext()

  const likesReceived = activities.filter(a => a.type === 'new_like').length
  const matchCount    = mutualMatchIds.length

  return (
    <div className="flex flex-col min-h-full pb-6">
      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex items-center justify-between flex-shrink-0">
        <h1 className="font-syne text-2xl font-bold text-wb">My Profile</h1>
        <button
          onClick={() => navigate('/app/profile/edit')}
          className="flex items-center gap-1.5 bg-sand px-3 py-2 rounded-xl active:scale-95 transition-transform"
        >
          <svg className="w-4 h-4 text-wb2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
          </svg>
          <span className="font-dm text-sm text-wb font-medium">Edit</span>
        </button>
      </div>

      <div className="px-5 flex flex-col gap-5">
        {/* ── Profile card preview ─────────────────────────────── */}
        <div className="bg-sand rounded-3xl overflow-hidden">
          {/* Photo strip */}
          <div className="relative w-full aspect-[3/4] bg-cream">
            {currentUser.photo_url ? (
              <img src={currentUser.photo_url} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              <Avatar
                photoUrl={null}
                name={currentUser.name}
                userId={currentUser.id}
                size={0}
                className="!rounded-none !w-full !h-full"
              />
            )}

            {/* Paused banner */}
            {currentUser.is_paused && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white/90 px-5 py-3 rounded-2xl text-center">
                  <p className="font-syne text-base font-bold text-wb">Profile paused</p>
                  <p className="font-dm text-xs text-wb2 mt-0.5">You won't appear in feeds</p>
                </div>
              </div>
            )}

            {/* Edit photo button */}
            <button
              onClick={() => navigate('/app/profile/edit')}
              className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow"
              aria-label="Edit photo"
            >
              <svg className="w-4 h-4 text-wb" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </button>
          </div>

          {/* Info */}
          <div className="px-4 py-3">
            <p className="font-syne text-xl font-bold text-wb">
              {currentUser.name}, {currentUser.age}
            </p>
            <p className="font-dm text-sm text-wb2 mt-0.5">
              {currentUser.year} · {currentUser.faculty} · {currentUser.university}
            </p>
            <p className="font-dm text-xs text-wb3 mt-0.5">
              {currentUser.hall_preference} · {currentUser.move_in_semester}
            </p>
          </div>
        </div>

        {/* ── Stats ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-sand rounded-2xl px-4 py-4 flex flex-col items-center gap-1">
            <svg className="w-6 h-6 text-terra" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            <p className="font-syne text-2xl font-bold text-wb">{likesReceived}</p>
            <p className="font-dm text-xs text-wb2">Likes received</p>
          </div>
          <div className="bg-sand rounded-2xl px-4 py-4 flex flex-col items-center gap-1">
            <span className="text-2xl">🎉</span>
            <p className="font-syne text-2xl font-bold text-wb">{matchCount}</p>
            <p className="font-dm text-xs text-wb2">Matches</p>
          </div>
        </div>

        {/* ── Prompts preview ──────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <div className="bg-sand rounded-2xl px-4 py-3.5">
            <p className="font-syne text-sm font-bold text-wb mb-1.5">A little about me…</p>
            <p className="font-dm text-sm text-wb2 leading-relaxed">{currentUser.prompt_1_answer}</p>
          </div>
          {currentUser.prompt_2_question && (
            <div className="bg-sand rounded-2xl px-4 py-3.5">
              <p className="font-syne text-sm font-bold text-wb mb-1.5">{currentUser.prompt_2_question}</p>
              <p className="font-dm text-sm text-wb2 leading-relaxed">{currentUser.prompt_2_answer}</p>
            </div>
          )}
        </div>

        {/* ── Quick lifestyle pills ─────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          <span className="bg-sand text-wb font-dm text-xs px-3 py-1.5 rounded-full">
            {DIET_LABELS[currentUser.diet] ?? currentUser.diet}
          </span>
          <span className="bg-sand text-wb font-dm text-xs px-3 py-1.5 rounded-full">
            {SOCIAL_LABELS[currentUser.social_style] ?? currentUser.social_style}
          </span>
          <span className="bg-sand text-wb font-dm text-xs px-3 py-1.5 rounded-full">
            {STUDY_LABELS[currentUser.study_location] ?? currentUser.study_location}
          </span>
          {currentUser.needs_ac    && <span className="bg-sand text-wb font-dm text-xs px-3 py-1.5 rounded-full">❄️ Needs AC</span>}
          {currentUser.cooks       && <span className="bg-sand text-wb font-dm text-xs px-3 py-1.5 rounded-full">🍳 Cooks</span>}
          {currentUser.prefers_quiet && <span className="bg-sand text-wb font-dm text-xs px-3 py-1.5 rounded-full">🤫 Prefers quiet</span>}
        </div>

        {/* ── Settings ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <p className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide">Settings</p>

          {/* Edit profile */}
          <button
            onClick={() => navigate('/app/profile/edit')}
            className="w-full flex items-center gap-3 bg-sand px-4 py-3.5 rounded-2xl active:scale-[0.98] transition-transform"
          >
            <svg className="w-5 h-5 text-wb2 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
            <div className="flex-1 text-left">
              <p className="font-dm text-sm font-medium text-wb">Edit profile</p>
              <p className="font-dm text-xs text-wb3">Update your info, habits and prompts</p>
            </div>
            <ChevronRight />
          </button>

          {/* Pause toggle */}
          <button
            onClick={togglePause}
            className="w-full flex items-center gap-3 bg-sand px-4 py-3.5 rounded-2xl active:scale-[0.98] transition-transform"
          >
            <svg className="w-5 h-5 text-wb2 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>
            <div className="flex-1 text-left">
              <p className="font-dm text-sm font-medium text-wb">Pause profile</p>
              <p className="font-dm text-xs text-wb3">
                {currentUser.is_paused ? 'Paused — not visible in feeds' : 'Active — visible to others'}
              </p>
            </div>
            {/* Toggle switch */}
            <div className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-200 ${currentUser.is_paused ? 'bg-terra' : 'bg-wb3'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${currentUser.is_paused ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </button>

          {/* Connect via */}
          <button
            onClick={() => navigate('/app/profile/edit')}
            className="w-full flex items-center gap-3 bg-sand px-4 py-3.5 rounded-2xl active:scale-[0.98] transition-transform"
          >
            <svg className="w-5 h-5 text-wb2 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
            <div className="flex-1 text-left">
              <p className="font-dm text-sm font-medium text-wb">Connect via</p>
              <p className="font-dm text-xs text-wb3">
                {currentUser.connect_platform === 'telegram' ? 'Telegram' : 'WhatsApp'}
                {currentUser.connect_handle ? ` · ${currentUser.connect_platform === 'telegram' ? '@' : ''}${currentUser.connect_handle}` : ''}
              </p>
            </div>
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  )
}
