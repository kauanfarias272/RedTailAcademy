/**
 * Mascot Evolution System - RedTail Academy
 *
 * The pet is now a Koi -> Dragon path only. The older Peng route is
 * normalized back into the dragon journey so saved players keep progress
 * without carrying an alternate evolution line.
 */

export type EvolutionStage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
export type EvolutionPath = 'dragon'

export type KoiVariantId =
  | 'cheng-long'
  | 'li-xiaolong'
  | 'hua-mulan'
  | 'sun-wukong'
  | 'bai-long'
  | 'taiyi-zhenren'
  | 'zhang-yimou'
  | 'nezha'
  | 'xi-shi'
  | 'diaochan'
  | 'zhuangzi'
  | 'mozi'
  | 'guan-yu'
  | 'han-xin'
  | 'yang-guifei'
  | 'change'
  | 'zixia'
  | 'qingluan'
  | 'xinghe'
  | 'caihong'
  | 'yexingzhe'
  | 'jinlin'
  | 'chiyan'
  | 'xuanbing'
  | 'zi-shu'
  | 'chou-niu'
  | 'yin-hu'
  | 'mao-tu'
  | 'chen-long'
  | 'si-she'
  | 'wu-ma'
  | 'wei-yang'
  | 'shen-hou'
  | 'you-ji'
  | 'xu-gou'
  | 'hai-zhu'

export interface KoiVariant {
  id: KoiVariantId
  hanzi: string
  name: string
  pinyin: string
  trait: string
  color: string
  accent: string
}

export interface MascotState {
  /** Current evolution stage (1 = classic koi, 8 = complete dragon) */
  stage: EvolutionStage
  /** Total lessons completed (cumulative, never resets) */
  lessonsCompleted: number
  /** Current evolution XP - used for stage thresholds */
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
  /** Legacy-safe destiny. Always dragon now. */
  evolutionPath: EvolutionPath
  /** Visual/personality line from the Koi companion chart. */
  koiVariantId: KoiVariantId
}

export type MascotMood = 'happy' | 'excited' | 'neutral' | 'sad' | 'sleepy'
export type MascotAnimation = 'idle' | 'celebrate' | 'evolve' | 'devolve' | 'sleep'

