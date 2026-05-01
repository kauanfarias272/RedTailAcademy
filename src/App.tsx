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
  Mic,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
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
  toneDrills,
  units,
  writingCharacters,
  type Lesson,
  type Phrase,
  type WritingCharacter,
} from './content'
import {
  nextDueDate,
  updateStudyStreak,
  useStoredProgress,
  useToday,
  type LearningProgress,
} from './progress'
import { checkInactivity, onLessonComplete, onCardReview } from './mascot'
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
  { id: 'clips', label: 'Clips', icon: Headphones },
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

      const updatedMascot = alreadyCompleted
        ? current.mascot
        : onLessonComplete(current.mascot, today)

      return {
        ...current,
        xp: alreadyCompleted ? current.xp : current.xp + lesson.xp,
        streak: updateStudyStreak(current, today),
        lastStudyDate: today,
        completedLessons: alreadyCompleted
          ? current.completedLessons
          : [...current.completedLessons, lesson.id],
        cards,
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
      setIsAutoAdvancing(false)
      if (autoAdvanceTimer.current) window.clearTimeout(autoAdvanceTimer.current)
      return
    }

    speak(quizPhrase.hanzi)
    setIsAutoAdvancing(true)
    if (autoAdvanceTimer.current) window.clearTimeout(autoAdvanceTimer.current)
    autoAdvanceTimer.current = window.setTimeout(advanceLessonFlow, 1100)
  }

  function reviewCard(difficulty: Difficulty) {
    setProgress((current) => {
      const existing = current.cards[activeCard.id] ?? {
        box: 0,
        dueAt: Date.now(),
        reviewed: 0,
        correct: 0,
      }
      const nextBox =
        difficulty === 'hard' ? Math.max(0, existing.box - 1) : existing.box + (difficulty === 'easy' ? 2 : 1)

      return {
        ...current,
        xp: current.xp + (difficulty === 'hard' ? 2 : difficulty === 'good' ? 4 : 6),
        streak: updateStudyStreak(current, today),
        lastStudyDate: today,
        cards: {
          ...current.cards,
          [activeCard.id]: {
            box: nextBox,
            dueAt: nextDueDate(difficulty, existing.box),
            reviewed: existing.reviewed + 1,
            correct: existing.correct + (difficulty === 'hard' ? 0 : 1),
          },
        },
        mascot: onCardReview(current.mascot, today),
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
      setTranscript(result)
      setProgress((current) => ({
        ...current,
        speakingSessions: current.speakingSessions + 1,
        xp: current.xp + (result.includes(expected.slice(0, 1)) ? 8 : 4),
        streak: updateStudyStreak(current, today),
        lastStudyDate: today,
      }))
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
          <MascotWidget mascot={progress.mascot} compact={true} />
          <Stat icon={Flame} label="Streak" value={`${progress.streak} dias`} />
          <Stat icon={Star} label="XP" value={`${progress.xp}`} />
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
            onFlip={() => setIsCardFlipped((current) => !current)}
            onReview={reviewCard}
            onSpeak={speak}
          />
        )}
        {activeTab === 'speak' && (
          <SpeakView
            transcript={transcript}
            onRecord={recordSpeech}
            onSpeak={speak}
            onCompleteSession={() =>
              setProgress((current) => ({
                ...current,
                speakingSessions: current.speakingSessions + 1,
                xp: current.xp + 10,
                streak: updateStudyStreak(current, today),
                lastStudyDate: today,
              }))
            }
          />
        )}
        {activeTab === 'write' && (
          <WritingView
            onSpeak={speak}
            onCompletePractice={() =>
              setProgress((current) => ({
                ...current,
                writingSessions: current.writingSessions + 1,
                xp: current.xp + 8,
                streak: updateStudyStreak(current, today),
                lastStudyDate: today,
              }))
            }
          />
        )}
        {activeTab === 'clips' && (
          <ClipsView
            clipTitle={clipTitle}
            clipUrl={clipUrl}
            clipTheme={clipTheme}
            savedClips={progress.savedClips}
            onAddClip={addClip}
            onTitleChange={setClipTitle}
            onUrlChange={setClipUrl}
            onThemeChange={setClipTheme}
          />
        )}
        {activeTab === 'mascot' && (
          <MascotWidget
            mascot={progress.mascot}
            onRename={(name) =>
              setProgress((current) => ({
                ...current,
                mascot: { ...current.mascot, name },
              }))
            }
          />
        )}
        {activeTab === 'profile' && <ProfileView progress={progress} totalMinutes={totalMinutes} />}
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
    clips: 'Clips e sons',
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
    </div>
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
  onCompletePractice,
}: {
  onSpeak: (text: string) => void
  onCompletePractice: () => void
}) {
  const [selectedId, setSelectedId] = useState(writingCharacters[0].id)
  const [strokesDrawn, setStrokesDrawn] = useState(0)
  const [practiceDone, setPracticeDone] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDrawing = useRef(false)
  const selectedCharacter =
    writingCharacters.find((character) => character.id === selectedId) ?? writingCharacters[0]

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
    setStrokesDrawn((current) => current + 1)
    setPracticeDone(false)
  }

  function draw(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!isDrawing.current) return
    const drawing = setupCanvas()
    if (!drawing) return

    const point = pointFromEvent(event)
    drawing.context.lineTo(point.x, point.y)
    drawing.context.stroke()
  }

  function stopDrawing() {
    isDrawing.current = false
  }

  function resetCanvas() {
    const drawing = setupCanvas()
    if (drawing) {
      drawing.context.clearRect(0, 0, drawing.rect.width, drawing.rect.height)
    }
    setStrokesDrawn(0)
    setPracticeDone(false)
  }

  function completeWritingPractice(character: WritingCharacter) {
    if (!isStrokeValid) return
    setPracticeDone(true)
    onCompletePractice()
    onSpeak(character.character)
  }

  const isStrokeValid = strokesDrawn > 0 && Math.abs(strokesDrawn - selectedCharacter.strokes) <= 1

  return (
    <div className="writing-layout">
      <section className="writing-board">
        <div className="writing-header">
          <div>
            <p className="eyebrow">Treino de escrita</p>
            <h2>Trace o hanzi no grid.</h2>
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
            disabled={!isStrokeValid}
            onClick={() => completeWritingPractice(selectedCharacter)}
          >
            <CheckCircle2 size={18} />
            Validar
          </button>
        </div>
        <p className={practiceDone ? 'feedback good' : (strokesDrawn > 0 && !isStrokeValid ? 'feedback error' : 'feedback')}>
          {practiceDone
            ? `Treino salvo. Voce fez ${strokesDrawn} tracos.`
            : (strokesDrawn > 0 && !isStrokeValid
              ? `Incorreto: você fez ${strokesDrawn} traços. Tente focar em ${selectedCharacter.strokes} traços principais.`
              : `Meta: ${selectedCharacter.strokes} tracos principais.`)}
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

function ClipsView({
  clipTitle,
  clipUrl,
  clipTheme,
  savedClips,
  onAddClip,
  onTitleChange,
  onUrlChange,
  onThemeChange,
}: {
  clipTitle: string
  clipUrl: string
  clipTheme: string
  savedClips: LearningProgress['savedClips']
  onAddClip: (event: FormEvent<HTMLFormElement>) => void
  onTitleChange: (value: string) => void
  onUrlChange: (value: string) => void
  onThemeChange: (value: string) => void
}) {
  return (
    <div className="clips-layout">
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

function ProfileView({ progress, totalMinutes }: { progress: LearningProgress; totalMinutes: number }) {
  const stats = [
    { label: 'XP total', value: progress.xp, icon: Star },
    { label: 'Sequencia', value: progress.streak, icon: Flame },
    { label: 'Minutos', value: totalMinutes, icon: CalendarCheck },
    { label: 'Freeze', value: progress.freezeStreaks, icon: ShieldCheck },
    { label: 'Fala', value: progress.speakingSessions, icon: Mic },
    { label: 'Hanzi', value: progress.writingSessions, icon: Brush },
  ]

  const mockRankings = [
    { name: 'Você', xp: progress.xp, current: true },
    { name: 'Ana S.', xp: progress.xp + 120, current: false },
    { name: 'Lucas M.', xp: Math.max(0, progress.xp - 50), current: false },
  ].sort((a, b) => b.xp - a.xp)

  return (
    <div className="profile-layout">
      <section className="profile-hero">
        <p className="eyebrow">RedTail Score</p>
        <h2>{progress.xp < 150 ? 'Explorador HSK 1' : 'Aprendiz consistente'}</h2>
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
          <span>HSK 1 completo</span>
          <span>Dialogos por IA</span>
          <span>Buddy streak</span>
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
