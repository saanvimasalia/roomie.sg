import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from '../../components/OnboardingLayout'
import type { ConnectPlatform } from '../../types'

export default function Connect() {
  const navigate = useNavigate()
  const { data, update, submitProfile } = useOnboarding()

  const isValid = data.connect_handle.trim() !== ''

  const handleDone = () => {
    submitProfile()
    navigate('/app/discover')
  }

  const platforms: { value: ConnectPlatform; label: string; color: string }[] = [
    { value: 'telegram', label: 'Telegram', color: '#229ED9' },
    { value: 'whatsapp', label: 'WhatsApp', color: '#25D366' },
  ]

  return (
    <OnboardingLayout
      step={11}
      title="How should they reach you?"
      subtitle="Only visible to mutual matches."
      onNext={handleDone}
      nextLabel="Let's go 🎉"
      nextDisabled={!isValid}
    >
      <div className="flex flex-col gap-5">
        {/* Platform toggle */}
        <div className="flex gap-2 bg-sand p-1 rounded-2xl">
          {platforms.map(p => (
            <button
              key={p.value}
              onClick={() => update({ connect_platform: p.value, connect_handle: '' })}
              className={`flex-1 py-3 rounded-xl font-dm font-medium text-sm transition-all ${
                data.connect_platform === p.value
                  ? 'bg-white text-wb shadow-sm'
                  : 'text-wb3'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Handle input */}
        <div>
          {data.connect_platform === 'telegram' ? (
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-dm text-wb2 text-sm">@</span>
              <input
                type="text"
                placeholder="username"
                value={data.connect_handle}
                onChange={e => update({ connect_handle: e.target.value })}
                autoCapitalize="none"
                className="w-full bg-sand rounded-xl pl-8 pr-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-sm"
              />
            </div>
          ) : (
            <input
              type="tel"
              placeholder="+65 9123 4567"
              value={data.connect_handle}
              onChange={e => update({ connect_handle: e.target.value })}
              className="w-full bg-sand rounded-xl px-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-sm"
            />
          )}
          <p className="font-dm text-xs text-wb3 mt-2">
            {data.connect_platform === 'telegram'
              ? 'Your Telegram username without the @'
              : 'Include country code, e.g. +65'}
          </p>
        </div>

        {/* Preview */}
        {isValid && (
          <div className="bg-sage-light rounded-2xl px-4 py-3.5 flex items-center gap-3">
            <svg className="w-5 h-5 text-sage flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
            <p className="font-dm text-sm text-sage-dark">
              Matches will connect via{' '}
              <span className="font-medium">
                {data.connect_platform === 'telegram'
                  ? `@${data.connect_handle}`
                  : data.connect_handle}
              </span>
            </p>
          </div>
        )}
      </div>
    </OnboardingLayout>
  )
}
