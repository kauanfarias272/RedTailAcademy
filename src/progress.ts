import { useEffect, useMemo, useState } from 'react'
import { type MascotState, defaultMascotState } from './mascot'

export type CardProgress = {
  box: number
  dueAt: number
  reviewed: number
  correct: number
}

export type MistakeType = 'lesson' | 'card' | 'writing' | 'speech' | 'chunk'

export type LearningMistake = {
  id: string
  type: MistakeType
  itemId: string
  prompt: string
  expected: string
  answer: string
  helper: string
  createdAt: number
  lastSeenAt: number
  attempts: number
  correctReviews: number
  resolvedAt?: number
}

export type PersonalGoal = {
  id: 'travel' | 'work' | 'music' | 'games' | 'series'
  label: string
  targetMinutes: number
  focus: string
}

export type LearningProgress = {
  xp: number
  coins: number
  streak: number
  lastStudyDate: string
  completedLessons: string[]
  speakingSessions: number
  writingSessions: number
  spokenPhrases: string[]
  cards: Record<string, CardProgress>
  savedClips: SavedClip[]
  mistakes: LearningMistake[]
  mascot: MascotState
  freezeStreaks: number
  dailyGoals: {
    lessons: number
    cards: number
    speaking: number
    writing: number
    date: string
  }
  personalGoal: PersonalGoal
}

export type SavedClip = {
  id: string
  title: string
  url: string
  theme: string
  createdAt: number
}

export const progressKey = 'redtail-academy-progress-v1'

export const personalGoals: PersonalGoal[] = [
  { id: 'travel', label: 'Viagem', targetMinutes: 180, focus: 'frases de aeroporto, hotel e comida' },
  { id: 'work', label: 'Trabalho', targetMinutes: 220, focus: 'apresentacoes, reunioes e mensagens curtas' },
  { id: 'music', label: 'Musicas', targetMinutes: 160, focus: 'refroes, ritmo, tons e vocabulario pop' },
  { id: 'games', label: 'Games', targetMinutes: 150, focus: 'comandos, chat e missoes em mandarim' },
  { id: 'series', label: 'Series', targetMinutes: 200, focus: 'frases naturais e escuta de dialogos' },
]

export const defaultProgress: LearningProgress = {
  xp: 0,
  coins: 25,
  streak: 0,
  lastStudyDate: '',
  completedLessons: [],
  speakingSessions: 0,
  writingSessions: 0,
  spokenPhrases: [],
  cards: {},
  savedClips: [],
  mistakes: [],
  mascot: defaultMascotState,
  freezeStreaks: 1, // Start with 1 free freeze
  dailyGoals: {
    lessons: 0,
    cards: 0,
    speaking: 0,
    writing: 0,
    date: '',
  },
  personalGoal: personalGoals[0],
}

export function useStoredProgress() {
  const [progress, setProgress] = useState<LearningProgress>(() => {
    try {
      const raw = localStorage.getItem(progressKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        return {
          ...defaultProgress,
          ...parsed,
          coins: typeof parsed.coins === 'number' ? parsed.coins : defaultProgress.coins,
          mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : [],
          spokenPhrases: Array.isArray(parsed.spokenPhrases) ? parsed.spokenPhrases : [],
          mascot: { ...defaultMascotState, ...(parsed.mascot ?? {}) },
          dailyGoals: normalizeDailyGoals(parsed.dailyGoals, parsed.dailyGoals?.date ?? ''),
          personalGoal: normalizePersonalGoal(parsed.personalGoal),
        }
      }
      return defaultProgress
    } catch {
      return defaultProgress
    }
  })

  useEffect(() => {
    localStorage.setItem(progressKey, JSON.stringify(progress))
  }, [progress])

  return [progress, setProgress] as const
}

export function useToday() {
  return useMemo(() => new Date().toISOString().slice(0, 10), [])
}

export function updateStudyStreak(progress: LearningProgress, today: string) {
  if (progress.lastStudyDate === today) {
    return progress.streak
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = yesterday.toISOString().slice(0, 10)

  return progress.lastStudyDate === yesterdayKey ? progress.streak + 1 : 1
}

export function normalizeDailyGoals(
  dailyGoals: Partial<LearningProgress['dailyGoals']> | undefined,
  today: string,
): LearningProgress['dailyGoals'] {
  if (!dailyGoals || dailyGoals.date !== today) {
    return {
      lessons: 0,
      cards: 0,
      speaking: 0,
      writing: 0,
      date: today,
    }
  }

  return {
    lessons: dailyGoals.lessons ?? 0,
    cards: dailyGoals.cards ?? 0,
    speaking: dailyGoals.speaking ?? 0,
    writing: dailyGoals.writing ?? 0,
    date: today,
  }
}

export function normalizePersonalGoal(goal: Partial<PersonalGoal> | undefined): PersonalGoal {
  const matched = personalGoals.find((item) => item.id === goal?.id)
  return matched ?? personalGoals[0]
}

export function progressLevel(xp: number) {
  return Math.max(1, Math.floor(xp / 100) + 1)
}

export function openMistakes(progress: Pick<LearningProgress, 'mistakes'>) {
  return progress.mistakes.filter((mistake) => !mistake.resolvedAt)
}

export function hasOpenMistakes(progress: Pick<LearningProgress, 'mistakes'>) {
  return openMistakes(progress).length > 0
}

export function recordMistake(
  progress: LearningProgress,
  input: Pick<LearningMistake, 'type' | 'itemId' | 'prompt' | 'expected' | 'answer' | 'helper'>,
  timestamp = Date.now(),
): LearningProgress {
  const existingIndex = progress.mistakes.findIndex(
    (mistake) => !mistake.resolvedAt && mistake.type === input.type && mistake.itemId === input.itemId,
  )

  if (existingIndex >= 0) {
    const mistakes = [...progress.mistakes]
    const existing = mistakes[existingIndex]
    mistakes[existingIndex] = {
      ...existing,
      answer: input.answer,
      helper: input.helper || existing.helper,
      lastSeenAt: timestamp,
      attempts: existing.attempts + 1,
    }
    return { ...progress, mistakes }
  }

  return {
    ...progress,
    mistakes: [
      {
        id: `${input.type}-${input.itemId}-${timestamp}`,
        ...input,
        createdAt: timestamp,
        lastSeenAt: timestamp,
        attempts: 1,
        correctReviews: 0,
      },
      ...progress.mistakes,
    ],
  }
}

export function resolveMistake(
  progress: LearningProgress,
  type: MistakeType,
  itemId: string,
  timestamp = Date.now(),
): LearningProgress {
  let resolvedAny = false
  const mistakes = progress.mistakes.map((mistake) => {
    if (mistake.resolvedAt || mistake.type !== type || mistake.itemId !== itemId) {
      return mistake
    }
    resolvedAny = true
    return {
      ...mistake,
      correctReviews: mistake.correctReviews + 1,
      resolvedAt: timestamp,
      lastSeenAt: timestamp,
    }
  })

  if (!resolvedAny) return progress

  return {
    ...progress,
    mistakes,
    xp: progress.xp + 4,
    coins: progress.coins + 6,
  }
}

export function nextDueDate(difficulty: 'hard' | 'good' | 'easy', box: number) {
  const hour = 60 * 60 * 1000
  const day = 24 * hour

  if (difficulty === 'hard') return Date.now() + 3 * hour
  if (difficulty === 'good') return Date.now() + Math.max(1, box + 1) * day
  return Date.now() + Math.max(3, (box + 2) * 2) * day
}
