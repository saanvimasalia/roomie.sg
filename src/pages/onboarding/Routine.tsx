import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from '../../components/OnboardingLayout'
import OptionCard from '../../components/OptionCard'
import { formatHour } from '../../lib/utils'
import type { StudyLocation } from '../../types'

const STUDY_OPTIONS: { value: StudyLocation; label: string; emoji: string }[] = [
  { value: 'room', label: 'In my room', emoji: '🏠' },
  { value: 'library', label: 'Library', emoji: '📚' },
  { value: 'mixed', label: 'Mix of both', emoji: '🔀' },
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

  return (
    <OnboardingLayout
      step={6}
      title="Your daily routine"
      subtitle="Helps us match you with someone on the same schedule."
      onNext={() => navigate('/onboarding/social')}
      nextDisabled={data.study_location === ''}
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
          <div className="flex flex-col gap-2">
            {STUDY_OPTIONS.map(opt => (
              <OptionCard
                key={opt.value}
                label={opt.label}
                emoji={opt.emoji}
                selected={data.study_location === opt.value}
                onSelect={() => update({ study_location: opt.value })}
              />
            ))}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  )
}
