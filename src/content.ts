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

export type StudyMoment = {
  id: string
  title: string
  source: string
  type: 'meme' | 'song' | 'anthem' | 'history'
  level: string
  phrase: string
  pinyin: string
  meaning: string
  note: string
  searchUrl: string
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

export type Chunk = {
  id: string
  unitId?: Unit['id']
  hanzi: string
  pinyin: string
  portuguese: string
  gloss: string
  blank: string
  blankAnswer: string
  note: string
}

export const units: Unit[] = [
  {
    id: 'tones',
    title: 'Nadando na lagoa',
    level: 'Fase 1',
    accent: 'red',
    summary: 'O carpa testa a agua: som, ritmo, tons e primeiras silabas.',
    lessonIds: ['tones-hello', 'tones-four', 'tones-initials', 'tones-vowels', 'tones-nasals'],
  },
  {
    id: 'survival',
    title: 'Subindo o rio',
    level: 'Fase 2',
    accent: 'jade',
    summary: 'Cumprimentos, agradecimentos e respostas curtas para nao se perder na correnteza.',
    lessonIds: ['survival-greetings', 'survival-politeness', 'survival-questions', 'survival-introduction', 'survival-location'],
  },
  {
    id: 'numbers',
    title: 'Cachoeira do Dragao',
    level: 'Fase 3',
    accent: 'gold',
    summary: 'Contar, perguntar preco e pedir coisas para nao parar antes da cachoeira.',
    lessonIds: ['numbers-basic', 'numbers-money', 'numbers-order', 'numbers-dates', 'numbers-addresses'],
  },
  {
    id: 'daily',
    title: 'Saltando o Portao',
    level: 'Fase 4',
    accent: 'ink',
    summary: 'Familia, tempo, comida e rotinas: o ultimo salto antes de virar dragao.',
    lessonIds: ['daily-family', 'daily-food', 'daily-time', 'daily-hobbies', 'daily-descriptions'],
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
    id: 'tones-vowels',
    unitId: 'tones',
    title: 'Vogais longas e curtas',
    focus: 'Diferenca entre ui, iu, ao, ou',
    xp: 18,
    minutes: 6,
    phrases: [
      {
        id: 'gui-dui',
        hanzi: '鬼 推',
        pinyin: 'guǐ tuī',
        portuguese: 'fantasma, empurrar',
        literal: 'fantasma e empurrar',
        note: 'ui em gui soa como uma vogal unica; em dui come com a lingua mais atras.',
        tonePattern: '3-1',
      },
      {
        id: 'niu-kou',
        hanzi: '牛 口',
        pinyin: 'niú kǒu',
        portuguese: 'vaca, boca',
        literal: 'vaca e boca',
        note: 'iu tem uma pronuncia rapida; ou em dui e mais alongado.',
        tonePattern: '2-3',
      },
    ],
  },
  {
    id: 'tones-nasals',
    unitId: 'tones',
    title: 'Sons nasais n, ng, m',
    focus: 'Distincao entre n e ng finais',
    xp: 22,
    minutes: 7,
    phrases: [
      {
        id: 'tan-tang',
        hanzi: '谈 堂',
        pinyin: 'tán táng',
        portuguese: 'discutir, sala',
        literal: 'discutir e sala',
        note: 'an termina com lingua na boca; ang vai para a garganta.',
        tonePattern: '2-2',
      },
      {
        id: 'min-ming',
        hanzi: '民 名',
        pinyin: 'mín míng',
        portuguese: 'povo, nome',
        literal: 'povo e nome',
        note: 'in e diferente de ing; ing tem a lingua enrolada para tras.',
        tonePattern: '2-2',
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
    id: 'survival-introduction',
    unitId: 'survival',
    title: 'Apresentacao pessoal',
    focus: 'Nome, profissao, procedencia',
    xp: 20,
    minutes: 7,
    phrases: [
      {
        id: 'wo-jiao',
        hanzi: '我叫卡蓝',
        pinyin: 'wǒ jiào Kǎ-lán',
        portuguese: 'me chamo Kauan',
        literal: 'eu chamar Kauan',
        note: 'jiào e usado para nomes, nunca shifu(師傅) aqui, mas em contexto de respeito.',
        tonePattern: '3-4-3-2',
      },
      {
        id: 'wo-shi-xuesheng',
        hanzi: '我是学生',
        pinyin: 'wǒ shì xuésheng',
        portuguese: 'eu sou estudante',
        literal: 'eu ser estudante',
        note: 'shi e o verbo ser; xuesheng e um nomen de profissao comum.',
        tonePattern: '3-4-2',
      },
    ],
  },
  {
    id: 'survival-location',
    unitId: 'survival',
    title: 'Localizacao e direcoes',
    focus: 'Ontem esta aqui, vem ca',
    xp: 22,
    minutes: 7,
    phrases: [
      {
        id: 'zai-nar',
        hanzi: '在哪儿？',
        pinyin: 'zài nǎr?',
        portuguese: 'onde esta?',
        literal: 'em que lugar',
        note: 'nar e coloquial para nar/nali; usado em pergunta por localizacao.',
        tonePattern: '4-3',
      },
      {
        id: 'zai-zher',
        hanzi: '在这儿',
        pinyin: 'zài zhèr',
        portuguese: 'esta aqui',
        literal: 'em este lugar',
        note: 'zher e a forma coloquial para aqui; zha e mais formal.',
        tonePattern: '4-4',
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
    id: 'numbers-dates',
    unitId: 'numbers',
    title: 'Datas e numeros maiores',
    focus: '11 a 99, dias da semana',
    xp: 24,
    minutes: 8,
    phrases: [
      {
        id: 'shi-yi',
        hanzi: '十一',
        pinyin: 'shíyī',
        portuguese: 'onze',
        literal: 'dez um',
        note: 'Numeros maiores que 10 seguem: 10 + unidade. Exceto 20 = ershi (nao shi-shi).',
        tonePattern: '2-1',
      },
      {
        id: 'xingqi-yi',
        hanzi: '星期一',
        pinyin: 'xīngqī yī',
        portuguese: 'segunda-feira',
        literal: 'semana um',
        note: 'xingqi + numero (1-6 = segunda a sabado); domingo e xingqi ri ou zhou ri.',
        tonePattern: '1-1-1',
      },
    ],
  },
  {
    id: 'numbers-addresses',
    unitId: 'numbers',
    title: 'Endereco e locais comerciais',
    focus: 'Rua, numero, andar',
    xp: 24,
    minutes: 8,
    phrases: [
      {
        id: 'lu-hao',
        hanzi: '路号',
        pinyin: 'lù hào',
        portuguese: 'rua numero',
        literal: 'rua numero',
        note: 'lu = rua; hao = numero; usado em enderecos chineses.',
        tonePattern: '4-4',
      },
      {
        id: 'lou-ceng',
        hanzi: '楼层',
        pinyin: 'lóucéng',
        portuguese: 'andar',
        literal: 'andar',
        note: 'lou = predio; ceng = andar. Em China, o "primeiro andar" e o ground floor (nos EUA seria segundo).',
        tonePattern: '2-2',
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
  {
    id: 'daily-hobbies',
    unitId: 'daily',
    title: 'Hobbies e atividades',
    focus: 'Gostar, desportos, passatempos',
    xp: 22,
    minutes: 7,
    phrases: [
      {
        id: 'xi-huan-you-yong',
        hanzi: '喜欢游泳',
        pinyin: 'xǐhuan yóu-yǒng',
        portuguese: 'gosto de nadar',
        literal: 'gostar nadar',
        note: 'xihuan = gostar; youyong = nadar. Padrao: xihuan + verbo.',
        tonePattern: '3-0-2-3',
      },
      {
        id: 'wan-youxi',
        hanzi: '玩游戏',
        pinyin: 'wán yóu-xì',
        portuguese: 'jogar jogos',
        literal: 'jogar jogos',
        note: 'wan = brincar/jogar; youxi = jogo. Muito usado para videogames (dianzi youxi).',
        tonePattern: '2-2-4',
      },
    ],
  },
  {
    id: 'daily-descriptions',
    unitId: 'daily',
    title: 'Descricoes e adjetivos',
    focus: 'Grande, pequeno, bonito, feio',
    xp: 22,
    minutes: 7,
    phrases: [
      {
        id: 'da-xiaoyang',
        hanzi: '大小样',
        pinyin: 'dà xiǎo yàng',
        portuguese: 'tamanho',
        literal: 'grande pequeno forma',
        note: 'da = grande; xiao = pequeno. Adjetivos vem antes do substantivo em chines.',
        tonePattern: '4-3-4',
      },
      {
        id: 'piao-liang',
        hanzi: '漂亮',
        pinyin: 'piàoliang',
        portuguese: 'bonito / lindo',
        literal: 'flutuante brilhante',
        note: 'piaolaing e um adjetivo muito comum para descrever beleza ou elegancia.',
        tonePattern: '4-0',
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

export const studyMoments: StudyMoment[] = [
  {
    id: 'super-idol',
    title: 'Super Idol',
    source: 'Meme musical',
    type: 'song',
    level: 'Livre',
    phrase: '笑容',
    pinyin: 'xiàoróng',
    meaning: 'sorriso',
    note: 'Use o meme para treinar xiao, rong e o segundo tom subindo no final.',
    searchUrl: 'https://www.youtube.com/results?search_query=Super+Idol+Chinese+lyrics+learning',
  },
  {
    id: 'john-cena-bing-chilling',
    title: 'John Cena falando mandarim',
    source: 'Meme de entrevista',
    type: 'meme',
    level: 'HSK 1',
    phrase: '冰淇淋',
    pinyin: 'bīngqílín',
    meaning: 'sorvete',
    note: 'Palavra divertida para treinar b, q e tons em sequencia.',
    searchUrl: 'https://www.youtube.com/results?search_query=John+Cena+Mandarin+bing+chilling',
  },
  {
    id: 'chinese-anthem',
    title: 'Hino chines',
    source: 'Musica civica',
    type: 'anthem',
    level: 'Interesse cultural',
    phrase: '起来',
    pinyin: 'qǐlái',
    meaning: 'levantar-se',
    note: 'Boa palavra para perceber terceiro tom seguido de segundo tom.',
    searchUrl: 'https://www.youtube.com/results?search_query=Chinese+national+anthem+lyrics+pinyin',
  },
  {
    id: 'mao-historical-song',
    title: 'Cancoes historicas de Mao Zedong',
    source: 'Contexto historico',
    type: 'history',
    level: 'Cultura',
    phrase: '东方红',
    pinyin: 'Dōngfāng hóng',
    meaning: 'o oriente e vermelho',
    note: 'Use como contexto cultural e para treinar dong, fang e hong sem depender de traducao literal.',
    searchUrl: 'https://www.youtube.com/results?search_query=The+East+is+Red+Chinese+pinyin',
  },
  {
    id: 'football-meme',
    title: 'Meme de torcida',
    source: 'Frase viral',
    type: 'meme',
    level: 'HSK 1',
    phrase: '加油',
    pinyin: 'jiāyóu',
    meaning: 'forca / vamos la',
    note: 'Perfeito para jogos, desafios e rankings entre amigos.',
    searchUrl: 'https://www.youtube.com/results?search_query=jiayou+Chinese+meme',
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
  {
    id: 'shi',
    character: '是',
    pinyin: 'shì',
    meaning: 'ser / estar',
    strokes: 9,
    radical: '日',
    words: ['是', '你是学生', '这是'],
    strokeOrder: [
      'Ponto esquerdo do radical sol.',
      'Traço horizontal.',
      'Vertical esquerda do sol.',
      'Horizontal do sol.',
      'Vertical direita do sol.',
      'Horizontal final do sol.',
      'Traço horizontal acima de shi.',
      'Traço vertical com gancho.',
      'Traço final.',
    ],
  },
  {
    id: 'hao-alt',
    character: '号',
    pinyin: 'hào',
    meaning: 'numero / marca',
    strokes: 5,
    radical: '号',
    words: ['号码', '第一号', '路号'],
    strokeOrder: [
      'Vertical com gancho (esquerda).',
      'Horizontal no topo.',
      'Horizontal no meio.',
      'Horizontal abaixo.',
      'Traço final.',
    ],
  },
  {
    id: 'jia',
    character: '家',
    pinyin: 'jiā',
    meaning: 'casa / familia',
    strokes: 10,
    radical: '宀',
    words: ['家', '我的家', '回家'],
    strokeOrder: [
      'Topo esquerdo (telhado).',
      'Topo central (telhado).',
      'Topo direito (telhado).',
      'Vertical esquerda.',
      'Ponto superior do caractere interno.',
      'Horizontal central.',
      'Vertical com gancho.',
      'Traço descendente.',
      'Traço na base.',
      'Traço final da base.',
    ],
  },
  {
    id: 'shi-eat',
    character: '吃',
    pinyin: 'chī',
    meaning: 'comer',
    strokes: 6,
    radical: '口',
    words: ['吃饭', '好吃', '吃饭了'],
    strokeOrder: [
      'Vertical esquerda da boca.',
      'Horizontal superior.',
      'Vertical direita da boca.',
      'Horizontal inferior da boca.',
      'Traço no centro superior.',
      'Traço no centro inferior.',
    ],
  },
]

export const chunks: Chunk[] = [
  {
    id: 'chunk-meu-nome',
    unitId: 'survival',
    hanzi: '我叫卡蓝',
    pinyin: 'wǒ jiào Kǎ-lán',
    portuguese: 'me chamo Kauan',
    gloss: 'eu / chamar / Kauan',
    blank: '我___卡蓝',
    blankAnswer: '叫',
    note: 'Use 叫 (jiào) para apresentar como gosta de ser chamado. Troque o final pelo seu nome.',
  },
  {
    id: 'chunk-tudo-bem',
    unitId: 'survival',
    hanzi: '你好吗',
    pinyin: 'nǐ hǎo ma',
    portuguese: 'tudo bem?',
    gloss: 'voce / bem / (pergunta)',
    blank: '你好___',
    blankAnswer: '吗',
    note: 'A particula 吗 (ma) transforma uma afirmacao em pergunta sim/nao.',
  },
  {
    id: 'chunk-obrigado',
    unitId: 'survival',
    hanzi: '谢谢你',
    pinyin: 'xièxie nǐ',
    portuguese: 'obrigado a voce',
    gloss: 'obrigado / voce',
    blank: '谢谢___',
    blankAnswer: '你',
    note: 'Bloco fixo: 谢谢 vai sempre antes do alvo do agradecimento.',
  },
  {
    id: 'chunk-quanto-custa',
    unitId: 'numbers',
    hanzi: '这个多少钱',
    pinyin: 'zhège duōshao qián',
    portuguese: 'quanto custa isto?',
    gloss: 'isto / quanto / dinheiro',
    blank: '这个___钱',
    blankAnswer: '多少',
    note: '多少钱 e o bloco de preco, sempre vem ao fim da pergunta.',
  },
  {
    id: 'chunk-quero-isto',
    unitId: 'numbers',
    hanzi: '我要这个',
    pinyin: 'wǒ yào zhège',
    portuguese: 'eu quero este',
    gloss: 'eu / querer / este',
    blank: '我___这个',
    blankAnswer: '要',
    note: '要 (yào) funciona como pedido firme, comum em lojas e restaurantes.',
  },
  {
    id: 'chunk-cafe',
    unitId: 'numbers',
    hanzi: '我想喝咖啡',
    pinyin: 'wǒ xiǎng hē kāfēi',
    portuguese: 'eu quero (gostaria de) tomar cafe',
    gloss: 'eu / desejar / beber / cafe',
    blank: '我___喝咖啡',
    blankAnswer: '想',
    note: '想 + verbo expressa desejo educado. 喝 + bebida e o bloco classico.',
  },
  {
    id: 'chunk-vou-parque',
    unitId: 'daily',
    hanzi: '我去公园',
    pinyin: 'wǒ qù gōngyuán',
    portuguese: 'eu vou ao parque',
    gloss: 'eu / ir / parque',
    blank: '我___公园',
    blankAnswer: '去',
    note: '去 + lugar, sem preposicao no meio. Esse bloco vale para qualquer destino.',
  },
  {
    id: 'chunk-tempo',
    unitId: 'daily',
    hanzi: '今天天气好',
    pinyin: 'jīntiān tiānqì hǎo',
    portuguese: 'hoje o tempo esta bom',
    gloss: 'hoje / tempo / bom',
    blank: '今天___好',
    blankAnswer: '天气',
    note: '天气 e a unidade pronta para descrever o clima. 好 fecha o bloco.',
  },
  {
    id: 'chunk-gosto-comer',
    unitId: 'daily',
    hanzi: '我喜欢吃面',
    pinyin: 'wǒ xǐhuan chī miàn',
    portuguese: 'eu gosto de comer macarrao',
    gloss: 'eu / gostar / comer / macarrao',
    blank: '我___吃面',
    blankAnswer: '喜欢',
    note: '喜欢 + verbo + objeto e o bloco padrao para falar do que voce gosta de fazer.',
  },
  {
    id: 'chunk-que-horas',
    unitId: 'daily',
    hanzi: '现在几点',
    pinyin: 'xiànzài jǐ diǎn',
    portuguese: 'que horas sao agora?',
    gloss: 'agora / quantas / horas',
    blank: '现在___点',
    blankAnswer: '几',
    note: '几点 e o bloco fixo para perguntar horas. 现在 marca o agora.',
  },
  {
    id: 'chunk-onde-esta',
    unitId: 'survival',
    hanzi: '洗手间在哪儿',
    pinyin: 'xǐshǒujiān zài nǎr?',
    portuguese: 'onde fica o banheiro?',
    gloss: 'banheiro / estar em / onde',
    blank: '洗手间___哪儿',
    blankAnswer: '在',
    note: '在 indica localizacao. Padrao: coisa + 在 + lugar. xishoujiang = banheiro (literal: sala de lavar maos).',
  },
]
