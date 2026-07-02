import type { UserProfile, MatchLabel } from '../types'

const CLEAN_ORDER = ['relaxed', 'average', 'tidy'] as const
const GUEST_ORDER = ['never', 'rarely', 'sometimes', 'often'] as const

function normSleep(h: number): number {
  return h < 5 ? h + 24 : h
}

export function computeScore(
  me: UserProfile,
  other: UserProfile,
): { score: number; label: MatchLabel; match_reasons: string[] } {
  let pts = 0
  const reasons: string[] = []

  // Smoking — 15 pts
  if (me.smoking === other.smoking) {
    pts += 15
    if (!me.smoking) reasons.push('Both non-smokers')
  }

  // Sleep schedule — up to 20 pts
  const wakeDiff = Math.abs(me.wake_time - other.wake_time)
  const sleepDiff = Math.abs(normSleep(me.sleep_time) - normSleep(other.sleep_time))
  pts += Math.max(0, 20 - (wakeDiff + sleepDiff) * 2)
  if (wakeDiff <= 1 && sleepDiff <= 1) reasons.push('Similar sleep schedule')

  // Cleanliness — 15 pts
  const cleanDiff = Math.abs(
    CLEAN_ORDER.indexOf(me.cleanliness) - CLEAN_ORDER.indexOf(other.cleanliness),
  )
  if (cleanDiff === 0) {
    pts += 15
    reasons.push('Similar cleanliness')
  } else if (cleanDiff === 1) {
    pts += 7
  }

  // Diet — 10 pts exact meaningful, 5 if both none, 3 partial
  if (me.diet === other.diet) {
    pts += me.diet === 'none' ? 5 : 10
    if (me.diet !== 'none') reasons.push('Same diet preference')
  } else if (me.diet === 'none' || other.diet === 'none') {
    pts += 3
  }

  // Social style — 10 pts
  if (me.social_style === other.social_style) {
    pts += 10
    reasons.push('Same social style')
  } else if (me.social_style === 'ambivert' || other.social_style === 'ambivert') {
    pts += 5
  }

  // Guest frequency — 8 pts
  const guestDiff = Math.abs(
    GUEST_ORDER.indexOf(me.guest_frequency) - GUEST_ORDER.indexOf(other.guest_frequency),
  )
  if (guestDiff === 0) pts += 8
  else if (guestDiff === 1) pts += 4

  // AC preference — 7 pts
  if (me.needs_ac === other.needs_ac) {
    pts += 7
    if (me.needs_ac) reasons.push('Same AC preference')
  }

  // Prefers quiet — 8 pts
  if (me.prefers_quiet === other.prefers_quiet) {
    pts += 8
    if (me.prefers_quiet) reasons.push('Both prefer quiet')
  }

  // Study location — 5 pts (any overlap counts)
  if (me.study_location && other.study_location) {
    const myLocs = me.study_location.split(', ')
    const theirLocs = other.study_location.split(', ')
    if (myLocs.some(l => theirLocs.includes(l))) {
      pts += 5
      reasons.push('Same study style')
    }
  }

  // Cooks — 2 pts
  if (me.cooks === other.cooks) pts += 2

  // Has pet — 2 pts
  if (me.has_pet === other.has_pet) pts += 2

  // Max raw = 15+20+15+10+10+8+7+8+5+2+2 = 102
  const score = Math.min(100, Math.round((pts / 102) * 100))
  const label: MatchLabel =
    score >= 70 ? 'Great match' : score >= 50 ? 'Good match' : 'Decent match'

  return { score, label, match_reasons: reasons.slice(0, 4) }
}
