import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from '../../components/OnboardingLayout'
import type { ConnectDisplay } from '../../types'

const COUNTRY_CODES = [
  { code: '+213', label: 'Algeria (+213)' },
  { code: '+54',  label: 'Argentina (+54)' },
  { code: '+61',  label: 'Australia (+61)' },
  { code: '+43',  label: 'Austria (+43)' },
  { code: '+973', label: 'Bahrain (+973)' },
  { code: '+880', label: 'Bangladesh (+880)' },
  { code: '+32',  label: 'Belgium (+32)' },
  { code: '+591', label: 'Bolivia (+591)' },
  { code: '+55',  label: 'Brazil (+55)' },
  { code: '+673', label: 'Brunei (+673)' },
  { code: '+855', label: 'Cambodia (+855)' },
  { code: '+56',  label: 'Chile (+56)' },
  { code: '+86',  label: 'China (+86)' },
  { code: '+57',  label: 'Colombia (+57)' },
  { code: '+420', label: 'Czech Republic (+420)' },
  { code: '+45',  label: 'Denmark (+45)' },
  { code: '+593', label: 'Ecuador (+593)' },
  { code: '+20',  label: 'Egypt (+20)' },
  { code: '+358', label: 'Finland (+358)' },
  { code: '+33',  label: 'France (+33)' },
  { code: '+49',  label: 'Germany (+49)' },
  { code: '+233', label: 'Ghana (+233)' },
  { code: '+30',  label: 'Greece (+30)' },
  { code: '+36',  label: 'Hungary (+36)' },
  { code: '+91',  label: 'India (+91)' },
  { code: '+62',  label: 'Indonesia (+62)' },
  { code: '+98',  label: 'Iran (+98)' },
  { code: '+964', label: 'Iraq (+964)' },
  { code: '+972', label: 'Israel (+972)' },
  { code: '+39',  label: 'Italy (+39)' },
  { code: '+81',  label: 'Japan (+81)' },
  { code: '+962', label: 'Jordan (+962)' },
  { code: '+7',   label: 'Kazakhstan (+7)' },
  { code: '+254', label: 'Kenya (+254)' },
  { code: '+965', label: 'Kuwait (+965)' },
  { code: '+856', label: 'Laos (+856)' },
  { code: '+961', label: 'Lebanon (+961)' },
  { code: '+60',  label: 'Malaysia (+60)' },
  { code: '+52',  label: 'Mexico (+52)' },
  { code: '+976', label: 'Mongolia (+976)' },
  { code: '+212', label: 'Morocco (+212)' },
  { code: '+95',  label: 'Myanmar (+95)' },
  { code: '+977', label: 'Nepal (+977)' },
  { code: '+31',  label: 'Netherlands (+31)' },
  { code: '+64',  label: 'New Zealand (+64)' },
  { code: '+234', label: 'Nigeria (+234)' },
  { code: '+47',  label: 'Norway (+47)' },
  { code: '+968', label: 'Oman (+968)' },
  { code: '+92',  label: 'Pakistan (+92)' },
  { code: '+595', label: 'Paraguay (+595)' },
  { code: '+51',  label: 'Peru (+51)' },
  { code: '+63',  label: 'Philippines (+63)' },
  { code: '+48',  label: 'Poland (+48)' },
  { code: '+351', label: 'Portugal (+351)' },
  { code: '+974', label: 'Qatar (+974)' },
  { code: '+40',  label: 'Romania (+40)' },
  { code: '+7',   label: 'Russia (+7)' },
  { code: '+966', label: 'Saudi Arabia (+966)' },
  { code: '+65',  label: 'Singapore (+65)' },
  { code: '+27',  label: 'South Africa (+27)' },
  { code: '+82',  label: 'South Korea (+82)' },
  { code: '+34',  label: 'Spain (+34)' },
  { code: '+94',  label: 'Sri Lanka (+94)' },
  { code: '+46',  label: 'Sweden (+46)' },
  { code: '+41',  label: 'Switzerland (+41)' },
  { code: '+66',  label: 'Thailand (+66)' },
  { code: '+670', label: 'Timor-Leste (+670)' },
  { code: '+216', label: 'Tunisia (+216)' },
  { code: '+90',  label: 'Turkey (+90)' },
  { code: '+971', label: 'UAE (+971)' },
  { code: '+380', label: 'Ukraine (+380)' },
  { code: '+44',  label: 'United Kingdom (+44)' },
  { code: '+598', label: 'Uruguay (+598)' },
  { code: '+1',   label: 'USA / Canada (+1)' },
  { code: '+998', label: 'Uzbekistan (+998)' },
  { code: '+58',  label: 'Venezuela (+58)' },
  { code: '+84',  label: 'Vietnam (+84)' },
]

