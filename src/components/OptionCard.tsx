type Props = {
  label: string
  description?: string
  emoji?: string
  selected: boolean
  onSelect: () => void
}

export default function OptionCard({ label, description, emoji, selected, onSelect }: Props) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all active:scale-[0.98] ${
        selected ? 'bg-terra-light border-terra' : 'bg-sand border-transparent'
      }`}
    >
      {emoji && <span className="text-xl leading-none">{emoji}</span>}
      <div className="flex-1 min-w-0">
        <p
          className={`font-dm font-medium text-sm leading-snug ${
            selected ? 'text-terra' : 'text-wb'
          }`}
        >
          {label}
        </p>
        {description && (
          <p className="font-dm text-xs text-wb2 mt-0.5 leading-snug">{description}</p>
        )}
      </div>
      <div
        className={`w-5 h-5 rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-all ${
          selected ? 'bg-terra border-terra' : 'border-wb3 bg-transparent'
        }`}
      >
        {selected && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    </button>
  )
}
