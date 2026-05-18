import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import OptionCard from '../../components/OptionCard'
import Toggle from '../../components/Toggle'
import Avatar from '../../components/Avatar'
import { formatHour } from '../../lib/utils'
import type {
  Year, Semester, Diet, StudyLocation,
  SocialStyle, GuestFrequency, Cleanliness, ConnectPlatform,
} from '../../types'

// ─── Section header ────────────────────────────────────────────────────────────
function Section({ title }: { title: string }) {
  return (
    <p className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide pt-2">{title}</p>
  )
}

// ─── Time slider ───────────────────────────────────────────────────────────────
function TimeSlider({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="bg-sand rounded-2xl px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-dm text-sm font-medium text-wb">{label}</p>
        <span className="font-syne text-base font-bold text-terra">{formatHour(value)}</span>
      </div>
      <div className="relative h-2 bg-wb3 bg-opacity-30 rounded-full">
        <div className="absolute left-0 top-0 h-2 bg-terra rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <input
        type="range" min={min} max={max} step={1} value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full mt-1 cursor-pointer"
        style={{ accentColor: '#C4581A' }}
      />
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
const COMMON_ALLERGIES = ['Nuts', 'Shellfish', 'Dairy', 'Gluten', 'Eggs', 'Soy', 'Sesame']
const PROMPT_2_OPTIONS = [
  'My ideal weekend looks like…',
  'A non-negotiable for me is…',
  "You'll often find me…",
  "I'm known for…",
  'I need a roommate who…',
  'A fun fact about me…',
]

export default function EditProfile() {
  const navigate = useNavigate()
  const { currentUser, updateCurrentUser } = useAppContext()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialise form from current user
  const [form, setForm] = useState({
    name:             currentUser.name,
    age:              String(currentUser.age),
    year:             currentUser.year as Year | '',
    faculty:          currentUser.faculty,
    nationality:      currentUser.nationality,
    photo_url:        currentUser.photo_url,
    hall_preference:  currentUser.hall_preference,
    move_in_semester: currentUser.move_in_semester as Semester | '',
    diet:             currentUser.diet as Diet | '',
    wake_time:        currentUser.wake_time,
    sleep_time:       currentUser.sleep_time,
    study_location:   currentUser.study_location as StudyLocation | '',
    social_style:     currentUser.social_style as SocialStyle | '',
    guest_frequency:  currentUser.guest_frequency as GuestFrequency | '',
    cleanliness:      currentUser.cleanliness as Cleanliness | '',
    smoking:          currentUser.smoking,
    needs_ac:         currentUser.needs_ac,
    cooks:            currentUser.cooks,
    prefers_quiet:    currentUser.prefers_quiet,
    has_pet:          currentUser.has_pet,
    allergies:        currentUser.allergies,
    allergies_other:  currentUser.allergies_other ?? '',
    prompt_1_answer:  currentUser.prompt_1_answer,
    prompt_2_question: currentUser.prompt_2_question,
    prompt_2_answer:  currentUser.prompt_2_answer,
    connect_platform: currentUser.connect_platform as ConnectPlatform,
    connect_handle:   currentUser.connect_handle ?? '',
  })

  const set = <K extends keyof typeof form>(key: K, value: typeof form[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const toggleAllergy = (item: string) => {
    set('allergies', form.allergies.includes(item)
      ? form.allergies.filter(a => a !== item)
      : [...form.allergies, item]
    )
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) set('photo_url', URL.createObjectURL(file))
  }

  const handleSave = () => {
    updateCurrentUser({
      name:             form.name.trim(),
      age:              Number(form.age),
      year:             form.year as Year,
      faculty:          form.faculty.trim(),
      nationality:      form.nationality.trim(),
      photo_url:        form.photo_url,
      hall_preference:  form.hall_preference.trim(),
      move_in_semester: form.move_in_semester as Semester,
      diet:             form.diet as Diet,
      wake_time:        form.wake_time,
      sleep_time:       form.sleep_time,
      study_location:   form.study_location as StudyLocation,
      social_style:     form.social_style as SocialStyle,
      guest_frequency:  form.guest_frequency as GuestFrequency,
      cleanliness:      form.cleanliness as Cleanliness,
      smoking:          form.smoking,
      needs_ac:         form.needs_ac,
      cooks:            form.cooks,
      prefers_quiet:    form.prefers_quiet,
      has_pet:          form.has_pet,
      allergies:        form.allergies,
      allergies_other:  form.allergies_other || null,
      prompt_1_answer:  form.prompt_1_answer,
      prompt_2_question: form.prompt_2_question,
      prompt_2_answer:  form.prompt_2_answer,
      connect_platform: form.connect_platform,
      connect_handle:   form.connect_handle || null,
    })
    navigate('/app/profile')
  }

  const YEARS: Year[] = ['Y1', 'Y2', 'Y3', 'Y4', 'Grad']

  return (
    <div className="min-h-screen bg-cream">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-cream border-b border-sand px-5 pt-14 pb-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="font-dm text-sm text-wb2 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Cancel
        </button>
        <p className="font-syne text-base font-bold text-wb">Edit Profile</p>
        <button
          onClick={handleSave}
          className="font-dm text-sm font-medium text-terra"
        >
          Save
        </button>
      </div>

      {/* Scrollable form */}
      <div className="px-5 pb-16 flex flex-col gap-4 mt-4">

        {/* ── Photo ───────────────────────────── */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative"
            aria-label="Change photo"
          >
            <Avatar
              photoUrl={form.photo_url}
              name={form.name || currentUser.name}
              userId={currentUser.id}
              size={96}
              className="ring-4 ring-sand"
            />
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-terra rounded-full flex items-center justify-center border-2 border-cream">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
          </button>
          <p className="font-dm text-xs text-wb3">Tap to change photo</p>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
        </div>

        {/* ── Basic info ──────────────────────── */}
        <Section title="Basic info" />
        <input
          type="text" placeholder="Full name" value={form.name}
          onChange={e => set('name', e.target.value)}
          className="w-full bg-sand rounded-xl px-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-sm"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number" placeholder="Age" value={form.age} min={17} max={35}
            onChange={e => set('age', e.target.value)}
            className="w-full bg-sand rounded-xl px-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-sm"
          />
          <select
            value={form.year}
            onChange={e => set('year', e.target.value as Year)}
            className={`w-full bg-sand rounded-xl px-4 py-3.5 font-dm border border-transparent focus:border-terra focus:outline-none text-sm ${form.year ? 'text-wb' : 'text-wb3'}`}
          >
            <option value="" disabled>Year</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <input
          type="text" placeholder="Faculty / School" value={form.faculty}
          onChange={e => set('faculty', e.target.value)}
          className="w-full bg-sand rounded-xl px-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-sm"
        />
        <input
          type="text" placeholder="Nationality" value={form.nationality}
          onChange={e => set('nationality', e.target.value)}
          className="w-full bg-sand rounded-xl px-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-sm"
        />

        {/* ── Hall ────────────────────────────── */}
        <Section title="Accommodation" />
        <input
          type="text" placeholder="Hall preference" value={form.hall_preference}
          onChange={e => set('hall_preference', e.target.value)}
          className="w-full bg-sand rounded-xl px-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-sm"
        />
        <div className="flex gap-2">
          {(['Sem1', 'Sem2'] as Semester[]).map(s => (
            <OptionCard
              key={s} label={s === 'Sem1' ? 'Semester 1' : 'Semester 2'}
              selected={form.move_in_semester === s}
              onSelect={() => set('move_in_semester', s)}
            />
          ))}
        </div>

        {/* ── Diet ────────────────────────────── */}
        <Section title="Diet" />
        {([
          { value: 'halal',        label: 'Halal',             emoji: '🌙' },
          { value: 'vegetarian',   label: 'Vegetarian',        emoji: '🥦' },
          { value: 'no_pork_beef', label: 'No pork / no beef', emoji: '🙅' },
          { value: 'none',         label: 'No restrictions',   emoji: '🍜' },
        ] as { value: Diet; label: string; emoji: string }[]).map(o => (
          <OptionCard key={o.value} label={o.label} emoji={o.emoji}
            selected={form.diet === o.value} onSelect={() => set('diet', o.value)} />
        ))}

        {/* ── Routine ─────────────────────────── */}
        <Section title="Daily routine" />
        <TimeSlider label="Wake up time" value={form.wake_time} min={4} max={12}
          onChange={v => set('wake_time', v)} />
        <TimeSlider label="Bedtime" value={form.sleep_time > 23 ? form.sleep_time : form.sleep_time}
          min={20} max={30}
          onChange={v => set('sleep_time', v > 23 ? v - 24 : v)} />
        {([
          { value: 'room',    label: 'In my room',           emoji: '🏠' },
          { value: 'library', label: 'Library',              emoji: '📚' },
          { value: 'mixed',   label: 'Mix of both',          emoji: '🔀' },
          { value: 'cafes',   label: 'Cafes & hangout spots', emoji: '☕' },
        ] as { value: StudyLocation; label: string; emoji: string }[]).map(o => (
          <OptionCard key={o.value} label={o.label} emoji={o.emoji}
            selected={form.study_location === o.value} onSelect={() => set('study_location', o.value)} />
        ))}

        {/* ── Social ──────────────────────────── */}
        <Section title="Social style" />
        {([
          { value: 'introvert', label: 'Introvert', description: 'I recharge alone',        emoji: '📖' },
          { value: 'ambivert',  label: 'Ambivert',  description: 'Somewhere in between',    emoji: '⚖️' },
          { value: 'extrovert', label: 'Extrovert', description: 'I love being around people', emoji: '🎉' },
        ] as { value: SocialStyle; label: string; description: string; emoji: string }[]).map(o => (
          <OptionCard key={o.value} label={o.label} description={o.description} emoji={o.emoji}
            selected={form.social_style === o.value} onSelect={() => set('social_style', o.value)} />
        ))}
        <Section title="Guest frequency" />
        {([
          { value: 'never',     label: 'Never',     description: 'I keep guests out' },
          { value: 'rarely',    label: 'Rarely',    description: 'Occasionally' },
          { value: 'sometimes', label: 'Sometimes', description: 'A few times a week' },
          { value: 'often',     label: 'Often',     description: 'Friends over regularly' },
        ] as { value: GuestFrequency; label: string; description: string }[]).map(o => (
          <OptionCard key={o.value} label={o.label} description={o.description}
            selected={form.guest_frequency === o.value} onSelect={() => set('guest_frequency', o.value)} />
        ))}

        {/* ── Living habits ───────────────────── */}
        <Section title="Cleanliness" />
        {([
          { value: 'tidy',    label: 'Tidy',    description: 'Everything in its place', emoji: '✨' },
          { value: 'average', label: 'Average', description: 'Clean enough',            emoji: '🙂' },
          { value: 'relaxed', label: 'Relaxed', description: 'A little mess is fine',   emoji: '🌿' },
        ] as { value: Cleanliness; label: string; description: string; emoji: string }[]).map(o => (
          <OptionCard key={o.value} label={o.label} description={o.description} emoji={o.emoji}
            selected={form.cleanliness === o.value} onSelect={() => set('cleanliness', o.value)} />
        ))}
        <Section title="Habits" />
        <Toggle emoji="🚬" label="I smoke"                  checked={form.smoking}       onChange={v => set('smoking', v)} />
        <Toggle emoji="❄️" label="I need air conditioning"  checked={form.needs_ac}      onChange={v => set('needs_ac', v)} />
        <Toggle emoji="🍳" label="I cook regularly"          checked={form.cooks}         onChange={v => set('cooks', v)} />
        <Toggle emoji="🤫" label="I prefer a quiet space"   checked={form.prefers_quiet} onChange={v => set('prefers_quiet', v)} />
        <Toggle emoji="🐾" label="I have a pet"             checked={form.has_pet}       onChange={v => set('has_pet', v)} />

        {/* ── Allergies ───────────────────────── */}
        <Section title="Allergies" />
        <div className="flex flex-wrap gap-2">
          {COMMON_ALLERGIES.map(item => (
            <button key={item} onClick={() => toggleAllergy(item)}
              className={`px-4 py-2 rounded-full font-dm text-sm font-medium border transition-all active:scale-95 ${
                form.allergies.includes(item)
                  ? 'bg-terra-light border-terra text-terra'
                  : 'bg-sand border-transparent text-wb'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <input
          type="text" placeholder="Other allergies (optional)" value={form.allergies_other}
          onChange={e => set('allergies_other', e.target.value)}
          className="w-full bg-sand rounded-xl px-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-sm"
        />

        {/* ── Prompts ─────────────────────────── */}
        <Section title="About you" />
        <div className="bg-sand rounded-2xl px-4 py-3 mb-1">
          <p className="font-syne text-sm font-bold text-wb">A little about me…</p>
        </div>
        <textarea
          value={form.prompt_1_answer} maxLength={200} rows={3}
          onChange={e => set('prompt_1_answer', e.target.value)}
          className="w-full bg-sand rounded-xl px-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-sm resize-none"
        />
        <div className="flex flex-col gap-2">
          {PROMPT_2_OPTIONS.map(q => (
            <button key={q} onClick={() => set('prompt_2_question', q)}
              className={`w-full text-left px-4 py-3 rounded-2xl border font-dm text-sm font-medium transition-all ${
                form.prompt_2_question === q
                  ? 'bg-terra-light border-terra text-terra'
                  : 'bg-sand border-transparent text-wb'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
        {form.prompt_2_question && (
          <>
            <div className="bg-sand rounded-2xl px-4 py-3">
              <p className="font-syne text-sm font-bold text-wb">{form.prompt_2_question}</p>
            </div>
            <textarea
              value={form.prompt_2_answer} maxLength={200} rows={3}
              onChange={e => set('prompt_2_answer', e.target.value)}
              className="w-full bg-sand rounded-xl px-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-sm resize-none"
            />
          </>
        )}

        {/* ── Connect via ─────────────────────── */}
        <Section title="Connect via" />
        <div className="flex gap-2 bg-sand p-1 rounded-2xl">
          {(['telegram', 'whatsapp'] as ConnectPlatform[]).map(p => (
            <button key={p} onClick={() => set('connect_platform', p)}
              className={`flex-1 py-3 rounded-xl font-dm font-medium text-sm transition-all ${
                form.connect_platform === p ? 'bg-white text-wb shadow-sm' : 'text-wb3'
              }`}
            >
              {p === 'telegram' ? 'Telegram' : 'WhatsApp'}
            </button>
          ))}
        </div>
        {form.connect_platform === 'telegram' ? (
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-dm text-wb2 text-sm">@</span>
            <input
              type="text" placeholder="username" value={form.connect_handle}
              onChange={e => set('connect_handle', e.target.value)}
              autoCapitalize="none"
              className="w-full bg-sand rounded-xl pl-8 pr-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-sm"
            />
          </div>
        ) : (
          <input
            type="tel" placeholder="+65 9123 4567" value={form.connect_handle}
            onChange={e => set('connect_handle', e.target.value)}
            className="w-full bg-sand rounded-xl px-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-sm"
          />
        )}

        {/* ── Save button ─────────────────────── */}
        <button
          onClick={handleSave}
          className="w-full bg-terra text-white font-dm font-medium py-4 rounded-2xl mt-2 active:scale-[0.98] transition-transform"
        >
          Save changes
        </button>
      </div>
    </div>
  )
}
