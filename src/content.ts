export type Phrase = {
  id: string
  hanzi: string
  pinyin: string
  portuguese: string
  literal: string
  note: string
  tonePattern: string
}

export type Lesson = {
  id: string
  unitId: string
  title: string
  focus: string
  xp: number
  minutes: number
  phrases: Phrase[]
}

export type Unit = {
  id: string
  title: string
  level: string
  accent: 'red' | 'jade' | 'gold' | 'ink'
  summary: string
  lessonIds: string[]
}

export type ClipSeed = {
  id: string
  title: string
  source: string
  level: string
  theme: string
  url: string
  kind: 'article' | 'video' | 'song'
}

export type WritingCharacter = {
  id: string
  character: string
  pinyin: string
  meaning: string
  strokes: number
  radical: string
  words: string[]
  strokeOrder: string[]
}

export const units: Unit[] = [
  {
    id: 'tones',
    title: 'Pinyin e tons',
    level: 'Fundacao',
    accent: 'red',
    summary: 'Som, ritmo, tons e primeiras silabas.',
    lessonIds: ['tones-hello', 'tones-four', 'tones-initials'],
  },
  {
    id: 'survival',
    title: 'Mandarim de sobrevivencia',
    level: 'HSK 1',
    accent: 'jade',
    summary: 'Frases curtas para cumprimentar, agradecer e responder.',
    lessonIds: ['survival-greetings', 'survival-politeness', 'survival-questions'],
  },
  {
    id: 'numbers',
    title: 'Numeros e compras',
    level: 'HSK 1',
    accent: 'gold',
    summary: 'Contar, perguntar preco e pedir coisas simples.',
    lessonIds: ['numbers-basic', 'numbers-money', 'numbers-order'],
  },
  {
    id: 'daily',
    title: 'Vida diaria',
    level: 'HSK 1+',
    accent: 'ink',
    summary: 'Familia, tempo, comida e rotinas.',
    lessonIds: ['daily-family', 'daily-food', 'daily-time'],
  },
]

