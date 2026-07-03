import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type {
  University,
  Year,
  Semester,
  Diet,
  StudyLocation,
  SocialStyle,
  GuestFrequency,
  Cleanliness,
  ConnectDisplay,
} from '../types'
import { supabase } from '../lib/supabase'
import { deriveUniversity } from '../lib/utils'

export type OnboardingData = {
  email: string
  university: University | ''
  name: string
  age: string
  year: Year | ''
  faculty: string
  nationality: string
  photo_url: string | null
  hall_points: number | ''
  hall_preference: string[]
  move_in_semester: Semester | ''
  diet: Diet | ''
  wake_time: number
  sleep_time: number
  study_location: StudyLocation[]
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
  telegram_handle: string
  whatsapp_cc: string
  whatsapp_number: string
  connect_display: ConnectDisplay | ''
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
  hall_points: '',
  hall_preference: [],
  move_in_semester: '',
  diet: '',
  wake_time: 7,
  sleep_time: 23,
  study_location: [],
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
  telegram_handle: '',
  whatsapp_cc: '+65',
  whatsapp_number: '',
  connect_display: '',
}

type OnboardingContextType = {
  data: OnboardingData
  update: (fields: Partial<OnboardingData>) => void
  reset: () => void
  setPhotoFile: (file: File | null) => void
  submitProfile: () => Promise<{ error: string | null }>
}

const OnboardingContext = createContext<OnboardingContextType | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(defaultData)
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  // Pre-populate email + university from the active auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const email = session?.user?.email
      if (email) {
        const university = deriveUniversity(email)
        if (university) setData(prev => ({ ...prev, email, university }))
      }
    })
  }, [])

  const update = (fields: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...fields }))
  }

  const reset = () => {
    setData(defaultData)
    setPhotoFile(null)
  }

  const submitProfile = async (): Promise<{ error: string | null }> => {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { error: 'Not signed in.' }

    let photoUrl: string | null = null

    if (photoFile) {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`${user.id}/avatar`, photoFile, { upsert: true })

      if (uploadError) return { error: uploadError.message }

      // The avatars bucket is private — store the storage path, not a
      // public URL. Readers resolve it to a short-lived signed URL.
      photoUrl = `${user.id}/avatar`
    }

    const { error: insertError } = await supabase.from('profiles').update({
      name: data.name,
      age: data.age ? Number(data.age) : null,
      year: data.year || null,
      faculty: data.faculty || null,
      nationality: data.nationality || null,
      photo_url: photoUrl,
      hall_points: data.hall_points !== '' ? data.hall_points : null,
      hall_preference: data.hall_preference.length ? data.hall_preference.join(', ') : null,
      move_in_semester: data.move_in_semester || null,
      diet: data.diet || null,
      wake_time: data.wake_time,
      sleep_time: data.sleep_time,
      study_location: data.study_location.length ? data.study_location.join(', ') : null,
      social_style: data.social_style || null,
      guest_frequency: data.guest_frequency || null,
      cleanliness: data.cleanliness || null,
      smoking: data.smoking,
      needs_ac: data.needs_ac,
      cooks: data.cooks,
      prefers_quiet: data.prefers_quiet,
      has_pet: data.has_pet,
      allergies: data.allergies,
      allergies_other: data.allergies_other || null,
      prompt_1_answer: data.prompt_1_answer,
      prompt_2_question: data.prompt_2_question,
      prompt_2_answer: data.prompt_2_answer,
      telegram_handle: data.telegram_handle || null,
      whatsapp_cc: data.whatsapp_number ? data.whatsapp_cc : null,
      whatsapp_number: data.whatsapp_number || null,
      connect_display: data.connect_display || null,
      is_paused: false,
    }).eq('id', user.id)

    if (insertError) return { error: insertError.message }

    reset()
    return { error: null }
  }

  return (
    <OnboardingContext.Provider value={{ data, update, reset, setPhotoFile, submitProfile }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider')
  return ctx
}