export const KOI_VARIANTS: KoiVariant[] = [
  { id: 'cheng-long', hanzi: '成龙', name: 'Cheng Long', pinyin: 'Cheng Long', trait: 'acao e carisma', color: '#2d95ff', accent: '#64d3ff' },
  { id: 'li-xiaolong', hanzi: '李小龙', name: 'Li Xiaolong', pinyin: 'Li Xiaolong', trait: 'foco e disciplina', color: '#f25a2e', accent: '#ffc04d' },
  { id: 'hua-mulan', hanzi: '花木兰', name: 'Hua Mulan', pinyin: 'Hua Mulan', trait: 'coragem e honra', color: '#d72e28', accent: '#fff0dc' },
  { id: 'sun-wukong', hanzi: '孙悟空', name: 'Sun Wukong', pinyin: 'Sun Wukong', trait: 'travessura e sabedoria', color: '#dca62c', accent: '#fff2a8' },
  { id: 'bai-long', hanzi: '白龙', name: 'Bai Long', pinyin: 'Bai Long', trait: 'poder e misterio', color: '#121318', accent: '#f0c46a' },
  { id: 'taiyi-zhenren', hanzi: '太乙真人', name: 'Taiyi Zhenren', pinyin: 'Taiyi Zhenren', trait: 'cura e paciencia', color: '#f5f1e8', accent: '#c49b55' },
  { id: 'zhang-yimou', hanzi: '张艺谋', name: 'Zhang Yimou', pinyin: 'Zhang Yimou', trait: 'visao e estrategia', color: '#f4f0df', accent: '#171717' },
  { id: 'nezha', hanzi: '哪吒', name: 'Nezha', pinyin: 'Nezha', trait: 'determinacao', color: '#ff7d12', accent: '#191919' },
  { id: 'xi-shi', hanzi: '西施', name: 'Xi Shi', pinyin: 'Xi Shi', trait: 'beleza e graca', color: '#efe7d8', accent: '#c8a774' },
  { id: 'diaochan', hanzi: '貂蝉', name: 'Diaochan', pinyin: 'Diaochan', trait: 'encanto e inteligencia', color: '#e53c2f', accent: '#fff7ea' },
  { id: 'zhuangzi', hanzi: '庄子', name: 'Zhuangzi', pinyin: 'Zhuangzi', trait: 'liberdade e filosofia', color: '#c59b55', accent: '#f5d47a' },
  { id: 'mozi', hanzi: '墨子', name: 'Mozi', pinyin: 'Mozi', trait: 'logica e defesa', color: '#69717c', accent: '#1f2329' },
  { id: 'guan-yu', hanzi: '关羽', name: 'Guan Yu', pinyin: 'Guan Yu', trait: 'lealdade e coragem', color: '#bf6b19', accent: '#ff8c25' },
  { id: 'han-xin', hanzi: '韩信', name: 'Han Xin', pinyin: 'Han Xin', trait: 'estrategia e paciencia', color: '#f7f4e8', accent: '#1b1b1b' },
  { id: 'yang-guifei', hanzi: '杨贵妃', name: 'Yang Guifei', pinyin: 'Yang Guifei', trait: 'elegancia e talento', color: '#dfb84d', accent: '#fff0b8' },
  { id: 'change', hanzi: '嫦娥', name: "Chang'e", pinyin: "Chang'e", trait: 'pureza e misterio', color: '#f08aa8', accent: '#ffd5e0' },
  { id: 'zixia', hanzi: '紫霞', name: 'Zixia', pinyin: 'Zixia', trait: 'sonhos e romance', color: '#6c25cf', accent: '#b97bff' },
  { id: 'qingluan', hanzi: '青鸾', name: 'Qingluan', pinyin: 'Qingluan', trait: 'sorte e harmonia', color: '#1fb6a5', accent: '#7ff7e5' },
  { id: 'xinghe', hanzi: '星河', name: 'Xinghe', pinyin: 'Xinghe', trait: 'calma e profundidade', color: '#064dcc', accent: '#49b8ff' },
  { id: 'caihong', hanzi: '彩虹', name: 'Caihong', pinyin: 'Caihong', trait: 'alegria e esperanca', color: '#ffb32e', accent: '#20d6b5' },
  { id: 'yexingzhe', hanzi: '夜行者', name: 'Yexingzhe', pinyin: 'Yexingzhe', trait: 'agilidade e foco', color: '#221036', accent: '#8f46ff' },
  { id: 'jinlin', hanzi: '金鳞', name: 'Jinlin', pinyin: 'Jinlin', trait: 'riqueza e prosperidade', color: '#f0c35a', accent: '#fff4b2' },
  { id: 'chiyan', hanzi: '赤焰', name: 'Chiyan', pinyin: 'Chiyan', trait: 'paixao e energia', color: '#e72d13', accent: '#ff9d3d' },
  { id: 'xuanbing', hanzi: '玄冰', name: 'Xuanbing', pinyin: 'Xuanbing', trait: 'calma e resistencia', color: '#cceeff', accent: '#86d9ff' },
  { id: 'zi-shu', hanzi: '子鼠', name: 'Zi Shu', pinyin: 'Zi Shu', trait: 'engenho flexivel', color: '#ffd8d8', accent: '#ff9db0' },
  { id: 'chou-niu', hanzi: '丑牛', name: 'Chou Niu', pinyin: 'Chou Niu', trait: 'constancia forte', color: '#c99125', accent: '#f3d27c' },
  { id: 'yin-hu', hanzi: '寅虎', name: 'Yin Hu', pinyin: 'Yin Hu', trait: 'impulso valente', color: '#dd8118', accent: '#2b1708' },
  { id: 'mao-tu', hanzi: '卯兔', name: 'Mao Tu', pinyin: 'Mao Tu', trait: 'gentileza rapida', color: '#ffd8dc', accent: '#ff93a5' },
  { id: 'chen-long', hanzi: '辰龙', name: 'Chen Long', pinyin: 'Chen Long', trait: 'pressagio auspicioso', color: '#62b842', accent: '#baf2a2' },
  { id: 'si-she', hanzi: '巳蛇', name: 'Si She', pinyin: 'Si She', trait: 'sabedoria quieta', color: '#159f91', accent: '#82ffe8' },
  { id: 'wu-ma', hanzi: '午马', name: 'Wu Ma', pinyin: 'Wu Ma', trait: 'energia livre', color: '#d92f14', accent: '#ff8c32' },
  { id: 'wei-yang', hanzi: '未羊', name: 'Wei Yang', pinyin: 'Wei Yang', trait: 'ternura firme', color: '#efe5cf', accent: '#c9a66b' },
  { id: 'shen-hou', hanzi: '申猴', name: 'Shen Hou', pinyin: 'Shen Hou', trait: 'criatividade esperta', color: '#b66d27', accent: '#f5b66e' },
  { id: 'you-ji', hanzi: '酉鸡', name: 'You Ji', pinyin: 'You Ji', trait: 'precisao no tempo', color: '#e2382d', accent: '#fff3df' },
  { id: 'xu-gou', hanzi: '戌狗', name: 'Xu Gou', pinyin: 'Xu Gou', trait: 'lealdade alerta', color: '#c79a4e', accent: '#f0d08e' },
  { id: 'hai-zhu', hanzi: '亥猪', name: 'Hai Zhu', pinyin: 'Hai Zhu', trait: 'alegria abundante', color: '#f2a2b2', accent: '#ffd2dc' },
]