export const lessons: Lesson[] = [
  {
    id: 'tones-hello',
    unitId: 'tones',
    title: 'Ola sem tropeçar nos tons',
    focus: 'Tons 3-3, saudacao basica',
    xp: 15,
    minutes: 5,
    phrases: [
      {
        id: 'ni-hao',
        hanzi: '你好',
        pinyin: 'nǐ hǎo',
        portuguese: 'ola',
        literal: 'voce bom',
        note: 'Na fala natural, o primeiro terceiro tom sobe para soar mais leve.',
        tonePattern: '3-3',
      },
      {
        id: 'wo-hen-hao',
        hanzi: '我很好',
        pinyin: 'wǒ hěn hǎo',
        portuguese: 'eu estou bem',
        literal: 'eu muito bom',
        note: 'hen suaviza a frase; nem sempre significa "muito" nesse contexto.',
        tonePattern: '3-3-3',
      },
    ],
  },
  {
    id: 'tones-four',
    unitId: 'tones',
    title: 'Quatro tons, uma silaba',
    focus: 'ma nos tons 1, 2, 3 e 4',
    xp: 20,
    minutes: 6,
    phrases: [
      {
        id: 'ma-tones',
        hanzi: '妈 麻 马 骂',
        pinyin: 'mā má mǎ mà',
        portuguese: 'mae, canhamo, cavalo, xingar',
        literal: 'quatro tons com ma',
        note: 'A mesma silaba muda de significado quando o tom muda.',
        tonePattern: '1-2-3-4',
      },
      {
        id: 'shi-tones',
        hanzi: '是 十 事',
        pinyin: 'shì shí shì',
        portuguese: 'ser, dez, assunto',
        literal: 'sons parecidos, tons diferentes',
        note: 'Ouvir pares minimos ajuda a separar significado por tom.',
        tonePattern: '4-2-4',
      },
    ],
  },
  {
    id: 'tones-initials',
    unitId: 'tones',
    title: 'Iniciais que confundem',
    focus: 'zh, ch, sh, r',
    xp: 20,
    minutes: 7,
    phrases: [
      {
        id: 'zhong-guo',
        hanzi: '中国',
        pinyin: 'Zhōngguó',
        portuguese: 'China',
        literal: 'pais do meio',
        note: 'zh tem a lingua enrolada para tras, diferente de z.',
        tonePattern: '1-2',
      },
      {
        id: 'ren',
        hanzi: '人',
        pinyin: 'rén',
        portuguese: 'pessoa',
        literal: 'pessoa',
        note: 'O r em mandarim fica entre r, zh e um som mais retroflexo.',
        tonePattern: '2',
      },
    ],
  },
  {
    id: 'survival-greetings',
    unitId: 'survival',
    title: 'Cumprimentos reais',
    focus: 'ola, ate logo, nome',
    xp: 18,
    minutes: 6,
    phrases: [
      {
        id: 'zao-shang-hao',
        hanzi: '早上好',
        pinyin: 'zǎoshang hǎo',
        portuguese: 'bom dia',
        literal: 'manha boa',
        note: 'Usado pela manha; ni hao ainda funciona em muitas situacoes.',
        tonePattern: '3-0-3',
      },
      {
        id: 'zai-jian',
        hanzi: '再见',
        pinyin: 'zàijiàn',
        portuguese: 'tchau',
        literal: 'ver de novo',
        note: 'Formal o suficiente para quase qualquer contexto.',
        tonePattern: '4-4',
      },
    ],
  },
  {
    id: 'survival-politeness',
    unitId: 'survival',
    title: 'Educacao rapida',
    focus: 'obrigado, desculpa, sem problema',
    xp: 18,
    minutes: 6,
    phrases: [
      {
        id: 'xie-xie',
        hanzi: '谢谢',
        pinyin: 'xièxie',
        portuguese: 'obrigado',
        literal: 'agradecer',
        note: 'A segunda silaba costuma ficar mais leve.',
        tonePattern: '4-0',
      },
      {
        id: 'mei-guan-xi',
        hanzi: '没关系',
        pinyin: 'méi guānxi',
        portuguese: 'sem problema',
        literal: 'nao tem relacao',
        note: 'Resposta natural para desculpas ou pequenos erros.',
        tonePattern: '2-1-0',
      },
    ],
  },
  {
    id: 'survival-questions',
    unitId: 'survival',
    title: 'Perguntas pequenas',
    focus: 'particula ma e perguntas simples',
    xp: 20,
    minutes: 7,
    phrases: [
      {
        id: 'ni-hao-ma',
        hanzi: '你好吗？',
        pinyin: 'nǐ hǎo ma?',
        portuguese: 'voce esta bem?',
        literal: 'voce bom pergunta',
        note: 'ma transforma uma frase em pergunta sim/nao.',
        tonePattern: '3-3-0',
      },
      {
        id: 'shen-me',
        hanzi: '什么？',
        pinyin: 'shénme?',
        portuguese: 'o que?',
        literal: 'que coisa',
        note: 'Uma das palavras de pergunta mais frequentes.',
        tonePattern: '2-0',
      },
    ],
  },
  {
    id: 'numbers-basic',
    unitId: 'numbers',
    title: 'Numeros 1 a 10',
    focus: 'contagem e reconhecimento auditivo',
    xp: 16,
    minutes: 5,
    phrases: [
      {
        id: 'yi-er-san',
        hanzi: '一 二 三',
        pinyin: 'yī, èr, sān',
        portuguese: 'um, dois, tres',
        literal: '1 2 3',
        note: 'yi muda de tom em combinacoes, mas primeiro memorize o som base.',
        tonePattern: '1-4-1',
      },
      {
        id: 'shi',
        hanzi: '十',
        pinyin: 'shí',
        portuguese: 'dez',
        literal: '10',
        note: 'O segundo tom sobe, como uma pergunta curta.',
        tonePattern: '2',
      },
    ],
  },
  {
    id: 'numbers-money',
    unitId: 'numbers',
    title: 'Quanto custa?',
    focus: 'preco e demonstrativos',
    xp: 22,
    minutes: 7,
    phrases: [
      {
        id: 'duo-shao-qian',
        hanzi: '多少钱？',
        pinyin: 'duōshao qián?',
        portuguese: 'quanto custa?',
        literal: 'quanto dinheiro',
        note: 'Frase pronta para lojas, mercados e taxis.',
        tonePattern: '1-0-2',
      },
      {
        id: 'zhe-ge',
        hanzi: '这个',
        pinyin: 'zhège',
        portuguese: 'este',
        literal: 'este item',
        note: 'Muito usado apontando para algo que voce quer.',
        tonePattern: '4-0',
      },
    ],
  },
  {
    id: 'numbers-order',
    unitId: 'numbers',
    title: 'Pedir comida',
    focus: 'quero, uma unidade, agua',
    xp: 22,
    minutes: 7,
    phrases: [
      {
        id: 'wo-yao',
        hanzi: '我要',
        pinyin: 'wǒ yào',
        portuguese: 'eu quero',
        literal: 'eu querer',
        note: 'Funciona para pedidos simples, mas use com educacao.',
        tonePattern: '3-4',
      },
      {
        id: 'yi-bei-shui',
        hanzi: '一杯水',
        pinyin: 'yì bēi shuǐ',
        portuguese: 'um copo de agua',
        literal: 'um copo agua',
        note: 'bei e o classificador para copos e bebidas.',
        tonePattern: '4-1-3',
      },
    ],
  },
  {
    id: 'daily-family',
    unitId: 'daily',
    title: 'Familia',
    focus: 'pessoas proximas',
    xp: 18,
    minutes: 6,
    phrases: [
      {
        id: 'wo-de-jia',
        hanzi: '我的家',
        pinyin: 'wǒ de jiā',
        portuguese: 'minha familia / minha casa',
        literal: 'eu possessivo casa',
        note: 'jia pode ser casa ou familia dependendo do contexto.',
        tonePattern: '3-0-1',
      },
      {
        id: 'peng-you',
        hanzi: '朋友',
        pinyin: 'péngyou',
        portuguese: 'amigo',
        literal: 'amigo',
        note: 'A segunda silaba e neutra na fala comum.',
        tonePattern: '2-0',
      },
    ],
  },
  {
    id: 'daily-food',
    unitId: 'daily',
    title: 'Comida do dia a dia',
    focus: 'comer, beber, arroz',
    xp: 20,
    minutes: 7,
    phrases: [
      {
        id: 'chi-fan',
        hanzi: '吃饭',
        pinyin: 'chī fàn',
        portuguese: 'comer / fazer refeicao',
        literal: 'comer arroz',
        note: 'Chifan virou uma expressao geral para fazer uma refeicao.',
        tonePattern: '1-4',
      },
      {
        id: 'he-shui',
        hanzi: '喝水',
        pinyin: 'hē shuǐ',
        portuguese: 'beber agua',
        literal: 'beber agua',
        note: 'h em he e aspirado, com ar saindo claro.',
        tonePattern: '1-3',
      },
    ],
  },
  {
    id: 'daily-time',
    unitId: 'daily',
    title: 'Hoje, agora, amanha',
    focus: 'tempo basico',
    xp: 20,
    minutes: 7,
    phrases: [
      {
        id: 'jin-tian',
        hanzi: '今天',
        pinyin: 'jīntiān',
        portuguese: 'hoje',
        literal: 'este dia',
        note: 'j exige a lingua mais alta, perto do som de ji.',
        tonePattern: '1-1',
      },
      {
        id: 'ming-tian',
        hanzi: '明天',
        pinyin: 'míngtiān',
        portuguese: 'amanha',
        literal: 'dia claro',
        note: 'Muito util para combinar horarios simples.',
        tonePattern: '2-1',
      },
    ],
  },
]

