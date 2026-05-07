/**
 * Spiral Learning Implementation
 * 
 * Vocabulary and grammar concepts spiral through the curriculum:
 * - Basic concepts introduced early
 * - Revisited in new contexts throughout
 * - Increased complexity with each spiral
 * - Reinforcement without repetition fatigue
 */

export interface SpiralItem {
  id: string
  concept: string // e.g., "present tense", "greetings", "food vocabulary"
  level: 1 | 2 | 3 | 4 | 5 // Complexity level
  lessonIds: string[] // Which lessons include this
  context: string[] // Different contexts: classroom, market, dinner, etc
  frequency: number // How many times reviewed
}

export interface SpiralCurriculum {
  [concept: string]: SpiralItem
}

/**
 * Determine which concepts should spiral into next lesson
 * Based on learner's current progress
 */
export function getConceptsForNextLesson(
  currentLevel: number,
  completedConcepts: string[]
): string[] {
  const spiralConceptsPerLesson = 2 // How many past concepts to review

  if (completedConcepts.length === 0) return []

  // Take last N concepts (most recently learned) and spiral them back
  return completedConcepts.slice(-spiralConceptsPerLesson)
}

/**
 * Build a spiral path for a concept across lessons
 */
export function buildSpiralPath(
  concept: string,
  totalLessons: number
): { lessonNumber: number; context: string; complexity: number }[] {
  const path: { lessonNumber: number; context: string; complexity: number }[] = []

  // Introduce at 10% of curriculum
  const introduceLesson = Math.floor(totalLessons * 0.1)
  path.push({ lessonNumber: introduceLesson, context: 'introduction', complexity: 1 })

  // Spiral: appear every 5-7 lessons with increased complexity
  let complexity = 2
  for (let i = introduceLesson + 6; i < totalLessons; i += 7) {
    path.push({ lessonNumber: i, context: 'reinforcement', complexity: Math.min(5, complexity) })
    complexity++
  }

  return path
}

/**
 * Get vocabulary for next lesson that spirals previous lessons
 */
export function getSpiralVocabulary(
  newVocabulary: string[],
  previousLessonVocabulary: string[],
  spiralCount: number = 5 // How many previous words to include
): { new: string[]; spiral: string[] } {
  // Take last N words from previous lessons
  const spiralWords = previousLessonVocabulary.slice(-spiralCount)

  return {
    new: newVocabulary,
    spiral: spiralWords,
  }
}

/**
 * Create lesson with spiral review built-in
 */
export function integrateSpiral(
  lessonContent: {
    title: string
    newVocab: string[]
    exercises: any[]
  },
  spiralVocab: string[]
) {
  // Insert spiral words into exercises naturally
  const spiralExercises = spiralVocab.map((word) => ({
    type: 'recognition',
    word,
    isSpiral: true,
    difficulty: 'easy', // Spiral items should be easier
  }))

  return {
    ...lessonContent,
    exercises: [
      // New content first
      ...lessonContent.exercises.slice(0, Math.ceil(lessonContent.exercises.length * 0.7)),
      // Then spiral review
      ...spiralExercises,
      // Final new content
      ...lessonContent.exercises.slice(Math.ceil(lessonContent.exercises.length * 0.7)),
    ],
  }
}

/**
 * Track when each concept appears in curriculum
 */
export function trackSpiralOccurrence(
  concept: string,
  lessonId: string,
  spiralItems: Map<string, SpiralItem>
) {
  const existing = spiralItems.get(concept)
  if (existing) {
    existing.lessonIds.push(lessonId)
    existing.frequency++
  }
}
