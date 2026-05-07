/**
 * Anki Integration - Sistema de Flashcards Inteligente
 * Implementação compatível com o formato Anki e algoritmo SuperMemo
 */

import { SRSCard } from './srs'

export interface AnkiDeck {
  id: string
  name: string
  description: string
  cards: SRSCard[]
  createdAt: number
  updatedAt: number
  stats: {
    new: number
    learning: number
    review: number
    mastery: number
  }
}

export interface AnkiSession {
  deckId: string
  startedAt: number
  cardsReviewed: number
  correctAnswers: number
  timeSpent: number // em ms
  sessionId: string
}

/**
 * Cria um novo Anki Deck para uma unidade ou lição
 */
export function createAnkiDeck(
  unitId: string,
  lessonTitle: string,
  cards: SRSCard[]
): AnkiDeck {
  const now = Date.now()
  const stats = calculateAnkiStats(cards)

  return {
    id: `anki-${unitId}-${now}`,
    name: `${lessonTitle} - Flashcards`,
    description: `Deck Anki para ${lessonTitle} com repetição espaçada`,
    cards: cards || [],
    createdAt: now,
    updatedAt: now,
    stats,
  }
}

/**
 * Calcula estatísticas do Anki Deck
 */
export function calculateAnkiStats(cards: SRSCard[]) {
  const now = Date.now()
  return {
    new: cards.filter((c) => c.repetitions === 0).length,
    learning: cards.filter((c) => c.box === 1).length,
    review: cards.filter((c) => c.box >= 2 && c.box <= 4).length,
    mastery: cards.filter((c) => c.box === 5 || c.correctReviews > 20).length,
  }
}

/**
 * Inicia uma sessão de estudo Anki
 */
export function startAnkiSession(deckId: string): AnkiSession {
  return {
    deckId,
    startedAt: Date.now(),
    cardsReviewed: 0,
    correctAnswers: 0,
    timeSpent: 0,
    sessionId: `session-${deckId}-${Date.now()}`,
  }
}

/**
 * Registra um card revisado na sessão
 */
export function recordCardReview(
  session: AnkiSession,
  isCorrect: boolean,
  timeSpentOnCard: number
): AnkiSession {
  return {
    ...session,
    cardsReviewed: session.cardsReviewed + 1,
    correctAnswers: isCorrect ? session.correctAnswers + 1 : session.correctAnswers,
    timeSpent: session.timeSpent + timeSpentOnCard,
  }
}

/**
 * Calcula acurácia da sessão
 */
export function getSessionAccuracy(session: AnkiSession): number {
  if (session.cardsReviewed === 0) return 0
  return (session.correctAnswers / session.cardsReviewed) * 100
}

/**
 * Exporta Anki Deck em formato APKG (compatível com Anki)
 * Nota: Implementação simplificada, formato real é mais complexo
 */
export function exportAnkiDeck(deck: AnkiDeck): string {
  const csv = deck.cards
    .map(
      (card) =>
        `"${card.front.replace(/"/g, '\\"')}"\t"${card.back.replace(/"/g, '\\"')}"\t${card.level}`
    )
    .join('\n')

  return csv
}

/**
 * Importa cards de um arquivo Anki CSV
 */
export function importAnkiCards(
  csvData: string,
  deckId: string
): SRSCard[] {
  const lines = csvData.split('\n')
  const now = Date.now()

  return lines
    .filter((line) => line.trim())
    .map((line, idx) => {
      const [front, back, levelStr] = line.split('\t')
      const level = parseInt(levelStr || '1')

      return {
        id: `imported-${deckId}-${idx}`,
        itemId: `imported-${idx}`,
        type: 'phrase',
        front: front.replace(/^"|"$/g, '').replace(/\\"/g, '"'),
        back: back.replace(/^"|"$/g, '').replace(/\\"/g, '"'),
        level,
        box: 0,
        dueAt: now,
        createdAt: now,
        reviewedAt: 0,
        interval: 0,
        easeFactor: 2.5,
        repetitions: 0,
        correctReviews: 0,
        lastGrade: 0,
      }
    })
}

/**
 * Gera recomendação de quantos cards estudar por dia
 * Baseado na carga cognitiva e tempo disponível
 */
export function recommendDailyCardCount(
  totalCards: number,
  minutesAvailable: number,
  cardsPerMinute: number = 2
): number {
  const recommendedByTime = Math.floor(minutesAvailable * cardsPerMinute)
  const recommendedByTotal = Math.ceil(totalCards / 30) // Spread over 30 days
  return Math.min(recommendedByTime, recommendedByTotal, 30) // Max 30 cards/day
}
