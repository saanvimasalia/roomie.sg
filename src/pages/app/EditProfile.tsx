import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import OptionCard from '../../components/OptionCard'
import Toggle from '../../components/Toggle'
import Avatar from '../../components/Avatar'
import { formatHour } from '../../lib/utils'
import { supabase } from '../../lib/supabase'
import type {
  Year, Semester, Diet, StudyLocation,
  SocialStyle, GuestFrequency, Cleanliness, ConnectDisplay, ProfileWithScore,
} from '../../types'

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

const YEARS: Year[] = ['Y1', 'Y2', 'Y3', 'Y4', 'Grad', 'Exchange']

const FACULTIES = [
  'Asian School of the Environment (ASE)',
  'College of Computing and Data Science (CCDS)',
  'Lee Kong Chian School of Medicine (LKCMedicine)',
  'Nanyang Business School (NBS)',
  'National Institute of Education (NIE)',
  'School of Art, Design and Media (ADM)',
  'School of Biological Sciences (SBS)',
  'School of Chemical & Biomedical Engineering (SCBE)',
  'School of Civil & Environmental Engineering (CEE)',
  'School of Electrical & Electronic Engineering (EEE)',
  'School of Humanities (SoH)',
  'School of Materials Science & Engineering (MSE)',
  'School of Mechanical & Aerospace Engineering (MAE)',
  'School of Physical & Mathematical Sciences (SPMS)',
  'School of Social Sciences (SSS)',
  'Wee Kim Wee School of Communication and Information (WKWSCI)',
]

const NATIONALITIES = [
  'Afghan', 'Albanian', 'Algerian', 'American', 'Andorran', 'Angolan', 'Argentinian',
  'Armenian', 'Australian', 'Austrian', 'Azerbaijani', 'Bahraini', 'Bangladeshi',
  'Belarusian', 'Belgian', 'Belizean', 'Beninese', 'Bhutanese', 'Bolivian',
  'Bosnian', 'Botswanan', 'Brazilian', 'British', 'Bruneian', 'Bulgarian',
  'Burkinabe', 'Burmese', 'Burundian', 'Cambodian', 'Cameroonian', 'Canadian',
  'Cape Verdean', 'Central African', 'Chadian', 'Chilean', 'Chinese', 'Colombian',
  'Comorian', 'Congolese', 'Costa Rican', 'Croatian', 'Cuban', 'Cypriot', 'Czech',
  'Danish', 'Djiboutian', 'Dominican', 'Dutch', 'Ecuadorian', 'Egyptian',
  'Emirati', 'Eritrean', 'Estonian', 'Ethiopian', 'Fijian', 'Finnish', 'French',
  'Gabonese', 'Gambian', 'Georgian', 'German', 'Ghanaian', 'Greek', 'Guatemalan',
  'Guinean', 'Haitian', 'Honduran', 'Hungarian', 'Icelandic', 'Indian',
  'Indonesian', 'Iranian', 'Iraqi', 'Irish', 'Israeli', 'Italian', 'Ivorian',
  'Jamaican', 'Japanese', 'Jordanian', 'Kazakh', 'Kenyan', 'Korean', 'Kuwaiti',
  'Kyrgyz', 'Laotian', 'Latvian', 'Lebanese', 'Liberian', 'Libyan', 'Lithuanian',
  'Luxembourgish', 'Macedonian', 'Malagasy', 'Malawian', 'Malaysian', 'Maldivian',
  'Malian', 'Maltese', 'Mauritanian', 'Mauritian', 'Mexican', 'Moldovan',
  'Mongolian', 'Montenegrin', 'Moroccan', 'Mozambican', 'Namibian', 'Nepali',
  'New Zealander', 'Nicaraguan', 'Nigerien', 'Nigerian', 'Norwegian', 'Omani',
  'Pakistani', 'Palestinian', 'Panamanian', 'Paraguayan', 'Peruvian', 'Filipino',
  'Polish', 'Portuguese', 'Qatari', 'Romanian', 'Russian', 'Rwandan', 'Saudi',
  'Senegalese', 'Serbian', 'Sierra Leonean', 'Singaporean', 'Slovak', 'Slovenian',
  'Somali', 'South African', 'Spanish', 'Sri Lankan', 'Sudanese', 'Swedish',
  'Swiss', 'Syrian', 'Taiwanese', 'Tajik', 'Tanzanian', 'Thai', 'Togolese',
  'Trinidadian', 'Tunisian', 'Turkish', 'Turkmen', 'Ugandan', 'Ukrainian',
  'Uruguayan', 'Uzbek', 'Venezuelan', 'Vietnamese', 'Yemeni', 'Zambian', 'Zimbabwean',
]

