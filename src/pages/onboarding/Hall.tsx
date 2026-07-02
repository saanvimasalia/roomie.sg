import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from '../../components/OnboardingLayout'
import OptionCard from '../../components/OptionCard'
import type { Semester } from '../../types'

const SEMESTERS: { value: Semester; label: string; description: string }[] = [
  { value: 'Sem1', label: 'Semester 1', description: 'August intake' },
  { value: 'Sem2', label: 'Semester 2', description: 'January intake' },
]

const NTU_HALLS = [
  'Hall 1', 'Hall 2', 'Hall 3', 'Hall 4', 'Hall 5', 'Hall 6',
  'Hall 7', 'Hall 8', 'Hall 9', 'Hall 10', 'Hall 11', 'Hall 12',
  'Hall 13', 'Hall 14', 'Hall 15', 'Hall 16',
  'Crescent Hall', 'Pioneer Hall', 'Binjai Hall',
  'Tanjong Hall', 'Banyan Hall', 'Tamarind Hall', 'Saraca Hall',
]

export default function Hall() {
  const navigate = useNavigate()
  const { data, update } = useOnboarding()

  const isY1 = data.year === 'Y1' || data.year === 'Exchange'

  const toggle = (hall: string) => {
    const next = data.hall_preference.includes(hall)
      ? data.hall_preference.filter(h => h !== hall)
      : [...data.hall_preference, hall]
    update({ hall_preference: next })
  }

  const isValid = isY1
    ? data.move_in_semester !== ''
    : data.hall_points !== '' && data.hall_preference.length > 0 && data.move_in_semester !== ''

  return (
    <OnboardingLayout
      step={4}
      title="Where do you want to stay?"
      subtitle={isY1 ? "Tell us when you're moving in." : "Select all halls you'd be happy to live in."}
      onNext={() => navigate('/onboarding/diet')}
      nextDisabled={!isValid}
    >
      <div className="flex flex-col gap-5">
        {!isY1 && (
          <>
            {/* Hall points */}
            <div>
              <label className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide mb-2 block">
                Hall points
              </label>
              <div className="flex gap-2 flex-wrap">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(pt => (
                  <button
                    key={pt}
                    onClick={() => update({ hall_points: pt })}
                    className={`w-10 h-10 rounded-full font-dm text-sm font-medium border transition-all active:scale-95 ${
                      data.hall_points === pt
                        ? 'bg-terra-light border-terra text-terra'
                        : 'bg-sand border-transparent text-wb'
                    }`}
                  >
                    {pt}
                  </button>
                ))}
              </div>
            </div>

            {/* Hall chips */}
            <div>
              <label className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide mb-2 block">
                Hall preference
              </label>
              <div className="flex flex-wrap gap-2">
                {NTU_HALLS.map(hall => {
                  const selected = data.hall_preference.includes(hall)
                  return (
                    <button
                      key={hall}
                      onClick={() => toggle(hall)}
                      className={`px-4 py-2 rounded-full font-dm text-sm font-medium border transition-all active:scale-95 ${
                        selected
                          ? 'bg-terra-light border-terra text-terra'
                          : 'bg-sand border-transparent text-wb'
                      }`}
                    >
                      {hall}
                    </button>
                  )
                })}
              </div>
              {data.hall_preference.length === 0 && (
                <p className="font-dm text-xs text-wb3 mt-2">Select at least one hall to continue.</p>
              )}
            </div>
          </>
        )}

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
