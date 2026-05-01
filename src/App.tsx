import {
  BookOpen,
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
  Mic,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Undo2,
  Volume2,
} from 'lucide-react'
import { Capacitor, registerPlugin } from '@capacitor/core'
import { auth } from './firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, type User, sendEmailVerification, GoogleAuthProvider, signInWithCredential } from 'firebase/auth'
import { FirebaseAuthentication } from '@capacitor-firebase/authentication'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, FormEvent, PointerEvent as ReactPointerEvent } from 'react'
import './App.css'
import {
  allPhrases,
  clipSeeds,
  lessons,
  studyMoments,
  toneDrills,
  units,
  writingCharacters,
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

type Tab = 'learn' | 'practice' | 'clips' | 'mascot' | 'profile'
type PracticeMode = 'cards' | 'speak' | 'write'
type Difficulty = 'hard' | 'good' | 'easy'
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

const navItems: Array<{ id: Tab; label: string; icon: typeof BookOpen }> = [
  { id: 'learn', label: 'Trilha', icon: BookOpen },
  { id: 'practice', label: 'Treino', icon: Layers3 },
  { id: 'clips', label: 'Estudar', icon: Headphones },
  { id: 'mascot', label: 'Koi', icon: Fish },
  { id: 'profile', label: 'Perfil', icon: Trophy },
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
  { id: 'speak', label: 'Fala', icon: Mic },
  { id: 'write', label: 'Escrita', icon: Brush },
]

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setIsAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const [activeTab, setActiveTab] = useState<Tab>('learn')
  const [isLessonActive, setIsLessonActive] = useState(false)
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('cards')
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0].id)
  const [lessonStep, setLessonStep] = useState(0)
  const [quizChoice, setQuizChoice] = useState('')
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false)
  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [clipTitle, setClipTitle] = useState('')
  const [clipUrl, setClipUrl] = useState('')
  const [clipTheme, setClipTheme] = useState('pronuncia')
  const [transcript, setTranscript] = useState('')
  const [mandarinVoice, setMandarinVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [now, setNow] = useState(0)
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
  const mascotEvolutionLocked = unresolvedMistakes.length > 0
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
    return Array.from(new Set([quizPhrase.portuguese, ...quizOptions]))
      .filter(Boolean)
      .slice(0, 4)
      .sort((left, right) => optionRank(selectedLesson.id, left) - optionRank(selectedLesson.id, right))
  }, [quizPhrase.portuguese, selectedLesson.id])

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

      return {
        ...nextBase,
        mascot: updatedMascot,
      }
    })
    setQuizChoice('')
  }

  function startLesson(lessonId: string) {
    if (autoAdvanceTimer.current) window.clearTimeout(autoAdvanceTimer.current)
    setIsAutoAdvancing(false)
    setLessonStep(0)
    setQuizChoice('')
    setSelectedLessonId(lessonId)
    setIsLessonActive(true)
  }

  function advanceLessonFlow() {
    if (autoAdvanceTimer.current) window.clearTimeout(autoAdvanceTimer.current)
    setIsAutoAdvancing(false)

    if (lessonStep < selectedLesson.phrases.length - 1) {
      setLessonStep((current) => current + 1)
      setQuizChoice('')
      return
    }

    completeLesson(selectedLesson)
    setIsLessonActive(false)
    const nextLessonId = getNextLessonId(selectedLesson.id)
    if (nextLessonId) {
      setSelectedLessonId(nextLessonId)
      setLessonStep(0)
      setQuizChoice('')
      return
    }

    setPracticeMode('cards')
    setActiveTab('practice')
  }

  function chooseQuizAnswer(choice: string) {
    setQuizChoice(choice)
    if (choice !== quizPhrase.portuguese) {
      setProgress((current) =>
        recordMistake(
          current,
          {
            type: 'lesson',
            itemId: quizPhrase.id,
            prompt: `${quizPhrase.hanzi} - ${quizPhrase.pinyin}`,
            expected: quizPhrase.portuguese,
            answer: choice,
            helper: quizPhrase.note,
          },
        ),
      )
      setIsAutoAdvancing(false)
      if (autoAdvanceTimer.current) window.clearTimeout(autoAdvanceTimer.current)
      return
    }

    setProgress((current) => resolveMistake(current, 'lesson', quizPhrase.id))
    speak(quizPhrase.hanzi)
    setIsAutoAdvancing(true)
    if (autoAdvanceTimer.current) window.clearTimeout(autoAdvanceTimer.current)
    autoAdvanceTimer.current = window.setTimeout(advanceLessonFlow, 1100)
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
              prompt: `${activeCard.hanzi} - ${activeCard.pinyin}`,
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
      return matched
        ? resolveMistake(baseProgress, 'speech', expected)
        : recordMistake(baseProgress, {
            type: 'speech',
            itemId: expected,
            prompt: expected,
            expected,
            answer: result,
            helper: 'Ouça de novo e tente acompanhar o ritmo da frase.',
          })
    })
  }

  async function recordSpeech(expected: string) {
    if (Capacitor.isNativePlatform()) {
      try {
        setTranscript('Ouvindo... fale depois do sinal do Android.')
        const result = await MandarinSpeech.listen({
          language: 'zh-CN',
          prompt: 'Repita a frase em mandarim',
        })
        handleSpeechResult(expected, result.transcript)
        return
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Microfone nao retornou audio.'
        setTranscript(`${message} Tente de novo em um lugar silencioso.`)
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
    }

    const browserWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor
      webkitSpeechRecognition?: SpeechRecognitionConstructor
    }
    const Recognition = browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition

    if (!Recognition) {
      setTranscript('Reconhecimento de voz indisponivel neste navegador. No Android, use o APK novo com microfone nativo.')
      return
    }

    const recognition = new Recognition()
    recognition.lang = 'zh-CN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript
      handleSpeechResult(expected, result)
    }
    recognition.onerror = (event) =>
      setTranscript(event?.error === 'not-allowed' ? 'Permita o microfone para gravar.' : 'Microfone nao retornou audio claro. Tente de novo.')
    recognition.start()
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

  if (!user) {
    return (
      <div className="app-shell" style={{ display: 'grid', placeItems: 'center', padding: '20px' }}>
        <form 
          className="lesson-panel" 
          style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}
          onSubmit={async (e) => {
            e.preventDefault()
            setAuthError('')
            try {
              if (isRegistering) {
                const cred = await createUserWithEmailAndPassword(auth, authEmail, authPassword)
                await sendEmailVerification(cred.user)
                await signOut(auth)
                setAuthError('Conta criada! Enviamos um e-mail de confirmação. Verifique sua caixa de entrada antes de entrar.')
                setIsRegistering(false)
                setAuthPassword('')
              } else {
                const cred = await signInWithEmailAndPassword(auth, authEmail, authPassword)
                if (!cred.user.emailVerified) {
                  await signOut(auth)
                  setAuthError('Você precisa confirmar o seu e-mail antes de entrar. Verifique a sua caixa de entrada.')
                }
              }
            } catch (err: any) {
              setAuthError(err.message || 'Erro na autenticação')
            }
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h2 style={{ margin: 0 }}>RedTail Academy</h2>
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
              try {
                setAuthError('')
                const result = await FirebaseAuthentication.signInWithGoogle()
                if (result.credential?.idToken) {
                  const credential = GoogleAuthProvider.credential(result.credential.idToken)
                  await signInWithCredential(auth, credential)
                }
              } catch (err: any) {
                setAuthError('Erro no Google Login: ' + err.message)
              }
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Entrar com Google
          </button>
          
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

  return (
    <main className="app-shell">
      <aside className="side-nav" aria-label="Navegacao principal">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            <RedTailLogo />
          </div>
          <div>
            <strong>RedTail Academy</strong>
            <small>{user?.email || 'Mandarim vivo'}</small>
          </div>
        </div>

        <nav>
          {navItems.map((item) => {
            const Icon = item.icon
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
        <button className="nav-button" onClick={() => signOut(auth)} style={{ marginTop: '16px', color: '#b92732', fontWeight: 800 }}>
          <span>Sair da conta</span>
        </button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">{currentUnit.level}</p>
            <h1>{activeTitle(activeTab)}</h1>
          </div>
          <div className="topbar-actions">
            <div className="progress-ring" style={{ '--progress': `${levelProgress}%` } as CSSProperties}>
              <span>{levelProgress}%</span>
            </div>
            {mascotEvolutionLocked && (
              <span className="evolution-lock" title="Corrija seus erros para voltar a evoluir o mascote">
                <LockKeyhole size={15} />
                {unresolvedMistakes.length} erros
              </span>
            )}
          </div>
        </header>

        {activeTab === 'learn' && (
          <LearnView
            selectedLesson={selectedLesson}
            selectedLessonId={selectedLessonId}
            phrase={quizPhrase}
            stepIndex={lessonStep}
            stepTotal={selectedLesson.phrases.length}
            quizChoice={quizChoice}
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
            onFlip={() => setIsCardFlipped((current) => !current)}
            onReview={reviewCard}
            onResolveMistake={resolveReviewMistake}
            onMissMistake={missReviewMistake}
            onRecord={recordSpeech}
            onCompleteSpeakingSession={completeSpeakingSession}
            onPracticeMistake={recordWritingMistake}
            onCompleteWritingPractice={completeWritingPractice}
            onSpeak={speak}
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
          return (
            <button
              className={activeTab === item.id ? 'bottom-button active' : 'bottom-button'}
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              title={item.label}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </main>
  )
}

function activeTitle(tab: Tab) {
  const labels: Record<Tab, string> = {
    learn: 'Arvore de mandarim',
    practice: 'Treino diario',
    clips: 'Estudar com cultura',
    mascot: 'Seu companheiro Koi',
    profile: 'Seu ritmo',
  }
  return labels[tab]
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

function mistakeLabel(type: LearningMistake['type']) {
  const labels: Record<LearningMistake['type'], string> = {
    lesson: 'Licao',
    card: 'Cartao',
    writing: 'Escrita',
    speech: 'Fala',
  }
  return labels[type]
}

function RedTailLogo() {
  return (
    <svg viewBox="0 0 64 64" role="presentation" aria-hidden="true">
      <path className="logo-disc" d="M12 9h40c2.8 0 5 2.2 5 5v36c0 2.8-2.2 5-5 5H12c-2.8 0-5-2.2-5-5V14c0-2.8 2.2-5 5-5Z" />
      <path className="logo-tail" d="M16 40c13-2 21-10 31-27 1 18-5 32-21 39 4-5 2-10-10-12Z" />
      <path className="logo-stroke" d="M20 21h23M31 21v25M20 34h24" />
      <path className="logo-spark" d="M47 37l6 3-6 3-3 6-3-6-6-3 6-3 3-6 3 6Z" />
    </svg>
  )
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

function LearnView({
  selectedLesson,
  selectedLessonId,
  phrase,
  stepIndex,
  stepTotal,
  quizChoice,
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
  const unitCompletion = (unitId: string) => {
    const unitLessons = lessons.filter((lesson) => lesson.unitId === unitId)
    const done = unitLessons.filter((lesson) => progress.completedLessons.includes(lesson.id)).length
    return Math.round((done / unitLessons.length) * 100)
  }

  if (isLessonActive) {
    return (
      <div className="lesson-active-layout">
        <section className="lesson-panel">
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
              <span>{phrase.pinyin}</span>
              <p>{phrase.literal}</p>
            </div>
          </div>

          <div className="quiz-block">
            <p className="eyebrow">Escolha a traducao</p>
            <div className="answer-grid">
              {options.map((option) => (
                <button
                  className={[
                    'answer-option',
                    quizChoice === option ? 'selected' : '',
                    quizChoice === option && option === phrase.portuguese ? 'correct' : '',
                    quizChoice === option && option !== phrase.portuguese ? 'wrong' : '',
                  ].join(' ')}
                  key={option}
                  type="button"
                  onClick={() => onChoose(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <p className={isCorrect ? 'feedback good' : 'feedback'}>
              {isCorrect && isAutoAdvancing ? 'Correto. Avancando automaticamente...' : quizChoice ? phrase.note : ' '}
            </p>
          </div>

          <div className="lesson-footer">
            <div>
              <span>Padrao de tons</span>
              <strong>{phrase.tonePattern}</strong>
            </div>
            <button className="primary-action" type="button" disabled={!isCorrect} onClick={onAdvanceNow}>
              {stepIndex + 1 === stepTotal ? 'Concluir' : 'Proxima'}
              <ChevronRight size={18} />
            </button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="learn-grid">
      <section className="mission-band">
        <div>
          <p className="eyebrow">Missao diaria</p>
          <h2>Complete uma licao, revise dois cartoes e grave uma frase.</h2>
        </div>
        <div className="mission-metrics">
          <Stat icon={BookOpen} label="Licoes" value={`${progress.completedLessons.length}/${lessons.length}`} />
          <Stat icon={Layers3} label="Cartoes" value={`${Object.keys(progress.cards).length}`} />
          <Stat icon={Mic} label="Fala" value={`${progress.speakingSessions}`} />
          <Stat icon={Brush} label="Hanzi" value={`${progress.writingSessions}`} />
        </div>
      </section>

      <section className="lesson-tree-panel" aria-label="Arvore de crescimento HSK">
        <div className="tree-canopy">
          <p className="eyebrow">Arvore HSK</p>
          <h2>Suba de raiz em raiz ate o proximo nivel.</h2>
        </div>
        <div className="tree-trunk">
          {units.map((unit, unitIndex) => (
            <div className={`tree-stage ${unit.accent}`} key={unit.id}>
              <div className="hsk-gate">
                <span>{unit.level}</span>
                <strong>{unit.title}</strong>
                <small>{unitCompletion(unit.id)}%</small>
              </div>
              <div className="tree-branch">
                {unit.lessonIds.map((lessonId, lessonIndex) => {
                  const lesson = lessons.find((item) => item.id === lessonId)
                  if (!lesson) return null
                  const completed = progress.completedLessons.includes(lesson.id)
                  return (
                    <button
                      className={[
                        'tree-node',
                        selectedLessonId === lesson.id ? 'active' : '',
                        completed ? 'complete' : '',
                      ].filter(Boolean).join(' ')}
                      key={lesson.id}
                      type="button"
                      onClick={() => onSelectLesson(lesson.id)}
                      style={{
                        '--branch-x': `${lessonIndex === 1 ? 0 : lessonIndex === 0 ? -58 : 58}px`,
                        '--branch-y': `${lessonIndex * 12}px`,
                        '--stage-delay': `${unitIndex * 0.04}s`,
                      } as React.CSSProperties}
                    >
                      <span className="tree-node-icon">
                        {completed ? <CheckCircle2 size={22} /> : <GraduationCap size={22} />}
                      </span>
                      <span>{lesson.title}</span>
                      <small>{lesson.xp} XP</small>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          <div className="hsk-gate next">
            <span>Proximo portal</span>
            <strong>HSK 2</strong>
            <small>libera com HSK 1 completo</small>
          </div>
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
  onFlip,
  onReview,
  onResolveMistake,
  onMissMistake,
  onRecord,
  onCompleteSpeakingSession,
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
  onFlip: () => void
  onReview: (difficulty: Difficulty) => void
  onResolveMistake: (mistake: LearningMistake) => void
  onMissMistake: (mistake: LearningMistake, answer: string) => void
  onRecord: (expected: string) => void
  onCompleteSpeakingSession: () => void
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
          openMistakes={openMistakes}
          onFlip={onFlip}
          onReview={onReview}
          onResolveMistake={onResolveMistake}
          onMissMistake={onMissMistake}
          onSpeak={onSpeak}
        />
      )}

      {mode === 'speak' && (
        <SpeakView
          transcript={transcript}
          onRecord={onRecord}
          onSpeak={onSpeak}
          onCompleteSession={onCompleteSpeakingSession}
        />
      )}

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
  openMistakes,
  onFlip,
  onReview,
  onResolveMistake,
  onMissMistake,
  onSpeak,
}: {
  activeCard: (typeof allPhrases)[number]
  dueCount: number
  flipped: boolean
  progress: LearningProgress
  openMistakes: LearningMistake[]
  onFlip: () => void
  onReview: (difficulty: Difficulty) => void
  onResolveMistake: (mistake: LearningMistake) => void
  onMissMistake: (mistake: LearningMistake, answer: string) => void
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
          <strong>{flipped ? activeCard.note : activeCard.pinyin}</strong>
          <small>{flipped ? activeCard.literal : activeCard.lessonTitle}</small>
        </button>

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
          <h2>{allPhrases.length} itens HSK 1</h2>
          <span>{reviewed} revisoes feitas</span>
        </div>
        <div className="deck-list">
          {allPhrases.map((phrase) => {
            const card = progress.cards[phrase.id]
            return (
              <article className="deck-item" key={phrase.id}>
                <div>
                  <strong>{phrase.hanzi}</strong>
                  <span>{phrase.pinyin}</span>
                </div>
                <small>{card ? `Caixa ${card.box}` : 'Novo'}</small>
              </article>
            )
          })}
        </div>
      </section>

      <MistakeReviewPanel
        mistakes={openMistakes}
        onResolve={onResolveMistake}
        onMiss={onMissMistake}
        onSpeak={onSpeak}
      />
    </div>
  )
}

function MistakeReviewPanel({
  mistakes,
  onResolve,
  onMiss,
  onSpeak,
}: {
  mistakes: LearningMistake[]
  onResolve: (mistake: LearningMistake) => void
  onMiss: (mistake: LearningMistake, answer: string) => void
  onSpeak: (text: string) => void
}) {
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const activeMistake = mistakes[0]

  if (!activeMistake) {
    return (
      <section className="mistake-panel cleared">
        <div className="mistake-panel-header">
          <div>
            <p className="eyebrow">Erros</p>
            <h2>Fila limpa</h2>
          </div>
          <CheckCircle2 size={26} />
        </div>
        <p>Nenhum erro bloqueando a evolucao do mascote.</p>
      </section>
    )
  }

  const isWritingMistake = activeMistake.type === 'writing'

  function submitMistakeReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!activeMistake) return

    if (isWritingMistake) {
      setFeedback('Esse erro sai da fila quando voce validar o hanzi na aba Escrita.')
      return
    }

    if (normalizeAnswer(answer) === normalizeAnswer(activeMistake.expected)) {
      setAnswer('')
      setFeedback('')
      onResolve(activeMistake)
      return
    }

    onMiss(activeMistake, answer || 'Resposta vazia')
    setFeedback('Ainda nao. Veja a dica e tente outra vez.')
  }

  return (
    <section className="mistake-panel">
      <div className="mistake-panel-header">
        <div>
          <p className="eyebrow">Treinar erros</p>
          <h2>{mistakes.length} erro{mistakes.length === 1 ? '' : 's'} bloqueando evolucao</h2>
        </div>
        <LockKeyhole size={26} />
      </div>

      <article className="mistake-card">
        <span>{mistakeLabel(activeMistake.type)}</span>
        <strong>{activeMistake.prompt}</strong>
        <small>{activeMistake.helper}</small>
        <div className="mistake-actions">
          <button className="icon-action" type="button" onClick={() => onSpeak(activeMistake.prompt)} title="Ouvir">
            <Volume2 size={18} />
          </button>
          <span>{activeMistake.attempts} tentativa{activeMistake.attempts === 1 ? '' : 's'}</span>
        </div>
      </article>

      <form className="mistake-form" onSubmit={submitMistakeReview}>
        <label>
          {isWritingMistake ? 'Volte para Escrita e valide o caractere' : 'Digite a resposta certa'}
          <input
            value={answer}
            disabled={isWritingMistake}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder={isWritingMistake ? activeMistake.expected : 'traducao em portugues'}
          />
        </label>
        <button className="primary-action" type="submit">
          <CheckCircle2 size={18} />
          Conferir
        </button>
      </form>
      <p className={feedback ? 'feedback error' : 'feedback'}>{feedback || ' '}</p>
    </section>
  )
}

function SpeakView({
  transcript,
  onRecord,
  onSpeak,
  onCompleteSession,
}: {
  transcript: string
  onRecord: (expected: string) => void
  onSpeak: (text: string) => void
  onCompleteSession: () => void
}) {
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
        <div className="tone-wave" aria-hidden="true">
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
                <span>{drill.pinyin}</span>
                <small>{drill.focus}</small>
              </div>
              <button className="icon-action" type="button" onClick={() => onSpeak(drill.hanzi)} title="Ouvir">
                <Play size={18} />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="shadow-panel">
        <p className="eyebrow">Shadowing</p>
        <h2>我要一杯水</h2>
        <span>wǒ yào yì bēi shuǐ</span>
        <p>eu quero um copo de agua</p>
        <div className="shadow-actions">
          <button type="button" onClick={() => onSpeak('我要一杯水')}>
            <Volume2 size={18} />
            Ouvir
          </button>
          <button type="button" onClick={() => onRecord('我要一杯水')}>
            <Mic size={18} />
            Gravar
          </button>
          <button type="button" onClick={onCompleteSession}>
            <Star size={18} />
            Marcar
          </button>
        </div>
        <div className="transcript-box">
          <span>Resultado</span>
          <strong>{transcript || 'Aguardando voz'}</strong>
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
              <span>{character.pinyin}</span>
            </button>
          ))}
        </div>

        <article className="stroke-card">
          <p className="eyebrow">{selectedCharacter.meaning}</p>
          <h2>
            {selectedCharacter.character} <span>{selectedCharacter.pinyin}</span>
          </h2>
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

  const strokeTolerance = character.strokes >= 6 ? 2 : 1
  if (Math.abs(strokesDrawn - character.strokes) > strokeTolerance) {
    return {
      ok: false,
      message: `Voce fez ${strokesDrawn} tracos. Esse hanzi aceita perto de ${character.strokes}; tente chegar mais proximo.`,
    }
  }

  const points = strokes.flat()
  if (points.length < Math.max(6, character.strokes * 3)) {
    return { ok: false, message: 'Trace os movimentos completos antes de validar.' }
  }

  const bounds = getPointBounds(points)
  const widthRatio = bounds.width / Math.max(1, canvasSize.width)
  const heightRatio = bounds.height / Math.max(1, canvasSize.height)
  const pathLength = strokes.reduce((total, stroke) => total + getPathLength(stroke), 0)
  const template = writingValidationTemplates[character.id] ?? {
    cells: ['1-0', '0-1', '1-1', '2-1', '1-2'],
    minWidthRatio: 0.3,
    minHeightRatio: 0.34,
    minPathLength: WRITING_MIN_PATH * 0.65,
  }

  if (widthRatio < template.minWidthRatio || heightRatio < template.minHeightRatio) {
    return { ok: false, message: 'A forma ficou pequena demais ou concentrada. Use mais do grid do hanzi.' }
  }

  if (pathLength < template.minPathLength) {
    return { ok: false, message: 'O caminho desenhado ficou curto demais para esse caractere.' }
  }

  const touchedCells = new Set(
    points.map((point) => {
      const col = Math.min(2, Math.max(0, Math.floor((point.x / Math.max(1, canvasSize.width)) * 3)))
      const row = Math.min(2, Math.max(0, Math.floor((point.y / Math.max(1, canvasSize.height)) * 3)))
      return `${col}-${row}`
    }),
  )
  const hitCells = template.cells.filter((cell) => touchedCells.has(cell)).length
  const neededCells = Math.max(2, Math.ceil(template.cells.length * 0.45))

  if (hitCells < neededCells) {
    return { ok: false, message: 'A forma ficou muito fora do hanzi. Siga a sombra, mas nao precisa ficar perfeito.' }
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
  return (
    <div className="clips-layout">
      <section className="study-moments">
        <div className="clip-library-header">
          <div>
            <p className="eyebrow">Aba estudar</p>
            <h2>Memes, musicas e cultura para fixar frases.</h2>
          </div>
          <Target size={26} />
        </div>
        <div className="study-moment-grid">
          {studyMoments.map((moment) => (
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
        <small>{moment.pinyin}</small>
      </button>
      <p>{moment.meaning}</p>
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
  onBuyFreeze,
  onGoalChange,
}: {
  progress: LearningProgress
  totalMinutes: number
  openMistakeCount: number
  userLevel: number
  onBuyFreeze: () => void
  onGoalChange: (goalId: LearningProgress['personalGoal']['id']) => void
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

  return (
    <div className="profile-layout">
      <section className="profile-hero">
        <p className="eyebrow">RedTail Score</p>
        <h2>{progress.xp < 150 ? 'Explorador HSK 1' : 'Aprendiz consistente'}</h2>
        <span>Nivel {userLevel} - {progress.personalGoal.label}</span>
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
