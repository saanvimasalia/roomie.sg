import { useState } from 'react'
import { formatHour } from '../lib/utils'
import type { ProfileWithScore } from '../types'

export type FilterCategory = 'routine' | 'age' | 'faculty' | 'smoking' | 'diet' | 'cleanliness' | 'social' | 'ac' | 'quiet' | 'cooking'

type Props = {
  currentUser: ProfileWithScore
  active: FilterCategory[]
  onApply: (active: FilterCategory[]) => void
  onClose: () => void
}

type ChipDef = {
  id: FilterCategory
  emoji: string
  label: string
  value: (user: ProfileWithScore) => string
}

const DIET_LABELS: Record<string, string> = {
  halal: 'Halal',
  vegetarian: 'Vegetarian',
  no_pork_beef: 'No pork / beef',
  none: 'No restrictions',
}

const CHIPS: ChipDef[] = [
  {
    id: 'routine',
    emoji: '⏰',
    label: 'Daily routine',
    value: u => `${formatHour(u.wake_time)} – ${formatHour(u.sleep_time)}`,
  },
  {
    id: 'age',
    emoji: '🎂',
    label: 'Age',
    value: u => `${u.age} yrs  (±3)`,
  },
  {
    id: 'faculty',
    emoji: '🏛️',
    label: 'Faculty',
    value: u => u.faculty,
  },
  {
    id: 'smoking',
    emoji: '🚬',
    label: 'Smoking',
    value: u => (u.smoking ? 'Smoker' : 'Non-smoker'),
  },
  {
    id: 'diet',
    emoji: '🌙',
    label: 'Diet',
    value: u => DIET_LABELS[u.diet] ?? u.diet,
  },
  {
    id: 'cleanliness',
    emoji: '✨',
    label: 'Cleanliness',
    value: u => u.cleanliness.charAt(0).toUpperCase() + u.cleanliness.slice(1),
  },
  {
    id: 'social',
    emoji: '👥',
    label: 'Social style',
    value: u => u.social_style.charAt(0).toUpperCase() + u.social_style.slice(1),
  },
  {
    id: 'ac',
    emoji: '❄️',
    label: 'AC',
    value: u => (u.needs_ac ? 'Needs AC' : 'No AC needed'),
  },
  {
    id: 'quiet',
    emoji: '🤫',
    label: 'Noise level',
    value: u => (u.prefers_quiet ? 'Prefers quiet' : 'Okay with noise'),
  },
  {
    id: 'cooking',
    emoji: '🍳',
    label: 'Cooking',
    value: u => (u.cooks ? 'Cooks regularly' : "Doesn't cook"),
  },
]

export default function FilterSheet({ currentUser, active, onApply, onClose }: Props) {
  const [local, setLocal] = useState<FilterCategory[]>(active)

  const toggle = (id: FilterCategory) =>
    setLocal(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id],
    )

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-[430px] bg-cream rounded-t-3xl px-5 pt-5 pb-24 animate-slide-up">
        {/* Handle */}
        <div className="w-10 h-1 bg-wb3 rounded-full mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-syne text-xl font-bold text-wb">Filter by compatibility</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-sand flex items-center justify-center text-wb2 active:scale-90 transition-transform"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="font-dm text-sm text-wb2 mb-5">
          Tap a category to only show people who match your lifestyle.
        </p>

        {/* Chip grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-6">
          {CHIPS.map(chip => {
            const isActive = local.includes(chip.id)
            return (
              <button
                key={chip.id}
                onClick={() => toggle(chip.id)}
                className={`flex items-start gap-2.5 px-3 py-3 rounded-2xl text-left transition-all active:scale-[0.97] border ${
                  isActive
                    ? 'bg-sage-light border-sage text-sage-dark'
                    : 'bg-sand border-transparent text-wb'
                }`}
              >
                <span className="text-xl leading-none mt-0.5">{chip.emoji}</span>
                <div className="min-w-0">
                  <p className={`font-dm text-xs font-medium leading-none mb-1 ${isActive ? 'text-sage' : 'text-wb3'}`}>
                    {chip.label}
                  </p>
                  <p className="font-dm text-sm font-semibold leading-snug truncate">
                    {chip.value(currentUser)}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Actions */}
        <button
          onClick={() => onApply(local)}
          className="w-full bg-terra text-white font-dm font-medium py-4 rounded-2xl active:scale-[0.98] transition-transform"
        >
          {local.length === 0 ? 'Show everyone' : `Apply ${local.length} filter${local.length > 1 ? 's' : ''}`}
        </button>

        {local.length > 0 && (
          <button
            onClick={() => {
              setLocal([])
              onApply([])
            }}
            className="w-full mt-3 font-dm text-sm text-wb2 underline underline-offset-2"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  )
}