const VARIANT_IDS = KOI_VARIANTS.map((variant) => variant.id)

export function getKoiVariant(id?: string): KoiVariant {
  return KOI_VARIANTS.find((variant) => variant.id === id) ?? KOI_VARIANTS[0]
}

export function randomKoiVariantId(): KoiVariantId {
  return VARIANT_IDS[Math.floor(Math.random() * VARIANT_IDS.length)]
}

/** Thresholds: how many evoXP points needed to reach each stage */
export const STAGE_THRESHOLDS: Record<EvolutionStage, number> = {
  1: 0,
  2: 30,
  3: 80,
  4: 160,
  5: 280,
  6: 440,
  7: 650,
  8: 920,
}

/** Descriptions for the Koi -> Dragon journey */
export const STAGE_INFO_DRAGON: Record<EvolutionStage, {
  name: string
  title: string
  description: string
  emoji: string
  color: string
}> = {
  1: {
    name: 'Koi companheiro',
    title: 'Koi nivel 1 - forma classica',
    description: 'Um koi jovem com historia propria. O objetivo ainda e pequeno: ouvir, entender e repetir o basico todos os dias.',
    emoji: '鱼',
    color: '#64bfe9',
  },
  2: {
    name: 'Koi inicial',
    title: 'Koi nivel 2 - cauda aprimorada',
    description: 'A cauda ganha forca. Cumprimentos e frases curtas comecam a voltar naturalmente nas revisoes.',
    emoji: '鲤',
    color: '#4aa7f0',
  },
  3: {
    name: 'Koi definido',
    title: 'Koi nivel 3 - corpo mais firme',
    description: 'O corpo fica mais definido e as nadadeiras alongam. A memoria cresce com repeticao espacada.',
    emoji: '鳞',
    color: '#3e8fe0',
  },
  4: {
    name: 'Koi desperto',
    title: 'Koi nivel 4 - tracos de dragao',
    description: 'Os primeiros tracos de dragao aparecem. As licoes novas passam a carregar revisoes de licoes antigas.',
    emoji: '云',
    color: '#5a8b6a',
  },
  5: {
    name: 'Koi-dragao jovem',
    title: 'Koi nivel 5 - corpo em transformacao',
    description: 'Escamas mais duras e energia maior. O input compreensivel abre caminho antes da cobranca.',
    emoji: '角',
    color: '#d4a04a',
  },
  6: {
    name: 'Dragao emergente',
    title: 'Koi nivel 6 - essencia desperta',
    description: 'A essencia do dragao acorda. Cartoes Anki, chunks e fala reforcam os mesmos blocos por angulos diferentes.',
    emoji: '龙',
    color: '#f39c12',
  },
  7: {
    name: 'Dragao elevado',
    title: 'Koi nivel 7 - forma de dragao emerge',
    description: 'A forma de dragao fica visivel. O poder vem de ciclos: conhecer, reconhecer, lembrar e produzir.',
    emoji: '龍',
    color: '#d94b32',
  },
  8: {
    name: 'Dragao completo',
    title: 'Koi nivel 8 - poder desperto',
    description: 'Formacao completa de dragao: poder desperto, essencia liberada. Cada revisao mantem o brilho vivo.',
    emoji: '皇',
    color: '#f1c40f',
  },
}

