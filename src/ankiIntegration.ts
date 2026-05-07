/**
 * Anki Integration for RedTail Academy
 * 
 * Implements Anki-style flashcards throughout the app
 * with automatic scheduling and spaced repetition
 */

export interface AnkiDeck {
  id: string
  name: string
  description: string
  cards: AnkiCard[]
  createdAt: number
  updatedAt: number
  reviewStats: {
    totalReviews: number
    todayReviews: number
    averageTime: number // seconds
  }
}

export interface AnkiCard {
  id: string
  deckId: string
  front: string // Question/prompt (in Portuguese usually)
  back: string // Answer (Mandarin)
  extras?: {
    pronunciation?: string
    example?: string
    audio?: string
    image?: string
    mnemonic?: string
  }
  type: 'vocabulary' | 'phrase' | 'character' | 'grammar' | 'cultural'
  interval: number // days
  ease: number // ease factor
  due: string // ISO date
  reviewed: number // total reviews
  lapses: number // incorrect answers
  tags: string[]
}

export interface AnkiReviewSession {
  deckId: string
  startedAt: number
  cardsReviewed: number
  correctCards: number
  sessionDuration: number // seconds
}

/**
 * Create a new Anki deck for a lesson or unit
 */
export function createAnkiDeck(
  name: string,
  description: string
): AnkiDeck {
  return {
    id: `anki-${Date.now()}`,
    name,
    description,
    cards: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    reviewStats: {
      totalReviews: 0,
      todayReviews: 0,
      averageTime: 0,
    },
  }
}

/**
 * Add card to Anki deck
 */
export function addAnkiCard(
  deck: AnkiDeck,
  front: string,
  back: string,
  type: AnkiCard['type'],
  extras?: AnkiCard['extras'],
  tags: string[] = []
): AnkiCard {
  const card: AnkiCard = {
    id: `card-${Date.now()}`,
    deckId: deck.id,
    front,
    back,
    type,
    extras,
    interval: 1,
    ease: 2.5,
    due: new Date().toISOString().split('T')[0],
    reviewed: 0,
    lapses: 0,
    tags,
  }

  deck.cards.push(card)
  return card
}

/**
 * Get cards due for review
 */
export function getAnkiCardsDue(deck: AnkiDeck): AnkiCard[] {
  const today = new Date().toISOString().split('T')[0]
  return deck.cards.filter((card) => card.due <= today && card.lapses < 5)
}

/**
 * Review an Anki card (0 = again, 1 = hard, 2 = good, 3 = easy)
 */
export function reviewAnkiCard(
  card: AnkiCard,
  quality: 0 | 1 | 2 | 3
): AnkiCard {
  // SM-2 algorithm
  let ease = card.ease
  let interval = card.interval

  if (quality < 2) {
    // Failed
    interval = 1
    card.lapses++
    ease = Math.max(1.3, ease - 0.2)
  } else if (quality === 2) {
    // Good
    interval = Math.round(card.interval * ease)
    ease = ease // Keep same
  } else {
    // Easy
    interval = Math.round(card.interval * ease * 1.3)
    ease = ease + 0.1
  }

  const nextDue = new Date(Date.now() + interval * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  return {
    ...card,
    interval: Math.min(interval, 36500), // Cap at ~100 years
    ease,
    due: nextDue,
    reviewed: card.reviewed + 1,
  }
}

/**
 * Generate Anki cards from lesson vocabulary
 */
export function generateAnkiCardsFromLesson(
  lessonId: string,
  vocabulary: {
    id: string
    hanzi: string
    pinyin: string
    portuguese: string
    literal?: string
  }[]
): AnkiCard[] {
  return vocabulary.map((word) => ({
    id: `anki-${lessonId}-${word.id}`,
    deckId: `deck-${lessonId}`,
    front: `${word.portuguese} - (${word.pinyin})`,
    back: word.hanzi,
    type: 'vocabulary' as const,
    extras: {
      pronunciation: word.pinyin,
      example: word.literal,
    },
    interval: 1,
    ease: 2.5,
    due: new Date().toISOString().split('T')[0],
    reviewed: 0,
    lapses: 0,
    tags: ['lesson', lessonId, 'vocabulary'],
  }))
}

/**
 * Create character-writing Anki cards
 */
export function createCharacterAnkiCard(
  character: string,
  pinyin: string,
  meaning: string,
  strokeOrder: string[]
): AnkiCard {
  return {
    id: `anki-char-${character}-${Date.now()}`,
    deckId: 'characters',
    front: `Write: ${meaning}\n(${pinyin})`,
    back: character,
    type: 'character',
    extras: {
      mnemonic: `${character} - ${meaning}`,
    },
    interval: 1,
    ease: 2.5,
    due: new Date().toISOString().split('T')[0],
    reviewed: 0,
    lapses: 0,
    tags: ['character', pinyin, 'writing'],
  }
}

/**
 * Export deck to Anki format (.apkg)
 */
export function exportDeckToAnki(deck: AnkiDeck): string {
  // Anki uses a specific CSV format
  const rows = deck.cards.map((card) => {
    const front = card.front.replace(/"/g, '""')
    const back = card.back.replace(/"/g, '""')
    const tags = card.tags.join(' ')
    return `"${front}"\t"${back}"\t"${tags}"\t${card.reviewed}\t${card.lapses}`
  })

  return rows.join('\n')
}

/**
 * Calculate optimal review time based on cards due
 */
export function getOptimalReviewTime(deck: AnkiDeck): {
  cardsToReview: number
  estimatedTime: number // minutes
  recommendedTime: string
} {
  const cardsDue = getAnkiCardsDue(deck)
  const avgTimePerCard = (deck.reviewStats.averageTime || 10) / 1000 / 60 // convert to minutes
  const estimatedTime = Math.round(cardsDue.length * avgTimePerCard)

  let recommendedTime = '📚 Now is a good time!'
  if (estimatedTime > 60) {
    recommendedTime = '⏰ Consider breaking this into 2 sessions'
  }
  if (estimatedTime > 30) {
    recommendedTime = '⏱️ About 30 mins to review'
  }

  return { cardsToReview: cardsDue.length, estimatedTime, recommendedTime }
}
