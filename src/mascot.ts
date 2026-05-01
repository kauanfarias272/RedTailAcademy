/**
 * Mascot Evolution System — RedTail Academy
 *
 * Inspired by the Chinese legend of the Koi (鲤鱼) that swims upstream
 * through the Dragon Gate (龙门) and transforms into a dragon (龙),
 * or follows the Kun Peng legend and becomes a giant hawk-like bird.
 *
 * The player's pet starts as a tiny red-tailed fish and evolves as
 * they complete lessons, gaining wings, whiskers, and power until it
 * becomes a majestic dragon or a celestial Gavião Peng at Level 7.
 *
 * If the player stops studying, the mascot gradually devolves — losing
 * features and shrinking back toward being a fish.
 */

export type EvolutionStage = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface MascotState {
  /** Current evolution stage (1 = baby fish, 7 = dragon/peng) */
  stage: EvolutionStage
  /** Total lessons completed (cumulative, never resets) */
  lessonsCompleted: number
  /** Current evolution XP — used for stage thresholds */
  evoXp: number
  /** ISO date string of last activity */
  lastActiveDate: string
  /** How many days without study in a row */
  inactiveDays: number
  /** Name chosen by the user */
  name: string
  /** Accessories the mascot has earned */
  accessories: string[]
  /** Current mood based on activity */
  mood: MascotMood
  /** Animation state */
  animation: MascotAnimation
  /** The evolution destiny: Dragon or Peng */
  evolutionPath: 'dragon' | 'peng'
}

export type MascotMood = 'happy' | 'excited' | 'neutral' | 'sad' | 'sleepy'
export type MascotAnimation = 'idle' | 'celebrate' | 'evolve' | 'devolve' | 'sleep'

/** Thresholds: how many evoXP points needed to reach each stage */
export const STAGE_THRESHOLDS: Record<EvolutionStage, number> = {
  1: 0,
  2: 30,
  3: 80,
  4: 160,
  5: 280,
  6: 440,
  7: 650,
}

/** Descriptions for Dragon journey */
export const STAGE_INFO_DRAGON: Record<EvolutionStage, {
  name: string
  title: string
  description: string
  emoji: string
  color: string
}> = {
  1: {
    name: 'Filhote Koi',
    title: '🐟 Peixinho de cauda vermelha',
    description: 'Um pequeno peixe com uma cauda vermelha brilhante. Mal saiu do ovo, mas já sonha com o Portal do Dragão.',
    emoji: '🐟',
    color: '#ff6b6b',
  },
  2: {
    name: 'Koi Jovem',
    title: '🐠 Koi aventureiro',
    description: 'A cauda ficou mais longa e vibrante. O peixe está mais forte e começa a nadar contra a correnteza.',
    emoji: '🐠',
    color: '#e74c3c',
  },
  3: {
    name: 'Koi Forte',
    title: '🐡 Koi de barbatanas longas',
    description: 'Barbatanas elegantes cresceram. Agora nada com confiança pelas águas mais turbulentas.',
    emoji: '🐡',
    color: '#c0392b',
  },
  4: {
    name: 'Koi Alado',
    title: '🦈 Koi com brotos de asas',
    description: 'Pequenos brotos de asas surgiram! A lenda diz que quem persiste... ganha asas.',
    emoji: '🦈',
    color: '#9b59b6',
  },
  5: {
    name: 'Dragão Jovem',
    title: '🐲 Koi-Dragão com asas',
    description: 'Asas de dragão completas! Bigodes começam a crescer. O Portal do Dragão está perto.',
    emoji: '🐲',
    color: '#8e44ad',
  },
  6: {
    name: 'Dragão Ascendente',
    title: '🐉 Dragão quase completo',
    description: 'Um híbrido majestoso entre koi e dragão. Bigodes longos, escamas douradas, prestes a cruzar o Portal.',
    emoji: '🐉',
    color: '#f39c12',
  },
  7: {
    name: 'Dragão Celestial',
    title: '🀄 Lóng — O Dragão Celestial',
    description: 'A carpa cruzou o Portal do Dragão! Agora é um dragão celestial com poder sobre as nuvens e as palavras.',
    emoji: '🀄',
    color: '#f1c40f',
  },
}

