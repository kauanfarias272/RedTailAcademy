/**
 * Mascot Evolution System - RedTail Academy
 *
 * The mascot can follow two mythic routes:
 * - Dragon: koi -> dragon, complete at level 8.
 * - Peng: fish -> hybrid -> bird -> final Peng, complete at level 10.
 */

export type EvolutionStage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
export type EvolutionPath = 'dragon' | 'peng'

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

export type PengVariantId = 'peng-koi' | 'peng-arowana' | 'peng-dourado' | 'peng-lutador' | 'peng-borboleta'

export interface MascotVariant {
  id: KoiVariantId | PengVariantId
  hanzi: string
  name: string
  pinyin: string
  trait: string
  color: string
  accent: string
  path: EvolutionPath
}

export interface MascotState {
  /** Current evolution stage. Dragon caps at 8, Peng caps at 10. */
  stage: EvolutionStage
  /** Total lessons completed (cumulative, never resets). */
  lessonsCompleted: number
  /** Current evolution XP - used for stage thresholds. */
  evoXp: number
  /** ISO date string of last activity. */
  lastActiveDate: string
  /** How many days without study in a row. */
  inactiveDays: number
  /** Name chosen by the user. */
  name: string
  /** Accessories the mascot has earned. */
  accessories: string[]
  /** Current mood based on activity. */
  mood: MascotMood
  /** Animation state. */
  animation: MascotAnimation
  /** Evolution destiny: dragon or Peng. */
  evolutionPath: EvolutionPath
  /** Dragon-route visual/personality line. */
  koiVariantId: KoiVariantId
  /** Peng-route fish family from the companion chart. */
  pengVariantId: PengVariantId
}

export type MascotMood = 'happy' | 'excited' | 'neutral' | 'sad' | 'sleepy'
export type MascotAnimation = 'idle' | 'celebrate' | 'evolve' | 'devolve' | 'sleep'

