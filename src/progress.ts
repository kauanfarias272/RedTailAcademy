import { useEffect, useMemo, useState } from 'react'
import { type MascotState, defaultMascotState } from './mascot'

export type CardProgress = {
  box: number
  dueAt: number
  reviewed: number
  correct: number
}

export type LearningProgress = {
  xp: number
  streak: number
  lastStudyDate: string
  completedLessons: string[]
  speakingSessions: number
  writingSessions: number
  cards: Record<string, CardProgress>
  savedClips: SavedClip[]
  mascot: MascotState
  freezeStreaks: number
  dailyGoals: {
    lessons: number
    cards: number
    date: string
  }
}

export type SavedClip = {
  id: string
  title: string
  url: string
  theme: string
  createdAt: number
}

export const progressKey = 'redtail-academy-progress-v1'

export const defaultProgress: LearningProgress = {
  xp: 0,
  streak: 0,
  lastStudyDate: '',
  completedLessons: [],
  speakingSessions: 0,
  writingSessions: 0,
  cards: {},
  savedClips: [],
  mascot: defaultMascotState,
  freezeStreaks: 1, // Start with 1 free freeze
  dailyGoals: {
    lessons: 0,
    cards: 0,
    date: '',
  },
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
          mascot: { ...defaultMascotState, ...(parsed.mascot ?? {}) },
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

export function nextDueDate(difficulty: 'hard' | 'good' | 'easy', box: number) {
  const hour = 60 * 60 * 1000
  const day = 24 * hour

  if (difficulty === 'hard') return Date.now() + 3 * hour
  if (difficulty === 'good') return Date.now() + Math.max(1, box + 1) * day
  return Date.now() + Math.max(3, (box + 2) * 2) * day
}
