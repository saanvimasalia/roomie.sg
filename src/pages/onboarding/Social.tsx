import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from '../../components/OnboardingLayout'
import OptionCard from '../../components/OptionCard'
import type { SocialStyle as SocialStyleType, GuestFrequency } from '../../types'

const SOCIAL_OPTIONS: {
  value: SocialStyleType
  label: string
  description: string
  emoji: string
}[] = [
  {
    value: 'introvert',
    label: 'Introvert',
    description: 'I recharge alone, prefer quiet time at home',
    emoji: '📖',
  },
  {
    value: 'ambivert',
    label: 'Ambivert',
    description: 'Somewhere in between — depends on my mood',
    emoji: '⚖️',
  },
  {
    value: 'extrovert',
    label: 'Extrovert',
    description: 'I love being around people and socialising',
    emoji: '🎉',
  },
]

const GUEST_OPTIONS: {
  value: GuestFrequency
  label: string
  description: string
}[] = [
  { value: 'never', label: 'Never', description: 'I keep guests out of my room' },
  { value: 'rarely', label: 'Rarely', description: 'Occasionally, maybe once a month' },
  { value: 'sometimes', label: 'Sometimes', description: 'A few times a week' },
  { value: 'often', label: 'Often', description: 'Friends over regularly' },
]

export default function Social() {
  const navigate = useNavigate()
  const { data, update } = useOnboarding()

  const isValid = data.social_style !== '' && data.guest_frequency !== ''

  return (
    <OnboardingLayout
      step={7}
      title="How do you live?"
      subtitle="Be honest — compatibility depends on it."
      onNext={() => navigate('/onboarding/living')}
      nextDisabled={!isValid}
    >
      <div className="flex flex-col gap-6">
        <div>
          <p className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide mb-2">
            Social style
          </p>
          <div className="flex flex-col gap-2">
            {SOCIAL_OPTIONS.map(opt => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                description={opt.description}
                emoji={opt.emoji}
                selected={data.social_style === opt.value}
                onSelect={() => update({ social_style: opt.value })}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide mb-2">
            How often do you have guests over?
          </p>
          <div className="flex flex-col gap-2">
            {GUEST_OPTIONS.map(opt => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                description={opt.description}
                selected={data.guest_frequency === opt.value}
                onSelect={() => update({ guest_frequency: opt.value })}
              />
            ))}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  )
}