export const KOI_VARIANTS: MascotVariant[] = [
  { id: 'cheng-long', hanzi: '成龙', name: 'Cheng Long', pinyin: 'Cheng Long', trait: 'acao e carisma', color: '#2d95ff', accent: '#64d3ff', path: 'dragon' },
  { id: 'li-xiaolong', hanzi: '李小龙', name: 'Li Xiaolong', pinyin: 'Li Xiaolong', trait: 'foco e disciplina', color: '#f25a2e', accent: '#ffc04d', path: 'dragon' },
  { id: 'hua-mulan', hanzi: '花木兰', name: 'Hua Mulan', pinyin: 'Hua Mulan', trait: 'coragem e honra', color: '#d72e28', accent: '#fff0dc', path: 'dragon' },
  { id: 'sun-wukong', hanzi: '孙悟空', name: 'Sun Wukong', pinyin: 'Sun Wukong', trait: 'travessura e sabedoria', color: '#dca62c', accent: '#fff2a8', path: 'dragon' },
  { id: 'bai-long', hanzi: '白龙', name: 'Bai Long', pinyin: 'Bai Long', trait: 'poder e misterio', color: '#121318', accent: '#f0c46a', path: 'dragon' },
  { id: 'taiyi-zhenren', hanzi: '太乙真人', name: 'Taiyi Zhenren', pinyin: 'Taiyi Zhenren', trait: 'cura e paciencia', color: '#f5f1e8', accent: '#c49b55', path: 'dragon' },
  { id: 'zhang-yimou', hanzi: '张艺谋', name: 'Zhang Yimou', pinyin: 'Zhang Yimou', trait: 'visao e estrategia', color: '#f4f0df', accent: '#171717', path: 'dragon' },
  { id: 'nezha', hanzi: '哪吒', name: 'Nezha', pinyin: 'Nezha', trait: 'determinacao', color: '#ff7d12', accent: '#191919', path: 'dragon' },
  { id: 'xi-shi', hanzi: '西施', name: 'Xi Shi', pinyin: 'Xi Shi', trait: 'beleza e graca', color: '#efe7d8', accent: '#c8a774', path: 'dragon' },
  { id: 'diaochan', hanzi: '貂蝉', name: 'Diaochan', pinyin: 'Diaochan', trait: 'encanto e inteligencia', color: '#e53c2f', accent: '#fff7ea', path: 'dragon' },
  { id: 'zhuangzi', hanzi: '庄子', name: 'Zhuangzi', pinyin: 'Zhuangzi', trait: 'liberdade e filosofia', color: '#c59b55', accent: '#f5d47a', path: 'dragon' },
  { id: 'mozi', hanzi: '墨子', name: 'Mozi', pinyin: 'Mozi', trait: 'logica e defesa', color: '#69717c', accent: '#1f2329', path: 'dragon' },
  { id: 'guan-yu', hanzi: '关羽', name: 'Guan Yu', pinyin: 'Guan Yu', trait: 'lealdade e coragem', color: '#bf6b19', accent: '#ff8c25', path: 'dragon' },
  { id: 'han-xin', hanzi: '韩信', name: 'Han Xin', pinyin: 'Han Xin', trait: 'estrategia e paciencia', color: '#f7f4e8', accent: '#1b1b1b', path: 'dragon' },
  { id: 'yang-guifei', hanzi: '杨贵妃', name: 'Yang Guifei', pinyin: 'Yang Guifei', trait: 'elegancia e talento', color: '#dfb84d', accent: '#fff0b8', path: 'dragon' },
  { id: 'change', hanzi: '嫦娥', name: "Chang'e", pinyin: "Chang'e", trait: 'pureza e misterio', color: '#f08aa8', accent: '#ffd5e0', path: 'dragon' },
  { id: 'zixia', hanzi: '紫霞', name: 'Zixia', pinyin: 'Zixia', trait: 'sonhos e romance', color: '#6c25cf', accent: '#b97bff', path: 'dragon' },
  { id: 'qingluan', hanzi: '青鸾', name: 'Qingluan', pinyin: 'Qingluan', trait: 'sorte e harmonia', color: '#1fb6a5', accent: '#7ff7e5', path: 'dragon' },
  { id: 'xinghe', hanzi: '星河', name: 'Xinghe', pinyin: 'Xinghe', trait: 'calma e profundidade', color: '#064dcc', accent: '#49b8ff', path: 'dragon' },
  { id: 'caihong', hanzi: '彩虹', name: 'Caihong', pinyin: 'Caihong', trait: 'alegria e esperanca', color: '#ffb32e', accent: '#20d6b5', path: 'dragon' },
  { id: 'yexingzhe', hanzi: '夜行者', name: 'Yexingzhe', pinyin: 'Yexingzhe', trait: 'agilidade e foco', color: '#221036', accent: '#8f46ff', path: 'dragon' },
  { id: 'jinlin', hanzi: '金鳞', name: 'Jinlin', pinyin: 'Jinlin', trait: 'riqueza e prosperidade', color: '#f0c35a', accent: '#fff4b2', path: 'dragon' },
  { id: 'chiyan', hanzi: '赤焰', name: 'Chiyan', pinyin: 'Chiyan', trait: 'paixao e energia', color: '#e72d13', accent: '#ff9d3d', path: 'dragon' },
  { id: 'xuanbing', hanzi: '玄冰', name: 'Xuanbing', pinyin: 'Xuanbing', trait: 'calma e resistencia', color: '#cceeff', accent: '#86d9ff', path: 'dragon' },
  { id: 'zi-shu', hanzi: '子鼠', name: 'Zi Shu', pinyin: 'Zi Shu', trait: 'engenho flexivel', color: '#ffd8d8', accent: '#ff9db0', path: 'dragon' },
  { id: 'chou-niu', hanzi: '丑牛', name: 'Chou Niu', pinyin: 'Chou Niu', trait: 'constancia forte', color: '#c99125', accent: '#f3d27c', path: 'dragon' },
  { id: 'yin-hu', hanzi: '寅虎', name: 'Yin Hu', pinyin: 'Yin Hu', trait: 'impulso valente', color: '#dd8118', accent: '#2b1708', path: 'dragon' },
  { id: 'mao-tu', hanzi: '卯兔', name: 'Mao Tu', pinyin: 'Mao Tu', trait: 'gentileza rapida', color: '#ffd8dc', accent: '#ff93a5', path: 'dragon' },
  { id: 'chen-long', hanzi: '辰龙', name: 'Chen Long', pinyin: 'Chen Long', trait: 'pressagio auspicioso', color: '#62b842', accent: '#baf2a2', path: 'dragon' },
  { id: 'si-she', hanzi: '巳蛇', name: 'Si She', pinyin: 'Si She', trait: 'sabedoria quieta', color: '#159f91', accent: '#82ffe8', path: 'dragon' },
  { id: 'wu-ma', hanzi: '午马', name: 'Wu Ma', pinyin: 'Wu Ma', trait: 'energia livre', color: '#d92f14', accent: '#ff8c32', path: 'dragon' },
  { id: 'wei-yang', hanzi: '未羊', name: 'Wei Yang', pinyin: 'Wei Yang', trait: 'ternura firme', color: '#efe5cf', accent: '#c9a66b', path: 'dragon' },
  { id: 'shen-hou', hanzi: '申猴', name: 'Shen Hou', pinyin: 'Shen Hou', trait: 'criatividade esperta', color: '#b66d27', accent: '#f5b66e', path: 'dragon' },
  { id: 'you-ji', hanzi: '酉鸡', name: 'You Ji', pinyin: 'You Ji', trait: 'precisao no tempo', color: '#e2382d', accent: '#fff3df', path: 'dragon' },
  { id: 'xu-gou', hanzi: '戌狗', name: 'Xu Gou', pinyin: 'Xu Gou', trait: 'lealdade alerta', color: '#c79a4e', accent: '#f0d08e', path: 'dragon' },
  { id: 'hai-zhu', hanzi: '亥猪', name: 'Hai Zhu', pinyin: 'Hai Zhu', trait: 'alegria abundante', color: '#f2a2b2', accent: '#ffd2dc', path: 'dragon' },
]

