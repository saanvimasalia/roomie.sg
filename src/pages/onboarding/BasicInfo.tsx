import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../context/OnboardingContext'
import OnboardingLayout from '../../components/OnboardingLayout'
import { validateImageFile } from '../../lib/utils'
import type { Year } from '../../types'

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

export default function BasicInfo() {
  const navigate = useNavigate()
  const { data, update, setPhotoFile } = useOnboarding()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoError, setPhotoError] = useState('')

  const isValid =
    data.name.trim() !== '' &&
    data.age !== '' &&
    Number(data.age) >= 17 &&
    Number(data.age) <= 35 &&
    data.year !== '' &&
    data.faculty.trim() !== '' &&
    data.nationality.trim() !== ''

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateImageFile(file)
    if (validationError) {
      setPhotoError(validationError)
      e.target.value = ''
      return
    }

    setPhotoError('')
    setPhotoFile(file)
    update({ photo_url: URL.createObjectURL(file) })
  }

  return (
    <OnboardingLayout
      step={3}
      title="About you"
      subtitle="This is what others will see on your profile."
      onNext={() => navigate('/onboarding/hall')}
      nextDisabled={!isValid}
    >
      {/* Photo upload */}
      <div className="flex flex-col items-center mb-7">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="relative w-24 h-24 rounded-full bg-sand border-2 border-dashed border-wb3 hover:border-terra overflow-hidden flex items-center justify-center transition-colors"
          aria-label="Upload photo"
        >
          {data.photo_url ? (
            <img src={data.photo_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-8 h-8 text-wb3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
          )}
        </button>
        <p className="font-dm text-xs text-wb3 mt-2">
          {data.photo_url ? 'Tap to change' : 'Add photo (optional)'}
        </p>
        {photoError && (
          <p className="font-dm text-xs text-red-500 mt-1">{photoError}</p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Full name"
          value={data.name}
          onChange={e => update({ name: e.target.value })}
          className="w-full bg-sand rounded-xl px-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-sm"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Age"
            value={data.age}
            onChange={e => update({ age: e.target.value })}
            min={17}
            max={35}
            className="w-full bg-sand rounded-xl px-4 py-3.5 font-dm text-wb placeholder-wb3 border border-transparent focus:border-terra focus:outline-none text-sm"
          />

          <select
            value={data.year}
            onChange={e => update({ year: e.target.value as Year })}
            className={`w-full bg-sand rounded-xl px-4 py-3.5 font-dm border border-transparent focus:border-terra focus:outline-none text-sm ${
              data.year ? 'text-wb' : 'text-wb3'
            }`}
          >
            <option value="" disabled>Year</option>
            {YEARS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <select
          value={data.faculty}
          onChange={e => update({ faculty: e.target.value })}
          className={`w-full bg-sand rounded-xl px-4 py-3.5 font-dm border border-transparent focus:border-terra focus:outline-none text-sm ${
            data.faculty ? 'text-wb' : 'text-wb3'
          }`}
        >
          <option value="" disabled>Faculty / School</option>
          {FACULTIES.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <select
          value={data.nationality}
          onChange={e => update({ nationality: e.target.value })}
          className={`w-full bg-sand rounded-xl px-4 py-3.5 font-dm border border-transparent focus:border-terra focus:outline-none text-sm ${
            data.nationality ? 'text-wb' : 'text-wb3'
          }`}
        >
          <option value="" disabled>Nationality</option>
          {NATIONALITIES.map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
    </OnboardingLayout>
  )
}
