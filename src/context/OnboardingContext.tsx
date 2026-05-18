import { createContext, useContext, useState, ReactNode } from 'react'
import type {
  University,
  Year,
  Semester,
  Diet,
  StudyLocation,
  SocialStyle,
  GuestFrequency,
  Cleanliness,
  ConnectPlatform,
} from '../types'

export type OnboardingData = {
  email: string
  university: University | ''
  name: string
  age: string
  year: Year | ''
  faculty: string
  nationality: string
  photo_url: string | null
  hall_preference: string
  move_in_semester: Semester | ''
  diet: Diet | ''
  wake_time: number
  sleep_time: number
  study_location: StudyLocation | ''
  social_style: SocialStyle | ''
  guest_frequency: GuestFrequency | ''
  cleanliness: Cleanliness | ''
  smoking: boolean
  needs_ac: boolean
  cooks: boolean
  prefers_quiet: boolean
  has_pet: boolean
  allergies: string[]
  allergies_other: string
  prompt_1_answer: string
  prompt_2_question: string
  prompt_2_answer: string
  connect_platform: ConnectPlatform
  connect_handle: string
}

const defaultData: OnboardingData = {
  email: '',
  university: '',
  name: '',
  age: '',
  year: '',
  faculty: '',
  nationality: '',
  photo_url: null,
  hall_preference: '',
  move_in_semester: '',
  diet: '',
  wake_time: 7,
  sleep_time: 23,
  study_location: '',
  social_style: '',
  guest_frequency: '',
  cleanliness: '',
  smoking: false,
  needs_ac: false,
  cooks: false,
  prefers_quiet: false,
  has_pet: false,
  allergies: [],
  allergies_other: '',
  prompt_1_answer: '',
  prompt_2_question: '',
  prompt_2_answer: '',
  connect_platform: 'telegram',
  connect_handle: '',
}

type OnboardingContextType = {
  data: OnboardingData
  update: (fields: Partial<OnboardingData>) => void
  reset: () => void
  submitProfile: () => void
}

const OnboardingContext = createContext<OnboardingContextType | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(defaultData)

  const update = (fields: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...fields }))
  }

  const reset = () => setData(defaultData)

  const submitProfile = () => {
    // Step 9 wires this to Supabase — log for now
    console.log('Submitting profile:', data)
  }

  return (
    <OnboardingContext.Provider value={{ data, update, reset, submitProfile }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider')
  return ctx
}