export const PENG_VARIANTS: MascotVariant[] = [
  { id: 'peng-koi', hanzi: '锦鲤', name: 'Koi', pinyin: 'Jinli', trait: 'equilibrio', color: '#f7f2e7', accent: '#c92828', path: 'peng' },
  { id: 'peng-arowana', hanzi: '龙鱼', name: 'Arowana', pinyin: 'Longyu', trait: 'forca', color: '#b92c1b', accent: '#ff7f3b', path: 'peng' },
  { id: 'peng-dourado', hanzi: '金鱼', name: 'Dourado', pinyin: 'Jinyu', trait: 'riqueza', color: '#f0b02e', accent: '#fff1a8', path: 'peng' },
  { id: 'peng-lutador', hanzi: '斗鱼', name: 'Lutador', pinyin: 'Douyu', trait: 'coragem', color: '#0d6dcc', accent: '#e92e4d', path: 'peng' },
  { id: 'peng-borboleta', hanzi: '蝶鱼', name: 'Borboleta', pinyin: 'Dieyu', trait: 'leveza', color: '#7a3ed4', accent: '#d0a7ff', path: 'peng' },
]

const KOI_VARIANT_IDS = KOI_VARIANTS.map((variant) => variant.id as KoiVariantId)
const PENG_VARIANT_IDS = PENG_VARIANTS.map((variant) => variant.id as PengVariantId)

export function getKoiVariant(id?: string): MascotVariant {
  return KOI_VARIANTS.find((variant) => variant.id === id) ?? KOI_VARIANTS[0]
}

export function getPengVariant(id?: string): MascotVariant {
  return PENG_VARIANTS.find((variant) => variant.id === id) ?? PENG_VARIANTS[0]
}

export function getMascotVariant(state: Pick<MascotState, 'evolutionPath' | 'koiVariantId' | 'pengVariantId'>): MascotVariant {
  return state.evolutionPath === 'peng' ? getPengVariant(state.pengVariantId) : getKoiVariant(state.koiVariantId)
}