const NTU_HALLS = [
  'Hall 1', 'Hall 2', 'Hall 3', 'Hall 4', 'Hall 5', 'Hall 6',
  'Hall 7', 'Hall 8', 'Hall 9', 'Hall 10', 'Hall 11', 'Hall 12',
  'Hall 13', 'Hall 14', 'Hall 15', 'Hall 16',
  'Crescent Hall', 'Pioneer Hall', 'Binjai Hall',
  'Tanjong Hall', 'Banyan Hall', 'Tamarind Hall', 'Saraca Hall',
]

const STUDY_OPTIONS: { value: StudyLocation; label: string; emoji: string }[] = [
  { value: 'room',    label: 'In my room',           emoji: '🏠' },
  { value: 'library', label: 'Library',              emoji: '📚' },
  { value: 'cafes',   label: 'Cafes & hangout spots', emoji: '☕' },
]

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

function buildForm(u: import('../../types').ProfileWithScore) {
  return {
    name:              u.name             ?? '',
    age:               String(u.age       ?? ''),
    year:              (u.year            ?? '') as import('../../types').Year | '',
    faculty:           u.faculty          ?? '',
    nationality:       u.nationality      ?? '',
    photo_url:         u.photo_url,
    hall_preference:   u.hall_preference ? u.hall_preference.split(', ').filter(Boolean) : [] as string[],
    hall_points:       (u.hall_points ?? '') as number | '',
    move_in_semester:  (u.move_in_semester ?? '') as import('../../types').Semester | '',
    diet:              (u.diet            ?? '') as import('../../types').Diet | '',
    wake_time:         u.wake_time        ?? 7,
    sleep_time:        u.sleep_time       ?? 23,
    study_location:    u.study_location ? u.study_location.split(', ').filter(Boolean) as import('../../types').StudyLocation[] : [] as import('../../types').StudyLocation[],
    social_style:      (u.social_style    ?? '') as import('../../types').SocialStyle | '',
    guest_frequency:   (u.guest_frequency ?? '') as import('../../types').GuestFrequency | '',
    cleanliness:       (u.cleanliness     ?? '') as import('../../types').Cleanliness | '',
    smoking:           u.smoking          ?? false,
    needs_ac:          u.needs_ac         ?? false,
    cooks:             u.cooks            ?? false,
    prefers_quiet:     u.prefers_quiet    ?? false,
    has_pet:           u.has_pet          ?? false,
    allergies:         u.allergies        ?? [],
    allergies_other:   u.allergies_other  ?? '',
    prompt_1_answer:   u.prompt_1_answer  ?? '',
    prompt_2_question: u.prompt_2_question ?? '',
    prompt_2_answer:   u.prompt_2_answer  ?? '',
    telegram_handle:   u.telegram_handle  ?? '',
    whatsapp_cc:       u.whatsapp_cc      ?? '+65',
    whatsapp_number:   u.whatsapp_number  ?? '',
    connect_display:   (u.connect_display ?? '') as import('../../types').ConnectDisplay | '',
  }
}

