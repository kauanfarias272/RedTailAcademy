import {
  AlertTriangle,
  BookOpen,
  Boxes,
  Brush,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Eraser,
  Fish,
  Flame,
  GraduationCap,
  Headphones,
  Layers3,
  Library,
  LockKeyhole,
  LogIn,
  LogOut,
  Mic,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Swords,
  Target,
  Trash2,
  Trophy,
  Undo2,
  Users,
  Volume2,
} from 'lucide-react'
import { DirectionCHeader, DirectionCNavButton } from './components/DirectionC'
import { Logo1, LogoVertical } from './components/Logos'
import { Capacitor, registerPlugin } from '@capacitor/core'
import { auth, deleteCurrentAccount } from './firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, type User, GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth'
import { FirebaseAuthentication } from '@capacitor-firebase/authentication'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, PointerEvent as ReactPointerEvent } from 'react'
import './App.css'
import {
  allPhrases,
  chunks,
  clipSeeds,
  lessons,
  studyMoments,
  toneDrills,
  units,
  writingCharacters,
  type Chunk,
  type Lesson,
  type Phrase,
  type StudyMoment,
  type WritingCharacter,
} from './content'
import {
  hasOpenMistakes,
  nextDueDate,
  normalizeDailyGoals,
  openMistakes,
  personalGoals,
  progressLevel,
  recordMistake,
  resolveMistake,
  updateStudyStreak,
  useStoredProgress,
  useToday,
  type LearningMistake,
  type LearningProgress,
} from './progress'
import { checkInactivity, getStageAccessories, onLessonComplete, onCardReview } from './mascot'
import { MascotWidget } from './MascotWidget'
import { playCorrect, playLevelUp, playWrong, unlockAudioOnFirstGesture } from './sound'
import {
  CLAN_MAX_MEMBERS,
  clanXpBonus,
  createClan,
  fetchMembers,
  joinClanByCode,
  leaveClan,
  recomputeClanTotal,
  subscribeClan,
  subscribeTopClans,
  syncUserDoc,
  type ClanDoc,
  type ClanMember,
} from './clans'

type Tab = 'learn' | 'practice' | 'errors' | 'clan' | 'clips' | 'mascot' | 'profile'
type PracticeMode = 'cards' | 'chunks' | 'speak' | 'write'
type Difficulty = 'hard' | 'good' | 'easy'
type MicState = 'idle' | 'starting' | 'listening' | 'processing' | 'success' | 'fail' | 'error'
type MandarinTtsPlugin = {
  speak(options: { text: string; rate?: number }): Promise<{ spoken: boolean }>
  stop(): Promise<void>
}
type MandarinSpeechPlugin = {
  listen(options?: { language?: string; prompt?: string }): Promise<{ transcript: string; matches: string[] }>
  stop(): Promise<void>
}

const MandarinTts = registerPlugin<MandarinTtsPlugin>('MandarinTts')
const MandarinSpeech = registerPlugin<MandarinSpeechPlugin>('MandarinSpeech')

const navItems: Array<{ id: Tab; label: string; icon: typeof BookOpen; symbol: string }> = [
  { id: 'learn', label: 'Trilha', icon: BookOpen, symbol: '本' },
  { id: 'practice', label: 'Treino', icon: Layers3, symbol: '卡' },
  { id: 'errors', label: 'Erros', icon: AlertTriangle, symbol: '⚠' },
  { id: 'clan', label: 'Clã', icon: Users, symbol: '族' },
  { id: 'profile', label: 'Ritmo', icon: Trophy, symbol: '節' },
]

const secondaryNavItems: Array<{ id: Tab; label: string; icon: typeof BookOpen }> = [
  { id: 'clips', label: 'Cultura', icon: Headphones },
  { id: 'mascot', label: 'Koi', icon: Fish },
]

const quizOptions = [
  'ola',
  'obrigado',
  'quanto custa?',
  'eu quero',
  'bom dia',
  'amigo',
  'beber agua',
  'sem problema',
  'China',
  'pessoa',
  'com licenca',
  'onde fica o banheiro?',
  'tres horas',
  'amanha as dez',
  'estou cansado',
  'quero descansar',
  'pai',
  'mae',
]

const FREEZE_COST = 80
const MASCOT_SWITCH_COST = 300
const WRITING_MIN_PATH = 220

type DrawPoint = {
  x: number
  y: number
}

type WritingValidationTemplate = {
  cells: string[]
  minWidthRatio: number
  minHeightRatio: number
  minPathLength: number
}

const writingValidationTemplates: Record<string, WritingValidationTemplate> = {
  ren: { cells: ['1-0', '1-1', '0-2', '2-2'], minWidthRatio: 0.26, minHeightRatio: 0.36, minPathLength: 105 },
  kou: { cells: ['0-0', '1-0', '2-0', '0-1', '2-1', '0-2', '1-2', '2-2'], minWidthRatio: 0.3, minHeightRatio: 0.3, minPathLength: 130 },
  ni: { cells: ['0-0', '0-1', '1-0', '2-0', '1-1', '2-1', '1-2', '2-2'], minWidthRatio: 0.34, minHeightRatio: 0.38, minPathLength: 205 },
  hao: { cells: ['0-0', '0-1', '0-2', '1-1', '2-0', '2-1', '1-2', '2-2'], minWidthRatio: 0.34, minHeightRatio: 0.36, minPathLength: 190 },
  zhong: { cells: ['0-0', '1-0', '2-0', '0-1', '1-1', '2-1', '1-2'], minWidthRatio: 0.28, minHeightRatio: 0.4, minPathLength: 150 },
  shui: { cells: ['1-0', '1-1', '0-2', '1-2', '2-2'], minWidthRatio: 0.34, minHeightRatio: 0.38, minPathLength: 150 },
}

const practiceModes: Array<{ id: PracticeMode; label: string; icon: typeof Layers3 }> = [
  { id: 'cards', label: 'Cartoes', icon: Layers3 },
  { id: 'chunks', label: 'Chunks', icon: Boxes },
  { id: 'speak', label: 'Fala', icon: Mic },
  { id: 'write', label: 'Escrita', icon: Brush },
]

const phraseConnectionMap: Record<string, string[]> = {
  'ni-hao': ['好 volta em 很好, 早上好 e 好吃', '你好 vira pergunta com 吗: 你好吗'],
  'wo-hen-hao': ['我 + estado tambem aparece em 我累了', '很好 reaproveita o mesmo 好 de 你好'],
  'ma-tones': ['妈 conecta com 妈妈', '吗 usa som leve para transformar frase em pergunta'],
  'shi-tones': ['十 reaparece em 十点', '是 e 事 treinam mesmo som com tons diferentes'],
  'zhong-guo': ['中 volta em 中文 e 中国人', '国 aparece em nomes de paises'],
  ren: ['人 entra em 中国人', 'O radical pessoa aparece em 你'],
  'ba-ba': ['爸爸 e 妈妈 usam repeticao com segunda silaba leve', 'Treina final -a antes de frases de familia'],
  'ma-ma': ['妈妈 conecta com 妈 dos quatro tons', 'Mesmo padrao de palavra familiar de 爸爸'],
  'zao-shang-hao': ['好 conecta com 你好 e 很好', '早上 marca tempo antes da saudacao'],
  'zai-jian': ['再 marca repeticao: ver de novo', '见 volta em encontros e despedidas'],
  'xie-xie': ['谢谢你 usa o alvo depois do agradecimento', 'A segunda silaba fica neutra como em 朋友'],
  'mei-guan-xi': ['没 nega situacoes: 没问题 e 没关系', 'Serve como resposta natural para 对不起'],
  'ni-hao-ma': ['吗 e o bloco que transforma afirmacao em pergunta', 'Reaproveita 你好 sem mudar a base'],
  'shen-me': ['什么 combina com objetos: 这是什么', 'Perguntas curtas reaparecem em 哪里'],
  'qing-wen': ['请问 prepara perguntas educadas', 'Use antes de 厕所在哪里'],
  'ce-suo-zai-na-li': ['在哪里 troca o lugar: 学校在哪里', '请问 + pergunta deixa a frase mais educada'],
  'yi-er-san': ['三 reaparece em 三点', '一 muda de tom em 一杯水'],
  shi: ['十 entra em 十点', 'Conecta numeros com horario'],
  'duo-shao-qian': ['多少 serve para quantidade e preco', '钱 fecha perguntas de compra'],
  'zhe-ge': ['这个 entra em 我要这个', '个 e classificador geral para itens'],
  'wo-yao': ['我要 + item cria pedido direto', '想 suaviza o desejo em 我想休息'],
  'yi-bei-shui': ['一杯 conecta numero + classificador', '水 volta em 喝水'],
  'san-dian': ['点 marca horas', '三 vem da contagem 1-10'],
  'ming-tian-shi-dian': ['明天 ja apareceu na fase de tempo', '十点 combina numero + horario'],
  'wo-de-jia': ['我的 cria posse: meu/minha', '家 pode ser casa ou familia'],
  'peng-you': ['朋友 usa segunda silaba neutra', 'Pode virar 我的朋友'],
  'chi-fan': ['吃 + comida volta em 吃面', '饭 aqui funciona como refeicao, nao so arroz'],
  'he-shui': ['喝 + bebida volta em 喝咖啡', '水 conecta com 一杯水'],
  'jin-tian': ['今天 marca tempo antes da frase', 'Combina com 天气好'],
  'ming-tian': ['明天 conecta com 明天十点', 'Tempo vem antes do horario'],
  'wo-lei-le': ['了 marca mudanca de estado', '我 + estado conecta com 我很好'],
  'wo-xiang-xiu-xi': ['想 + verbo suaviza desejo', 'Mesmo 想 de 我想喝咖啡'],
  'ta-shi-shei': ['谁 reaparece em perguntas de identidade', '他/她 so mudam genero na escrita'],
  'ta-shi-wo-pengyou': ['朋友 volta de daily-family', '是 liga pessoa + papel/relacao'],
  'wo-ai-wo-de-jia': ['我的家 expande 我家', '爱 aparece em gostos fortes'],
  'ba-ma-dou-hao': ['都 marca todos no grupo', '好 conecta com 你好 e 天气很好'],
  'ta-shi-laoshi': ['老师 conecta ao mundo Escola', '是 liga pessoa + profissao/papel'],
  'wo-shi-xuesheng': ['学生 contrasta com 老师', '我是... vira estrutura de apresentacao'],
  'wo-xuexi-zhongwen': ['学习 conecta com aluno/professor', '中文 reaparece em 会说中文'],
  'ni-hui-shuo-zhongwen-ma': ['会 + verbo marca habilidade', '吗 transforma habilidade em pergunta'],
  'zhe-shi-wo-de-shu': ['这是 apresenta objetos', '的 marca posse de forma clara'],
  'diannao-zai-zhuozi-shang': ['在 localiza coisas', '上 adiciona posicao em cima'],
  'wo-kan-shu': ['看 muda pelo objeto: ver ou ler', '书 conecta com 这是我的书'],
  'qing-xie-hanzi': ['请 suaviza comandos', '写 conecta com treino de hanzi'],
  'wo-qu-xuexiao': ['去 + lugar e destino', '学校 conecta com 学生 e 老师'],
  'ta-lai-zhongguo': ['来 e o par de 去', '中国 conecta com 中文 e 中国人'],
  'wo-zuo-chuzuche': ['坐 + transporte', '出租车 entra em deslocamento urbano'],
  'huochezhan-zai-nali': ['在哪里 reaparece de banheiro', '站 marca lugar de transporte'],
  'shangdian-you-shui': ['有 marca existencia/posse', '水 conecta com 喝水 e 一杯水'],
  'wo-yao-mai-shuiguo': ['要 + 买 cria intencao de compra', '水果 conecta comida e mercado'],
  'jintian-xingqi-yi': ['今天 coloca tempo antes da frase', '星期 + numero forma dias'],
  'xianzai-ba-dian': ['现在 marca agora', '点 conecta com 三点 e 十点'],
  'tianqi-hen-hao': ['天气 conecta com 今天', '很好 reaproveita 好'],
  'xianzai-xia-yu': ['下雨 e bloco fixo de clima', '现在 liga ao momento atual'],
  'wo-hui-shuo-yidian-zhongwen': ['会说中文 expande a pergunta de habilidade', '一点 deixa a frase humilde'],
  'wo-xihuan-he-cha': ['喜欢 + verbo/objeto', '喝 conecta agua, cafe e cha'],
  'ni-jiao-shenme-mingzi': ['叫什么名字 e bloco de apresentacao', '什么 pergunta sobre coisa/nome'],
  'wo-jiao-kauan': ['我叫 apresenta nome', 'Troque o final por qualquer nome'],
  'ni-shi-na-guo-ren': ['哪 + pais + 人 pergunta nacionalidade', '人 volta de pessoa'],
  'wo-ershi-sui': ['岁 marca idade sem verbo ter', '二十 combina 二 + 十'],
  'ni-zhu-zai-nar': ['住在 + lugar fala onde mora', '哪儿 e alternativa curta de 哪里'],
  'wo-zhu-zai-beijing': ['住在 reaproveita a pergunta anterior', 'Troque 北京 por sua cidade'],
}

