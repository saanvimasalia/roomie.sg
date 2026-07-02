import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../context/OnboardingContext'
import { deriveUniversity } from '../../lib/utils'
import { supabase } from '../../lib/supabase'

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  )
}

export default function Verify() {
  const navigate = useNavigate()
  const { update } = useOnboarding()

  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [confirmPw, setConfirmPw]       = useState('')
  const [showPw, setShowPw]             = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [sent, setSent]                 = useState(false)

  const isLogin = localStorage.getItem('auth_intent') === 'login'
  const university = deriveUniversity(email)
  const isValidUniEmail = university !== null

  // ── Login ────────────────────────────────────────────────────────────────────

  const handleLogin = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    setLoading(false)

    if (signInError) {
      setError('Incorrect email or password. No account yet?')
      return
    }

    navigate('/app/discover', { replace: true })
  }

  // ── Signup ───────────────────────────────────────────────────────────────────

  const handleSignup = async () => {
    if (!isValidUniEmail) {
      setError('Please use your .ntu.edu.sg email.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPw) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    // Store password for use at end of onboarding (after OTP redirect)
    localStorage.setItem('signup_password', password)
    update({ email, university })
    setSent(true)
  }

  // ── Sent screen (signup) ─────────────────────────────────────────────────────

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-sage-light flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-sage" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
          </svg>
        </div>
        <h2 className="font-syne text-2xl font-bold text-wb">Check your inbox</h2>
        <p className="font-dm text-sm text-wb2 mt-2 leading-relaxed">
          We sent a verification link to<br />
          <span className="text-wb font-medium">{email}</span>
        </p>
        <p className="font-dm text-xs text-wb3 mt-4">
          Click the link to continue setting up your profile.
        </p>
        <button
          onClick={() => { setSent(false); setPassword(''); setConfirmPw('') }}
          className="mt-8 font-dm text-sm text-terra underline-offset-2 underline"
        >
          Use a different email
        </button>
      </div>
    )
  }

  // ── Shared input style ───────────────────────────────────────────────────────

  const inputClass = 'w-full bg-sand rounded-xl px-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-base'

  // ── Main form ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col px-5">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="mt-14 text-wb2 p-1 -ml-1 self-start"
        aria-label="Go back"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="mt-8 flex-1 flex flex-col gap-3">
        <h2 className="font-syne text-2xl font-bold text-wb mb-1">
          {isLogin ? 'Welcome back' : 'Create your account'}
        </h2>

        {/* Email */}
        <input
          type="email"
          placeholder="you@e.ntu.edu.sg"
          value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
          autoCapitalize="none"
          autoComplete="email"
          className={inputClass}
        />

        {/* University recognition (signup only) */}
        {!isLogin && isValidUniEmail && (
          <p className="font-dm text-xs text-sage -mt-1">✓ {university} email recognised</p>
        )}

        {/* Password */}
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-wb3"
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            <EyeIcon open={showPw} />
          </button>
        </div>

        {/* Confirm password (signup only) */}
        {!isLogin && (
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm password"
              value={confirmPw}
              onChange={e => { setConfirmPw(e.target.value); setError('') }}
              autoComplete="new-password"
              className={`${inputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-wb3"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              <EyeIcon open={showConfirm} />
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2">
            <p className="font-dm text-xs text-red-500">{error}</p>
            {isLogin && error.includes('No account yet') && (
              <button
                onClick={() => {
                  localStorage.setItem('auth_intent', 'signup')
                  navigate('/onboarding/verify')
                }}
                className="font-dm text-xs text-terra underline underline-offset-2 whitespace-nowrap"
              >
                Create one →
              </button>
            )}
          </div>
        )}

        {/* Hint */}
        {!isLogin && (
          <p className="font-dm text-xs text-wb3">Min. 8 characters.</p>
        )}
      </div>

      <div className="pb-14">
        <button
          onClick={isLogin ? handleLogin : handleSignup}
          disabled={!email || !password || (!isLogin && !confirmPw) || loading}
          className={`w-full py-4 rounded-2xl font-dm font-medium text-base transition-all ${
            email && password && (isLogin || confirmPw) && !loading
              ? 'bg-terra text-white active:scale-[0.98]'
              : 'bg-sand text-wb3 cursor-not-allowed'
          }`}
        >
          {loading
            ? (isLogin ? 'Signing in…' : 'Sending…')
            : (isLogin ? 'Sign in' : 'Continue')}
        </button>
      </div>
    </div>
  )
}
