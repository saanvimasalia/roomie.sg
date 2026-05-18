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
