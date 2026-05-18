import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../context/OnboardingContext'
import { deriveUniversity } from '../../lib/utils'

export default function Verify() {
  const navigate = useNavigate()
  const { update } = useOnboarding()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const university = deriveUniversity(email)
  const isValid = university !== null

  const handleContinue = () => {
    if (!isValid) {
      setError('Please use your .nus.edu.sg or .ntu.edu.sg email.')
      return
    }
    update({ email, university })
    navigate('/onboarding/basic-info')
  }

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

      <div className="mt-8 flex-1">
        <h2 className="font-syne text-2xl font-bold text-wb">What's your uni email?</h2>
        <p className="font-dm text-sm text-wb2 mt-1 mb-8">
          We'll send you a verification link.
        </p>

        <input
          type="email"
          placeholder="you@e.ntu.edu.sg"
          value={email}
          onChange={e => {
            setEmail(e.target.value)
            setError('')
          }}
          autoCapitalize="none"
          autoComplete="email"
          className="w-full bg-sand rounded-xl px-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-base"
        />

        {error && (
          <p className="font-dm text-xs text-red-500 mt-2">{error}</p>
        )}

        {isValid && (
          <p className="font-dm text-xs text-sage mt-2">
            ✓ {university} email recognised
          </p>
        )}
      </div>

      <div className="pb-14">
        <button
          onClick={handleContinue}
          disabled={!email}
          className={`w-full py-4 rounded-2xl font-dm font-medium text-base transition-all ${
            email
              ? 'bg-terra text-white active:scale-[0.98]'
              : 'bg-sand text-wb3 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
