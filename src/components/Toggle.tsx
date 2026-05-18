type Props = {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  emoji?: string
  description?: string
}

export default function Toggle({ checked, onChange, label, emoji, description }: Props) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center gap-3 px-4 py-3.5 bg-sand rounded-2xl active:scale-[0.98] transition-transform"
    >
      {emoji && <span className="text-xl leading-none">{emoji}</span>}
      <div className="flex-1 text-left min-w-0">
        <p className="font-dm font-medium text-sm text-wb leading-snug">{label}</p>
        {description && (
          <p className="font-dm text-xs text-wb2 mt-0.5 leading-snug">{description}</p>
        )}
      </div>
      {/* Toggle switch */}
      <div
        className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-200 ${
          checked ? 'bg-terra' : 'bg-wb3'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  )
}
