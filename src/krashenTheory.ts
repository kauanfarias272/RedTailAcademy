/**
 * Krashen's Theory of Language Acquisition Implementation
 * 
 * Core Principles:
 * 1. Comprehensible Input (i+1): Input slightly above learner's current level
 * 2. Affective Filter: Low anxiety learning environment
 * 3. Monitor Hypothesis: Conscious grammar review
 * 4. Natural Order: Follow natural acquisition sequence
 * 5. Acquisition vs Learning distinction
 */

export interface ComprehensibleInputLesson {
  id: string
  title: string
  level: 'beginner' | 'elementary' | 'intermediate' | 'advanced'
  context: string // Story or scenario
  newVocabulary: string[] // Max 3-5 new items (i+1)
  reviewVocabulary: string[] // Known vocabulary for context
  audioUrl?: string // Listen first (natural acquisition)
  imageUrl?: string // Visual context clue
  comprehensionCheck: boolean // Not explicit grammar
}

export interface AcquisitionStage {
  stage: 'silent' | 'early-production' | 'speech-emergence' | 'intermediate-fluency' | 'advanced'
  characteristics: string[]
  recommendedActivities: string[]
  expectedOutput: string
}

/**
 * Krashen's Natural Order of Acquisition for Chinese
 * Based on linguistic research
 */
export const NATURAL_ACQUISITION_ORDER = [
  'basics', // Greetings, numbers (Stage 0)
  'present-simple', // Now I am, I like (Stage 1)
  'personal-pronouns', // Me, you, he, she (Stage 1)
  'object-pronouns', // Me, him, her (Stage 2)
  'auxiliary-verbs', // Am, is, are (Stage 2)
  'possessive', // My, your, his (Stage 2)
  'third-person-singular', // He goes, she comes (Stage 3)
  'irregular-past', // Was, were, went (Stage 3)
  'regular-past', // Worked, played (Stage 3)
  'continuous', // Is going, are playing (Stage 4)
  'perfect', // Has gone, have played (Stage 4)
  'conditionals', // If I were, would go (Stage 5)
  'passive-voice', // Was given, is seen (Stage 5)
]

/**
 * Stages of Language Acquisition (Krashen)
 */
export const ACQUISITION_STAGES: Record<AcquisitionStage['stage'], AcquisitionStage> = {
  'silent': {
    stage: 'silent',
    characteristics: [
      'Learner listens but does not speak',
      'Building receptive vocabulary',
      'Understanding patterns'
    ],
    recommendedActivities: [
      'Listen to stories',
      'Watch videos with subtitles',
      'Read simple texts',
      'Identify key words'
    ],
    expectedOutput: 'Understanding, no speech required'
  },
  'early-production': {
    stage: 'early-production',
    characteristics: [
      'Uses single words or two-word phrases',
      'Limited output',
      'High reliance on gestures'
    ],
    recommendedActivities: [
      'Point and name objects',
      'Yes/No questions',
      'Choose correct answers',
      'Match pictures to words'
    ],
    expectedOutput: 'One or two word responses'
  },
  'speech-emergence': {
    stage: 'speech-emergence',
    characteristics: [
      'Produces short phrases and simple sentences',
      'Grammatical errors common',
      'More confident speaking'
    ],
    recommendedActivities: [
      'Ask/answer simple questions',
      'Tell short stories',
      'Describe pictures',
      'Have simple conversations'
    ],
    expectedOutput: 'Complete short sentences'
  },
  'intermediate-fluency': {
    stage: 'intermediate-fluency',
    characteristics: [
      'Speaks in longer sentences',
      'Fewer grammatical errors',
      'Understands complex topics'
    ],
    recommendedActivities: [
      'Discuss opinions',
      'Give presentations',
      'Write paragraph summaries',
      'Complex conversations'
    ],
    expectedOutput: 'Paragraph-length responses'
  },
  'advanced': {
    stage: 'advanced',
    characteristics: [
      'Near-native proficiency',
      'Sophisticated expression',
      'Understands cultural nuances'
    ],
    recommendedActivities: [
      'Debate complex topics',
      'Analyze literature',
      'Professional communication',
      'Cultural critique'
    ],
    expectedOutput: 'Fluent, nuanced communication'
  }
}

/**
 * Determine affective filter level (anxiety)
 * Lower anxiety = better acquisition
 */
export function calculateAffectiveFilter(learnerState: {
  streakDays: number
  mistakesCount: number
  lastActivityHoursAgo: number
  sessionDuration: number // minutes
}): {
  level: 'low' | 'moderate' | 'high'
  recommendation: string
} {
  let anxietyScore = 0

  // High mistakes = high anxiety
  if (learnerState.mistakesCount > 5) anxietyScore += 2
  if (learnerState.mistakesCount > 10) anxietyScore += 2

  // Long gap between sessions = anxiety when returning
  if (learnerState.lastActivityHoursAgo > 48) anxietyScore += 2
  if (learnerState.lastActivityHoursAgo > 7 * 24) anxietyScore += 3

  // Very long sessions = mental fatigue = anxiety
  if (learnerState.sessionDuration > 60) anxietyScore += 1

  // Positive: streak reduces anxiety
  if (learnerState.streakDays > 7) anxietyScore = Math.max(0, anxietyScore - 1)
  if (learnerState.streakDays > 30) anxietyScore = Math.max(0, anxietyScore - 2)

  let level: 'low' | 'moderate' | 'high' = 'low'
  let recommendation = '✅ Continue with challenging content'

  if (anxietyScore > 5) {
    level = 'high'
    recommendation = '⚠️ Take a break or review easier content. Anxiety is blocking acquisition.'
  } else if (anxietyScore > 2) {
    level = 'moderate'
    recommendation = '⚡ Keep going, but maybe review familiar content first to build confidence.'
  }

  return { level, recommendation }
}

/**
 * Calculate i+1 level (comprehensible input)
 * Based on learner's current level + 1 step
 */
export function calculateIPlusOneLevel(
  currentLevel: 'beginner' | 'elementary' | 'intermediate' | 'advanced',
  completedLessons: number
): 'beginner' | 'elementary' | 'intermediate' | 'advanced' {
  const levels = ['beginner', 'elementary', 'intermediate', 'advanced']
  const currentIndex = levels.indexOf(currentLevel)

  // Introduce next level after ~20 lessons at current level
  if (completedLessons % 20 === 0 && currentIndex < levels.length - 1) {
    return levels[currentIndex + 1] as any
  }

  return currentLevel
}

/**
 * Get learner's current acquisition stage
 */
export function getAcquisitionStage(
  vocabularySize: number,
  canSpeakWords: number,
  monthsLearning: number
): AcquisitionStage['stage'] {
  if (vocabularySize < 50) return 'silent'
  if (canSpeakWords < 10) return 'early-production'
  if (vocabularySize < 500) return 'speech-emergence'
  if (vocabularySize < 2000) return 'intermediate-fluency'
  return 'advanced'
}
