import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from '../../components/OnboardingLayout'
import { formatHour } from '../../lib/utils'
import type { StudyLocation } from '../../types'

const STUDY_OPTIONS: { value: StudyLocation; label: string; emoji: string }[] = [
  { value: 'room', label: 'In my room', emoji: '🏠' },
  { value: 'library', label: 'Library', emoji: '📚' },
  { value: 'cafes', label: 'Cafes & hangout spots', emoji: '☕' },
]

type SliderProps = {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}

function TimeSlider({ label, value, min, max, onChange }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="bg-sand rounded-2xl px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-dm text-sm font-medium text-wb">{label}</p>
        <span className="font-syne text-base font-bold text-terra">{formatHour(value)}</span>
      </div>
      <div className="relative h-2 bg-wb3 bg-opacity-30 rounded-full">
        <div
          className="absolute left-0 top-0 h-2 bg-terra rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full mt-1 cursor-pointer"
        style={{ accentColor: '#C4581A' }}
      />
    </div>
  )
}

export default function Routine() {
  const navigate = useNavigate()
  const { data, update } = useOnboarding()

  const toggleStudy = (val: StudyLocation) => {
    const next = data.study_location.includes(val)
      ? data.study_location.filter(v => v !== val)
      : [...data.study_location, val]
    update({ study_location: next })
  }

  return (
    <OnboardingLayout
      step={6}
      title="Your daily routine"
      subtitle="Helps us match you with someone on the same schedule."
      onNext={() => navigate('/onboarding/social')}
      nextDisabled={data.study_location.length === 0}
    >
      <div className="flex flex-col gap-5">
        {/* Time sliders */}
        <div className="flex flex-col gap-3">
          <TimeSlider
            label="Wake up time"
            value={data.wake_time}
            min={0}
            max={23}
            onChange={v => update({ wake_time: v })}
          />
          <TimeSlider
            label="Bedtime"
            value={data.sleep_time}
            min={0}
            max={23}
            onChange={v => update({ sleep_time: v })}
          />
        </div>

        {/* Study location */}
        <div>
          <p className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide mb-2">
            Where do you usually study?
          </p>
          <div className="flex flex-wrap gap-2">
            {STUDY_OPTIONS.map(opt => {
              const selected = data.study_location.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleStudy(opt.value)}
                  className={`px-4 py-2 rounded-full font-dm text-sm font-medium border transition-all active:scale-95 ${
                    selected
                      ? 'bg-terra-light border-terra text-terra'
                      : 'bg-sand border-transparent text-wb'
                  }`}
                >
                  {opt.emoji} {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  )
}
