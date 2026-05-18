import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from '../../components/OnboardingLayout'

const PROMPT_2_OPTIONS = [
  'My ideal weekend looks like…',
  'A non-negotiable for me is…',
  "You'll often find me…",
  "I'm known for…",
  'I need a roommate who…',
  'A fun fact about me…',
]

export default function Prompts() {
  const navigate = useNavigate()
  const { data, update } = useOnboarding()

  const isValid =
    data.prompt_1_answer.trim() !== '' &&
    data.prompt_2_question !== '' &&
    data.prompt_2_answer.trim() !== ''

  return (
    <OnboardingLayout
      step={10}
      title="Tell them about you"
      subtitle="These show on your profile card."
      onNext={() => navigate('/onboarding/connect')}
      nextDisabled={!isValid}
    >
      <div className="flex flex-col gap-6">
        {/* Mandatory prompt */}
        <div>
          <div className="bg-sand rounded-2xl px-4 py-3 mb-2">
            <p className="font-syne text-sm font-bold text-wb">A little about me…</p>
          </div>
          <textarea
            placeholder="Write a short intro about yourself"
            value={data.prompt_1_answer}
            onChange={e => update({ prompt_1_answer: e.target.value })}
            maxLength={200}
            rows={3}
            className="w-full bg-sand rounded-xl px-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-sm resize-none"
          />
          <p className="font-dm text-xs text-wb3 text-right mt-1">
            {data.prompt_1_answer.length}/200
          </p>
        </div>

        {/* Choose a prompt */}
        <div>
          <p className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide mb-2">
            Choose a prompt
          </p>
          <div className="flex flex-col gap-2 mb-3">
            {PROMPT_2_OPTIONS.map(q => (
              <button
                key={q}
                onClick={() => update({ prompt_2_question: q, prompt_2_answer: '' })}
                className={`w-full text-left px-4 py-3 rounded-2xl border font-dm text-sm font-medium transition-all active:scale-[0.98] ${
                  data.prompt_2_question === q
                    ? 'bg-terra-light border-terra text-terra'
                    : 'bg-sand border-transparent text-wb'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          {data.prompt_2_question !== '' && (
            <div>
              <div className="bg-sand rounded-2xl px-4 py-3 mb-2">
                <p className="font-syne text-sm font-bold text-wb">{data.prompt_2_question}</p>
              </div>
              <textarea
                placeholder="Your answer…"
                value={data.prompt_2_answer}
                onChange={e => update({ prompt_2_answer: e.target.value })}
                maxLength={200}
                rows={3}
                className="w-full bg-sand rounded-xl px-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-sm resize-none"
              />
              <p className="font-dm text-xs text-wb3 text-right mt-1">
                {data.prompt_2_answer.length}/200
              </p>
            </div>
          )}
        </div>
      </div>
    </OnboardingLayout>
  )
}
