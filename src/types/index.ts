export type University = 'NUS' | 'NTU'
export type Year = 'Y1' | 'Y2' | 'Y3' | 'Y4' | 'Grad'
export type Semester = 'Sem1' | 'Sem2'
export type Diet = 'halal' | 'vegetarian' | 'no_pork_beef' | 'none'
export type StudyLocation = 'room' | 'library' | 'mixed' | 'cafes'
export type SocialStyle = 'introvert' | 'ambivert' | 'extrovert'
export type GuestFrequency = 'never' | 'rarely' | 'sometimes' | 'often'
export type Cleanliness = 'tidy' | 'average' | 'relaxed'
export type ConnectPlatform = 'telegram' | 'whatsapp'
export type ActivityType = 'new_like' | 'new_match' | 'connected'

export type UserProfile = {
  // Identity
  id: string
  email: string
  university: University
  created_at: string

  // Basic info
  name: string
  age: number
  year: Year
  faculty: string
  nationality: string
  photo_url: string | null

  // Accommodation
  hall_preference: string
  move_in_semester: Semester

  // Lifestyle
  diet: Diet
  wake_time: number       // Hour 0-23
  sleep_time: number      // Hour 0-23
  study_location: StudyLocation
  social_style: SocialStyle
  guest_frequency: GuestFrequency
  cleanliness: Cleanliness
  smoking: boolean
  needs_ac: boolean
  cooks: boolean
  prefers_quiet: boolean
  has_pet: boolean

  // Allergies
  allergies: string[]
  allergies_other: string | null

  // Prompts
  prompt_1_answer: string
  prompt_2_question: string
  prompt_2_answer: string

  // Connect
  connect_platform: ConnectPlatform
  connect_handle: string | null

  // App state
  is_paused: boolean
  is_verified: boolean
}

export type Like = {
  id: string
  liker_id: string
  liked_id: string
  created_at: string
}

export type Activity = {
  id: string
  user_id: string
  type: ActivityType
  actor_id: string
  is_read: boolean
  created_at: string
}

export type MatchLabel = 'Great match' | 'Good match' | 'Decent match'

export type ProfileWithScore = UserProfile & {
  score: number
  label: MatchLabel
  match_reasons: string[]
  is_mutual_match: boolean
}
