import { useNavigate } from 'react-router-dom'

type Props = {
  step: number // 3–11
  title: string
  subtitle?: string
  onNext: () => void
  nextLabel?: string
  nextDisabled?: boolean
  children: React.ReactNode
}

// Steps 3–11 are the 9 real form steps shown to the user
const FORM_STEPS = 9

export default function OnboardingLayout({
  step,
  title,
  subtitle,
  onNext,
  nextLabel = 'Continue',
  nextDisabled = false,
  children,
}: Props) {
  const navigate = useNavigate()
  const formStep = step - 2 // converts step 3 → 1, step 11 → 9
  const progress = (formStep / FORM_STEPS) * 100

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-5 pt-10 pb-3 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="text-wb2 p-1 -ml-1 mb-4 flex items-center"
          aria-label="Go back"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Progress */}
        <div className="h-1.5 bg-sand rounded-full overflow-hidden">
          <div
            className="h-full bg-terra rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="font-dm text-xs text-wb3 mt-1.5">
          {formStep} of {FORM_STEPS}
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pb-36">
        <h2 className="font-syne text-2xl font-bold text-wb mt-2">{title}</h2>
        {subtitle && <p className="font-dm text-sm text-wb2 mt-1 mb-6">{subtitle}</p>}
        {!subtitle && <div className="mb-6" />}
        {children}
      </div>

      {/* Fixed footer button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-5 pb-10 pt-5 bg-gradient-to-t from-cream via-cream to-transparent pointer-events-none">
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className={`w-full py-4 rounded-2xl font-dm font-medium text-base pointer-events-auto transition-all ${
            nextDisabled
              ? 'bg-sand text-wb3 cursor-not-allowed'
              : 'bg-terra text-white active:scale-[0.98]'
          }`}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  )
}