const DISPLAY_OPTIONS: { value: ConnectDisplay; label: string; description: string }[] = [
  { value: 'telegram', label: 'Telegram only', description: 'Matches see your Telegram handle' },
  { value: 'whatsapp', label: 'WhatsApp only', description: 'Matches see your WhatsApp number' },
  { value: 'both',     label: 'Both',          description: 'Matches see both numbers' },
]

function PhoneField({
  label,
  cc,
  number,
  onCcChange,
  onNumberChange,
}: {
  label: string
  cc: string
  number: string
  onCcChange: (v: string) => void
  onNumberChange: (v: string) => void
}) {
  return (
    <div>
      <p className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide mb-2">{label}</p>
      <div className="flex gap-2">
        <select
          value={cc}
          onChange={e => onCcChange(e.target.value)}
          className="bg-sand rounded-xl px-3 py-3.5 font-dm text-wb border border-transparent focus:border-terra focus:outline-none text-sm w-36 flex-shrink-0"
        >
          {COUNTRY_CODES.map(c => (
            <option key={c.label} value={c.code}>{c.label}</option>
          ))}
        </select>
        <input
          type="tel"
          placeholder=""
          value={number}
          onChange={e => onNumberChange(e.target.value)}
          className="flex-1 bg-sand rounded-xl px-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-sm"
        />
      </div>
    </div>
  )
}

export default function Connect() {
  const navigate = useNavigate()
  const { data, update, submitProfile } = useOnboarding()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isValid =
    (data.telegram_handle.trim() !== '' || data.whatsapp_number.trim() !== '') &&
    data.connect_display !== ''

  const handleDone = async () => {
    setLoading(true)
    setError('')
    const { error: submitError } = await submitProfile()
    setLoading(false)
    if (submitError) {
      setError(submitError)
      return
    }
    localStorage.setItem('onboardingComplete', 'true')
    navigate('/app/discover', { replace: true })
  }

  return (
    <OnboardingLayout
      step={11}
      title="How should they reach you?"
      subtitle="Only visible to mutual matches."
      onNext={handleDone}
      nextLabel={loading ? 'Saving…' : "Let's go 🎉"}
      nextDisabled={!isValid || loading}
    >
      <div className="flex flex-col gap-5">
        {/* Telegram username */}
        <div>
          <p className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide mb-2">Telegram</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-dm text-wb2 text-sm">@</span>
            <input
              type="text"
              placeholder="username"
              value={data.telegram_handle}
              onChange={e => update({ telegram_handle: e.target.value })}
              autoCapitalize="none"
              className="w-full bg-sand rounded-xl pl-8 pr-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* WhatsApp number */}
        <PhoneField
          label="WhatsApp"
          cc={data.whatsapp_cc}
          number={data.whatsapp_number}
          onCcChange={v => update({ whatsapp_cc: v })}
          onNumberChange={v => update({ whatsapp_number: v })}
        />

        {/* Display preference */}
        <div>
          <p className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide mb-2">
            What do you want to show matches?
          </p>
          <div className="flex flex-col gap-2">
            {DISPLAY_OPTIONS.filter(opt => {
              if (opt.value === 'telegram') return data.telegram_handle.trim() !== ''
              if (opt.value === 'whatsapp') return data.whatsapp_number.trim() !== ''
              return data.telegram_handle.trim() !== '' && data.whatsapp_number.trim() !== ''
            }).map(opt => {
              const selected = data.connect_display === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => update({ connect_display: opt.value })}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl border font-dm transition-all active:scale-[0.99] ${
                    selected
                      ? 'bg-terra-light border-terra'
                      : 'bg-sand border-transparent'
                  }`}
                >
                  <p className={`text-sm font-medium ${selected ? 'text-terra' : 'text-wb'}`}>{opt.label}</p>
                  <p className="text-xs text-wb3 mt-0.5">{opt.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        {error && (
          <p className="font-dm text-xs text-red-500">{error}</p>
        )}
      </div>
    </OnboardingLayout>
  )
}
