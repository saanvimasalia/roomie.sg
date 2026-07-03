import { describe, it, expect } from 'vitest'
import { computeScore } from './matching'
import type { UserProfile } from '../types'

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 'user-1',
    email: 'a@e.ntu.edu.sg',
    university: 'NTU',
    created_at: '2026-01-01T00:00:00Z',
    name: 'Test User',
    age: 20,
    year: 'Y2',
    faculty: 'Engineering',
    nationality: 'Singaporean',
    photo_url: null,
    hall_points: null,
    hall_preference: 'Hall A',
    move_in_semester: 'Sem1',
    diet: 'none',
    wake_time: 7,
    sleep_time: 23,
    study_location: 'room',
    social_style: 'ambivert',
    guest_frequency: 'sometimes',
    cleanliness: 'average',
    smoking: false,
    needs_ac: true,
    cooks: false,
    prefers_quiet: false,
    has_pet: false,
    allergies: [],
    allergies_other: null,
    prompt_1_answer: '',
    prompt_2_question: '',
    prompt_2_answer: '',
    telegram_handle: null,
    whatsapp_cc: null,
    whatsapp_number: null,
    connect_display: null,
    is_paused: false,
    is_verified: true,
    ...overrides,
  }
}

describe('computeScore', () => {
  it('scores identical profiles as a Great match with full marks', () => {
    // diet: 'none' only earns partial credit by design, so use a meaningful
    // diet here to hit the true maximum score.
    const me = makeProfile({ diet: 'halal' })
    const other = makeProfile({ id: 'user-2', diet: 'halal' })

    const result = computeScore(me, other)

    expect(result.score).toBe(100)
    expect(result.label).toBe('Great match')
  })

  it('gives no credit for opposite preferences on every scored field', () => {
    const me = makeProfile({
      smoking: false,
      cleanliness: 'tidy',
      diet: 'halal',
      social_style: 'introvert',
      guest_frequency: 'never',
      needs_ac: true,
      prefers_quiet: true,
      cooks: true,
      has_pet: true,
      wake_time: 6,
      sleep_time: 22,
      study_location: 'room',
    })
    const other = makeProfile({
      id: 'user-2',
      smoking: true,
      cleanliness: 'relaxed',
      diet: 'vegetarian',
      social_style: 'extrovert',
      guest_frequency: 'often',
      needs_ac: false,
      prefers_quiet: false,
      cooks: false,
      has_pet: false,
      wake_time: 14,
      sleep_time: 4,
      study_location: 'cafes',
    })

    const result = computeScore(me, other)

    expect(result.score).toBe(0)
    expect(result.label).toBe('Decent match')
    expect(result.match_reasons).toEqual([])
  })

  it('credits study location match on partial overlap, not exact string equality', () => {
    // Differ on every other scored field so the study-location reason isn't
    // crowded out by match_reasons' 4-item cap.
    const me = makeProfile({
      smoking: false,
      cleanliness: 'tidy',
      social_style: 'introvert',
      needs_ac: true,
      wake_time: 6,
      sleep_time: 22,
      study_location: 'room, library',
    })
    const other = makeProfile({
      id: 'user-2',
      smoking: true,
      cleanliness: 'relaxed',
      social_style: 'extrovert',
      needs_ac: false,
      wake_time: 14,
      sleep_time: 10,
      study_location: 'library, cafes',
    })

    const result = computeScore(me, other)

    expect(result.match_reasons).toContain('Same study style')
  })

  it('does not credit study location when there is no overlap', () => {
    const me = makeProfile({ study_location: 'room' })
    const other = makeProfile({ id: 'user-2', study_location: 'cafes' })

    const result = computeScore(me, other)

    expect(result.match_reasons).not.toContain('Same study style')
  })

  it('treats sleep times either side of midnight as close, not far apart', () => {
    const me = makeProfile({ wake_time: 8, sleep_time: 0 })
    const other = makeProfile({ id: 'user-2', wake_time: 8, sleep_time: 23 })

    const result = computeScore(me, other)

    expect(result.match_reasons).toContain('Similar sleep schedule')
  })

  it('caps match_reasons at four entries', () => {
    const me = makeProfile()
    const other = makeProfile({ id: 'user-2' })

    const result = computeScore(me, other)

    expect(result.match_reasons.length).toBeLessThanOrEqual(4)
  })
})
