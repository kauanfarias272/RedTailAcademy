/**
 * Krashen-Inspired Learning Framework
 * Implementação dos princípios de Stephen Krashen para aquisição de linguagem
 *
 * Princípios:
 * 1. Comprehensible Input (i+1): Input levemente acima do nível atual
 * 2. Monitor Hypothesis: Consciente x Inconsciente
 * 3. Affective Filter: Reduzir ansiedade
 * 4. Natural Order: Ordem natural de aquisição
 * 5. Acquisition vs Learning: Focar em aquisição
 */

export interface KrashenLevel {
  stage: 'silent' | 'early-production' | 'speech-emergence' | 'intermediate' | 'advanced'
  characteristics: string[]
  focusAreas: string[]
  inputLevel: 'comprehensible' | 'comprehensible+1' | 'comprehensible+2'
}

export interface ComprehensibleInput {
  /** Conteúdo visual para ajudar compreensão */
  visualSupport: string[]
  /** Contexto situacional */
  context: string
  /** Palavras-chave repetidas */
  keyPhrases: string[]
  /** Velocidade de fala recomendada (0.5-2.0) */
  speechRate: number
  /** Suporte de legenda recomendado */
  captionsNeeded: boolean
}

/**
 * Niveis de aquisição de Krashen
 */
export const KRASHEN_STAGES: Record<string, KrashenLevel> = {
  silent: {
    stage: 'silent',
    characteristics: [
      'Compreende mas não fala',
      'Fase de absorção',
      'Escuta atentamente',
    ],
    focusAreas: [
      'Input compreensível (vídeos, imagens)',
      'Escuta passiva',
      'Familiarização com sons',
    ],
    inputLevel: 'comprehensible',
  },
  earlyProduction: {
    stage: 'early-production',
    characteristics: [
      'Fala frases curtas',
      'Respostas simples (sim/não)',
      'Uma ou duas palavras',
    ],
    focusAreas: [
      'Frases simples',
      'Vocabulário básico',
      'Pronúncia com feedback',
    ],
    inputLevel: 'comprehensible',
  },
  speechEmergence: {
    stage: 'speech-emergence',
    characteristics: [
      'Forma frases simples',
      'Começa a experimentar a língua',
      'Usa gestos menos',
    ],
    focusAreas: [
      'Construir frases',
      'Listening & Speaking juntos',
      'Chunks e colocações',
    ],
    inputLevel: 'comprehensible+1',
  },
  intermediate: {
    stage: 'intermediate',
    characteristics: [
      'Conversação fluida em contextos simples',
      'Entende conversação natural',
      'Faz perguntas',
    ],
    focusAreas: [
      'Conversação em contextos reais',
      'Escuta de material autêntico',
      'Nuances e expressões idiomáticas',
    ],
    inputLevel: 'comprehensible+1',
  },
  advanced: {
    stage: 'advanced',
    characteristics: [
      'Compreensão de material complexo',
      'Expressão fluida e natural',
      'Pode usar humor e nuances',
    ],
    focusAreas: [
      'Input autêntico complexo',
      'Escrita acadêmica/profissional',
      'Idiomaticidade e sotaque nativo',
    ],
    inputLevel: 'comprehensible+2',
  },
}

/**
 * Classifica o nível do usuário baseado em XP e lições completadas
 */
export function getUserKrashenStage(
  xp: number,
  lessonsCompleted: number
): string {
  if (lessonsCompleted < 5) return 'silent'
  if (lessonsCompleted < 15) return 'earlyProduction'
  if (lessonsCompleted < 35) return 'speechEmergence'
  if (lessonsCompleted < 70) return 'intermediate'
  return 'advanced'
}

/**
 * Gera input compreensível para o usuário
 */
export function generateComprehensibleInput(
  stage: string,
  phrase: string,
  translation: string,
  visualElements: string[] = []
): ComprehensibleInput {
  const stageInfo = KRASHEN_STAGES[stage] || KRASHEN_STAGES.silent

  return {
    visualSupport: visualElements,
    context: `Contexto: Aprendendo "${phrase}" (${translation})`,
    keyPhrases: [phrase],
    speechRate: stage === 'silent' ? 0.7 : stage === 'earlyProduction' ? 0.8 : 0.95,
    captionsNeeded: stage === 'silent' || stage === 'earlyProduction',
  }
}

/**
 * Cria um lesson plan baseado em Krashen
 * Foca em Comprehensible Input (i+1)
 */
export function createKrashenLesson(
  baseLevel: string,
  lessonTitle: string,
  phrases: Array<{ phrase: string; translation: string }>
) {
  const userStage = KRASHEN_STAGES[baseLevel] || KRASHEN_STAGES.silent

  return {
    title: lessonTitle,
    stage: baseLevel,
    inputLevel: userStage.inputLevel,
    focusAreas: userStage.focusAreas,
    activities: [
      {
        type: 'comprehensible-input',
        title: 'Escuta e Visualização',
        description: 'Entenda o input com apoio visual',
        duration: 3,
      },
      {
        type: 'repetition',
        title: 'Repetição Natural',
        description: 'Repita as frases para familiarização',
        duration: 2,
      },
      ...(baseLevel !== 'silent'
        ? [
            {
              type: 'production',
              title: 'Produção Ativa',
              description: 'Tente usar as frases',
              duration: 3,
            },
          ]
        : []),
      {
        type: 'reinforcement',
        title: 'Reforço com Repetição Espaçada',
        description: 'Cards SRS baseados em Anki',
        duration: 2,
      },
    ],
  }
}

/**
 * Recomenda velocidade de fala baseada no estágio
 */
export function recommendSpeechRate(stage: string): number {
  const rates: Record<string, number> = {
    silent: 0.6,
    'early-production': 0.7,
    'speech-emergence': 0.85,
    intermediate: 0.95,
    advanced: 1.2,
  }
  return rates[stage] || 0.8
}