export const clipSeeds: ClipSeed[] = [
  {
    id: 'pinyin-chart',
    title: 'Tabela de pinyin com audio',
    source: 'Yoyo Chinese',
    level: 'Fundacao',
    theme: 'pinyin',
    kind: 'article',
    url: 'https://yoyochinese.com/chinese-learning-tools/Mandarin-Chinese-pronunciation-lesson/pinyin-chart-table',
  },
  {
    id: 'digmandarin-pinyin',
    title: 'Guia completo de pinyin',
    source: 'DigMandarin',
    level: 'Fundacao',
    theme: 'tons',
    kind: 'article',
    url: 'https://www.digmandarin.com/learn-chinese-pinyin',
  },
  {
    id: 'goeast-pronunciation',
    title: 'Pronuncia e pares minimos',
    source: 'GoEast Mandarin',
    level: 'HSK 1',
    theme: 'pronuncia',
    kind: 'article',
    url: 'https://goeastmandarin.com/chinese-pronunciation/',
  },
  {
    id: 'music-lab',
    title: 'Aprender chines com musica',
    source: 'Chinese with Ping',
    level: 'Livre',
    theme: 'musica',
    kind: 'song',
    url: 'https://www.chinesewithping.com/',
  },
]

export const allPhrases = lessons.flatMap((lesson) =>
  lesson.phrases.map((phrase) => ({
    ...phrase,
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    unitId: lesson.unitId,
  })),
)