export function getStageInfo(stage: EvolutionStage, _path: EvolutionPath = 'dragon') {
  return STAGE_INFO_DRAGON[stage] ?? STAGE_INFO_DRAGON[1]
}

/** Accessories earned at each evolution stage */
export const STAGE_ACCESSORIES_DRAGON: Record<EvolutionStage, string[]> = {
  1: [],
  2: ['tail-glow'],
  3: ['long-fins'],
  4: ['dragon-scales'],
  5: ['horn-buds', 'long-fins'],
  6: ['golden-whiskers', 'horn-buds'],
  7: ['golden-whiskers', 'dragon-horns', 'cloud-trail'],
  8: ['golden-whiskers', 'dragon-horns', 'celestial-crown', 'cloud-trail', 'dragon-aura'],
}

export function getStageAccessories(stage: EvolutionStage, _path: EvolutionPath = 'dragon') {
  return STAGE_ACCESSORIES_DRAGON[stage] ?? []
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
  evolutionPath: 'dragon',
  koiVariantId: randomKoiVariantId(),
}

export function normalizeMascotState(input: Partial<MascotState> | undefined): MascotState {
  const stage = normalizeStage(input?.stage)
  const koiVariantId = VARIANT_IDS.includes(input?.koiVariantId as KoiVariantId)
    ? (input?.koiVariantId as KoiVariantId)
    : defaultMascotState.koiVariantId

  return {
    ...defaultMascotState,
    ...(input ?? {}),
    stage,
    evolutionPath: 'dragon',
    koiVariantId,
    accessories: getStageAccessories(stage),
  }
}

function normalizeStage(stage: unknown): EvolutionStage {
  const value = typeof stage === 'number' ? stage : 1
  if (value >= 8) return 8
  if (value <= 1) return 1
  return Math.floor(value) as EvolutionStage
}

/**
 * Calculate the current stage based on evoXP.
 */
export function stageFromXp(evoXp: number): EvolutionStage {
  const stages: EvolutionStage[] = [8, 7, 6, 5, 4, 3, 2, 1]
  for (const stage of stages) {
    if (evoXp >= STAGE_THRESHOLDS[stage]) return stage
  }
  return 1
}

/**
 * Calculate XP needed for the next stage.
 */
export function xpToNextStage(currentXp: number, currentStage: EvolutionStage): number {
  if (currentStage >= 8) return 0
  const nextStage = (currentStage + 1) as EvolutionStage
  return Math.max(0, STAGE_THRESHOLDS[nextStage] - currentXp)
}

/**
 * Progress percentage toward the next stage.
 */
export function stageProgress(currentXp: number, currentStage: EvolutionStage): number {
  if (currentStage >= 8) return 100
  const nextStage = (currentStage + 1) as EvolutionStage
  const currentThreshold = STAGE_THRESHOLDS[currentStage]
  const nextThreshold = STAGE_THRESHOLDS[nextStage]
  const range = nextThreshold - currentThreshold
  const progress = currentXp - currentThreshold
  return Math.min(100, Math.max(0, Math.round((progress / range) * 100)))
}

/**
 * Called when a lesson is completed. Adds evoXP and may trigger evolution.
 */
