import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from '../../components/OnboardingLayout'
import OptionCard from '../../components/OptionCard'
import Toggle from '../../components/Toggle'
import type { Cleanliness } from '../../types'

const CLEANLINESS_OPTIONS: {
  value: Cleanliness
  label: string
  description: string
  emoji: string
}[] = [
  { value: 'tidy', label: 'Tidy', description: 'Everything in its place', emoji: '✨' },
  { value: 'average', label: 'Average', description: 'Clean enough, not spotless', emoji: '🙂' },
  { value: 'relaxed', label: 'Relaxed', description: 'A little mess is fine', emoji: '🌿' },
]

export default function Living() {
  const navigate = useNavigate()
  const { data, update } = useOnboarding()

  return (
    <OnboardingLayout
      step={8}
      title="Living habits"
      subtitle="These help filter non-negotiables."
      onNext={() => navigate('/onboarding/allergies')}
      nextDisabled={data.cleanliness === ''}
    >
      <div className="flex flex-col gap-6">
        {/* Cleanliness */}
        <div>
          <p className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide mb-2">
            Cleanliness level
          </p>
          <div className="flex flex-col gap-2">
            {CLEANLINESS_OPTIONS.map(opt => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                description={opt.description}
                emoji={opt.emoji}
                selected={data.cleanliness === opt.value}
                onSelect={() => update({ cleanliness: opt.value })}
              />
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div>
          <p className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide mb-2">
            Habits &amp; preferences
          </p>
          <div className="flex flex-col gap-2">
            <Toggle
              emoji="🚬"
              label="I smoke"
              description="Includes vaping"
              checked={data.smoking}
              onChange={v => update({ smoking: v })}
            />
            <Toggle
              emoji="❄️"
              label="I need air conditioning"
              description="AC is a must-have for me"
              checked={data.needs_ac}
              onChange={v => update({ needs_ac: v })}
            />
            <Toggle
              emoji="🍳"
              label="I cook regularly"
              checked={data.cooks}
              onChange={v => update({ cooks: v })}
            />
            <Toggle
              emoji="🤫"
              label="I prefer a quiet space"
              description="Low noise is important to me"
              checked={data.prefers_quiet}
              onChange={v => update({ prefers_quiet: v })}
            />
            <Toggle
              emoji="🐾"
              label="I have a pet"
              description="Or plan to bring one"
              checked={data.has_pet}
              onChange={v => update({ has_pet: v })}
            />
          </div>
        </div>
      </div>
    </OnboardingLayout>
  )
}
