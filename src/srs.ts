/**
 * Spaced Repetition System (SRS)
 * Implementação baseada na teoria de Stephen Krashen e técnicas de repetição espaçada
 * Similar ao algoritmo SuperMemo e Anki
 */

import { LearningMistake, CardProgress } from './progress'

export interface SRSCard {
  id: string
  itemId: string
  type: 'phrase' | 'character' | 'chunk'
  front: string // Hanzi/Pinyin
  back: string // Significado/Tradução
  level: number // 1-5 (iniciante a avançado)
  box: number // 0-5 (Leitner system)
  dueAt: number // Timestamp quando deve revisar
  createdAt: number
  reviewedAt: number
  interval: number // Dias até próxima revisão
  easeFactor: number // Fator de facilidade (1.3 - 2.5)
  repetitions: number // Quantas vezes foi revisado
  correctReviews: number
  lastGrade: number // 0-5 (qualidade da resposta)
}

export interface DailyAnchor {
  /** Conceitos básicos que devem estar em toda lição */
  basicPhrase: string
  basicCharacter: string
  basicChunk: string
}

/**
 * Algoritmo SM-2 (SuperMemo 2) adaptado
 * - Interval: dias até próxima revisão
 * - EaseFactor: quanto mais fácil, maior o intervalo
 */
export const SM2_INITIAL = {
  easeFactor: 2.5,
  interval: 1,
  repetitions: 0,
}

export const INTERVALS = {
  new: 1, // 1 dia
  learning: 3, // 3 dias
  reviewing: 7, // 7 dias
  mastery: 14, // 14 dias
  expert: 30, // 30 dias
}

/**
 * Calcula o novo intervalo baseado na resposta do usuário
 * @param card Card atual
 * @param grade Qualidade da resposta (0-5)
 * @returns Novo intervalo em dias
 */
export function calculateNextInterval(card: SRSCard, grade: number): number {
  if (grade < 3) {
    // Resposta incorreta - volta ao começo
    return INTERVALS.new
  }

  let newInterval = card.interval
  if (card.repetitions === 0) {
    newInterval = INTERVALS.new
  } else if (card.repetitions === 1) {
    newInterval = INTERVALS.learning
  } else {
    newInterval = Math.ceil(card.interval * card.easeFactor)
  }

  return Math.max(1, newInterval)
}

/**
 * Atualiza o fator de facilidade baseado na resposta
 */
export function calculateNewEaseFactor(card: SRSCard, grade: number): number {
  let newEase = card.easeFactor + 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)
  return Math.max(1.3, Math.min(2.5, newEase)) // Limita entre 1.3 e 2.5
}

/**
 * Calcula qual box (0-5) o card deve estar baseado no progresso
 */
export function calculateBox(repetitions: number, correctReviews: number): number {
  if (correctReviews === 0) return 0 // Nunca visto
  if (correctReviews < 3) return 1 // Aprendendo
  if (correctReviews < 7) return 2 // Revisando
  if (correctReviews < 15) return 3 // Consolidando
  if (correctReviews < 30) return 4 // Mastery
  return 5 // Expert
}

/**
 * Gera cards SRS para uma lição
 * Garante que conceitos básicos são repetidos
 */