export default function EditProfile() {
  const navigate = useNavigate()
  const { currentUser, updateCurrentUser, loading } = useAppContext()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // All hooks before any early return (React rules of hooks)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState('')
  const [form, setForm]           = useState(() => buildForm((currentUser ?? {}) as import('../../types').ProfileWithScore))

  // Re-sync form when currentUser first loads
  useEffect(() => {
    if (currentUser) setForm(buildForm(currentUser))
  }, [currentUser?.id])

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <p className="font-dm text-wb2">Loading…</p>
      </div>
    )
  }

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
    if (file) {
      setPhotoFile(file)
      set('photo_url', URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')

    let photoUrl = form.photo_url

    if (photoFile) {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`${currentUser.id}/avatar`, photoFile, { upsert: true })
      if (uploadError) {
        setSaveError(`Photo upload: ${uploadError.message}`)
        setSaving(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(`${currentUser.id}/avatar`)
      photoUrl = publicUrl
    }

    const updates = {
      name:              form.name.trim() || null,
      age:               form.age ? Number(form.age) : null,
      year:              form.year || null,
      faculty:           form.faculty.trim() || null,
      nationality:       form.nationality.trim() || null,
      photo_url:         photoUrl,
      hall_preference:   form.hall_preference.length ? form.hall_preference.join(', ') : null,
      hall_points:       form.hall_points !== '' ? form.hall_points : null,
      move_in_semester:  form.move_in_semester || null,
      diet:              form.diet || null,
      wake_time:         form.wake_time,
      sleep_time:        form.sleep_time,
      study_location:    form.study_location.length ? form.study_location.join(', ') : null,
      social_style:      form.social_style || null,
      guest_frequency:   form.guest_frequency || null,
      cleanliness:       form.cleanliness || null,
      smoking:           form.smoking,
      needs_ac:          form.needs_ac,
      cooks:             form.cooks,
      prefers_quiet:     form.prefers_quiet,
      has_pet:           form.has_pet,
      allergies:         form.allergies,
      allergies_other:   form.allergies_other || null,
      prompt_1_answer:   form.prompt_1_answer || null,
      prompt_2_question: form.prompt_2_question || null,
      prompt_2_answer:   form.prompt_2_answer || null,
      telegram_handle:   form.telegram_handle || null,
      whatsapp_cc:       form.whatsapp_number ? form.whatsapp_cc : null,
      whatsapp_number:   form.whatsapp_number || null,
      connect_display:   form.connect_display || null,
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', currentUser.id)

    if (error) {
      setSaveError(`Profile save: ${error.message}`)
      setSaving(false)
      return
    }

    updateCurrentUser({ ...updates, photo_url: photoUrl } as Partial<ProfileWithScore>)
    navigate('/app/profile')
  }

  const isY1 = form.year === 'Y1' || form.year === 'Exchange'

  const toggleHall = (hall: string) => {
    set('hall_preference', form.hall_preference.includes(hall)
      ? form.hall_preference.filter(h => h !== hall)
      : [...form.hall_preference, hall]
    )
  }

  const toggleStudy = (loc: StudyLocation) => {
    set('study_location', form.study_location.includes(loc)
      ? form.study_location.filter(l => l !== loc)
      : [...form.study_location, loc]
    )
  }

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
          disabled={saving}
          className="font-dm text-sm font-medium text-terra disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save'}
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
        <select
          value={form.faculty}
          onChange={e => set('faculty', e.target.value)}
          className={`w-full bg-sand rounded-xl px-4 py-3.5 font-dm border border-transparent focus:border-terra focus:outline-none text-sm ${form.faculty ? 'text-wb' : 'text-wb3'}`}
        >
          <option value="" disabled>Faculty / School</option>
          {FACULTIES.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select
          value={form.nationality}
          onChange={e => set('nationality', e.target.value)}
          className={`w-full bg-sand rounded-xl px-4 py-3.5 font-dm border border-transparent focus:border-terra focus:outline-none text-sm ${form.nationality ? 'text-wb' : 'text-wb3'}`}
        >
          <option value="" disabled>Nationality</option>
          {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
        </select>

        {/* ── Hall ────────────────────────────── */}
        <Section title="Accommodation" />
        {!isY1 && (
          <>
            <div>
              <p className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide mb-2">Hall points</p>
              <div className="flex gap-2 flex-wrap">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(pt => (
                  <button
                    key={pt}
                    onClick={() => set('hall_points', pt)}
                    className={`w-10 h-10 rounded-full font-dm text-sm font-medium border transition-all active:scale-95 ${
                      form.hall_points === pt
                        ? 'bg-terra-light border-terra text-terra'
                        : 'bg-sand border-transparent text-wb'
                    }`}
                  >
                    {pt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide mb-2">Hall preference</p>
              <div className="flex flex-wrap gap-2">
                {NTU_HALLS.map(hall => (
                  <button
                    key={hall}
                    onClick={() => toggleHall(hall)}
                    className={`px-4 py-2 rounded-full font-dm text-sm font-medium border transition-all active:scale-95 ${
                      form.hall_preference.includes(hall)
                        ? 'bg-terra-light border-terra text-terra'
                        : 'bg-sand border-transparent text-wb'
                    }`}
                  >
                    {hall}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        <div>
          <p className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide mb-2">Moving in</p>
          <div className="flex gap-2">
            {(['Sem1', 'Sem2'] as Semester[]).map(s => (
              <OptionCard
                key={s} label={s === 'Sem1' ? 'Semester 1' : 'Semester 2'}
                selected={form.move_in_semester === s}
                onSelect={() => set('move_in_semester', s)}
              />
            ))}
          </div>
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
        <TimeSlider label="Wake up time" value={form.wake_time} min={0} max={23}
          onChange={v => set('wake_time', v)} />
        <TimeSlider label="Bedtime" value={form.sleep_time} min={0} max={23}
          onChange={v => set('sleep_time', v)} />
        <p className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide">Where do you usually study?</p>
        <div className="flex flex-wrap gap-2">
          {STUDY_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => toggleStudy(o.value)}
              className={`px-4 py-2 rounded-full font-dm text-sm font-medium border transition-all active:scale-95 ${
                form.study_location.includes(o.value)
                  ? 'bg-terra-light border-terra text-terra'
                  : 'bg-sand border-transparent text-wb'
              }`}
            >
              {o.emoji} {o.label}
            </button>
          ))}
        </div>

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
        <div>
          <p className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide mb-2">Telegram</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-dm text-wb2 text-sm">@</span>
            <input
              type="text" placeholder="username" value={form.telegram_handle}
              onChange={e => set('telegram_handle', e.target.value)}
              autoCapitalize="none"
              className="w-full bg-sand rounded-xl pl-8 pr-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-sm"
            />
          </div>
        </div>
        <div>
          <p className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide mb-2">WhatsApp</p>
          <div className="flex gap-2">
            <select
              value={form.whatsapp_cc}
              onChange={e => set('whatsapp_cc', e.target.value)}
              className="bg-sand rounded-xl px-3 py-3.5 font-dm text-wb border border-transparent focus:border-terra focus:outline-none text-sm w-36 flex-shrink-0"
            >
              {COUNTRY_CODES.map(c => (
                <option key={c.label} value={c.code}>{c.label}</option>
              ))}
            </select>
            <input
              type="tel" placeholder="" value={form.whatsapp_number}
              onChange={e => set('whatsapp_number', e.target.value)}
              className="flex-1 bg-sand rounded-xl px-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-sm"
            />
          </div>
        </div>
        <div>
          <p className="font-dm text-xs font-medium text-wb2 uppercase tracking-wide mb-2">
            Show matches
          </p>
          <div className="flex gap-2">
            {(['telegram', 'whatsapp', 'both'] as ConnectDisplay[]).map(opt => (
              <button
                key={opt}
                onClick={() => set('connect_display', opt)}
                className={`flex-1 py-2.5 rounded-xl font-dm text-sm font-medium border transition-all ${
                  form.connect_display === opt
                    ? 'bg-terra-light border-terra text-terra'
                    : 'bg-sand border-transparent text-wb'
                }`}
              >
                {opt === 'telegram' ? 'Telegram' : opt === 'whatsapp' ? 'WhatsApp' : 'Both'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Save button ─────────────────────── */}
        {saveError && (
          <p className="font-dm text-xs text-red-500 text-center">{saveError}</p>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-terra text-white font-dm font-medium py-4 rounded-2xl mt-2 active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