/** Descriptions for Peng journey */
export const STAGE_INFO_PENG: Record<EvolutionStage, {
  name: string
  title: string
  description: string
  emoji: string
  color: string
}> = {
  1: {
    name: 'Filhote Koi',
    title: '🐟 Peixinho com potencial',
    description: 'Um pequeno peixe. Não sabe ainda, mas tem a linhagem do místico Kun, o peixe gigante do norte.',
    emoji: '🐟',
    color: '#ff6b6b',
  },
  2: {
    name: 'Koi Jovem',
    title: '🐠 Koi explorador',
    description: 'Começa a nadar mais rápido e ganhar tamanho. Sente um chamado para águas mais profundas.',
    emoji: '🐠',
    color: '#3498db',
  },
  3: {
    name: 'Peixe Kun Jovem',
    title: '🐳 Kun das Profundezas',
    description: 'Cresceu muito! Suas escamas estão azuis e majestosas. Ele nada pelos oceanos imensos.',
    emoji: '🐳',
    color: '#2980b9',
  },
  4: {
    name: 'Kun-Peng Híbrido',
    title: '🦈 Kun com plumas',
    description: 'Sua forma começa a mudar. Plumas mágicas crescem entre suas escamas azuis.',
    emoji: '🦈',
    color: '#8e44ad',
  },
  5: {
    name: 'Gavião Peng Jovem',
    title: '🦅 Gavião Peng',
    description: 'O peixe saltou da água e virou um gavião lendário. Suas asas cortam o vento como a lenda do Peng.',
    emoji: '🦅',
    color: '#16a085',
  },
  6: {
    name: 'Gavião das Nuvens',
    title: '🌪️ Peng dos Ventos',
    description: 'Ele viaja grandes distâncias com uma única batida de asas, dominando as tempestades e os tons.',
    emoji: '🌪️',
    color: '#1abc9c',
  },
  7: {
    name: 'Gavião Peng Celestial',
    title: '🌌 Kūn Péng — O Gavião Místico',
    description: 'O lendário Peng viaja entre o oceano celestial e as estrelas. O conhecimento pleno abriu suas asas.',
    emoji: '🌌',
    color: '#2ecc71',
  },
}

export function getStageInfo(stage: EvolutionStage, path: 'dragon' | 'peng') {
  return path === 'dragon' ? STAGE_INFO_DRAGON[stage] : STAGE_INFO_PENG[stage]
}

/** Accessories earned at each evolution stage */
export const STAGE_ACCESSORIES_DRAGON: Record<EvolutionStage, string[]> = {
  1: [],
  2: ['tail-glow'],
  3: ['long-fins'],
  4: ['wing-buds'],
  5: ['dragon-wings'],
  6: ['golden-whiskers', 'dragon-wings'],
  7: ['golden-whiskers', 'dragon-wings', 'celestial-crown', 'cloud-trail'],
}

export const STAGE_ACCESSORIES_PENG: Record<EvolutionStage, string[]> = {
  1: [],
  2: ['tail-glow'],
  3: ['blue-scales'],
  4: ['feather-buds'],
  5: ['peng-wings'],
  6: ['wind-aura', 'peng-wings'],
  7: ['wind-aura', 'peng-wings', 'star-crown', 'galaxy-trail'],
}

export function getStageAccessories(stage: EvolutionStage, path: 'dragon' | 'peng') {
  return path === 'dragon' ? STAGE_ACCESSORIES_DRAGON[stage] : STAGE_ACCESSORIES_PENG[stage]
}

export const defaultMascotState: MascotState = {
  stage: 1,
  lessonsCompleted: 0,
  evoXp: 0,
  lastActiveDate: '',
  inactiveDays: 0,
  name: 'Koi',
  accessories: [],
  mood: 'neutral',
  animation: 'idle',
  evolutionPath: Math.random() > 0.5 ? 'dragon' : 'peng',
}

/**
 * Calculate the current stage based on evoXP.
 */
export function stageFromXp(evoXp: number): EvolutionStage {
  const stages: EvolutionStage[] = [7, 6, 5, 4, 3, 2, 1]
  for (const stage of stages) {
    if (evoXp >= STAGE_THRESHOLDS[stage]) return stage
  }
  return 1
}

/**
 * Calculate XP needed for the next stage.
 */
export function xpToNextStage(currentXp: number, currentStage: EvolutionStage): number {
  if (currentStage >= 7) return 0
  const nextStage = (currentStage + 1) as EvolutionStage
  return STAGE_THRESHOLDS[nextStage] - currentXp
}

/**
 * Progress percentage toward the next stage.
 */
export function stageProgress(currentXp: number, currentStage: EvolutionStage): number {
  if (currentStage >= 7) return 100
  const nextStage = (currentStage + 1) as EvolutionStage
  const currentThreshold = STAGE_THRESHOLDS[currentStage]
  const nextThreshold = STAGE_THRESHOLDS[nextStage]
  const range = nextThreshold - currentThreshold
  const progress = currentXp - currentThreshold
  return Math.min(100, Math.round((progress / range) * 100))
}

