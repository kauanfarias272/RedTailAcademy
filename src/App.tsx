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

type Tab = 'learn' | 'cards' | 'speak' | 'write' | 'clips' | 'mascot' | 'profile'
type Difficulty = 'hard' | 'good' | 'easy'
type MandarinTtsPlugin = {
  speak(options: { text: string; rate?: number }): Promise<{ spoken: boolean }>
  stop(): Promise<void>
}

const MandarinTts = registerPlugin<MandarinTtsPlugin>('MandarinTts')

const navItems: Array<{ id: Tab; label: string; icon: typeof BookOpen }> = [
  { id: 'learn', label: 'Aprender', icon: BookOpen },
  { id: 'cards', label: 'Cartoes', icon: Layers3 },
  { id: 'speak', label: 'Fala', icon: Mic },
  { id: 'write', label: 'Escrita', icon: Brush },
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
  ren: { cells: ['1-0', '1-1', '0-2', '2-2'], minWidthRatio: 0.36, minHeightRatio: 0.5, minPathLength: 180 },
  kou: { cells: ['0-0', '1-0', '2-0', '0-1', '2-1', '0-2', '1-2', '2-2'], minWidthRatio: 0.42, minHeightRatio: 0.42, minPathLength: 220 },
  ni: { cells: ['0-0', '0-1', '1-0', '2-0', '1-1', '2-1', '1-2', '2-2'], minWidthRatio: 0.48, minHeightRatio: 0.56, minPathLength: 360 },
  hao: { cells: ['0-0', '0-1', '0-2', '1-1', '2-0', '2-1', '1-2', '2-2'], minWidthRatio: 0.5, minHeightRatio: 0.5, minPathLength: 320 },
  zhong: { cells: ['0-0', '1-0', '2-0', '0-1', '1-1', '2-1', '1-2'], minWidthRatio: 0.4, minHeightRatio: 0.58, minPathLength: 260 },
  shui: { cells: ['1-0', '1-1', '0-2', '1-2', '2-2'], minWidthRatio: 0.48, minHeightRatio: 0.56, minPathLength: 260 },
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('learn')
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0].id)
  const [lessonStep, setLessonStep] = useState(0)
  const [quizChoice, setQuizChoice] = useState('')
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false)
  const [isCardFlipped, setIsCardFlipped] = useState(false)
  const [clipTitle, setClipTitle] = useState('')
  const [clipUrl, setClipUrl] = useState('')
  const [clipTheme, setClipTheme] = useState('pronuncia')
  const [transcript, setTranscript] = useState('')
  const [audioStatus, setAudioStatus] = useState('Som pronto')
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
      setAudioStatus(voice ? `Voz: ${voice.name}` : 'Som pronto pelo TTS do sistema')
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
        setAudioStatus('Falando em mandarim...')
        await MandarinTts.speak({ text: cleanText, rate })
        setAudioStatus('Som pronto')
        return
      } catch {
        setAudioStatus('Usando audio do navegador')
      }
    }

    if (!('speechSynthesis' in window)) {
      setAudioStatus('Som indisponivel neste dispositivo')
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = 'zh-CN'
    utterance.rate = rate
    utterance.pitch = 1
    if (mandarinVoice) utterance.voice = mandarinVoice
    utterance.onstart = () => setAudioStatus('Falando em mandarim...')
    utterance.onend = () => setAudioStatus('Som pronto')
    utterance.onerror = () => setAudioStatus('Nao consegui tocar o audio')
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

  function selectLesson(lessonId: string) {
    if (autoAdvanceTimer.current) window.clearTimeout(autoAdvanceTimer.current)
    setIsAutoAdvancing(false)
    setLessonStep(0)
    setQuizChoice('')
    setSelectedLessonId(lessonId)
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
    const nextLessonId = getNextLessonId(selectedLesson.id)
    if (nextLessonId) {
      selectLesson(nextLessonId)
      return
    }

    setActiveTab('cards')
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

  function recordSpeech(expected: string) {
    type SpeechRecognitionConstructor = new () => {
      lang: string
      interimResults: boolean
      maxAlternatives: number
      start: () => void
      onresult: (event: { results: { 0: { transcript: string } }[] }) => void
      onerror: () => void
    }

    const browserWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor
      webkitSpeechRecognition?: SpeechRecognitionConstructor
    }
    const Recognition = browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition

    if (!Recognition) {
      setTranscript('Reconhecimento de voz indisponivel neste navegador.')
      return
    }

    const recognition = new Recognition()
    recognition.lang = 'zh-CN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript
      const matched = normalizeSpeechText(result).includes(normalizeSpeechText(expected).slice(0, 2))
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
    recognition.onerror = () => setTranscript('Nao consegui ouvir com clareza.')
    recognition.start()
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
            <small>Mandarim vivo</small>
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
            <span className="sound-status">{audioStatus}</span>
            <button className="primary-action" type="button" onClick={() => speak(quizPhrase.hanzi)}>
              <Volume2 size={18} />
              Ativar som
            </button>
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
            onSelectLesson={selectLesson}
            onChoose={chooseQuizAnswer}
            onSpeak={speak}
            onAdvanceNow={advanceLessonFlow}
          />
        )}
        {activeTab === 'cards' && (
          <CardsView
            activeCard={activeCard}
            dueCount={dueCards.length}
            flipped={isCardFlipped}
            progress={progress}
            openMistakes={unresolvedMistakes}
            onFlip={() => setIsCardFlipped((current) => !current)}
            onReview={reviewCard}
            onResolveMistake={(mistake) =>
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
            onMissMistake={(mistake, answer) =>
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
            onSpeak={speak}
          />
        )}
        {activeTab === 'speak' && (
          <SpeakView
            transcript={transcript}
            onRecord={recordSpeech}
            onSpeak={speak}
            onCompleteSession={() =>
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
          />
        )}
        {activeTab === 'write' && (
          <WritingView
            onSpeak={speak}
            openMistakes={unresolvedMistakes.filter((mistake) => mistake.type === 'writing')}
            onPracticeMistake={(character, reason) =>
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
            onCompletePractice={(character) =>
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
    learn: 'Trilha de mandarim',
    cards: 'Revisao inteligente',
    speak: 'Fala e tons',
    write: 'Escrita hanzi',
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
  onSelectLesson,
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
  onSelectLesson: (lessonId: string) => void
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

      <section className="path-panel">
        {units.map((unit, unitIndex) => (
          <div className={`unit-group ${unit.accent}`} key={unit.id}>
            <div className="unit-heading">
              <div>
                <span>{unit.level}</span>
                <h3>{unit.title}</h3>
                <p>{unit.summary}</p>
              </div>
              <strong>{unitCompletion(unit.id)}%</strong>
            </div>
            <div className="lesson-path">
              {unit.lessonIds.map((lessonId, lessonIndex) => {
                const lesson = lessons.find((item) => item.id === lessonId)
                if (!lesson) return null
                const completed = progress.completedLessons.includes(lesson.id)
                return (
                  <button
                    className={[
                      'lesson-node',
                      selectedLessonId === lesson.id ? 'active' : '',
                      completed ? 'complete' : '',
                    ].join(' ')}
                    key={lesson.id}
                    type="button"
                    onClick={() => onSelectLesson(lesson.id)}
                    style={{ '--offset': `${(lessonIndex % 2) * 26 + unitIndex * 4}px` } as React.CSSProperties}
                  >
                    {completed ? <CheckCircle2 size={20} /> : <GraduationCap size={20} />}
                    <span>{lesson.title}</span>
                    <small>{lesson.xp} XP</small>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="lesson-panel">
        <div className="lesson-panel-header">
          <div>
            <p className="eyebrow">{selectedLesson.focus}</p>
            <h2>{selectedLesson.title}</h2>
          </div>
          <span className="pill">{selectedLesson.minutes} min</span>
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

  if (strokesDrawn !== character.strokes) {
    return {
      ok: false,
      message: `Incorreto: voce fez ${strokesDrawn} tracos. Este hanzi pede ${character.strokes} tracos principais.`,
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
    minWidthRatio: 0.4,
    minHeightRatio: 0.45,
    minPathLength: WRITING_MIN_PATH,
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
  const missingCells = template.cells.filter((cell) => !touchedCells.has(cell))

  if (missingCells.length > Math.max(1, Math.floor(template.cells.length * 0.25))) {
    return { ok: false, message: 'A forma nao bateu com as zonas principais do hanzi. Siga a sombra do caractere.' }
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
