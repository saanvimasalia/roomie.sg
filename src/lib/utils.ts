export function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  <  1) return 'Just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  <  2) return 'Yesterday'
  if (days  <  7) return `${days}d ago`
  return new Date(isoString).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })
}

export function dayBucket(isoString: string): 'Today' | 'Yesterday' | 'Earlier' {
  const diff = Date.now() - new Date(isoString).getTime()
  if (diff < 86400000)  return 'Today'
  if (diff < 172800000) return 'Yesterday'
  return 'Earlier'
}

export function formatHour(h: number): string {
  if (h === 0) return '12:00 AM'
  if (h < 12) return `${h}:00 AM`
  if (h === 12) return '12:00 PM'
  return `${h - 12}:00 PM`
}

export function getMatchReasons(me: import('../types').UserProfile, them: import('../types').UserProfile): string[] {
  const reasons: string[] = []

  if (me.needs_ac === them.needs_ac)
    reasons.push(me.needs_ac ? 'Both need AC' : 'Neither needs AC')

  if (me.smoking === them.smoking)
    reasons.push(me.smoking ? 'Both smokers' : 'Both non-smokers')

  if (me.diet !== 'none' && me.diet === them.diet)
    reasons.push(`Both ${me.diet}`)

  if (me.hall_preference && them.hall_preference) {
    const myHalls = me.hall_preference.split(', ')
    const theirHalls = them.hall_preference.split(', ')
    const overlap = myHalls.some(h => theirHalls.includes(h))
    if (overlap)
      reasons.push('Same hall preference')
  }

  const sleepDiff = Math.abs(me.sleep_time - them.sleep_time)
  if (sleepDiff <= 2 || sleepDiff >= 22)
    reasons.push('Similar sleep schedule')

  const wakeDiff = Math.abs(me.wake_time - them.wake_time)
  if (wakeDiff <= 2)
    reasons.push('Similar wake time')

  if (me.social_style === them.social_style || me.social_style === 'ambivert' || them.social_style === 'ambivert')
    reasons.push('Compatible social style')

  if (me.study_location && them.study_location) {
    const myLocs = me.study_location.split(', ')
    const theirLocs = them.study_location.split(', ')
    if (myLocs.some(l => theirLocs.includes(l)))
      reasons.push('Same study style')
  }

  if (me.prefers_quiet === them.prefers_quiet)
    reasons.push(me.prefers_quiet ? 'Both prefer quiet' : 'Both okay with noise')

  if (me.cleanliness === them.cleanliness)
    reasons.push('Same cleanliness standard')

  return reasons.slice(0, 5)
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return 'Please choose a JPG, PNG, or WEBP image.'
  if (file.size > MAX_IMAGE_BYTES) return 'Image must be under 5MB.'
  return null
}

export function deriveUniversity(email: string): 'NUS' | 'NTU' | null {
  if (email.endsWith('@e.ntu.edu.sg') || email.endsWith('@ntu.edu.sg')) return 'NTU'
  if (
    email.endsWith('@e.nus.edu.sg') ||
    email.endsWith('@u.nus.edu.sg') ||
    email.endsWith('@nus.edu.sg')
  )
    return 'NUS'
  return null
}