export const toneDrills = [
  {
    id: 'ma',
    title: 'ma em quatro tons',
    hanzi: '妈 麻 马 骂',
    pinyin: 'mā má mǎ mà',
    focus: 'Altura da voz',
  },
  {
    id: 'hao',
    title: 'terceiro tom em sequencia',
    hanzi: '你好 很好',
    pinyin: 'nǐ hǎo, hěn hǎo',
    focus: 'Mudanca do terceiro tom',
  },
  {
    id: 'shi',
    title: 'sh e tons curtos',
    hanzi: '是 十 事',
    pinyin: 'shì shí shì',
    focus: 'Retroflexo e contraste',
  },
]

export const writingCharacters: WritingCharacter[] = [
  {
    id: 'ren',
    character: '人',
    pinyin: 'rén',
    meaning: 'pessoa',
    strokes: 2,
    radical: '人',
    words: ['人', '中国人', '朋友'],
    strokeOrder: ['Traço descendente para a esquerda.', 'Traço descendente para a direita, abrindo a base.'],
  },
  {
    id: 'kou',
    character: '口',
    pinyin: 'kǒu',
    meaning: 'boca / abertura',
    strokes: 3,
    radical: '口',
    words: ['口', '人口', '门口'],
    strokeOrder: ['Vertical esquerda.', 'Canto superior e vertical direita.', 'Linha inferior fechando o quadrado.'],
  },
  {
    id: 'ni',
    character: '你',
    pinyin: 'nǐ',
    meaning: 'voce',
    strokes: 7,
    radical: '亻',
    words: ['你好', '你们', '你好吗'],
    strokeOrder: [
      'Componente pessoa: traço inclinado curto.',
      'Vertical do componente pessoa.',
      'Pequeno traço inclinado no topo direito.',
      'Gancho horizontal descendo no centro.',
      'Traço vertical com gancho.',
      'Ponto esquerdo.',
      'Ponto direito.',
    ],
  },
  {
    id: 'hao',
    character: '好',
    pinyin: 'hǎo',
    meaning: 'bom / bem',
    strokes: 6,
    radical: '女',
    words: ['你好', '很好', '好吃'],
    strokeOrder: [
      'Mulher: traço curvo para baixo.',
      'Traço inclinado cruzando.',
      'Horizontal do componente mulher.',
      'Filho: traço horizontal curto.',
      'Gancho vertical.',
      'Horizontal final atravessando o componente filho.',
    ],
  },
  {
    id: 'zhong',
    character: '中',
    pinyin: 'zhōng',
    meaning: 'meio / China',
    strokes: 4,
    radical: '丨',
    words: ['中国', '中文', '中午'],
    strokeOrder: ['Caixa externa esquerda.', 'Topo e direita da caixa.', 'Base da caixa.', 'Vertical central atravessando.'],
  },
  {
    id: 'shui',
    character: '水',
    pinyin: 'shuǐ',
    meaning: 'agua',
    strokes: 4,
    radical: '水',
    words: ['喝水', '一杯水', '水果'],
    strokeOrder: ['Vertical com gancho no centro.', 'Traço descendente esquerdo.', 'Traço curto direito.', 'Traço longo direito.'],
  },
]