const chunkConnectionMap: Record<string, string[]> = {
  'chunk-meu-nome': ['我叫 troca o final pelo seu nome', 'Conecta apresentacao com 我 + verbo'],
  'chunk-tudo-bem': ['你好吗 reaproveita 你好', '吗 fecha pergunta sim/nao'],
  'chunk-obrigado': ['谢谢 + alvo', '你 tambem aparece em 你好'],
  'chunk-quanto-custa': ['多少 + 钱 cria preco', '这个 aponta o item'],
  'chunk-quero-isto': ['我要 conecta pedido direto com 这个', 'Use 想 para suavizar'],
  'chunk-cafe': ['想 + verbo + objeto', '喝 conecta bebidas: 水, 咖啡'],
  'chunk-vou-parque': ['去 + lugar', 'Troque 公园 por qualquer destino'],
  'chunk-tempo': ['今天 marca quando', '天气好 reaproveita 好'],
  'chunk-gosto-comer': ['喜欢 + verbo', '吃 conecta comida e rotina'],
  'chunk-que-horas': ['现在 marca agora', '几点 reaparece em horarios'],
  'chunk-banheiro': ['请问 + pergunta educada', '在哪里 troca o lugar sem mudar a estrutura'],
  'chunk-descansar': ['想 + verbo reaparece em 我想喝咖啡', '休息 conecta com energia/cansaco'],
  'chunk-quem-e-ele': ['谁 fecha perguntas sobre pessoa', '是 liga pessoa + identidade'],
  'chunk-sou-estudante': ['我是... serve para apresentacao', '学生 contrasta com 老师'],
  'chunk-falo-chines': ['会 + 说 marca habilidade oral', '中文 volta em 学习中文'],
  'chunk-meu-livro': ['这是 apresenta objetos', '我的 marca posse'],
  'chunk-vou-escola': ['去 + destino', '学校 conecta cidade e estudo'],
  'chunk-taxi': ['坐 + transporte', 'Mesmo padrao para trem/aviao/onibus'],
  'chunk-comprar-fruta': ['要 + 买 + objeto', '水果 conecta comida e compras'],
  'chunk-hoje-segunda': ['星期 + numero', '今天 marca o tempo da frase'],
  'chunk-um-pouco-chines': ['一点 suaviza habilidade', '会说中文 fecha checkpoint oral'],
  'chunk-qual-nome': ['叫什么名字 e bloco de prova', '名字 completa a pergunta'],
  'chunk-onde-mora': ['住在 + lugar', '哪儿 pergunta onde de forma curta'],
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [guestEmail, setGuestEmail] = useState<string | null>(() => {
    try { return localStorage.getItem('redtail.guestEmail') } catch { return null }
  })

  const effectiveUser = user ?? (guestEmail ? ({ email: guestEmail, uid: 'guest' } as unknown as User) : null)

  useEffect(() => {
    unlockAudioOnFirstGesture()
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setIsAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  function enterAsGuest(label?: string) {
    const email = (label && label.trim()) || `convidado-${Math.floor(Math.random() * 9999)}@redtail.local`
    try { localStorage.setItem('redtail.guestEmail', email) } catch { /* ignore */ }
    setGuestEmail(email)
    setAuthError('')
  }

  function leaveGuest() {
    try { localStorage.removeItem('redtail.guestEmail') } catch { /* ignore */ }
    setGuestEmail(null)
  }

  const [activeTab, setActiveTab] = useState<Tab>('learn')
  const [isLessonActive, setIsLessonActive] = useState(false)
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('cards')
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0].id)
  const [lessonStep, setLessonStep] = useState(0)
  const [quizChoice, setQuizChoice] = useState('')
  const [quizLocked, setQuizLocked] = useState(false)
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false)
  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [clipTitle, setClipTitle] = useState('')
  const [clipUrl, setClipUrl] = useState('')
  const [clipTheme, setClipTheme] = useState('pronuncia')
  const [transcript, setTranscript] = useState('')
  const [micState, setMicState] = useState<MicState>('idle')
  const [lastSpeechExpected, setLastSpeechExpected] = useState('')
  const [lastSpeechMatched, setLastSpeechMatched] = useState(false)
  const [mandarinVoice, setMandarinVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [now, setNow] = useState(0)
  const [celebrate, setCelebrate] = useState<{ kind: 'good' | 'bad'; text: string; key: number } | null>(null)
  const [clan, setClan] = useState<ClanDoc | null>(null)
  const [clanMembers, setClanMembers] = useState<ClanMember[]>([])
  const [topClans, setTopClans] = useState<ClanDoc[]>([])
  const [clanError, setClanError] = useState<string>('')
  const autoAdvanceTimer = useRef<number | null>(null)
  const [progress, setProgress] = useStoredProgress()
  const today = useToday()

  useEffect(() => {
    const updateNow = () => setNow(Date.now())
    updateNow()
    const timer = window.setInterval(updateNow, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!('speechSynthesis' in window)) return

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      const voice =
        voices.find((item) => item.lang.toLowerCase() === 'zh-cn') ??
        voices.find((item) => item.lang.toLowerCase().startsWith('zh')) ??
        null
      setMandarinVoice(voice)
    }

    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  }, [])

  useEffect(() => {
    return () => {
      if (autoAdvanceTimer.current) window.clearTimeout(autoAdvanceTimer.current)
    }
  }, [])

  useEffect(() => {
    setProgress((current) => {
      if (current.dailyGoals.date === today) return current
      return { ...current, dailyGoals: normalizeDailyGoals(current.dailyGoals, today) }
    })
  }, [setProgress, today])

  const isFirebaseUser = Boolean(user && !guestEmail)
  const clanMember: ClanMember | null = isFirebaseUser && user
    ? {
        uid: user.uid,
        displayName: user.displayName ?? user.email ?? 'Aprendiz',
        email: user.email ?? '',
        xp: progress.xp,
      }
    : null

  // Subscribe to current clan
  useEffect(() => {
    if (!isFirebaseUser || !progress.clanId) {
      setClan(null)
      setClanMembers([])
      return
    }
    const unsub = subscribeClan(progress.clanId, async (next) => {
      setClan(next)
      if (!next) {
        setProgress((current) => ({ ...current, clanId: null }))
        setClanMembers([])
        return
      }
      try {
        const members = await fetchMembers(next.memberUids)
        setClanMembers(members)
      } catch {
        setClanMembers([])
      }
    })
    return () => unsub()
  }, [isFirebaseUser, progress.clanId, setProgress])

  // Subscribe to top clans
  useEffect(() => {
    if (!isFirebaseUser) {
      setTopClans([])
      return
    }
    const unsub = subscribeTopClans((list) => setTopClans(list))
    return () => unsub()
  }, [isFirebaseUser])

  // Sync user's xp to user doc + recompute clan total when xp changes (debounced)
  useEffect(() => {
    if (!isFirebaseUser || !clanMember) return
    const handle = window.setTimeout(async () => {
      try {
        await syncUserDoc({ ...clanMember, clanId: progress.clanId })
        if (progress.clanId && clan?.memberUids?.length) {
          await recomputeClanTotal(progress.clanId, clan.memberUids)
        }
      } catch {
        // Silenciosamente ignora — usuario sem permissoes Firestore ou offline.
      }
    }, 1500)
    return () => window.clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFirebaseUser, progress.xp, progress.clanId, clan?.memberUids?.join(',')])

  async function handleCreateClan(name: string, emoji: string) {
    if (!clanMember) return
    setClanError('')
    try {
      const created = await createClan(clanMember, name, emoji)
      setProgress((current) => ({ ...current, clanId: created.id }))
    } catch (err: any) {
      setClanError(err?.message || 'Nao deu para criar o cla.')
    }
  }

  async function handleJoinClan(code: string) {
    if (!clanMember) return
    setClanError('')
    try {
      const joined = await joinClanByCode(clanMember, code)
      setProgress((current) => ({ ...current, clanId: joined.id }))
    } catch (err: any) {
      setClanError(err?.message || 'Codigo invalido.')
    }
  }

  async function handleLeaveClan() {
    if (!clanMember || !progress.clanId) return
    const ok = window.confirm('Sair do cla? Voce pode entrar em outro depois.')
    if (!ok) return
    try {
      await leaveClan(clanMember.uid, progress.clanId)
    } catch {
      // ignore
    }
    setProgress((current) => ({ ...current, clanId: null }))
  }

  // Check mascot inactivity on app load
  useEffect(() => {
    if (today && progress.mascot.lastActiveDate) {
      const lastDate = new Date(progress.mascot.lastActiveDate)
      const todayDate = new Date(today)
      const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

      let adjustedDate = progress.mascot.lastActiveDate
      let freezesUsed = 0

      if (daysDiff > 1 && progress.freezeStreaks > 0) {
        freezesUsed = Math.min(daysDiff - 1, progress.freezeStreaks)
        if (freezesUsed >= daysDiff - 1) {
          const yesterday = new Date(todayDate)
          yesterday.setDate(yesterday.getDate() - 1)
          adjustedDate = yesterday.toISOString().slice(0, 10)
        }
      }

      const mascotToUpdate = { ...progress.mascot, lastActiveDate: adjustedDate }
      const updatedMascot = checkInactivity(mascotToUpdate, today)

      if (updatedMascot.stage !== progress.mascot.stage || updatedMascot.mood !== progress.mascot.mood || freezesUsed > 0) {
        setProgress((current) => ({ 
          ...current, 
          mascot: updatedMascot,
          freezeStreaks: Math.max(0, current.freezeStreaks - freezesUsed)
        }))
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today])

  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0]
  const unresolvedMistakes = openMistakes(progress)
  const userLevel = progressLevel(progress.xp)
  const completedCount = progress.completedLessons.length
  const dueCards = allPhrases.filter((phrase) => {
    const card = progress.cards[phrase.id]
    return !card || card.dueAt <= now
  })
  const activeCard = dueCards[0] ?? allPhrases[0]
  const totalMinutes = lessons.reduce((total, lesson) => {
    return progress.completedLessons.includes(lesson.id) ? total + lesson.minutes : total
  }, 0)
  const levelProgress = Math.round((completedCount / lessons.length) * 100)
  const currentUnit = units.find((unit) => unit.id === selectedLesson.unitId) ?? units[0]

  const quizPhrase = selectedLesson.phrases[lessonStep] ?? selectedLesson.phrases[0]
  const options = useMemo(() => {
    const answerPool = Array.from(new Set([
      ...allPhrases.map((item) => item.portuguese),
      ...quizOptions,
    ]))
    const distractors = quizOptions
      .concat(answerPool)
      .filter((option, index, list) => option && option !== quizPhrase.portuguese && list.indexOf(option) === index)
      .sort((left, right) => optionRank(`${selectedLesson.id}-${quizPhrase.id}`, left) - optionRank(`${selectedLesson.id}-${quizPhrase.id}`, right))
      .slice(0, 3)

    return [quizPhrase.portuguese, ...distractors]
      .slice(0, 4)
      .sort((left, right) => optionRank(selectedLesson.id, left) - optionRank(selectedLesson.id, right))
  }, [quizPhrase.id, quizPhrase.portuguese, selectedLesson.id])

  async function speak(text: string, rate = 0.78) {
    const cleanText = normalizeSpeechText(text)

    if (Capacitor.isNativePlatform()) {
      try {
        await MandarinTts.speak({ text: cleanText, rate })
        return
      } catch {
        // Falls back to browser speech synthesis when Android TTS is unavailable.
      }
    }

    if (!('speechSynthesis' in window)) {
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = 'zh-CN'
    utterance.rate = rate
    utterance.pitch = 1
    if (mandarinVoice) utterance.voice = mandarinVoice
    window.speechSynthesis.speak(utterance)
  }

  function completeLesson(lesson: Lesson) {
    setProgress((current) => {
      const dailyGoals = normalizeDailyGoals(current.dailyGoals, today)
      const alreadyCompleted = current.completedLessons.includes(lesson.id)
      const cards = { ...current.cards }
      lesson.phrases.forEach((phrase) => {
        cards[phrase.id] = cards[phrase.id] ?? {
          box: 0,
          dueAt: Date.now(),
          reviewed: 0,
          correct: 0,
        }
      })

      const nextBase = {
        ...current,
        xp: alreadyCompleted ? current.xp : current.xp + lesson.xp,
        coins: alreadyCompleted ? current.coins : current.coins + 12,
        streak: updateStudyStreak(current, today),
        lastStudyDate: today,
        completedLessons: alreadyCompleted
          ? current.completedLessons
          : [...current.completedLessons, lesson.id],
        cards,
        dailyGoals: {
          ...dailyGoals,
          lessons: alreadyCompleted ? dailyGoals.lessons : dailyGoals.lessons + 1,
        },
      }

      const updatedMascot = alreadyCompleted || hasOpenMistakes(nextBase)
        ? current.mascot
        : onLessonComplete(nextBase.mascot, today)

      if (!alreadyCompleted) playLevelUp()

      return {
        ...nextBase,
        mascot: updatedMascot,
      }
    })
    setQuizChoice('')
    setQuizLocked(false)
  }

  function startLesson(lessonId: string) {
    if (autoAdvanceTimer.current) window.clearTimeout(autoAdvanceTimer.current)
    setIsAutoAdvancing(false)
    setLessonStep(0)
    setQuizChoice('')
    setQuizLocked(false)
    setSelectedLessonId(lessonId)
    setIsLessonActive(true)
  }

  function advanceLessonFlow() {
    if (autoAdvanceTimer.current) window.clearTimeout(autoAdvanceTimer.current)
    setIsAutoAdvancing(false)

    if (lessonStep < selectedLesson.phrases.length - 1) {
      setLessonStep((current) => current + 1)
      setQuizChoice('')
      setQuizLocked(false)
      return
    }

    completeLesson(selectedLesson)
    setIsLessonActive(false)
    const nextLessonId = getNextLessonId(selectedLesson.id)
    if (nextLessonId) {
      setSelectedLessonId(nextLessonId)
      setLessonStep(0)
      setQuizChoice('')
      setQuizLocked(false)
      return
    }

    setPracticeMode('cards')
    setActiveTab('practice')
  }

  function flashToast(kind: 'good' | 'bad', text: string) {
    const key = Date.now()
    setCelebrate({ kind, text, key })
    window.setTimeout(() => {
      setCelebrate((current) => (current && current.key === key ? null : current))
    }, 1500)
  }

  function chooseQuizAnswer(choice: string) {
    if (quizLocked) return
    setQuizLocked(true)
    setQuizChoice(choice)
    const isRight = choice === quizPhrase.portuguese

    if (!isRight) {
      playWrong()
      flashToast('bad', `Resposta certa: ${quizPhrase.portuguese}`)
      setProgress((current) =>
        recordMistake(current, {
          type: 'lesson',
          itemId: quizPhrase.id,
          prompt: quizPhrase.hanzi,
          expected: quizPhrase.portuguese,
          answer: choice,
          helper: quizPhrase.note,
        }),
      )
    } else {
      playCorrect()
      flashToast('good', '好! Boa.')
    }

    speak(quizPhrase.hanzi)
    setIsAutoAdvancing(true)
    if (autoAdvanceTimer.current) window.clearTimeout(autoAdvanceTimer.current)
    autoAdvanceTimer.current = window.setTimeout(advanceLessonFlow, 1500)
  }

  function reviewCard(difficulty: Difficulty) {
    setProgress((current) => {
      const dailyGoals = normalizeDailyGoals(current.dailyGoals, today)
      const existing = current.cards[activeCard.id] ?? {
        box: 0,
        dueAt: Date.now(),
        reviewed: 0,
        correct: 0,
      }
      const nextBox =
        difficulty === 'hard' ? Math.max(0, existing.box - 1) : existing.box + (difficulty === 'easy' ? 2 : 1)

      const baseProgress: LearningProgress = {
        ...current,
        coins: current.coins + (difficulty === 'hard' ? 1 : difficulty === 'good' ? 3 : 5),
        xp: current.xp + (difficulty === 'hard' ? 2 : difficulty === 'good' ? 4 : 6),
        streak: updateStudyStreak(current, today),
        lastStudyDate: today,
        dailyGoals: {
          ...dailyGoals,
          cards: dailyGoals.cards + 1,
        },
        cards: {
          ...current.cards,
          [activeCard.id]: {
            box: nextBox,
            dueAt: nextDueDate(difficulty, existing.box),
            reviewed: existing.reviewed + 1,
            correct: existing.correct + (difficulty === 'hard' ? 0 : 1),
          },
        },
      }

      const progressWithMistakeState =
        difficulty === 'hard'
          ? recordMistake(baseProgress, {
              type: 'card',
              itemId: activeCard.id,
              prompt: activeCard.hanzi,
              expected: activeCard.portuguese,
              answer: 'Marcou como dificil',
              helper: activeCard.note,
            })
          : resolveMistake(baseProgress, 'card', activeCard.id)

      return {
        ...progressWithMistakeState,
        mascot: hasOpenMistakes(progressWithMistakeState)
          ? progressWithMistakeState.mascot
          : onCardReview(progressWithMistakeState.mascot, today),
      }
    })
    setIsCardFlipped(false)
  }

  function addClip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!clipUrl.trim()) return

    setProgress((current) => ({
      ...current,
      savedClips: [
        {
          id: crypto.randomUUID(),
          title: clipTitle.trim() || 'Clip de mandarim',
          url: clipUrl.trim(),
          theme: clipTheme.trim() || 'pronuncia',
          createdAt: Date.now(),
        },
        ...current.savedClips,
      ],
    }))
    setClipTitle('')
    setClipUrl('')
    setClipTheme('pronuncia')
  }

  function handleSpeechResult(expected: string, result: string) {
    const matched = isSpeechCloseEnough(result, expected)
    setTranscript(result)
    setLastSpeechExpected(expected)
    setLastSpeechMatched(matched)
    setMicState(matched ? 'success' : 'fail')
    setProgress((current) => {
      const dailyGoals = normalizeDailyGoals(current.dailyGoals, today)
      const baseProgress: LearningProgress = {
        ...current,
        speakingSessions: current.speakingSessions + 1,
        xp: current.xp + (matched ? 8 : 4),
        coins: current.coins + (matched ? 4 : 1),
        streak: updateStudyStreak(current, today),
        lastStudyDate: today,
        dailyGoals: {
          ...dailyGoals,
          speaking: dailyGoals.speaking + 1,
        },
      }
      const afterMistake = matched
        ? resolveMistake(baseProgress, 'speech', expected)
        : recordMistake(baseProgress, {
            type: 'speech',
            itemId: expected,
            prompt: expected,
            expected,
            answer: result,
            helper: 'Ouça de novo e tente acompanhar o ritmo da frase.',
          })
      if (!matched) return afterMistake

      // Map the spoken hanzi to a phrase id and unlock lesson tree progression.
      const matchedPhrase = allPhrases.find((p) => p.hanzi === expected)
      if (!matchedPhrase) return afterMistake

      const spoken = afterMistake.spokenPhrases.includes(matchedPhrase.id)
        ? afterMistake.spokenPhrases
        : [...afterMistake.spokenPhrases, matchedPhrase.id]

      // If every phrase of any lesson is now spoken, complete that lesson.
      let completed = afterMistake.completedLessons
      let bonusXp = 0
      let bonusCoins = 0
      let mascot = afterMistake.mascot
      const dailyLessons = { ...afterMistake.dailyGoals }
      lessons.forEach((lesson) => {
        if (completed.includes(lesson.id)) return
        const allSpoken = lesson.phrases.every((phrase) => spoken.includes(phrase.id))
        if (allSpoken) {
          completed = [...completed, lesson.id]
          bonusXp += lesson.xp
          bonusCoins += 12
          dailyLessons.lessons = (dailyLessons.lessons ?? 0) + 1
          if (!hasOpenMistakes(afterMistake)) mascot = onLessonComplete(mascot, today)
        }
      })

      return {
        ...afterMistake,
        spokenPhrases: spoken,
        completedLessons: completed,
        xp: afterMistake.xp + bonusXp,
        coins: afterMistake.coins + bonusCoins,
        dailyGoals: dailyLessons,
        mascot,
      }
    })
  }

  async function recordSpeech(expected: string) {
    setLastSpeechExpected(expected)
    setLastSpeechMatched(false)
    setTranscript('')
    setMicState('starting')

    if (Capacitor.isNativePlatform()) {
      try {
        setMicState('listening')
        setTranscript('Ouvindo... fale depois do sinal do Android.')
        const result = await MandarinSpeech.listen({
          language: 'zh-CN',
          prompt: 'Repita a frase em mandarim',
        })
        setMicState('processing')
        handleSpeechResult(expected, result.transcript)
        return
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Microfone nao retornou audio.'
        setTranscript(`${message} Tente de novo em um lugar silencioso.`)
        setMicState('error')
        return
      }
    }

    type SpeechRecognitionConstructor = new () => {
      lang: string
      interimResults: boolean
      maxAlternatives: number
      start: () => void
      onresult: (event: { results: { 0: { transcript: string } }[] }) => void
      onerror: (event?: { error?: string }) => void
      onend?: () => void
      onstart?: () => void
    }

    const browserWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor
      webkitSpeechRecognition?: SpeechRecognitionConstructor
    }
    const Recognition = browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition

    if (!Recognition) {
      setTranscript('Reconhecimento de voz indisponivel neste navegador. No Android, use o APK novo com microfone nativo.')
      setMicState('error')
      return
    }

    const recognition = new Recognition()
    recognition.lang = 'zh-CN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onstart = () => {
      setMicState('listening')
      setTranscript('Estamos captando o microfone... fale agora.')
    }
    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript
      setMicState('processing')
      handleSpeechResult(expected, result)
    }
    recognition.onerror = (event) => {
      setMicState('error')
      setTranscript(event?.error === 'not-allowed' ? 'Permita o microfone para gravar.' : 'Microfone nao retornou audio claro. Tente de novo.')
    }
    recognition.start()
  }

  function resetSpeechState() {
    setTranscript('')
    setMicState('idle')
    setLastSpeechExpected('')
    setLastSpeechMatched(false)
  }

  function handleChunkResult(chunk: Chunk, correct: boolean, answer: string) {
    if (correct) {
      playCorrect()
      flashToast('good', 'Bloco completo! +6 XP')
    } else {
      playWrong()
      flashToast('bad', `Resposta: ${chunk.blankAnswer}`)
    }
    setProgress((current) => {
      if (!correct) {
        return recordMistake(current, {
          type: 'chunk',
          itemId: chunk.id,
          prompt: chunk.hanzi,
          expected: chunk.blankAnswer,
          answer: answer || 'Resposta vazia',
          helper: chunk.note,
        })
      }
      const baseProgress = resolveMistake(current, 'chunk', chunk.id)
      const dailyGoals = normalizeDailyGoals(baseProgress.dailyGoals, today)
      return {
        ...baseProgress,
        xp: baseProgress.xp + 6,
        coins: baseProgress.coins + 4,
        streak: updateStudyStreak(baseProgress, today),
        lastStudyDate: today,
        dailyGoals: { ...dailyGoals, cards: dailyGoals.cards + 1 },
        mascot: hasOpenMistakes(baseProgress) ? baseProgress.mascot : onCardReview(baseProgress.mascot, today),
      }
    })
  }

  function resolveReviewMistake(mistake: LearningMistake) {
    setProgress((current) => {
      const baseProgress = resolveMistake(current, mistake.type, mistake.itemId)
      return {
        ...baseProgress,
        streak: updateStudyStreak(baseProgress, today),
        lastStudyDate: today,
        mascot: hasOpenMistakes(baseProgress) ? baseProgress.mascot : onCardReview(baseProgress.mascot, today),
      }
    })
  }

  function missReviewMistake(mistake: LearningMistake, answer: string) {
    setProgress((current) =>
      recordMistake(current, {
        type: mistake.type,
        itemId: mistake.itemId,
        prompt: mistake.prompt,
        expected: mistake.expected,
        answer,
        helper: mistake.helper,
      }),
    )
  }

  function completeSpeakingSession() {
    setProgress((current) => {
      const dailyGoals = normalizeDailyGoals(current.dailyGoals, today)
      return {
        ...current,
        speakingSessions: current.speakingSessions + 1,
        xp: current.xp + 10,
        coins: current.coins + 5,
        streak: updateStudyStreak(current, today),
        lastStudyDate: today,
        dailyGoals: {
          ...dailyGoals,
          speaking: dailyGoals.speaking + 1,
        },
      }
    })
  }

  function recordWritingMistake(character: WritingCharacter, reason: string) {
    playWrong()
    setProgress((current) =>
      recordMistake(current, {
        type: 'writing',
        itemId: character.id,
        prompt: character.character,
        expected: `${character.strokes} tracos com estrutura de ${character.character}`,
        answer: reason,
        helper: 'Refaca seguindo as zonas do hanzi e a ordem dos tracos.',
      }),
    )
  }

  function completeWritingPractice(character: WritingCharacter) {
    playCorrect()
    setProgress((current) => {
      const dailyGoals = normalizeDailyGoals(current.dailyGoals, today)
      const baseProgress = resolveMistake(
        {
          ...current,
          writingSessions: current.writingSessions + 1,
          xp: current.xp + 8,
          coins: current.coins + 5,
          streak: updateStudyStreak(current, today),
          lastStudyDate: today,
          dailyGoals: {
            ...dailyGoals,
            writing: dailyGoals.writing + 1,
          },
        },
        'writing',
        character.id,
      )

      return {
        ...baseProgress,
        mascot: hasOpenMistakes(baseProgress) ? baseProgress.mascot : onCardReview(baseProgress.mascot, today),
      }
    })
  }

  if (isAuthLoading) {
    return <div className="app-shell" style={{ display: 'grid', placeItems: 'center' }}>Carregando...</div>
  }

  if (!effectiveUser) {
    return (
      <div className="app-shell auth-shell">
        <form
          className="lesson-panel auth-panel"
          style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}
          onSubmit={async (e) => {
            e.preventDefault()
            setAuthError('')
            try {
              if (isRegistering) {
                await createUserWithEmailAndPassword(auth, authEmail, authPassword)
                // Verificacao de email desativada — entrada imediata.
              } else {
                await signInWithEmailAndPassword(auth, authEmail, authPassword)
              }
            } catch (err: any) {
              setAuthError(err.message || 'Erro na autenticação')
            }
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <LogoVertical dark={true} />
            <p style={{ margin: 0, color: '#796f66' }}>{isRegistering ? 'Crie sua conta' : 'Acesse sua conta'}</p>
          </div>
          
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            E-mail
            <input 
              type="email" 
              value={authEmail} 
              onChange={e => setAuthEmail(e.target.value)} 
              required 
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(80,65,54,0.14)', background: 'rgba(255,250,244,0.08)', color: '#f6f0e8' }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            Senha
            <input 
              type="password" 
              value={authPassword} 
              onChange={e => setAuthPassword(e.target.value)} 
              required 
              minLength={6}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(80,65,54,0.14)', background: 'rgba(255,250,244,0.08)', color: '#f6f0e8' }}
            />
          </label>
          
          {authError && <p style={{ color: '#b92732', margin: 0, fontSize: '14px' }}>{authError}</p>}
          
          <button type="submit" className="primary-action" style={{ marginTop: '10px' }}>
            {isRegistering ? 'Cadastrar' : 'Entrar'}
          </button>

          <button
            type="button"
            className="answer-option"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
            onClick={async () => {
              setAuthError('')
              // Capacitor (Android): use the native plugin. NO web fallback —
              // the WebView serves at https://localhost/ and a redirect/popup
              // would bounce to localhost and break.
              if (Capacitor.isNativePlatform()) {
                try {
                  const result = await FirebaseAuthentication.signInWithGoogle({ skipNativeAuth: true })
                  const idToken = result.credential?.idToken ?? null
                  const accessToken = result.credential?.accessToken ?? null
                  if (idToken || accessToken) {
                    const credential = GoogleAuthProvider.credential(idToken, accessToken)
                    await signInWithCredential(auth, credential)
                    return
                  }
                  setAuthError('Google nao retornou token. Tente convidado abaixo.')
                  return
                } catch (err) {
                  setAuthError(googleNativeErrorMessage(err))
                  return
                }
              }
              // Browser flow: popup only. Redirect bounces to authDomain and
              // tries to come back to localhost in dev, which is broken.
              const provider = new GoogleAuthProvider()
              provider.addScope('email')
              provider.addScope('profile')
              try {
                await signInWithPopup(auth, provider)
              } catch (err: any) {
                const code = err?.code || ''
                if (code.includes('operation-not-allowed') || code.includes('not-enabled')) {
                  setAuthError('O provedor Google nao esta habilitado no Firebase Console deste projeto. Use convidado por enquanto.')
                } else if (code.includes('popup-blocked')) {
                  setAuthError('Popup bloqueado pelo navegador. Libere popups para este site e tente de novo, ou entre como convidado.')
                } else if (code.includes('popup-closed') || code.includes('cancelled-popup-request')) {
                  setAuthError('Voce fechou o popup antes de terminar. Tente de novo.')
                } else {
                  setAuthError('Google indisponivel: ' + (err?.message || 'use convidado abaixo.'))
                }
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Entrar com Google
          </button>

          <button
            type="button"
            className="primary-action"
            style={{ background: '#21846b', boxShadow: '0 10px 22px rgba(33,132,107,0.22)' }}
            onClick={() => enterAsGuest(authEmail || undefined)}
          >
            Entrar como convidado (offline)
          </button>

          <p style={{ margin: 0, fontSize: '12px', color: '#a99c8f', textAlign: 'center' }}>
            Modo convidado salva todo seu progresso localmente, sem precisar de senha nem confirmar email.
          </p>

          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            style={{ background: 'transparent', border: 'none', color: '#a99c8f', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegistering ? 'Já tem conta? Entrar' : 'Não tem conta? Cadastrar'}
          </button>
        </form>
      </div>
    )
  }

  const headerMeta = getDirectionCHeaderMeta({
    tab: activeTab,
    currentLevel: currentUnit.level,
    levelProgress,
    dueCards: dueCards.length,
    unresolvedMistakes: unresolvedMistakes.length,
    userLevel,
    personalGoalLabel: progress.personalGoal.label,
    guestEmail,
    userEmail: effectiveUser?.email ?? null,
  })

  return (
    <main className="app-shell">
      {celebrate && (
        <div
          key={celebrate.key}
          className={celebrate.kind === 'bad' ? 'celebrate-toast bad' : 'celebrate-toast'}
          role="status"
          aria-live="polite"
        >
          {celebrate.text}
        </div>
      )}
      <aside className="side-nav" aria-label="Navegacao principal">
        <div className="brand-lockup">
          <div className="brand-mark brand-mark-logo" aria-hidden="true">
            <Logo1 dark={true} />
          </div>
        </div>

        <nav>
          {navItems.map((item) => {
            const Icon = item.icon
            const badge = item.id === 'errors' && unresolvedMistakes.length > 0 ? unresolvedMistakes.length : 0
            return (
              <button
                className={activeTab === item.id ? 'nav-button active' : 'nav-button'}
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                title={item.label}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {badge > 0 && <em className="nav-badge">{badge}</em>}
              </button>
            )
          })}
        </nav>

        <div className="nav-stats" aria-label="Resumo de progresso">
          <MascotWidget mascot={progress.mascot} compact={true} blockedByMistakes={unresolvedMistakes.length} />
          <Stat icon={Flame} label="Streak" value={`${progress.streak} dias`} />
          <Stat icon={Star} label="XP" value={`${progress.xp}`} />
          <Stat icon={Target} label="Moedas" value={`${progress.coins}`} />
          <Stat icon={CalendarCheck} label="Minutos" value={`${totalMinutes}`} />
        </div>
        <button
          className="nav-button"
          onClick={async () => {
            if (guestEmail) leaveGuest()
            try { await signOut(auth) } catch { /* ignore */ }
          }}
          style={{ marginTop: '16px', color: '#b92732', fontWeight: 800 }}
        >
          <span>Sair da conta</span>
        </button>
      </aside>

      <section className="workspace">
        <DirectionCHeader
          phaseTag={headerMeta.phaseTag}
          title={headerMeta.title}
          titleAccent={headerMeta.titleAccent}
          sub={headerMeta.sub}
          errors={headerMeta.errors}
          coins={progress.coins}
          streak={progress.streak}
          freeze={progress.freezeStreaks}
          utilitySlot={
            <>
              <div className="utility-quick-row">
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={activeTab === item.id ? 'utility-icon active' : 'utility-icon'}
                      onClick={() => setActiveTab(item.id)}
                      title={item.label}
                      aria-label={item.label}
                    >
                      <Icon size={18} />
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                className="utility-account"
                onClick={async () => {
                  if (effectiveUser) {
                    const ok = window.confirm('Sair da conta agora?')
                    if (!ok) return
                    if (guestEmail) leaveGuest()
                    try { await signOut(auth) } catch { /* ignore */ }
                  } else {
                    setActiveTab('profile')
                  }
                }}
                title={effectiveUser ? 'Sair da conta' : 'Entrar / criar conta'}
                aria-label={effectiveUser ? 'Sair da conta' : 'Entrar'}
              >
                {effectiveUser ? <LogOut size={16} /> : <LogIn size={16} />}
                <span>{effectiveUser ? (guestEmail ? 'Convidado' : (effectiveUser.email?.split('@')[0] || 'Conta')) : 'Entrar'}</span>
              </button>
            </>
          }
        />

        {activeTab === 'learn' && (
          <LearnView
            selectedLesson={selectedLesson}
            selectedLessonId={selectedLessonId}
            phrase={quizPhrase}
            stepIndex={lessonStep}
            stepTotal={selectedLesson.phrases.length}
            quizChoice={quizChoice}
            quizLocked={quizLocked}
            isAutoAdvancing={isAutoAdvancing}
            options={options}
            progress={progress}
            isLessonActive={isLessonActive}
            onSelectLesson={startLesson}
            onCloseLesson={() => setIsLessonActive(false)}
            onChoose={chooseQuizAnswer}
            onSpeak={speak}
            onAdvanceNow={advanceLessonFlow}
          />
        )}
        {activeTab === 'practice' && (
          <PracticeView
            mode={practiceMode}
            onModeChange={setPracticeMode}
            activeCard={activeCard}
            dueCount={dueCards.length}
            flipped={isCardFlipped}
            progress={progress}
            openMistakes={unresolvedMistakes}
            transcript={transcript}
            micState={micState}
            lastSpeechExpected={lastSpeechExpected}
            lastSpeechMatched={lastSpeechMatched}
            onFlip={() => setIsCardFlipped((current) => !current)}
            onReview={reviewCard}
            onChunkResult={handleChunkResult}
            onRecord={recordSpeech}
            onCompleteSpeakingSession={completeSpeakingSession}
            onResetSpeech={resetSpeechState}
            onPracticeMistake={recordWritingMistake}
            onCompleteWritingPractice={completeWritingPractice}
            onSpeak={speak}
          />
        )}
        {activeTab === 'clan' && (
          <ClanView
            isFirebaseUser={isFirebaseUser}
            clan={clan}
            members={clanMembers}
            topClans={topClans}
            currentUid={user?.uid ?? null}
            error={clanError}
            onCreate={handleCreateClan}
            onJoin={handleJoinClan}
            onLeave={handleLeaveClan}
          />
        )}
        {activeTab === 'errors' && (
          <ErrorsView
            mistakes={unresolvedMistakes}
            onResolve={resolveReviewMistake}
            onMiss={missReviewMistake}
            onSpeak={speak}
            onGoToWriting={() => {
              setPracticeMode('write')
              setActiveTab('practice')
            }}
          />
        )}
        {activeTab === 'clips' && (
          <ClipsView
            clipTitle={clipTitle}
            clipUrl={clipUrl}
            clipTheme={clipTheme}
            studyMoments={studyMoments}
            savedClips={progress.savedClips}
            onAddClip={addClip}
            onTitleChange={setClipTitle}
            onUrlChange={setClipUrl}
            onThemeChange={setClipTheme}
            onSpeak={speak}
          />
        )}
        {activeTab === 'mascot' && (
          <MascotWidget
            mascot={progress.mascot}
            blockedByMistakes={unresolvedMistakes.length}
            userLevel={userLevel}
            coins={progress.coins}
            switchCost={MASCOT_SWITCH_COST}
            onRename={(name) =>
              setProgress((current) => ({
                ...current,
                mascot: { ...current.mascot, name },
              }))
            }
            onSwitchPath={() =>
              setProgress((current) => {
                if (progressLevel(current.xp) < 10 || current.coins < MASCOT_SWITCH_COST) return current
                const nextPath = current.mascot.evolutionPath === 'dragon' ? 'peng' : 'dragon'
                return {
                  ...current,
                  coins: current.coins - MASCOT_SWITCH_COST,
                  mascot: {
                    ...current.mascot,
                    evolutionPath: nextPath,
                    accessories: getStageAccessories(current.mascot.stage, nextPath),
                    animation: 'evolve',
                    mood: 'excited',
                  },
                }
              })
            }
          />
        )}
        {activeTab === 'profile' && (
          <ProfileView
            progress={progress}
            totalMinutes={totalMinutes}
            openMistakeCount={unresolvedMistakes.length}
            userLevel={userLevel}
            userEmail={effectiveUser?.email ?? null}
            isGuest={Boolean(guestEmail)}
            onSignOut={async () => {
              if (guestEmail) leaveGuest()
              try { await signOut(auth) } catch { /* ignore */ }
            }}
            onWipeLocal={() => {
              const ok = window.confirm('Apagar todo o progresso local? Isso nao desloga sua conta.')
              if (!ok) return
              try { localStorage.removeItem('redtail-academy-progress-v1') } catch { /* ignore */ }
              window.location.reload()
            }}
            onDeleteAccount={async () => {
              if (guestEmail) {
                const ok = window.confirm('Sair do modo convidado e apagar progresso?')
                if (!ok) return
                try { localStorage.removeItem('redtail-academy-progress-v1') } catch { /* ignore */ }
                leaveGuest()
                return
              }
              const first = window.confirm('Excluir a conta e todo o progresso? Acao irreversivel.')
              if (!first) return
              const second = window.confirm('Tem certeza absoluta? Confirme novamente para apagar.')
              if (!second) return
              try {
                await deleteCurrentAccount()
              } catch (err: any) {
                if (err?.code === 'auth/requires-recent-login') {
                  try {
                    await deleteCurrentAccount({ kind: 'google' })
                  } catch (reauthErr: any) {
                    const password = window.prompt('Sessao antiga. Digite sua senha para confirmar a exclusao:') || ''
                    if (!password) return
                    try {
                      await deleteCurrentAccount({ kind: 'password', password })
                    } catch (finalErr: any) {
                      window.alert('Nao deu para excluir: ' + (finalErr?.message || reauthErr?.message || err.message))
                      return
                    }
                  }
                } else {
                  window.alert('Nao deu para excluir: ' + (err?.message || 'erro desconhecido'))
                  return
                }
              }
              try { localStorage.removeItem('redtail-academy-progress-v1') } catch { /* ignore */ }
              window.location.reload()
            }}
            onBuyFreeze={() =>
              setProgress((current) => {
                if (current.coins < FREEZE_COST) return current
                return {
                  ...current,
                  coins: current.coins - FREEZE_COST,
                  freezeStreaks: current.freezeStreaks + 1,
                }
              })
            }
            onGoalChange={(goalId) =>
              setProgress((current) => ({
                ...current,
                personalGoal: personalGoals.find((goal) => goal.id === goalId) ?? current.personalGoal,
              }))
            }
          />
        )}
      </section>

      <nav className="bottom-nav" aria-label="Navegacao inferior">
        {navItems.map((item) => {
          const Icon = item.icon
          const badge = item.id === 'errors' && unresolvedMistakes.length > 0 ? unresolvedMistakes.length : 0
          return (
            <button
              className={activeTab === item.id ? 'bottom-button active' : 'bottom-button'}
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              title={item.label}
            >
              <DirectionCNavButton
                Icon={Icon}
                label={item.label}
                active={activeTab === item.id}
                badge={badge}
                symbol={item.symbol}
              />
            </button>
          )
        })}
      </nav>
    </main>
  )
}

function getDirectionCHeaderMeta({
  tab,
  currentLevel,
  levelProgress,
  dueCards,
  unresolvedMistakes,
  userLevel,
  personalGoalLabel,
  guestEmail,
  userEmail,
}: {
  tab: Tab
  currentLevel: string
  levelProgress: number
  dueCards: number
  unresolvedMistakes: number
  userLevel: number
  personalGoalLabel: string
  guestEmail: string | null
  userEmail: string | null
}) {
  switch (tab) {
    case 'learn':
      return {
        phaseTag: `${currentLevel} · ${levelProgress}%`,
        title: 'Trilha do',
        titleAccent: 'Carpa-Dragao',
        sub: 'Suba o rio, fase a fase, ate saltar o Portao.',
        errors: unresolvedMistakes,
      }
    case 'practice':
      return {
        phaseTag: `Hoje · ${dueCards} cartoes`,
        title: 'Treino',
        titleAccent: 'diario',
        sub: 'Mantenha a sequencia. Domine os 4 tons.',
        errors: unresolvedMistakes,
      }
    case 'errors':
      return {
        phaseTag: `${unresolvedMistakes} pendentes`,
        title: 'Corrigir',
        titleAccent: 'erros',
        sub: 'Cada acerto remove um bloqueio do mascote.',
        errors: 0,
      }
    case 'clan':
      return {
        phaseTag: 'Liga semanal',
        title: 'Cla do',
        titleAccent: 'Dragao',
        sub: 'Junte-se a um grupo e some XP coletivo.',
        errors: 0,
      }
    case 'clips':
      return {
        phaseTag: 'Aba estudar',
        title: 'Estudar com',
        titleAccent: 'cultura',
        sub: 'Memes, musicas e contexto real para fixar frases.',
        errors: 0,
      }
    case 'mascot':
      return {
        phaseTag: `Nivel ${userLevel}`,
        title: 'Companheiro',
        titleAccent: 'Koi',
        sub: 'Cuide do mascote e libere a evolucao.',
        errors: 0,
      }
    case 'profile':
      return {
        phaseTag: guestEmail ? 'Convidado' : (userEmail ? 'Conta' : 'Perfil'),
        title: 'Carpa',
        titleAccent: 'na lagoa',
        sub: `Nivel ${userLevel} · meta de ${personalGoalLabel}`,
        errors: unresolvedMistakes,
      }
  }
}

function optionRank(seed: string, value: string) {
  return [...`${seed}-${value}`].reduce((total, char) => total + char.charCodeAt(0), 0) % 101
}

function getNextLessonId(currentLessonId: string) {
  const index = lessons.findIndex((lesson) => lesson.id === currentLessonId)
  return lessons[index + 1]?.id ?? ''
}

function normalizeSpeechText(text: string) {
  return text.replace(/[?？,，.。]/g, ' ').replace(/\s+/g, ' ').trim()
}

function isSpeechCloseEnough(result: string, expected: string) {
  const cleanResult = normalizeSpeechText(result)
  const cleanExpected = normalizeSpeechText(expected)
  if (!cleanResult || !cleanExpected) return false
  if (cleanResult.includes(cleanExpected) || cleanExpected.includes(cleanResult)) return true

  const expectedChars = Array.from(cleanExpected).filter((char) => /[\u3400-\u9fff]/u.test(char))
  const resultChars = new Set(Array.from(cleanResult).filter((char) => /[\u3400-\u9fff]/u.test(char)))
  const common = expectedChars.filter((char) => resultChars.has(char)).length
  return common >= Math.min(2, expectedChars.length)
}

function normalizeAnswer(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[?？,，.。!！]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function googleNativeErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || 'erro do plugin nativo')
  const lower = message.toLowerCase()
  const configHint = lower.includes('provider') || lower.includes('10') || lower.includes('developer') || lower.includes('configuration')

  if (configHint) {
    return 'Google nativo falhou: revise o Firebase Console, habilite Google Sign-In e troque o google-services.json por um real com SHA-1/SHA-256 do app. Erro: ' + message
  }

  return 'Google nativo falhou: ' + message + '. Use convidado por enquanto.'
}

function mistakeLabel(type: LearningMistake['type']) {
  const labels: Record<LearningMistake['type'], string> = {
    lesson: 'Licao',
    card: 'Cartao',
    writing: 'Escrita',
    speech: 'Fala',
    chunk: 'Chunk',
  }
  return labels[type]
}

function mistakeCorrectionOptions(mistake: LearningMistake) {
  const pool = (() => {
    switch (mistake.type) {
      case 'chunk':
        return chunks.map((chunk) => chunk.blankAnswer)
      case 'speech':
        return allPhrases.map((phrase) => phrase.hanzi)
      case 'writing':
        return writingCharacters.map((character) => `${character.strokes} tracos com estrutura de ${character.character}`)
      case 'card':
      case 'lesson':
      default:
        return allPhrases.map((phrase) => phrase.portuguese)
    }
  })()

  const distractors = pool
    .filter((option, index, list) => option && normalizeAnswer(option) !== normalizeAnswer(mistake.expected) && list.indexOf(option) === index)
    .sort((left, right) => optionRank(mistake.id, left) - optionRank(mistake.id, right))
    .slice(0, 3)

  return [mistake.expected, ...distractors]
    .filter((option, index, list) => option && list.indexOf(option) === index)
    .sort((left, right) => optionRank(`${mistake.id}-review`, left) - optionRank(`${mistake.id}-review`, right))
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Flame
  label: string
  value: string
}) {
  return (
    <div className="stat">
      <Icon size={18} />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  )
}

function RevealStudyTabs({
  pronunciation,
  literal,
  literalNote,
  compact = false,
}: {
  pronunciation?: string
  literal?: string
  literalNote?: string
  compact?: boolean
}) {
  const [active, setActive] = useState<'pronunciation' | 'literal' | null>(null)
  const hasPronunciation = Boolean(pronunciation)
  const hasLiteral = Boolean(literal)

  if (!hasPronunciation && !hasLiteral) return null

  const toggle = (next: 'pronunciation' | 'literal') => {
    setActive((current) => (current === next ? null : next))
  }

  return (
    <div className={compact ? 'reveal-study-tabs compact' : 'reveal-study-tabs'}>
      <div className="reveal-tab-row" role="tablist" aria-label="Detalhes opcionais">
        {hasPronunciation && (
          <button
            className={active === 'pronunciation' ? 'reveal-tab active' : 'reveal-tab'}
            type="button"
            onClick={() => toggle('pronunciation')}
            aria-expanded={active === 'pronunciation'}
          >
            {active === 'pronunciation' ? 'Ocultar pronuncia' : 'Mostrar pronuncia'}
          </button>
        )}
        {hasLiteral && (
          <button
            className={active === 'literal' ? 'reveal-tab active' : 'reveal-tab'}
            type="button"
            onClick={() => toggle('literal')}
            aria-expanded={active === 'literal'}
          >
            {active === 'literal' ? 'Ocultar literal' : 'Mostrar literal'}
          </button>
        )}
      </div>
      {active && (
        <div className="reveal-tab-panel" role="region">
          <span>{active === 'pronunciation' ? 'Pronuncia' : 'Literal'}</span>
          <strong>{active === 'pronunciation' ? pronunciation : literal}</strong>
          {active === 'literal' && literalNote ? <small>{literalNote}</small> : null}
        </div>
      )}
    </div>
  )
}

function ConnectionChips({ items }: { items?: string[] }) {
  if (!items?.length) return null

  return (
    <div className="connection-chips" aria-label="Conexoes de estudo">
      <span>Conexoes</span>
      {items.map((item) => (
        <small key={item}>{item}</small>
      ))}
    </div>
  )
}

function LearnView({
  selectedLesson,
  selectedLessonId,
  phrase,
  stepIndex,
  stepTotal,
  quizChoice,
  quizLocked,
  isAutoAdvancing,
  options,
  progress,
  isLessonActive,
  onSelectLesson,
  onCloseLesson,
  onChoose,
  onSpeak,
  onAdvanceNow,
}: {
  selectedLesson: Lesson
  selectedLessonId: string
  phrase: Phrase
  stepIndex: number
  stepTotal: number
  quizChoice: string
  quizLocked: boolean
  isAutoAdvancing: boolean
  options: string[]
  progress: LearningProgress
  isLessonActive: boolean
  onSelectLesson: (lessonId: string) => void
  onCloseLesson: () => void
  onChoose: (choice: string) => void
  onSpeak: (text: string) => void
  onAdvanceNow: () => void
}) {
  const isCorrect = quizChoice === phrase.portuguese
  const activeUnit = units.find((unit) => unit.id === selectedLesson.unitId) ?? units[0]
  const currentTabLabel = `${activeUnit.level} / ${stepIndex + 1} de ${stepTotal}`
  const unitDone = lessons
    .filter((lesson) => lesson.unitId === activeUnit.id)
    .filter((lesson) => progress.completedLessons.includes(lesson.id)).length
  const unitCompletion = (unitId: string) => {
    const unitLessons = lessons.filter((lesson) => lesson.unitId === unitId)
    const done = unitLessons.filter((lesson) => progress.completedLessons.includes(lesson.id)).length
    return Math.round((done / unitLessons.length) * 100)
  }

  if (isLessonActive) {
    return (
      <div className="lesson-active-layout">
        <section className="lesson-tab-shell" aria-label="Licao aberta">
          <div className="lesson-tab-strip">
            <button className="lesson-open-tab active" type="button">
              <BookOpen size={16} />
              <span>{selectedLesson.title}</span>
            </button>
            <button className="lesson-open-tab" type="button" onClick={onCloseLesson}>
              <Layers3 size={16} />
              <span>Trilha</span>
            </button>
          </div>
          <div className="lesson-tab-hero">
            <div className={`lesson-tab-mark ${activeUnit.accent}`}>{phrase.hanzi.slice(0, 1)}</div>
            <div>
              <p className="eyebrow">{currentTabLabel}</p>
              <h2>{selectedLesson.focus}</h2>
              <span>{activeUnit.title} - {unitDone}/{activeUnit.lessonIds.length} licoes fechadas</span>
            </div>
            <button className="icon-action" type="button" onClick={onCloseLesson} title="Sair da licao">
              <Undo2 size={18} />
            </button>
          </div>
        </section>

        <section className="lesson-panel lesson-panel-live">
          <div className="lesson-panel-header">
            <div>
              <p className="eyebrow">{selectedLesson.focus}</p>
              <h2>{selectedLesson.title}</h2>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span className="pill">{selectedLesson.minutes} min</span>
              <button className="icon-action" type="button" onClick={onCloseLesson} title="Sair da licao">
                <Undo2 size={18} />
              </button>
            </div>
          </div>

          <div className="lesson-progress">
            {selectedLesson.phrases.map((item, index) => (
              <span
                className={index <= stepIndex ? 'active' : ''}
                key={item.id}
                aria-label={`Etapa ${index + 1} de ${stepTotal}`}
              ></span>
            ))}
          </div>

          <div className="phrase-stage">
            <button className="sound-button" type="button" onClick={() => onSpeak(phrase.hanzi)} title="Ouvir frase">
              <Volume2 size={24} />
            </button>
            <div>
              <strong>{phrase.hanzi}</strong>
              <RevealStudyTabs
                key={phrase.id}
                pronunciation={phrase.pinyin}
                literal={phrase.literal}
                literalNote={phrase.note}
              />
            </div>
          </div>
          <ConnectionChips items={phraseConnectionMap[phrase.id]} />

          <div className="quiz-block">
            <p className="eyebrow">Escolha a traducao</p>
            <div className="answer-grid">
              {options.map((option) => {
                const isChosen = quizChoice === option
                const isAnswer = option === phrase.portuguese
                const reveal = quizLocked && isAnswer
                return (
                  <button
                    className={[
                      'answer-option',
                      isChosen ? 'selected' : '',
                      isChosen && isAnswer ? 'correct' : '',
                      isChosen && !isAnswer ? 'wrong' : '',
                      reveal && !isChosen ? 'reveal' : '',
                      quizLocked ? 'locked' : '',
                    ].filter(Boolean).join(' ')}
                    key={option}
                    type="button"
                    disabled={quizLocked}
                    onClick={() => onChoose(option)}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
            <p className={isCorrect ? 'feedback good' : quizLocked ? 'feedback error' : 'feedback'}>
              {isCorrect && isAutoAdvancing
                ? 'Correto. Avancando...'
                : quizLocked && !isCorrect
                ? `Errado. Voce treina esse na aba Erros. Resposta: ${phrase.portuguese}.`
                : quizChoice
                ? phrase.note
                : ' '}
            </p>
          </div>

          <div className="lesson-footer">
            <div>
              <span>Padrao de tons</span>
              <strong>{phrase.tonePattern}</strong>
            </div>
            <button className="primary-action" type="button" disabled={!quizLocked} onClick={onAdvanceNow}>
              {stepIndex + 1 === stepTotal ? 'Concluir' : 'Proxima'}
              <ChevronRight size={18} />
            </button>
          </div>
        </section>
      </div>
    )
  }

  const phaseHanzi = ['池', '河', '瀑', '門', '人', '書', '市', '天', '考']

  return (
    <div className="learn-grid c-screen">
      <section className="lesson-tree-panel c-trilha" aria-label="Trilha do Carpa-Dragao">
        {units.map((unit, unitIndex) => {
          const pct = unitCompletion(unit.id)
          return (
            <div className="c-fase" key={unit.id}>
              <div className="c-fase-heading">
                <div className={`c-fase-hanzi ${unit.accent}`}>{phaseHanzi[unitIndex] ?? '本'}</div>
                <div>
                  <p>Fase {unitIndex + 1}</p>
                  <h2>{unit.title}</h2>
                </div>
                <strong>{pct}%</strong>
              </div>
              <div className="c-node-list">
                {unit.lessonIds.map((lessonId) => {
                  const lesson = lessons.find((item) => item.id === lessonId)
                  if (!lesson) return null
                  const completed = progress.completedLessons.includes(lesson.id)
                  const active = selectedLessonId === lesson.id
                  return (
                    <button
                      className={[
                        'c-node',
                        active ? 'active' : '',
                        completed ? 'done' : '',
                        !active && !completed ? 'locked' : '',
                      ].filter(Boolean).join(' ')}
                      key={lesson.id}
                      type="button"
                      onClick={() => onSelectLesson(lesson.id)}
                    >
                      {active && <span className="c-now">Agora</span>}
                      <span className="c-node-icon">
                        {completed ? <CheckCircle2 size={18} /> : active ? <GraduationCap size={18} /> : <LockKeyhole size={16} />}
                      </span>
                      <span className="c-node-copy">
                        <strong>{lesson.title}</strong>
                        <small>+{lesson.xp} XP</small>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
        <div className="c-dragon-gate">
          <span>龍</span>
          <strong>Portao HSK1</strong>
          <small>Checkpoint libera quando voce fechar os mundos da trilha</small>
        </div>
      </section>
    </div>
  )
}

function PracticeView({
  mode,
  onModeChange,
  activeCard,
  dueCount,
  flipped,
  progress,
  openMistakes,
  transcript,
  micState,
  lastSpeechExpected,
  lastSpeechMatched,
  onFlip,
  onReview,
  onChunkResult,
  onRecord,
  onCompleteSpeakingSession,
  onResetSpeech,
  onPracticeMistake,
  onCompleteWritingPractice,
  onSpeak,
}: {
  mode: PracticeMode
  onModeChange: (mode: PracticeMode) => void
  activeCard: (typeof allPhrases)[number]
  dueCount: number
  flipped: boolean
  progress: LearningProgress
  openMistakes: LearningMistake[]
  transcript: string
  micState: MicState
  lastSpeechExpected: string
  lastSpeechMatched: boolean
  onFlip: () => void
  onReview: (difficulty: Difficulty) => void
  onChunkResult: (chunk: Chunk, correct: boolean, answer: string) => void
  onRecord: (expected: string) => void
  onCompleteSpeakingSession: () => void
  onResetSpeech: () => void
  onPracticeMistake: (character: WritingCharacter, reason: string) => void
  onCompleteWritingPractice: (character: WritingCharacter) => void
  onSpeak: (text: string) => void
}) {
  return (
    <div className="practice-layout">
      <section className="practice-switcher" aria-label="Modos de treino">
        {practiceModes.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className={mode === item.id ? 'active' : ''}
              type="button"
              onClick={() => onModeChange(item.id)}
            >
              <Icon size={18} />
              {item.label}
            </button>
          )
        })}
      </section>

      {mode === 'cards' && (
        <CardsView
          activeCard={activeCard}
          dueCount={dueCount}
          flipped={flipped}
          progress={progress}
          onFlip={onFlip}
          onReview={onReview}
          onSpeak={onSpeak}
        />
      )}

      {mode === 'chunks' && (
        <ChunksView
          progress={progress}
          onChunkResult={onChunkResult}
          onSpeak={onSpeak}
        />
      )}

      {mode === 'speak' && (
        <SpeakView
          transcript={transcript}
          micState={micState}
          lastExpected={lastSpeechExpected}
          lastMatched={lastSpeechMatched}
          onRecord={onRecord}
          onSpeak={onSpeak}
          onCompleteSession={onCompleteSpeakingSession}
          onReset={onResetSpeech}
        />
      )}
      {/** SpeakView consumes mic feedback: idle / starting / listening / processing / success / fail / error */}

      {mode === 'write' && (
        <WritingView
          onSpeak={onSpeak}
          openMistakes={openMistakes.filter((mistake) => mistake.type === 'writing')}
          onPracticeMistake={onPracticeMistake}
          onCompletePractice={onCompleteWritingPractice}
        />
      )}
    </div>
  )
}

function CardsView({
  activeCard,
  dueCount,
  flipped,
  progress,
  onFlip,
  onReview,
  onSpeak,
}: {
  activeCard: (typeof allPhrases)[number]
  dueCount: number
  flipped: boolean
  progress: LearningProgress
  onFlip: () => void
  onReview: (difficulty: Difficulty) => void
  onSpeak: (text: string) => void
}) {
  const reviewed = Object.values(progress.cards).reduce((total, card) => total + card.reviewed, 0)

  return (
    <div className="cards-layout">
      <section className="review-stage">
        <div className="review-header">
          <div>
            <p className="eyebrow">Fila de hoje</p>
            <h2>{dueCount} cartoes prontos</h2>
          </div>
          <button className="icon-action" type="button" onClick={() => onSpeak(activeCard.hanzi)} title="Ouvir">
            <Volume2 size={20} />
          </button>
        </div>

        <button className={flipped ? 'flashcard flipped' : 'flashcard'} type="button" onClick={onFlip}>
          <span>{flipped ? activeCard.portuguese : activeCard.hanzi}</span>
          <strong>{flipped ? activeCard.note : activeCard.lessonTitle}</strong>
          <small>{flipped ? 'Abra pronuncia/literal so se precisar.' : 'Toque para testar significado sem cola.'}</small>
        </button>
        <RevealStudyTabs
          key={activeCard.id}
          pronunciation={activeCard.pinyin}
          literal={activeCard.literal}
          literalNote={activeCard.note}
        />
        <ConnectionChips items={phraseConnectionMap[activeCard.id]} />

        <div className="review-actions">
          <button type="button" onClick={() => onReview('hard')}>
            <RotateCcw size={18} />
            Dificil
          </button>
          <button type="button" onClick={() => onReview('good')}>
            <CheckCircle2 size={18} />
            Bom
          </button>
          <button type="button" onClick={() => onReview('easy')}>
            <Sparkles size={18} />
            Facil
          </button>
        </div>
      </section>

      <section className="deck-panel">
        <div className="deck-header">
          <p className="eyebrow">Deck vivo</p>
          <h2>{allPhrases.length} blocos da trilha</h2>
          <span>{reviewed} revisoes feitas</span>
        </div>
        <div className="deck-list">
          {allPhrases.map((phrase) => {
            const card = progress.cards[phrase.id]
            return (
              <article className="deck-item" key={phrase.id}>
                <div>
                  <strong>{phrase.hanzi}</strong>
                  <span>{phrase.lessonTitle}</span>
                </div>
                <small>{card ? `Caixa ${card.box}` : 'Novo'}</small>
              </article>
            )
          })}
        </div>
      </section>

    </div>
  )
}

function ErrorsView({
  mistakes,
  onResolve,
  onMiss,
  onSpeak,
  onGoToWriting,
}: {
  mistakes: LearningMistake[]
  onResolve: (mistake: LearningMistake) => void
  onMiss: (mistake: LearningMistake, answer: string) => void
  onSpeak: (text: string) => void
  onGoToWriting: () => void
}) {
  const [feedback, setFeedback] = useState<Record<string, string>>({})

  if (mistakes.length === 0) {
    return (
      <div className="errors-layout">
        <section className="mistake-panel cleared">
          <div className="mistake-panel-header">
            <div>
              <p className="eyebrow">Erros</p>
              <h2>Fila limpa</h2>
            </div>
            <CheckCircle2 size={26} />
          </div>
          <p>Sem erros pendentes. O carpa esta livre para subir o rio.</p>
        </section>
      </div>
    )
  }

  function chooseMistakeOption(mistake: LearningMistake, answer: string) {
    if (normalizeAnswer(answer) === normalizeAnswer(mistake.expected)) {
      setFeedback((current) => ({ ...current, [mistake.id]: '' }))
      onResolve(mistake)
      return
    }
    onMiss(mistake, answer)
    setFeedback((current) => ({ ...current, [mistake.id]: 'Ainda nao. Veja a dica e tente outra vez.' }))
  }

  return (
    <div className="errors-layout">
      <section className="mistake-panel">
        <div className="mistake-panel-header">
          <div>
            <p className="eyebrow">Erros para corrigir</p>
            <h2>{mistakes.length} pendente{mistakes.length === 1 ? '' : 's'} bloqueando evolucao</h2>
          </div>
          <LockKeyhole size={26} />
        </div>
        <p style={{ margin: 0, color: '#a99c8f' }}>
          Voce so corrige aqui depois da licao. Cada acerto remove um bloqueio do mascote.
        </p>
      </section>

      <section className="errors-list">
        {mistakes.map((mistake) => {
          const isWriting = mistake.type === 'writing'
          const correctionOptions = mistakeCorrectionOptions(mistake)
          return (
            <article className="mistake-card-row" key={mistake.id}>
              <div className="mistake-card-head">
                <span>{mistakeLabel(mistake.type)}</span>
                <strong>{mistake.prompt}</strong>
                <small>{mistake.helper}</small>
                <div className="mistake-actions">
                  <button className="icon-action" type="button" onClick={() => onSpeak(mistake.prompt)} title="Ouvir">
                    <Volume2 size={18} />
                  </button>
                  <span>
                    {mistake.attempts} tentativa{mistake.attempts === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
              <div className="mistake-choice-area">
                <span>{isWriting ? 'Marque a estrutura correta' : 'Marque a resposta certa'}</span>
                <div className="mistake-choice-grid">
                  {correctionOptions.map((option) => (
                    <button
                      className="mistake-choice"
                      key={option}
                      type="button"
                      onClick={() => chooseMistakeOption(mistake, option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {isWriting ? (
                  <button className="primary-action mistake-writing-shortcut" type="button" onClick={onGoToWriting}>
                    <Brush size={18} />
                    Ir para Escrita
                  </button>
                ) : null}
              </div>
              <p className={feedback[mistake.id] ? 'feedback error' : 'feedback'}>
                {feedback[mistake.id] || ' '}
              </p>
            </article>
          )
        })}
      </section>
    </div>
  )
}

function ChunksView({
  progress,
  onChunkResult,
  onSpeak,
}: {
  progress: LearningProgress
  onChunkResult: (chunk: Chunk, correct: boolean, answer: string) => void
  onSpeak: (text: string) => void
}) {
  const [index, setIndex] = useState(0)
  const [stage, setStage] = useState<'study' | 'gap' | 'feedback'>('study')
  const [answer, setAnswer] = useState('')
  const [isDropReady, setIsDropReady] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)

  const chunk = chunks[index % chunks.length]
  const chunkOptions = useMemo(() => chunkBlockOptions(chunk), [chunk])
  const [blankBefore, blankAfter] = splitChunkBlank(chunk.blank)
  const openChunkMistakes = progress.mistakes.filter((mistake) => !mistake.resolvedAt && mistake.type === 'chunk').length

  function next() {
    setStage('study')
    setAnswer('')
    setIsDropReady(false)
    setIndex((current) => (current + 1) % chunks.length)
  }

  function placeBlock(block: string) {
    setAnswer(block)
    setIsDropReady(false)
  }

  function check() {
    if (!answer) return
    const correct = normalizeAnswer(answer) === normalizeAnswer(chunk.blankAnswer)
    setLastCorrect(correct)
    onChunkResult(chunk, correct, answer)
    setStage('feedback')
  }

  return (
    <div className="chunks-layout">
      <section className="chunk-stage">
        <div className="review-header">
          <div>
            <p className="eyebrow">Chunks (Influx)</p>
            <h2>Aprenda blocos prontos, nao palavras soltas.</h2>
          </div>
          <div className="hud-pill">
            <Boxes size={16} />
            <strong>{index + 1}</strong>
            <span>/ {chunks.length}</span>
          </div>
        </div>

        {stage === 'study' && (
          <div className="chunk-card">
            <button className="sound-button" type="button" onClick={() => onSpeak(chunk.hanzi)} title="Ouvir bloco">
              <Volume2 size={24} />
            </button>
            <p className="eyebrow">Ouca o bloco</p>
            <strong>{chunk.portuguese}</strong>
            <span>Toque no alto-falante para ouvir o mandarim. Voce vai construir a frase no proximo passo.</span>
            <button className="primary-action" type="button" onClick={() => setStage('gap')}>
              Construir bloco <ChevronRight size={18} />
            </button>
          </div>
        )}

        {stage === 'gap' && (
          <div className="chunk-card chunk-builder-card">
            <p className="eyebrow">Arraste o bloco que falta</p>
            <p className="chunk-prompt">{chunk.portuguese}</p>
            <button className="sound-button inline" type="button" onClick={() => onSpeak(chunk.hanzi)} title="Ouvir frase completa">
              <Volume2 size={18} /> ouvir frase
            </button>
            <div
              className={isDropReady ? 'chunk-drop-zone ready' : answer ? 'chunk-drop-zone filled' : 'chunk-drop-zone'}
              onDragOver={(event) => {
                event.preventDefault()
                setIsDropReady(true)
              }}
              onDragLeave={() => setIsDropReady(false)}
              onDrop={(event) => {
                event.preventDefault()
                const block = event.dataTransfer.getData('text/plain')
                if (block) placeBlock(block)
              }}
            >
              <span>{blankBefore}</span>
              <button className="chunk-slot" type="button" onClick={() => setAnswer('')}>
                {answer || '___'}
              </button>
              <span>{blankAfter}</span>
            </div>
            <div className="chunk-option-bank" aria-label="Opcoes de blocos">
              {chunkOptions.map((option) => (
                <button
                  className={answer === option ? 'chunk-option used' : 'chunk-option'}
                  draggable
                  key={option}
                  type="button"
                  onClick={() => placeBlock(option)}
                  onDragStart={(event) => event.dataTransfer.setData('text/plain', option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <button className="primary-action" type="button" disabled={!answer} onClick={check}>
              <CheckCircle2 size={18} /> Conferir
            </button>
          </div>
        )}

        {stage === 'feedback' && (
          <div className="chunk-card">
            <p className={lastCorrect ? 'feedback good' : 'feedback error'}>
              {lastCorrect
                ? 'Bloco internalizado. +6 XP / +4 moedas.'
                : `Errado. Resposta: ${chunk.blankAnswer}. Esse chunk vai pra aba Erros.`}
            </p>
            <strong>{chunk.hanzi}</strong>
            <p>{chunk.portuguese}</p>
            <RevealStudyTabs
              key={chunk.id}
              pronunciation={chunk.pinyin}
              literal={chunk.gloss}
              literalNote={chunk.note}
            />
            <ConnectionChips items={chunkConnectionMap[chunk.id]} />
            <em>{chunk.note}</em>
            <button className="primary-action" type="button" onClick={next}>
              Proximo bloco <ChevronRight size={18} />
            </button>
          </div>
        )}
      </section>

      <aside className="chunk-side">
        <div className="deck-header">
          <p className="eyebrow">Erros de chunks</p>
          <h2>{openChunkMistakes} bloco{openChunkMistakes === 1 ? '' : 's'} para revisar</h2>
          <span>Esses voltam quando voce abrir a aba Erros.</span>
        </div>
        <div className="deck-list">
          {chunks.map((item, itemIndex) => (
            <button
              className={itemIndex === index ? 'deck-item active' : 'deck-item'}
              key={item.id}
              type="button"
              onClick={() => {
                setIndex(itemIndex)
                setStage('study')
                setAnswer('')
              }}
            >
              <div>
                <strong>Bloco {itemIndex + 1}</strong>
                <span>{units.find((unit) => unit.id === item.unitId)?.title ?? 'Trilha'}</span>
              </div>
              <small>{itemIndex === index ? 'Atual' : 'Escolher'}</small>
            </button>
          ))}
        </div>
      </aside>
    </div>
  )
}

function splitChunkBlank(blank: string) {
  const [before = '', after = ''] = blank.split('___')
  return [before, after]
}

function chunkBlockOptions(active: Chunk) {
  const distractors = chunks
    .map((chunk) => chunk.blankAnswer)
    .filter((block, index, all) => block !== active.blankAnswer && all.indexOf(block) === index)
    .sort((left, right) => optionRank(active.id, left) - optionRank(active.id, right))
    .slice(0, 3)

  return [active.blankAnswer, ...distractors]
    .filter((block, index, all) => all.indexOf(block) === index)
    .sort((left, right) => optionRank(`${active.id}-blocks`, left) - optionRank(`${active.id}-blocks`, right))
}

function SpeakView({
  transcript,
  micState,
  lastExpected,
  lastMatched,
  onRecord,
  onSpeak,
  onCompleteSession,
  onReset,
}: {
  transcript: string
  micState: MicState
  lastExpected: string
  lastMatched: boolean
  onRecord: (expected: string) => void
  onSpeak: (text: string) => void
  onCompleteSession: () => void
  onReset: () => void
}) {
  const shadowPhrase = '我要一杯水'
  const isListening = micState === 'listening' || micState === 'starting'
  const isBusy = isListening || micState === 'processing'
  const showFeedback = micState === 'success' || micState === 'fail' || micState === 'error'

  const micLabel = (() => {
    switch (micState) {
      case 'starting': return 'Preparando microfone...'
      case 'listening': return 'Captando voz... fale agora!'
      case 'processing': return 'Analisando o que voce disse...'
      case 'success': return 'Boa! Reconhecemos o que voce falou.'
      case 'fail': return 'Quase la — nao bateu com a frase. Tente de novo.'
      case 'error': return 'Microfone nao retornou audio. Permita acesso e tente novamente.'
      default: return 'Toque em Gravar para comecar a captar.'
    }
  })()

  return (
    <div className="speak-grid">
      <section className="tone-board">
        <div className="tone-header">
          <div>
            <p className="eyebrow">Laboratorio de tons</p>
            <h2>Escute, repita, compare.</h2>
          </div>
          <ShieldCheck size={26} />
        </div>
        <div className={`tone-wave ${isListening ? 'tone-wave-active' : ''}`} aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="tone-drills">
          {toneDrills.map((drill) => (
            <article className="tone-card" key={drill.id}>
              <div>
                <strong>{drill.hanzi}</strong>
                <RevealStudyTabs pronunciation={drill.pinyin} compact={true} />
                <small>{drill.focus}</small>
              </div>
              <div className="tone-card-actions">
                <button className="icon-action" type="button" onClick={() => onSpeak(drill.hanzi)} title="Ouvir">
                  <Play size={18} />
                </button>
                <button
                  className="icon-action"
                  type="button"
                  disabled={isBusy}
                  onClick={() => onRecord(drill.hanzi)}
                  title={`Gravar ${drill.hanzi}`}
                >
                  <Mic size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="shadow-panel">
        <p className="eyebrow">Shadowing</p>
        <h2>{shadowPhrase}</h2>
        <span>wǒ yào yì bēi shuǐ</span>
        <p>eu quero um copo de agua</p>

        <div className={`mic-status mic-${micState}`} role="status" aria-live="polite">
          <span className="mic-pulse" aria-hidden="true">
            <Mic size={18} />
          </span>
          <span>{micLabel}</span>
        </div>

        <div className="shadow-actions">
          <button type="button" onClick={() => onSpeak(shadowPhrase)} disabled={isBusy}>
            <Volume2 size={18} />
            Ouvir
          </button>
          <button
            type="button"
            className={isListening ? 'mic-button mic-button-listening' : 'mic-button'}
            onClick={() => onRecord(shadowPhrase)}
            disabled={isBusy}
          >
            <Mic size={18} />
            {isListening ? 'Captando...' : 'Gravar'}
          </button>
          <button type="button" onClick={onCompleteSession} disabled={isBusy}>
            <Star size={18} />
            Marcar +5
          </button>
        </div>

        <div className={`transcript-box transcript-${micState}`}>
          <span>Resultado {lastExpected ? `(esperado: ${lastExpected})` : ''}</span>
          <strong>{transcript || 'Aguardando voz'}</strong>
          {showFeedback && (
            <div className="mic-result-actions">
              {lastMatched ? (
                <button type="button" onClick={onReset} className="primary-action mic-next">
                  <CheckCircle2 size={16} />
                  Continuar treinando
                </button>
              ) : (
                <>
                  <button type="button" onClick={() => lastExpected && onRecord(lastExpected)} disabled={!lastExpected}>
                    <Mic size={16} />
                    Tentar de novo
                  </button>
                  <button type="button" onClick={() => lastExpected && onSpeak(lastExpected)} disabled={!lastExpected}>
                    <Volume2 size={16} />
                    Ouvir referencia
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function WritingView({
  onSpeak,
  openMistakes,
  onPracticeMistake,
  onCompletePractice,
}: {
  onSpeak: (text: string) => void
  openMistakes: LearningMistake[]
  onPracticeMistake: (character: WritingCharacter, reason: string) => void
  onCompletePractice: (character: WritingCharacter) => void
}) {
  const [selectedId, setSelectedId] = useState(writingCharacters[0].id)
  const [strokesDrawn, setStrokesDrawn] = useState(0)
  const [drawnStrokes, setDrawnStrokes] = useState<DrawPoint[][]>([])
  const [canvasSize, setCanvasSize] = useState({ width: 430, height: 430 })
  const [validationMessage, setValidationMessage] = useState('')
  const [practiceDone, setPracticeDone] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDrawing = useRef(false)
  const activeStroke = useRef<DrawPoint[]>([])
  const selectedCharacter =
    writingCharacters.find((character) => character.id === selectedId) ?? writingCharacters[0]
  const selectedOpenMistake = openMistakes.find((mistake) => mistake.itemId === selectedCharacter.id)

  function setupCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const ratio = window.devicePixelRatio || 1
    const nextWidth = Math.max(1, Math.round(rect.width * ratio))
    const nextHeight = Math.max(1, Math.round(rect.height * ratio))

    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
      canvas.width = nextWidth
      canvas.height = nextHeight
    }
    setCanvasSize({ width: rect.width, height: rect.height })

    const context = canvas.getContext('2d')
    if (!context) return null

    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    context.lineWidth = 10
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = '#241f23'
    return { context, rect }
  }

  function pointFromEvent(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  function startDrawing(event: ReactPointerEvent<HTMLCanvasElement>) {
    const drawing = setupCanvas()
    if (!drawing) return

    const point = pointFromEvent(event)
    event.currentTarget.setPointerCapture(event.pointerId)
    isDrawing.current = true
    drawing.context.beginPath()
    drawing.context.moveTo(point.x, point.y)
    activeStroke.current = [point]
    setStrokesDrawn((current) => current + 1)
    setPracticeDone(false)
    setValidationMessage('')
  }

  function draw(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!isDrawing.current) return
    const drawing = setupCanvas()
    if (!drawing) return

    const point = pointFromEvent(event)
    drawing.context.lineTo(point.x, point.y)
    drawing.context.stroke()
    const lastPoint = activeStroke.current[activeStroke.current.length - 1]
    if (!lastPoint || distanceBetween(lastPoint, point) > 4) {
      activeStroke.current.push(point)
    }
  }

  function stopDrawing() {
    if (activeStroke.current.length > 1) {
      const stroke = activeStroke.current
      setDrawnStrokes((current) => [...current, stroke])
    }
    activeStroke.current = []
    isDrawing.current = false
  }

  function resetCanvas() {
    const drawing = setupCanvas()
    if (drawing) {
      drawing.context.clearRect(0, 0, drawing.rect.width, drawing.rect.height)
    }
    setStrokesDrawn(0)
    setDrawnStrokes([])
    setValidationMessage('')
    setPracticeDone(false)
  }

  function completeWritingPractice(character: WritingCharacter) {
    if (!validation.ok) {
      const reason = validation.message
      setValidationMessage(reason)
      onPracticeMistake(character, reason)
      return
    }
    setPracticeDone(true)
    setValidationMessage('Hanzi validado e erro removido da fila, se existia.')
    onCompletePractice(character)
    onSpeak(character.character)
  }

  const validation = validateWritingAttempt(selectedCharacter, drawnStrokes, strokesDrawn, canvasSize)

  return (
    <div className="writing-layout">
      <section className="writing-board">
        <div className="writing-header">
          <div>
            <p className="eyebrow">Treino de escrita</p>
            <h2>Trace o hanzi no grid.</h2>
            {selectedOpenMistake && <span className="writing-error-badge">Erro pendente</span>}
          </div>
          <button className="icon-action" type="button" onClick={() => onSpeak(selectedCharacter.character)} title="Ouvir">
            <Volume2 size={20} />
          </button>
        </div>

        <div className="writing-canvas-wrap">
          <div className="writing-grid" aria-hidden="true">
            <span>{selectedCharacter.character}</span>
          </div>
          <canvas
            key={selectedCharacter.id}
            aria-label={`Area para desenhar ${selectedCharacter.character}`}
            className="writing-canvas"
            ref={canvasRef}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
            onPointerLeave={stopDrawing}
          />
        </div>

        <div className="writing-controls">
          <button type="button" onClick={resetCanvas}>
            <Eraser size={18} />
            Limpar
          </button>
          <button type="button" onClick={resetCanvas}>
            <Undo2 size={18} />
            Repetir
          </button>
          <button
            className="primary-action"
            type="button"
            disabled={strokesDrawn === 0}
            onClick={() => completeWritingPractice(selectedCharacter)}
          >
            <CheckCircle2 size={18} />
            Validar
          </button>
        </div>
        <p className={practiceDone ? 'feedback good' : (strokesDrawn > 0 && !validation.ok ? 'feedback error' : 'feedback')}>
          {practiceDone
            ? `Treino salvo. Voce fez ${strokesDrawn} tracos.`
            : (strokesDrawn > 0 && !validation.ok
              ? (validationMessage || validation.message)
              : `Meta: ${selectedCharacter.strokes} tracos principais e forma dentro das zonas do hanzi.`)}
        </p>
      </section>

      <section className="stroke-panel">
        <div className="character-picker">
          {writingCharacters.map((character) => (
            <button
              className={character.id === selectedCharacter.id ? 'active' : ''}
              key={character.id}
              type="button"
              onClick={() => {
                setSelectedId(character.id)
                setStrokesDrawn(0)
                setDrawnStrokes([])
                setValidationMessage('')
                setPracticeDone(false)
              }}
            >
              <strong>{character.character}</strong>
              <span>{character.meaning}</span>
            </button>
          ))}
        </div>

        <article className="stroke-card">
          <p className="eyebrow">{selectedCharacter.meaning}</p>
          <h2>{selectedCharacter.character}</h2>
          <RevealStudyTabs key={selectedCharacter.id} pronunciation={selectedCharacter.pinyin} compact={true} />
          <div className="stroke-meta">
            <span>{selectedCharacter.strokes} tracos</span>
            <span>radical {selectedCharacter.radical}</span>
          </div>
          <ol>
            {selectedCharacter.strokeOrder.map((stroke) => (
              <li key={stroke}>{stroke}</li>
            ))}
          </ol>
          <div className="word-chips">
            {selectedCharacter.words.map((word) => (
              <button key={word} type="button" onClick={() => onSpeak(word)}>
                {word}
              </button>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}

function validateWritingAttempt(
  character: WritingCharacter,
  strokes: DrawPoint[][],
  strokesDrawn: number,
  canvasSize: { width: number; height: number },
) {
  if (strokesDrawn <= 0) {
    return { ok: false, message: `Meta: ${character.strokes} tracos principais.` }
  }

  // Stroke count must match the real character (±0 — no slack).
  if (strokesDrawn !== character.strokes) {
    return {
      ok: false,
      message: strokesDrawn < character.strokes
        ? `Faltam tracos. Voce fez ${strokesDrawn}, o caractere tem ${character.strokes}.`
        : `Tracos a mais. Voce fez ${strokesDrawn}, o caractere tem ${character.strokes}. Limpe e refaca.`,
    }
  }

  const points = strokes.flat()
  if (points.length < Math.max(20, character.strokes * 8)) {
    return { ok: false, message: 'Tracos curtos demais. Refaca cobrindo a sombra do hanzi.' }
  }

  const bounds = getPointBounds(points)
  const widthRatio = bounds.width / Math.max(1, canvasSize.width)
  const heightRatio = bounds.height / Math.max(1, canvasSize.height)
  const pathLength = strokes.reduce((total, stroke) => total + getPathLength(stroke), 0)
  const template = writingValidationTemplates[character.id] ?? {
    cells: ['1-0', '0-1', '1-1', '2-1', '1-2'],
    minWidthRatio: 0.34,
    minHeightRatio: 0.36,
    minPathLength: WRITING_MIN_PATH,
  }

  if (widthRatio < template.minWidthRatio * 0.95 || heightRatio < template.minHeightRatio * 0.95) {
    return { ok: false, message: 'A forma ficou pequena. Ocupe quase todo o grid, igual ao hanzi guia.' }
  }

  if (pathLength < template.minPathLength * 0.95) {
    return { ok: false, message: 'O caminho ficou curto demais. Cubra a sombra do caractere completo.' }
  }

  const touchedFineCells = new Set(
    points.map((point) => {
      const col = Math.min(3, Math.max(0, Math.floor((point.x / Math.max(1, canvasSize.width)) * 4)))
      const row = Math.min(3, Math.max(0, Math.floor((point.y / Math.max(1, canvasSize.height)) * 4)))
      return `${col}-${row}`
    }),
  )
  if (touchedFineCells.size < Math.max(6, Math.ceil(character.strokes * 0.85))) {
    return { ok: false, message: 'A forma cobriu poucas areas. Espalhe o traco seguindo a sombra do hanzi.' }
  }

  // Anti-scribble: if all points fit in 1-2 fine cells, reject (concentrated mess).
  const pointsPerCell = points.length / Math.max(1, touchedFineCells.size)
  if (touchedFineCells.size <= 3 && pointsPerCell > 40) {
    return { ok: false, message: 'Parece um rabisco numa area so. Refaca seguindo o tracado.' }
  }

  const touchedCells = new Set(
    points.map((point) => {
      const col = Math.min(2, Math.max(0, Math.floor((point.x / Math.max(1, canvasSize.width)) * 3)))
      const row = Math.min(2, Math.max(0, Math.floor((point.y / Math.max(1, canvasSize.height)) * 3)))
      return `${col}-${row}`
    }),
  )
  const hitCells = template.cells.filter((cell) => touchedCells.has(cell)).length
  // Almost all template cells must be hit — this is what enforces shape.
  const neededCells = Math.max(template.cells.length - 1, Math.ceil(template.cells.length * 0.92))

  if (hitCells < neededCells) {
    return { ok: false, message: 'A forma nao bateu com a estrutura do hanzi. Siga a sombra como guia.' }
  }

  return { ok: true, message: 'Hanzi validado.' }
}

function getPointBounds(points: DrawPoint[]) {
  const xs = points.map((point) => point.x)
  const ys = points.map((point) => point.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

function getPathLength(points: DrawPoint[]) {
  return points.reduce((total, point, index) => {
    if (index === 0) return total
    return total + distanceBetween(points[index - 1], point)
  }, 0)
}

function distanceBetween(left: DrawPoint, right: DrawPoint) {
  return Math.hypot(left.x - right.x, left.y - right.y)
}

function ClanView({
  isFirebaseUser,
  clan,
  members,
  topClans,
  currentUid,
  error,
  onCreate,
  onJoin,
  onLeave,
}: {
  isFirebaseUser: boolean
  clan: ClanDoc | null
  members: ClanMember[]
  topClans: ClanDoc[]
  currentUid: string | null
  error: string
  onCreate: (name: string, emoji: string) => void | Promise<void>
  onJoin: (code: string) => void | Promise<void>
  onLeave: () => void | Promise<void>
}) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🐉')
  const [code, setCode] = useState('')

  if (!isFirebaseUser) {
    return (
      <div className="clan-layout">
        <section className="clan-empty">
          <Users size={28} />
          <h2>Cla precisa de conta real</h2>
          <p>
            Modo convidado nao entra em cla. Crie ou entre numa conta Google ou e-mail/senha pelo botao Sair / Entrar
            no perfil para juntar tres aprendizes e batalhar no ranking.
          </p>
        </section>
      </div>
    )
  }

  if (!clan) {
    return (
      <div className="clan-layout">
        <section className="clan-card">
          <div className="ranking-header">
            <p className="eyebrow">Forme um cla</p>
            <h2>Tres carpas saltam mais alto que um.</h2>
          </div>
          <p style={{ color: '#cdbfae', margin: 0 }}>
            Grupo de ate {CLAN_MAX_MEMBERS} pessoas. Cada XP individual entra com bonus de +25% no total do grupo,
            que disputa o ranking semanal contra outros clas.
          </p>

          <div className="clan-form">
            <p className="eyebrow">Criar novo cla</p>
            <div className="clan-form-row">
              <input
                value={emoji}
                onChange={(event) => setEmoji(event.target.value)}
                placeholder="🐉"
                maxLength={4}
                className="clan-emoji-input"
              />
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nome do cla (ate 24 letras)"
                maxLength={24}
              />
            </div>
            <button className="primary-action" type="button" onClick={() => onCreate(name, emoji)}>
              <Plus size={18} /> Fundar cla
            </button>
          </div>

          <div className="clan-form">
            <p className="eyebrow">Entrar com codigo</p>
            <div className="clan-form-row">
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="ex: D7K2QP"
                maxLength={8}
              />
              <button className="primary-action" type="button" onClick={() => onJoin(code)}>
                <LogIn size={18} /> Entrar
              </button>
            </div>
          </div>

          {error && <p className="feedback error" style={{ margin: 0 }}>{error}</p>}
        </section>

        <ClanRankingPanel topClans={topClans} currentUid={currentUid} />
      </div>
    )
  }

  return (
    <div className="clan-layout">
      <section className="clan-card">
        <div className="clan-banner">
          <span className="clan-banner-emoji" aria-hidden="true">{clan.emoji}</span>
          <div>
            <p className="eyebrow">Cla do Dragao</p>
            <h2>{clan.name}</h2>
            <small>codigo: {clan.code}</small>
          </div>
          <div className="hud-pill hud-coins">
            <Swords size={16} />
            <strong>{clan.totalXp}</strong>
            <span>XP grupo</span>
          </div>
        </div>

        <div className="clan-members">
          <p className="eyebrow">Membros ({members.length}/{CLAN_MAX_MEMBERS})</p>
          {members.map((member) => (
            <article key={member.uid} className={`clan-member${member.uid === currentUid ? ' current' : ''}`}>
              <div>
                <strong>{member.displayName}</strong>
                <small>{member.email}</small>
              </div>
              <div className="clan-member-xp">
                <span>{member.xp} XP</span>
                <small>+{clanXpBonus(member.xp)} bonus</small>
              </div>
            </article>
          ))}
          {members.length < CLAN_MAX_MEMBERS && (
            <p className="feedback" style={{ margin: 0, color: '#a99c8f' }}>
              Compartilhe o codigo <strong>{clan.code}</strong> com mais {CLAN_MAX_MEMBERS - members.length} aprendiz
              {CLAN_MAX_MEMBERS - members.length === 1 ? '' : 'es'}.
            </p>
          )}
        </div>

        <div className="clan-mascot">
          <Fish size={28} />
          <div>
            <p className="eyebrow">RedTail coletivo</p>
            <strong>{clan.mascotName || 'Dragao do cla'}</strong>
            <small>Cresce junto com o XP total. Quanto mais cedo o trio acerta, mais alto o cla salta.</small>
          </div>
        </div>

        <button className="account-button danger" type="button" onClick={() => onLeave()}>
          <LogOut size={18} /> Sair do cla
        </button>
        {error && <p className="feedback error" style={{ margin: 0 }}>{error}</p>}
      </section>

      <ClanRankingPanel topClans={topClans} currentUid={currentUid} />
    </div>
  )
}

function ClanRankingPanel({
  topClans,
  currentUid,
}: {
  topClans: ClanDoc[]
  currentUid: string | null
}) {
  return (
    <section className="clan-ranking">
      <div className="ranking-header">
        <p className="eyebrow">Ranking de clas</p>
        <h2>Top {topClans.length || 5} grupos da semana</h2>
      </div>
      {topClans.length === 0 ? (
        <p style={{ color: '#a99c8f', margin: 0 }}>
          Nenhum cla na briga ainda. Forme o seu e seja o primeiro do ranking.
        </p>
      ) : (
        <div className="ranking-list">
          {topClans.map((entry, index) => {
            const isMine = currentUid && entry.memberUids.includes(currentUid)
            return (
              <div className={`ranking-item${isMine ? ' current' : ''}`} key={entry.id}>
                <span className="ranking-pos">{index + 1}</span>
                <span className="ranking-name">
                  {entry.emoji} {entry.name}
                </span>
                <span className="ranking-xp">{entry.totalXp} XP</span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function ClipsView({
  clipTitle,
  clipUrl,
  clipTheme,
  studyMoments,
  savedClips,
  onAddClip,
  onTitleChange,
  onUrlChange,
  onThemeChange,
  onSpeak,
}: {
  clipTitle: string
  clipUrl: string
  clipTheme: string
  studyMoments: StudyMoment[]
  savedClips: LearningProgress['savedClips']
  onAddClip: (event: FormEvent<HTMLFormElement>) => void
  onTitleChange: (value: string) => void
  onUrlChange: (value: string) => void
  onThemeChange: (value: string) => void
  onSpeak: (text: string) => void
}) {
  const heroMoment = studyMoments[0]
  const moreMoments = studyMoments.slice(1)

  return (
    <div className="clips-layout c-screen c-cultura">
      <section className="study-moments c-culture-feed">
        <div className="c-chip-row" aria-label="Filtros de cultura">
          {['Tudo', 'Memes', 'Musica', 'Historico', 'Viral'].map((item, index) => (
            <span className={index === 0 ? 'active' : ''} key={item}>{item}</span>
          ))}
        </div>

        {heroMoment && (
          <article className="c-culture-hero">
            <div className="c-culture-watermark">笑</div>
            <div className="c-hero-tags">
              <span>{heroMoment.source}</span>
              <small>{heroMoment.level}</small>
            </div>
            <h2>{heroMoment.title}</h2>
            <button type="button" onClick={() => onSpeak(heroMoment.phrase)} title="Ouvir momento">
              <strong>{heroMoment.phrase}</strong>
              <em>Ouvir antes de revelar</em>
            </button>
            <RevealStudyTabs
              pronunciation={heroMoment.pinyin}
              literal={heroMoment.meaning}
              literalNote={heroMoment.note}
              compact={true}
            />
            <p>{heroMoment.note}</p>
            <a href={heroMoment.searchUrl} target="_blank" rel="noreferrer">
              Abrir referencia
            </a>
          </article>
        )}

        <p className="c-section-label">Mais momentos</p>
        <div className="c-moment-list">
          {moreMoments.map((moment) => (
            <StudyMomentCard key={moment.id} moment={moment} onSpeak={onSpeak} />
          ))}
        </div>
      </section>

      <section className="clip-library">
        <div className="clip-library-header">
          <div>
            <p className="eyebrow">Fontes base</p>
            <h2>Pronuncia, musica e contexto real.</h2>
          </div>
          <Library size={26} />
        </div>
        <div className="clip-grid">
          {clipSeeds.map((clip) => (
            <ClipCard key={clip.id} title={clip.title} theme={clip.theme} source={clip.source} url={clip.url} />
          ))}
          {savedClips.map((clip) => (
            <ClipCard key={clip.id} title={clip.title} theme={clip.theme} source="Minha biblioteca" url={clip.url} />
          ))}
        </div>
      </section>

      <section className="clip-form-panel">
        <p className="eyebrow">Clip lab</p>
        <h2>Adicionar fonte</h2>
        <form onSubmit={onAddClip}>
          <label>
            Titulo
            <input value={clipTitle} onChange={(event) => onTitleChange(event.target.value)} placeholder="Tons em dialogo" />
          </label>
          <label>
            URL
            <input value={clipUrl} onChange={(event) => onUrlChange(event.target.value)} placeholder="YouTube, Vimeo ou artigo" />
          </label>
          <label>
            Tema
            <select value={clipTheme} onChange={(event) => onThemeChange(event.target.value)}>
              <option value="pronuncia">Pronuncia</option>
              <option value="musica">Musica</option>
              <option value="dialogo">Dialogo</option>
              <option value="cultura">Cultura</option>
            </select>
          </label>
          <button className="primary-action" type="submit">
            <Plus size={18} />
            Adicionar
          </button>
        </form>
        <div className="source-note">
          <ShieldCheck size={18} />
          <span>Use links oficiais, conteudo proprio ou material autorizado.</span>
        </div>
      </section>
    </div>
  )
}

function StudyMomentCard({ moment, onSpeak }: { moment: StudyMoment; onSpeak: (text: string) => void }) {
  return (
    <article className={`study-moment ${moment.type}`}>
      <div className="study-moment-top">
        <span>{moment.source}</span>
        <small>{moment.level}</small>
      </div>
      <strong>{moment.title}</strong>
      <button className="study-phrase" type="button" onClick={() => onSpeak(moment.phrase)} title="Ouvir frase">
        <span>{moment.phrase}</span>
        <small>Ouvir frase</small>
      </button>
      <RevealStudyTabs pronunciation={moment.pinyin} literal={moment.meaning} literalNote={moment.note} compact={true} />
      <small>{moment.note}</small>
      <a href={moment.searchUrl} target="_blank" rel="noreferrer">
        Abrir referencia
      </a>
    </article>
  )
}

function ClipCard({
  title,
  source,
  theme,
  url,
}: {
  title: string
  source: string
  theme: string
  url: string
}) {
  const embedUrl = getEmbedUrl(url)

  return (
    <article className="clip-card">
      {embedUrl ? (
        <iframe
          title={title}
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="clip-visual">
          <Headphones size={30} />
          <span>{theme}</span>
        </div>
      )}
      <div className="clip-copy">
        <span>{source}</span>
        <strong>{title}</strong>
        <a href={url} target="_blank" rel="noreferrer">
          Abrir fonte
        </a>
      </div>
    </article>
  )
}

function ProfileView({
  progress,
  totalMinutes,
  openMistakeCount,
  userLevel,
  userEmail,
  isGuest,
  onBuyFreeze,
  onGoalChange,
  onSignOut,
  onWipeLocal,
  onDeleteAccount,
}: {
  progress: LearningProgress
  totalMinutes: number
  openMistakeCount: number
  userLevel: number
  userEmail: string | null
  isGuest: boolean
  onBuyFreeze: () => void
  onGoalChange: (goalId: LearningProgress['personalGoal']['id']) => void
  onSignOut: () => void | Promise<void>
  onWipeLocal: () => void
  onDeleteAccount: () => void | Promise<void>
}) {
  const stats = [
    { label: 'Nivel', value: userLevel, icon: Trophy },
    { label: 'XP total', value: progress.xp, icon: Star },
    { label: 'Moedas', value: progress.coins, icon: Target },
    { label: 'Sequencia', value: progress.streak, icon: Flame },
    { label: 'Minutos', value: totalMinutes, icon: CalendarCheck },
    { label: 'Freeze', value: progress.freezeStreaks, icon: ShieldCheck },
    { label: 'Erros', value: openMistakeCount, icon: LockKeyhole },
    { label: 'Fala', value: progress.speakingSessions, icon: Mic },
    { label: 'Hanzi', value: progress.writingSessions, icon: Brush },
  ]

  const mockRankings = [
    { name: 'Você', xp: progress.xp, current: true },
    { name: 'Ana S.', xp: progress.xp + 120, current: false },
    { name: 'Equipe Dragao', xp: Math.max(0, progress.xp + 70), current: false },
    { name: 'Lucas M.', xp: Math.max(0, progress.xp - 50), current: false },
  ].sort((a, b) => b.xp - a.xp)

  const goalProgress = Math.min(100, Math.round((totalMinutes / progress.personalGoal.targetMinutes) * 100))

  const dragonTitle =
    progress.xp >= 600
      ? 'Saltador do Portao'
      : progress.xp >= 300
      ? 'Carpa veterano'
      : progress.xp >= 120
      ? 'Carpa subindo o rio'
      : 'Carpa na lagoa'

  return (
    <div className="profile-layout">
      <section className="profile-hero">
        <div className="profile-identity">
          <div>
            <p className="eyebrow">{isGuest ? 'Convidado' : userEmail || 'Conta'}</p>
            <h2>{dragonTitle}</h2>
            <span>Nivel {userLevel} - {progress.personalGoal.label}</span>
          </div>
        </div>
        <div className="profile-meter">
          <span style={{ width: `${Math.min(100, progress.xp / 3)}%` }}></span>
        </div>
      </section>
      <section className="stats-grid">
        {stats.map((item) => (
          <article className="profile-stat" key={item.label}>
            <item.icon size={22} />
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <section className="goals-panel">
        <div className="ranking-header">
          <p className="eyebrow">Meta pessoal real</p>
          <h2>{progress.personalGoal.label}</h2>
        </div>
        <p>{progress.personalGoal.focus}</p>
        <div className="profile-meter dark">
          <span style={{ width: `${goalProgress}%` }}></span>
        </div>
        <small>{totalMinutes}/{progress.personalGoal.targetMinutes} min no objetivo</small>
        <div className="goal-options">
          {personalGoals.map((goal) => (
            <button
              key={goal.id}
              className={goal.id === progress.personalGoal.id ? 'active' : ''}
              type="button"
              onClick={() => onGoalChange(goal.id)}
            >
              {goal.label}
            </button>
          ))}
        </div>
      </section>

      <section className="ranking-panel">
        <div className="ranking-header">
          <p className="eyebrow">Metas Diárias</p>
          <h2>Complete para ganhar +XP</h2>
        </div>
        <div className="ranking-list" style={{ marginBottom: '24px' }}>
           <div className="ranking-item">
              <span className="ranking-pos">🎯</span>
              <span className="ranking-name">Fazer 1 lição</span>
              <span className="ranking-xp">{progress.dailyGoals.lessons >= 1 ? '✅' : '0/1'}</span>
           </div>
           <div className="ranking-item">
              <span className="ranking-pos">🃏</span>
              <span className="ranking-name">Revisar 3 cartões</span>
              <span className="ranking-xp">{progress.dailyGoals.cards >= 3 ? '✅' : `${progress.dailyGoals.cards}/3`}</span>
           </div>
           <div className="ranking-item">
              <span className="ranking-pos">🎙</span>
              <span className="ranking-name">Fazer 1 treino de fala</span>
              <span className="ranking-xp">{progress.dailyGoals.speaking >= 1 ? '✅' : `${progress.dailyGoals.speaking}/1`}</span>
           </div>
           <div className="ranking-item">
              <span className="ranking-pos">字</span>
              <span className="ranking-name">Validar 1 hanzi</span>
              <span className="ranking-xp">{progress.dailyGoals.writing >= 1 ? '✅' : `${progress.dailyGoals.writing}/1`}</span>
           </div>
        </div>

        <div className="freeze-shop">
          <div>
            <p className="eyebrow">Streak freeze</p>
            <strong>{progress.freezeStreaks} salva-dia</strong>
            <span>Compra com moedas para proteger a sequencia quando faltar um dia.</span>
          </div>
          <button className="primary-action" type="button" disabled={progress.coins < FREEZE_COST} onClick={onBuyFreeze}>
            <ShieldCheck size={18} />
            {FREEZE_COST} moedas
          </button>
        </div>

        <div className="ranking-header">
          <p className="eyebrow">Liga Ouro</p>
          <h2>Rankings da semana</h2>
        </div>
        <div className="ranking-list">
          {mockRankings.map((user, index) => (
            <div key={user.name} className={`ranking-item ${user.current ? 'current' : ''}`}>
              <span className="ranking-pos">{index + 1}</span>
              <span className="ranking-name">{user.name}</span>
              <span className="ranking-xp">{user.xp} XP</span>
            </div>
          ))}
        </div>
      </section>

      <section className="account-panel">
        <div className="ranking-header">
          <p className="eyebrow">Conta</p>
          <h2>{isGuest ? 'Modo convidado' : userEmail || 'Sem login'}</h2>
        </div>
        <div className="account-actions">
          <button className="account-button" type="button" onClick={() => onSignOut()}>
            <LogOut size={18} />
            <span>{isGuest ? 'Sair do modo convidado' : 'Sair da conta'}</span>
          </button>
          <button className="account-button" type="button" onClick={onWipeLocal}>
            <RotateCcw size={18} />
            <span>Apagar progresso deste aparelho</span>
          </button>
          <button
            className="account-button danger"
            type="button"
            onClick={() => onDeleteAccount()}
          >
            <Trash2 size={18} />
            <span>{isGuest ? 'Apagar convidado e progresso' : 'Excluir conta e progresso'}</span>
          </button>
        </div>
        <small style={{ color: '#a99c8f' }}>
          Excluir a conta apaga seu acesso no Firebase e tambem o progresso salvo neste aparelho. Operacao irreversivel.
        </small>
      </section>

      <section className="roadmap-band">
        <p className="eyebrow">Proximas camadas</p>
        <div className="roadmap-items">
          <span>Batalha de mascotes</span>
          <span>Guildas tematicas</span>
          <span>Recompensas reais</span>
        </div>
      </section>
    </div>
  )
}

function getEmbedUrl(url: string) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace('www.', '')
    if (host === 'youtu.be') {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`
    }
    if (host.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
    }
    if (host.includes('vimeo.com')) {
      const videoId = parsed.pathname.split('/').filter(Boolean)[0]
      return videoId ? `https://player.vimeo.com/video/${videoId}` : ''
    }
  } catch {
    return ''
  }
  return ''
}

export default App