export function generateSRSCardsForLesson(
  lessonId: string,
  phrases: Array<{ id: string; hanzi: string; pinyin: string; portuguese: string }>,
  includeAnchor: boolean = true
): SRSCard[] {
  const cards: SRSCard[] = []
  const now = Date.now()
  const baseDueAt = now + INTERVALS.new * 24 * 60 * 60 * 1000

  // Adicionar âncoras (conceitos básicos de lições anteriores)
  if (includeAnchor) {
    const anchors: DailyAnchor[] = [
      {
        basicPhrase: 'ni-hao-0',
        basicCharacter: 'ni-你',
        basicChunk: 'chunk-greeting',
      },
      {
        basicPhrase: 'xie-xie-0',
        basicCharacter: 'xie-谢',
        basicChunk: 'chunk-thanks',
      },
    ]

    anchors.forEach((anchor, idx) => {
      cards.push({
        id: `anchor-${idx}-${lessonId}`,
        itemId: anchor.basicPhrase,
        type: 'phrase',
        front: `复习: Básico da lição anterior`,
        back: `Revisão para consolidação`,
        level: 1,
        box: 2,
        dueAt: now,
        createdAt: now - 30 * 24 * 60 * 60 * 1000, // 30 dias atrás
        reviewedAt: now - 1 * 24 * 60 * 60 * 1000,
        interval: INTERVALS.reviewing,
        easeFactor: 2.0,
        repetitions: 3,
        correctReviews: 6,
        lastGrade: 4,
      })
    })
  }

  // Criar cards para cada frase da lição
  phrases.forEach((phrase, idx) => {
    // Card 1: Hanzi -> Português
    cards.push({
      id: `card-${phrase.id}-hanzi-${lessonId}`,
      itemId: phrase.id,
      type: 'phrase',
      front: phrase.hanzi,
      back: `${phrase.pinyin}\n${phrase.portuguese}`,
      level: 1,
      box: 0,
      dueAt: baseDueAt,
      createdAt: now,
      reviewedAt: 0,
      interval: 0,
      easeFactor: SM2_INITIAL.easeFactor,
      repetitions: 0,
      correctReviews: 0,
      lastGrade: 0,
    })

    // Card 2: Pinyin -> Português (para pronúncia)
    cards.push({
      id: `card-${phrase.id}-pinyin-${lessonId}`,
      itemId: phrase.id,
      type: 'phrase',
      front: phrase.pinyin,
      back: phrase.portuguese,
      level: 2,
      box: 0,
      dueAt: baseDueAt + 24 * 60 * 60 * 1000, // 1 dia depois
      createdAt: now,
      reviewedAt: 0,
      interval: 0,
      easeFactor: SM2_INITIAL.easeFactor,
      repetitions: 0,
      correctReviews: 0,
      lastGrade: 0,
    })

    // Card 3: Português -> Hanzi (produção ativa)
    if (idx < 5) {
      // Apenas primeiras 5 para não sobrecarregar
      cards.push({
        id: `card-${phrase.id}-production-${lessonId}`,
        itemId: phrase.id,
        type: 'phrase',
        front: phrase.portuguese,
        back: `${phrase.hanzi}\n${phrase.pinyin}`,
        level: 3, // Mais difícil
        box: 0,
        dueAt: baseDueAt + 2 * 24 * 60 * 60 * 1000, // 2 dias depois
        createdAt: now,
        reviewedAt: 0,
        interval: 0,
        easeFactor: SM2_INITIAL.easeFactor,
        repetitions: 0,
        correctReviews: 0,
        lastGrade: 0,
      })
    }
  })

  return cards
}

/**
 * Atualiza um card SRS após revisão
 */
export function updateSRSCard(card: SRSCard, grade: number): SRSCard {
  const now = Date.now()
  const newEase = calculateNewEaseFactor(card, grade)
  const newInterval = calculateNextInterval(card, grade)
  const newRepetitions = grade >= 3 ? card.repetitions + 1 : card.repetitions
  const newCorrectReviews = grade >= 3 ? card.correctReviews + 1 : card.correctReviews
  const newBox = calculateBox(newRepetitions, newCorrectReviews)

  return {
    ...card,
    easeFactor: newEase,
    interval: newInterval,
    repetitions: newRepetitions,
    correctReviews: newCorrectReviews,
    box: newBox,
    dueAt: now + newInterval * 24 * 60 * 60 * 1000,
    reviewedAt: now,
    lastGrade: grade,
  }
}

/**
 * Retorna cards que devem ser revisados hoje
 */
export function getDueCards(cards: SRSCard[]): SRSCard[] {
  const now = Date.now()
  return cards.filter((card) => card.dueAt <= now).sort((a, b) => a.box - b.box)
}

/**
 * Calcula estatísticas de aprendizado SRS
 */
export function calculateSRSStats(cards: SRSCard[]) {
  const now = Date.now()
  const due = cards.filter((c) => c.dueAt <= now).length
  const learning = cards.filter((c) => c.box === 1).length
  const review = cards.filter((c) => c.box >= 2 && c.box <= 4).length
  const mastery = cards.filter((c) => c.box === 5).length
  const accuracy = cards.length > 0
    ? (cards.reduce((sum, c) => sum + (c.correctReviews / Math.max(1, c.repetitions)), 0) / cards.length) * 100
    : 0

  return { due, learning, review, mastery, accuracy: accuracy.toFixed(1) }
}