export function randomKoiVariantId(): KoiVariantId {
  return KOI_VARIANT_IDS[Math.floor(Math.random() * KOI_VARIANT_IDS.length)]
}

export function randomPengVariantId(): PengVariantId {
  return PENG_VARIANT_IDS[Math.floor(Math.random() * PENG_VARIANT_IDS.length)]
}

export const STAGE_THRESHOLDS: Record<EvolutionStage, number> = {
  1: 0,
  2: 30,
  3: 80,
  4: 160,
  5: 280,
  6: 440,
  7: 650,
  8: 920,
  9: 1260,
  10: 1680,
}

export const MAX_STAGE_BY_PATH: Record<EvolutionPath, EvolutionStage> = {
  dragon: 8,
  peng: 10,
}

export const STAGE_INFO_DRAGON: Record<Exclude<EvolutionStage, 9 | 10>, StageInfo> = {
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

export const STAGE_INFO_PENG: Record<EvolutionStage, StageInfo> = {
  1: { name: 'Filhote Peng', title: 'Peng nivel 1 - filhote', description: 'Peixe pequeno com potencial para cruzar do rio ao ceu.', emoji: '鱼', color: '#64bfe9' },
  2: { name: 'Peixe desperto', title: 'Peng nivel 2 - cauda firme', description: 'A cauda fica mais forte e o primeiro habito de estudo aparece.', emoji: '鲤', color: '#4aa7f0' },
  3: { name: 'Peixe veloz', title: 'Peng nivel 3 - corpo definido', description: 'O corpo ganha forma e memorias antigas voltam mais rapido.', emoji: '鳞', color: '#3e8fe0' },
  4: { name: 'Peixe resiliente', title: 'Peng nivel 4 - nadadeiras longas', description: 'As nadadeiras sustentam treinos maiores e revisoes mais espacadas.', emoji: '涛', color: '#5a8b6a' },
  5: { name: 'Peixe ascendente', title: 'Peng nivel 5 - energia alta', description: 'O mascote sente o chamado do ar, mas ainda precisa de constancia.', emoji: '跃', color: '#d4a04a' },
  6: { name: 'Peixe mistico', title: 'Peng nivel 6 - espiral de poder', description: 'O corpo comeca a curvar como criatura lendaria.', emoji: '玄', color: '#f39c12' },
  7: { name: 'Peixe celeste', title: 'Peng nivel 7 - pre-hibrido', description: 'Escamas e cauda anunciam a virada para o ceu.', emoji: '星', color: '#d94b32' },
  8: { name: 'Hibrido Peng', title: 'Peng nivel 8 - hibrido', description: 'Peixe e passaro dividem o mesmo corpo. A transformacao e real.', emoji: '羽', color: '#c7d7ff' },
  9: { name: 'Passaro Peng', title: 'Peng nivel 9 - passaro', description: 'As asas dominam. Agora o estudo sobe como corrente termica.', emoji: '鹏', color: '#8cc8ff' },
  10: { name: 'Peng final', title: 'Peng nivel 10 - forma final', description: 'Forma final Peng: leveza, voo e memoria consolidada.', emoji: '天', color: '#f1c40f' },
}

type StageInfo = {
  name: string
  title: string
  description: string
  emoji: string
  color: string
}

export function maxStageForPath(path: EvolutionPath): EvolutionStage {
  return MAX_STAGE_BY_PATH[path]
}

export function getStageInfo(stage: EvolutionStage, path: EvolutionPath = 'dragon'): StageInfo {
  return path === 'peng'
    ? STAGE_INFO_PENG[normalizeStage(stage, 'peng')]
    : STAGE_INFO_DRAGON[normalizeStage(stage, 'dragon') as Exclude<EvolutionStage, 9 | 10>]
}

export const STAGE_ACCESSORIES_DRAGON: Record<Exclude<EvolutionStage, 9 | 10>, string[]> = {
  1: [],
  2: ['tail-glow'],
  3: ['long-fins'],
  4: ['dragon-scales'],
  5: ['horn-buds', 'long-fins'],
  6: ['golden-whiskers', 'horn-buds'],
  7: ['golden-whiskers', 'dragon-horns', 'cloud-trail'],
  8: ['golden-whiskers', 'dragon-horns', 'celestial-crown', 'cloud-trail', 'dragon-aura'],
}

export const STAGE_ACCESSORIES_PENG: Record<EvolutionStage, string[]> = {
  1: [],
  2: ['tail-glow'],
  3: ['long-fins'],
  4: ['wide-fins'],
  5: ['sky-call'],
  6: ['spiral-body'],
  7: ['wind-scales'],
  8: ['wing-buds', 'wind-aura'],
  9: ['peng-wings', 'wind-aura'],
  10: ['peng-wings', 'celestial-crown', 'galaxy-trail', 'wind-aura'],
}

export function getStageAccessories(stage: EvolutionStage, path: EvolutionPath = 'dragon') {
  return path === 'peng'
    ? STAGE_ACCESSORIES_PENG[normalizeStage(stage, 'peng')]
    : STAGE_ACCESSORIES_DRAGON[normalizeStage(stage, 'dragon') as Exclude<EvolutionStage, 9 | 10>]
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
  koiVariantId: randomKoiVariantId(),
  pengVariantId: randomPengVariantId(),
}

export function normalizeMascotState(input: Partial<MascotState> | undefined): MascotState {
  const evolutionPath: EvolutionPath = input?.evolutionPath === 'peng' ? 'peng' : 'dragon'
  const stage = normalizeStage(input?.stage, evolutionPath)
  const koiVariantId = KOI_VARIANT_IDS.includes(input?.koiVariantId as KoiVariantId)
    ? (input?.koiVariantId as KoiVariantId)
    : defaultMascotState.koiVariantId
  const pengVariantId = PENG_VARIANT_IDS.includes(input?.pengVariantId as PengVariantId)
    ? (input?.pengVariantId as PengVariantId)
    : defaultMascotState.pengVariantId

  return {
    ...defaultMascotState,
    ...(input ?? {}),
    stage,
    evolutionPath,
    koiVariantId,
    pengVariantId,
    accessories: getStageAccessories(stage, evolutionPath),
  }
}

function normalizeStage(stage: unknown, path: EvolutionPath): EvolutionStage {
  const value = typeof stage === 'number' ? stage : 1
  const maxStage = maxStageForPath(path)
  if (value >= maxStage) return maxStage
  if (value <= 1) return 1
  return Math.floor(value) as EvolutionStage
}

export function stageFromXp(evoXp: number, path: EvolutionPath = 'dragon'): EvolutionStage {
  const maxStage = maxStageForPath(path)
  for (let stage = maxStage; stage >= 1; stage -= 1) {
    const typedStage = stage as EvolutionStage
    if (evoXp >= STAGE_THRESHOLDS[typedStage]) return typedStage
  }
  return 1
}

export function xpToNextStage(currentXp: number, currentStage: EvolutionStage, path: EvolutionPath = 'dragon'): number {
  const stage = normalizeStage(currentStage, path)
  const maxStage = maxStageForPath(path)
  if (stage >= maxStage) return 0
  const nextStage = (stage + 1) as EvolutionStage
  return Math.max(0, STAGE_THRESHOLDS[nextStage] - currentXp)
}

export function stageProgress(currentXp: number, currentStage: EvolutionStage, path: EvolutionPath = 'dragon'): number {
  const stage = normalizeStage(currentStage, path)
  const maxStage = maxStageForPath(path)
  if (stage >= maxStage) return 100
  const nextStage = (stage + 1) as EvolutionStage
  const currentThreshold = STAGE_THRESHOLDS[stage]
  const nextThreshold = STAGE_THRESHOLDS[nextStage]
  const range = nextThreshold - currentThreshold
  const progress = currentXp - currentThreshold
  return Math.min(100, Math.max(0, Math.round((progress / range) * 100)))
}

export function lessonEvoXpGain(state: MascotState): number {
  const safeState = normalizeMascotState(state)
  return 15 + Math.floor(safeState.stage * 2)
}

export function previewLessonComplete(state: MascotState, today: string): {
  nextMascot: MascotState
  evoXpGain: number
  evolved: boolean
} {
  const safeState = normalizeMascotState(state)
  const evoXpGain = lessonEvoXpGain(safeState)
  const newXp = safeState.evoXp + evoXpGain
  const newStage = stageFromXp(newXp, safeState.evolutionPath)
  const evolved = newStage > safeState.stage

  return {
    evoXpGain,
    evolved,
    nextMascot: {
      ...safeState,
      lessonsCompleted: safeState.lessonsCompleted + 1,
      evoXp: newXp,
      stage: newStage,
      lastActiveDate: today,
      inactiveDays: 0,
      accessories: getStageAccessories(newStage, safeState.evolutionPath),
      mood: evolved ? 'excited' : 'happy',
      animation: evolved ? 'evolve' : 'celebrate',
    },
  }
}

export function onLessonComplete(state: MascotState, today: string): MascotState {
  return previewLessonComplete(state, today).nextMascot
}

export function onCardReview(state: MascotState, today: string): MascotState {
  const safeState = normalizeMascotState(state)
  const xpGain = 3
  const newXp = safeState.evoXp + xpGain
  const newStage = stageFromXp(newXp, safeState.evolutionPath)

  return {
    ...safeState,
    evoXp: newXp,
    stage: newStage,
    lastActiveDate: today,
    inactiveDays: 0,
    accessories: getStageAccessories(newStage, safeState.evolutionPath),
    mood: 'happy',
    animation: newStage > safeState.stage ? 'evolve' : 'idle',
  }
}

export function switchEvolutionPath(state: MascotState): MascotState {
  const safeState = normalizeMascotState(state)
  const evolutionPath: EvolutionPath = safeState.evolutionPath === 'dragon' ? 'peng' : 'dragon'
  const stage = stageFromXp(safeState.evoXp, evolutionPath)

  return {
    ...safeState,
    evolutionPath,
    stage,
    accessories: getStageAccessories(stage, evolutionPath),
    mood: 'excited',
    animation: 'evolve',
  }
}

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
  const newStage = stageFromXp(newXp, safeState.evolutionPath)
  const devolved = newStage < safeState.stage

  let mood: MascotMood = 'neutral'
  if (inactiveDays >= 5) mood = 'sleepy'
  else if (inactiveDays >= 3) mood = 'sad'

  return {
    ...safeState,
    evoXp: newXp,
    stage: newStage,
    inactiveDays,
    accessories: getStageAccessories(newStage, safeState.evolutionPath),
    mood,
    animation: devolved ? 'devolve' : (inactiveDays >= 3 ? 'sleep' : 'idle'),
  }
}

export function getMascotDialogue(state: MascotState): string {
  const safeState = normalizeMascotState(state)
  const variant = getMascotVariant(safeState)
  const destination = safeState.evolutionPath === 'peng' ? 'Peng' : 'Dragao'
  const dialogues: Record<MascotMood, string[]> = {
    excited: [
      `Evolui! ${variant.name} sente o caminho ${destination} acordando.`,
      `A linhagem ${variant.hanzi} brilhou. Vamos manter o ritmo.`,
      safeState.evolutionPath === 'peng' ? 'O ceu do Peng esta mais perto.' : 'O Portal do Dragao esta mais perto.',
    ],
    happy: [
      'Ni hao! Um pouco todo dia muda tudo.',
      'Jia you! Revisao curta tambem conta.',
      `Seu ${variant.name} esta firme na correnteza.`,
    ],
    neutral: [
      'Bora estudar um bloco pequeno?',
      'A correnteza esta forte, mas a repeticao abre caminho.',
      'Primeiro entender, depois responder. Esse e o truque.',
    ],
    sad: [
      'Senti falta do treino. Vamos recuperar com uma revisao facil.',
      'Sem revisao, a cauda perde brilho.',
      'Um cartao Anki ja acorda o mascote.',
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
