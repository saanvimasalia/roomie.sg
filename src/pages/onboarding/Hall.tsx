import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from '../../components/OnboardingLayout'
import OptionCard from '../../components/OptionCard'
import type { Semester } from '../../types'

const SEMESTERS: { value: Semester; label: string; description: string }[] = [
  { value: 'Sem1', label: 'Semester 1', description: 'August intake' },
  { value: 'Sem2', label: 'Semester 2', description: 'January intake' },
]

export default function Hall() {
  const navigate = useNavigate()
  const { data, update } = useOnboarding()

  const isValid = data.hall_preference.trim() !== '' && data.move_in_semester !== ''

  return (
    <OnboardingLayout
      step={4}
      title="Where do you want to stay?"
      subtitle="Enter your preferred hall or residence."
      onNext={() => navigate('/onboarding/diet')}
      nextDisabled={!isValid}
    >
      <div className="flex flex-col gap-5">
        {/* Hall input */}
        <div>
          <label className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide mb-2 block">
            Hall preference
          </label>
          <input
            type="text"
            placeholder={
              data.university === 'NTU'
                ? 'e.g. Hall 1, Pioneer House, Crescent Hall'
                : 'e.g. Eusoff Hall, UTown Residences, Sheares Hall'
            }
            value={data.hall_preference}
            onChange={e => update({ hall_preference: e.target.value })}
            className="w-full bg-sand rounded-xl px-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-sm"
          />
          <p className="font-dm text-xs text-wb3 mt-1.5">
            No preference? Type "Any hall"
          </p>
        </div>

        {/* Semester */}
        <div>
          <label className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide mb-2 block">
            Moving in
          </label>
          <div className="flex flex-col gap-2">
            {SEMESTERS.map(s => (
              <OptionCard
                key={s.value}
                label={s.label}
                description={s.description}
                selected={data.move_in_semester === s.value}
                onSelect={() => update({ move_in_semester: s.value })}
              />
            ))}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  )
}
