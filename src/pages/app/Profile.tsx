import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import Avatar from '../../components/Avatar'
import { supabase } from '../../lib/supabase'

const DIET_PILLS: Record<string, string> = {
  halal: '🌙 Halal diet',
  vegetarian: '🥗 Vegetarian',
  no_pork_beef: '🥩 No pork or beef',
  // 'none' is intentionally omitted — not useful to display
}
const SOCIAL_PILLS: Record<string, string> = {
  introvert: '🎧 Introvert',
  ambivert: '⚖️ Ambivert',
  extrovert: '🎉 Extrovert',
}
const STUDY_PILLS: Record<string, string> = {
  room: '🏠 Studies in room',
  library: '📚 Library person',
  cafes: '☕ Café studier',
  mixed: '🔀 Flexible studier',
}


export default function Profile() {
  const navigate = useNavigate()
  const { currentUser, activities, mutualMatchIds, togglePause, loading } = useAppContext()

  // Change password
  const [pwOpen, setPwOpen]         = useState(false)
  const [newPw, setNewPw]           = useState('')
  const [confirmPw, setConfirmPw]   = useState('')
  const [showPw, setShowPw]         = useState(false)
  const [pwSaving, setPwSaving]     = useState(false)
  const [pwError, setPwError]       = useState('')
  const [pwSuccess, setPwSuccess]   = useState(false)

  const handlePasswordUpdate = async () => {
    setPwError('')
    setPwSuccess(false)
    if (newPw.length < 8) { setPwError('At least 8 characters required.'); return }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return }
    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setPwSaving(false)
    if (error) { setPwError(error.message); return }
    setPwSuccess(true)
    setNewPw(''); setConfirmPw(''); setTimeout(() => { setPwOpen(false); setPwSuccess(false) }, 1500)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/onboarding/splash', { replace: true })
  }

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-dm text-wb2">Loading profile…</p>
      </div>
    )
  }

  const likesReceived = activities.filter(a => a.type === 'new_like').length
  const matchCount    = mutualMatchIds.length

  return (
    <div className="flex flex-col min-h-full pb-6">
      {/* Header */}
      <div className="px-5 pt-10 pb-4 flex items-center justify-between flex-shrink-0">
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
          {/* Diet — only show if non-trivial */}
          {DIET_PILLS[currentUser.diet] && (
            <span className="bg-sand text-wb font-dm text-xs px-3 py-1.5 rounded-full">
              {DIET_PILLS[currentUser.diet]}
            </span>
          )}
          {/* Social style */}
          <span className="bg-sand text-wb font-dm text-xs px-3 py-1.5 rounded-full">
            {SOCIAL_PILLS[currentUser.social_style] ?? currentUser.social_style}
          </span>
          {/* Study location */}
          <span className="bg-sand text-wb font-dm text-xs px-3 py-1.5 rounded-full">
            {STUDY_PILLS[currentUser.study_location] ?? currentUser.study_location}
          </span>
          {/* Boolean habits */}
          {currentUser.smoking      && <span className="bg-sand text-wb font-dm text-xs px-3 py-1.5 rounded-full">🚬 Smoker</span>}
          {currentUser.needs_ac     && <span className="bg-sand text-wb font-dm text-xs px-3 py-1.5 rounded-full">❄️ Needs AC</span>}
          {currentUser.cooks        && <span className="bg-sand text-wb font-dm text-xs px-3 py-1.5 rounded-full">🍳 Cooks regularly</span>}
          {currentUser.prefers_quiet && <span className="bg-sand text-wb font-dm text-xs px-3 py-1.5 rounded-full">🤫 Prefers quiet</span>}
        </div>

        {/* ── Settings ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <p className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide">Settings</p>

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
            <div className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-200 ${currentUser.is_paused ? 'bg-terra' : 'bg-wb3'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${currentUser.is_paused ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </button>

          {/* Connect via — display only */}
          <div className="w-full flex items-center gap-3 bg-sand px-4 py-3.5 rounded-2xl">
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
          </div>

          {/* Change password */}
          <button
            onClick={() => { setPwOpen(v => !v); setPwError(''); setPwSuccess(false); setNewPw(''); setConfirmPw('') }}
            className="w-full flex items-center gap-3 bg-sand px-4 py-3.5 rounded-2xl active:scale-[0.98] transition-transform"
          >
            <svg className="w-5 h-5 text-wb2 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <div className="flex-1 text-left">
              <p className="font-dm text-sm font-medium text-wb">Change password</p>
            </div>
            <svg className={`w-4 h-4 text-wb3 transition-transform duration-200 ${pwOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Inline password form */}
          {pwOpen && (
            <div className="bg-sand rounded-2xl px-4 py-4 flex flex-col gap-3">
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="New password (min. 8 characters)"
                  value={newPw}
                  onChange={e => { setNewPw(e.target.value); setPwError(''); setPwSuccess(false) }}
                  autoComplete="new-password"
                  className="w-full bg-white rounded-xl px-4 pr-12 py-3 font-dm text-sm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-wb3">
                  {showPw ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  )}
                </button>
              </div>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPw}
                onChange={e => { setConfirmPw(e.target.value); setPwError(''); setPwSuccess(false) }}
                autoComplete="new-password"
                className="w-full bg-white rounded-xl px-4 py-3 font-dm text-sm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none"
              />
              {pwError   && <p className="font-dm text-xs text-red-500">{pwError}</p>}
              {pwSuccess  && <p className="font-dm text-xs text-sage">✓ Password updated!</p>}
              <button
                onClick={handlePasswordUpdate}
                disabled={!newPw || !confirmPw || pwSaving}
                className={`w-full py-3 rounded-xl font-dm text-sm font-medium transition-all ${
                  newPw && confirmPw && !pwSaving ? 'bg-terra text-white active:scale-[0.98]' : 'bg-wb3/30 text-wb3 cursor-not-allowed'
                }`}
              >
                {pwSaving ? 'Updating…' : 'Update password'}
              </button>
            </div>
          )}

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 bg-sand px-4 py-3.5 rounded-2xl active:scale-[0.98] transition-transform"
          >
            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <p className="font-dm text-sm font-medium text-red-400">Sign out</p>
          </button>
        </div>
      </div>
    </div>
  )
}
