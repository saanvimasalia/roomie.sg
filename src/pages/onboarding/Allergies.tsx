import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from '../../components/OnboardingLayout'

const COMMON_ALLERGIES = ['Nuts', 'Shellfish', 'Dairy', 'Gluten', 'Eggs', 'Soy', 'Sesame']

export default function Allergies() {
  const navigate = useNavigate()
  const { data, update } = useOnboarding()

  const toggle = (item: string) => {
    const next = data.allergies.includes(item)
      ? data.allergies.filter(a => a !== item)
      : [...data.allergies, item]
    update({ allergies: next })
  }

  return (
    <OnboardingLayout
      step={9}
      title="Any allergies?"
      subtitle="This helps your roommate keep a safe living space."
      onNext={() => navigate('/onboarding/prompts')}
      // Allergies are optional — always enabled
    >
      <div className="flex flex-col gap-5">
        {/* Chip grid */}
        <div className="flex flex-wrap gap-2">
          {COMMON_ALLERGIES.map(item => {
            const selected = data.allergies.includes(item)
            return (
              <button
                key={item}
                onClick={() => toggle(item)}
                className={`px-4 py-2 rounded-full font-dm text-sm font-medium border transition-all active:scale-95 ${
                  selected
                    ? 'bg-terra-light border-terra text-terra'
                    : 'bg-sand border-transparent text-wb'
                }`}
              >
                {item}
              </button>
            )
          })}
        </div>

        {/* Other */}
        <div>
          <p className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide mb-2">
            Other (optional)
          </p>
          <input
            type="text"
            placeholder="e.g. Latex, certain medications…"
            value={data.allergies_other}
            onChange={e => update({ allergies_other: e.target.value })}
            className="w-full bg-sand rounded-xl px-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-sm"
          />
        </div>

        {data.allergies.length === 0 && data.allergies_other === '' && (
          <p className="font-dm text-xs text-wb3 text-center">
            No allergies? Just tap Continue.
          </p>
        )}
      </div>
    </OnboardingLayout>
  )
}