export function onLessonComplete(state: MascotState, today: string): MascotState {
  const safeState = normalizeMascotState(state)
  const xpGain = 15 + Math.floor(safeState.stage * 2)
  const newXp = safeState.evoXp + xpGain
  const newStage = stageFromXp(newXp)
  const evolved = newStage > safeState.stage

  return {
    ...safeState,
    lessonsCompleted: safeState.lessonsCompleted + 1,
    evoXp: newXp,
    stage: newStage,
    lastActiveDate: today,
    inactiveDays: 0,
    accessories: getStageAccessories(newStage),
    mood: evolved ? 'excited' : 'happy',
    animation: evolved ? 'evolve' : 'celebrate',
  }
}

/**
 * Called when a card is reviewed (gives less XP than a lesson).
 */
export function onCardReview(state: MascotState, today: string): MascotState {
  const safeState = normalizeMascotState(state)
  const xpGain = 3
  const newXp = safeState.evoXp + xpGain
  const newStage = stageFromXp(newXp)

  return {
    ...safeState,
    evoXp: newXp,
    stage: newStage,
    lastActiveDate: today,
    inactiveDays: 0,
    accessories: getStageAccessories(newStage),
    mood: 'happy',
    animation: newStage > safeState.stage ? 'evolve' : 'idle',
  }
}

/**
 * Called when the app opens - checks for inactivity and devolves the mascot.
 * Each day of inactivity removes some evoXP, causing gradual devolution.
 */
export function checkInactivity(state: MascotState, today: string): MascotState {
  const safeState = normalizeMascotState(state)
  if (!safeState.lastActiveDate || safeState.lastActiveDate === today) {
    return safeState
  }

  const lastDate = new Date(safeState.lastActiveDate)
  const todayDate = new Date(today)
  const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

  if (daysDiff <= 1) {
    return { ...safeState, inactiveDays: 0 }
  }

  const inactiveDays = daysDiff - 1
  const xpLoss = inactiveDays * (8 + inactiveDays * 2)
  const newXp = Math.max(0, safeState.evoXp - xpLoss)
  const newStage = stageFromXp(newXp)
  const devolved = newStage < safeState.stage

  let mood: MascotMood = 'neutral'
  if (inactiveDays >= 5) mood = 'sleepy'
  else if (inactiveDays >= 3) mood = 'sad'

  return {
    ...safeState,
    evoXp: newXp,
    stage: newStage,
    inactiveDays,
    accessories: getStageAccessories(newStage),
    mood,
    animation: devolved ? 'devolve' : (inactiveDays >= 3 ? 'sleep' : 'idle'),
  }
}

/**
 * Get the dialogue the mascot says based on its mood and state.
 */
export function getMascotDialogue(state: MascotState): string {
  const safeState = normalizeMascotState(state)
  const variant = getKoiVariant(safeState.koiVariantId)
  const dialogues: Record<MascotMood, string[]> = {
    excited: [
      `Evolui! ${variant.name} sente o dragao acordando.`,
      `A linhagem ${variant.hanzi} brilhou. Vamos manter o ritmo.`,
      'O Portal do Dragao esta mais perto.',
    ],
    happy: [
      'Ni hao! Um pouco todo dia muda tudo.',
      'Jia you! Revisao curta tambem conta.',
      `Seu koi ${variant.name} esta firme na correnteza.`,
    ],
    neutral: [
      'Bora estudar um bloco pequeno?',
      'A correnteza esta forte, mas a repeticao abre caminho.',
      'Primeiro entender, depois responder. Esse e o truque.',
    ],
    sad: [
      'Senti falta do treino. Vamos recuperar com uma revisao facil.',
      'Sem revisao, a cauda perde brilho.',
      'Um cartao Anki ja acorda o koi.',
    ],
    sleepy: [
      'Zzz... uma licao curta ja me puxa de volta.',
      'Estou quase dormindo no rio. Bora revisar o basico?',
      'Pouco input compreensivel hoje ja ajuda.',
    ],
  }

  const pool = dialogues[safeState.mood] ?? dialogues.neutral
  return pool[Math.floor(Math.random() * pool.length)]
}
