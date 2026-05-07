/**
 * Spaced Repetition System (SRS) Implementation
 * Based on SM-2 Algorithm and research by Piotr Wozniak
 * 
 * Intervals: 1 day, 3 days, 7 days, 14 days, 30 days, 60 days, 120 days, 240 days
 */

import { doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from './firebase'

export interface SRSCard {
  id: string
  itemId: string
  itemType: 'vocabulary' | 'phrase' | 'character' | 'chunk'
  interval: number // days until next review
  easeFactor: number // difficulty multiplier (starts at 2.5)
  repetitions: number // how many times reviewed
  nextReviewDate: number // timestamp
  lastReviewDate: number // timestamp
  quality: number // 0-5 rating from last review
  correctStreak: number // consecutive correct answers
  incorrectStreak: number // consecutive incorrect answers
  dueDate: string // ISO date string
}

// SM-2 Algorithm constants
const DEFAULT_EASE_FACTOR = 2.5
const MIN_EASE_FACTOR = 1.3
const DEFAULT_INTERVAL = 1 // Start with 1 day

// Optimized intervals for language learning
const INTERVALS_DAYS = [1, 3, 7, 14, 30, 60, 120, 240]

/**
 * Calculate next review interval using SM-2 algorithm
 * Quality: 0 = complete blackout, 5 = perfect response
 */
export function calculateNextInterval(
  card: SRSCard,
  quality: number // 0-5
): { interval: number; easeFactor: number; nextDate: number } {
  let easeFactor = card.easeFactor
  let interval = card.interval

  // Update ease factor based on quality
  easeFactor = Math.max(
    MIN_EASE_FACTOR,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  )

  if (quality < 3) {
    // Failed: reset to beginning
    interval = DEFAULT_INTERVAL
  } else if (card.repetitions === 0) {
    // First successful review: 1 day
    interval = 1
  } else if (card.repetitions === 1) {
    // Second review: 3 days
    interval = 3
  } else {
    // Subsequent reviews: multiply by ease factor
    interval = Math.round(card.interval * easeFactor)
  }

  // Cap at maximum interval
  interval = Math.min(interval, INTERVALS_DAYS[INTERVALS_DAYS.length - 1])

  const nextDate = Date.now() + interval * 24 * 60 * 60 * 1000

  return { interval, easeFactor, nextDate }
}

/**
 * Create a new SRS card for an item
 */
export function createSRSCard(
  itemId: string,
  itemType: SRSCard['itemType']
): SRSCard {
  const now = Date.now()
  const tomorrow = now + 24 * 60 * 60 * 1000

  return {
    id: `srs-${itemId}-${Date.now()}`,
    itemId,
    itemType,
    interval: DEFAULT_INTERVAL,
    easeFactor: DEFAULT_EASE_FACTOR,
    repetitions: 0,
    nextReviewDate: tomorrow,
    lastReviewDate: now,
    quality: 0,
    correctStreak: 0,
    incorrectStreak: 0,
    dueDate: new Date(tomorrow).toISOString().split('T')[0],
  }
}

/**
 * Get cards due for review today
 */
export function getCardsDue(cards: SRSCard[]): SRSCard[] {
  const today = new Date().toISOString().split('T')[0]
  return cards.filter((card) => card.dueDate <= today)
}

/**
 * Get review statistics
 */
export function getReviewStats(cards: SRSCard[]) {
  const dueToday = getCardsDue(cards).length
  const totalCards = cards.length
  const totalReviews = cards.reduce((sum, card) => sum + card.repetitions, 0)
  const averageEase = (cards.reduce((sum, card) => sum + card.easeFactor, 0) / cards.length).toFixed(2)
  const newCards = cards.filter((card) => card.repetitions === 0).length
  const maturCards = cards.filter((card) => card.repetitions >= 3).length

  return { dueToday, totalCards, totalReviews, averageEase, newCards, maturCards }
}

/**
 * Update card after review
 */
export async function reviewSRSCard(
  userId: string,
  card: SRSCard,
  quality: number, // 0-5
  isCorrect: boolean
): Promise<SRSCard> {
  const { interval, easeFactor, nextDate } = calculateNextInterval(card, quality)

  const updatedCard: SRSCard = {
    ...card,
    interval,
    easeFactor,
    repetitions: isCorrect ? card.repetitions + 1 : card.repetitions,
    nextReviewDate: nextDate,
    lastReviewDate: Date.now(),
    quality,
    correctStreak: isCorrect ? card.correctStreak + 1 : 0,
    incorrectStreak: isCorrect ? 0 : card.incorrectStreak + 1,
    dueDate: new Date(nextDate).toISOString().split('T')[0],
  }

  // Persist to Firebase
  await updateDoc(doc(db, 'users', userId, 'srsCards', card.id), updatedCard)

  return updatedCard
}

/**
 * Calculate optimal study time based on circadian rhythm
 * Returns true if user should study now
 */
export function isOptimalStudyTime(): boolean {
  const hour = new Date().getHours()
  // Optimal learning windows: 9-12am, 2-4pm, 7-9pm
  const optimalHours = [9, 10, 11, 14, 15, 16, 19, 20]
  return optimalHours.includes(hour)
}

/**
 * Get next review card considering difficulty
 */
export function getNextCardPriority(cards: SRSCard[]): SRSCard | null {
  const dueCards = getCardsDue(cards)
  if (dueCards.length === 0) return null

  // Priority: highest ease factor first (easier cards to warm up)
  return dueCards.reduce((min, card) => (card.easeFactor < min.easeFactor ? card : min))
}