/**
 * Called when a lesson is completed. Adds evoXP and may trigger evolution.
 */
export function onLessonComplete(state: MascotState, today: string): MascotState {
  const xpGain = 15 + Math.floor(state.stage * 2) // higher stages give a bit more
  const newXp = state.evoXp + xpGain
  const newStage = stageFromXp(newXp)
  const evolved = newStage > state.stage

  return {
    ...state,
    lessonsCompleted: state.lessonsCompleted + 1,
    evoXp: newXp,
    stage: newStage,
    lastActiveDate: today,
    inactiveDays: 0,
    accessories: getStageAccessories(newStage, state.evolutionPath),
    mood: evolved ? 'excited' : 'happy',
    animation: evolved ? 'evolve' : 'celebrate',
  }
}

/**
 * Called when a card is reviewed (gives less XP than a lesson).
 */
export function onCardReview(state: MascotState, today: string): MascotState {
  const xpGain = 3
  const newXp = state.evoXp + xpGain
  const newStage = stageFromXp(newXp)

  return {
    ...state,
    evoXp: newXp,
    stage: newStage,
    lastActiveDate: today,
    inactiveDays: 0,
    accessories: getStageAccessories(newStage, state.evolutionPath),
    mood: 'happy',
    animation: newStage > state.stage ? 'evolve' : 'idle',
  }
}

/**
 * Called when the app opens — checks for inactivity and devolves the mascot.
 * Each day of inactivity removes some evoXP, causing gradual devolution.
 */
export function checkInactivity(state: MascotState, today: string): MascotState {
  if (!state.lastActiveDate || state.lastActiveDate === today) {
    return state
  }

  const lastDate = new Date(state.lastActiveDate)
  const todayDate = new Date(today)
  const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

  if (daysDiff <= 1) {
    return { ...state, inactiveDays: 0 }
  }

  // Each day of inactivity loses progressively more XP
  const inactiveDays = daysDiff - 1
  const xpLoss = inactiveDays * (8 + inactiveDays * 2) // escalating penalty
  const newXp = Math.max(0, state.evoXp - xpLoss)
  const newStage = stageFromXp(newXp)
  const devolved = newStage < state.stage

  let mood: MascotMood = 'neutral'
  if (inactiveDays >= 5) mood = 'sleepy'
  else if (inactiveDays >= 3) mood = 'sad'

  return {
    ...state,
    evoXp: newXp,
    stage: newStage,
    inactiveDays,
    accessories: getStageAccessories(newStage, state.evolutionPath),
    mood,
    animation: devolved ? 'devolve' : (inactiveDays >= 3 ? 'sleep' : 'idle'),
  }
}

/**
 * Get the dialogue the mascot says based on its mood and state.
 */
export function getMascotDialogue(state: MascotState): string {
  const destiny = state.evolutionPath === 'peng' ? 'Gavião Peng' : 'dragão'
  const portal = state.evolutionPath === 'peng' ? 'vento do Peng' : 'Portal do Dragão'
  const dialogues: Record<MascotMood, string[]> = {
    excited: [
      '🎉 EVOLUÍ! Estou mais forte! Vamos continuar!',
      `✨ Sinto o poder do ${destiny} crescendo em mim!`,
      `🐲 O ${portal} está cada vez mais perto!`,
    ],
    happy: [
      '嗨! Bom te ver de volta! Vamos estudar?',
      '加油! Continue assim, estou crescendo!',
      '太好了! Que bom que você está aqui!',
    ],
    neutral: [
      'Olá! Já faz um tempinho... Bora estudar?',
      'A correnteza está forte, mas juntos conseguimos!',
      `Cada lição me deixa mais perto do ${portal}.`,
    ],
    sad: [
      '😔 Senti sua falta... Estou ficando fraquinho.',
      '💤 Sem treino, minha cauda está perdendo brilho...',
      '🐟 Preciso de lições para não voltar a ser um peixinho...',
    ],
    sleepy: [
      '😴 Zzz... Ah, você voltou? Quase virei uma sardinha...',
      '💤 Estava quase dormindo no rio... Preciso de lições!',
      '🐟 Me ajuda... Estou voltando a ser um peixe pequeno...',
    ],
  }

  const pool = dialogues[state.mood] ?? dialogues.neutral
  return pool[Math.floor(Math.random() * pool.length)]
}
