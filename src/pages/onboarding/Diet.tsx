import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from '../../components/OnboardingLayout'
import OptionCard from '../../components/OptionCard'
import type { Diet as DietType } from '../../types'

const OPTIONS: { value: DietType; label: string; description: string; emoji: string }[] = [
  {
    value: 'halal',
    label: 'Halal',
    description: 'I only eat halal-certified food',
    emoji: '🌙',
  },
  {
    value: 'vegetarian',
    label: 'Vegetarian',
    description: 'No meat or fish',
    emoji: '🥦',
  },
  {
    value: 'no_pork_beef',
    label: 'No pork / no beef',
    description: 'I avoid pork or beef',
    emoji: '🙅',
  },
  {
    value: 'none',
    label: 'No restrictions',
    description: 'I eat everything',
    emoji: '🍜',
  },
]

export default function Diet() {
  const navigate = useNavigate()
  const { data, update } = useOnboarding()

  return (
    <OnboardingLayout
      step={5}
      title="Any dietary restrictions?"
      subtitle="This is used to find compatible matches."
      onNext={() => navigate('/onboarding/routine')}
      nextDisabled={data.diet === ''}
    >
      <div className="flex flex-col gap-2">
        {OPTIONS.map(opt => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            description={opt.description}
            emoji={opt.emoji}
            selected={data.diet === opt.value}
            onSelect={() => update({ diet: opt.value })}
          />
        ))}
      </div>
    </OnboardingLayout>
  )
}
