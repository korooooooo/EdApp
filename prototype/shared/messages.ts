import type { Feedback, QuestionType, WeakTag } from './types'

export const WEAK_TAGS = [
  '理由説明不足',
  '具体例不足',
  '用語理解不足',
  '因果関係不足',
  '目的理解不足',
  '仕組み理解不足',
  '誤解あり',
  '回答が短すぎる',
  '話題逸脱',
  '大きな不足なし',
  'システムエラー',
] as const satisfies readonly WeakTag[]

export const QUESTION_TYPES = [
  '理由を問う',
  '具体例を問う',
  '目的を問う',
  '仕組みを問う',
  '比較させる',
  'もう少し詳しく促す',
  '身近な例で考えさせる',
  '学習に戻す',
  '終了を提案する',
] as const satisfies readonly QuestionType[]

export const MESSAGES = {
  api: {
    methodNotAllowed: 'Method not allowed',
    fallback: {
      dialogueReply: 'すみません、うまく返答できませんでした。もう一度送信してもらえますか？',
      feedback: {
        goodPoint: '最後まで自分の言葉で説明しようとした点が良かったです。',
        nextPoint: '次は用語の意味と理由を一文ずつ整理してみましょう。',
        modelAnswer: 'すみません、模範解答を生成できませんでした。もう一度挑戦してください。',
      },
    },
  },
  aiClient: {
    requestFailed: (path: string, status: number) => `${path} request failed with status ${status}`,
  },
  aiFallback: {
    endCommand: '!end',
    endKeywords: ['終了', 'やめる'],
    weakTags: {
      reasonMissing: '理由説明不足',
      offTopic: '話題逸脱',
      systemError: 'システムエラー',
    },
    questionTypes: {
      askReason: '理由を問う',
      suggestEnd: '終了を提案する',
      promptDetail: 'もう少し詳しく促す',
    },
    endReply: '今日はここまでにしましょうか。気が向いたら、またチャレンジしてみてくださいね。',
    dialogueReply: 'いいですね。なぜそう考えたのか、もう少し教えてもらえますか？',
    feedback: {
      goodPoint: '自分の言葉で説明しようとした点が良かったです。',
      nextPoint: '次は理由まで説明するともっと良くなります。',
      modelAnswer: 'これはダミーの模範解答です。NVIDIA NIM接続後にAIが生成します。',
    },
  },
  terms: {
    schemaMissing: 'terms.yaml に terms 配列がありません。',
    invalidTerm: (index: number) => `terms.yaml の ${index + 1} 番目の用語データが不正です。`,
    fetchFailed: (status: number) => `terms.yaml の取得に失敗しました。status=${status}`,
    loadFailed: '用語データの読み込みに失敗しました。時間をおいて再読み込みしてください。',
  },
  termSelector: {
    allCategory: 'すべて',
    civicsCategory: '公民',
    historyCategory: '歴史',
    termCategories: ['公民', '歴史'],
    categories: ['すべて', '公民', '歴史'],
    eyebrow: '中学社会・説明問題対策',
    appName: '説明トレ（仮）',
    description: '中学社会の用語を、自分の言葉で説明する練習をしましょう。',
    randomButton: 'ランダムで出題',
    loadingTerms: '用語データを読み込んでいます',
    retryLoad: '再読み込み',
    emptyCategory: 'このカテゴリの用語はまだありません。',
    cardActionHint: 'クリックして説明練習を始めます。',
  },
  loading: {
    aiThinking: 'AIが考え中',
  },
  dialogue: {
    back: '戻る',
    introLines: (termName: string) => [
      `『${termName}』という言葉を聞いて、どんなイメージが浮かびますか？`,
      '正解じゃなくて大丈夫です。',
    ],
    remainingSubmissions: '残り入力回数',
    remainingSubmissionsUnit: '回',
    inputPlaceholder: '自分の言葉で説明してみましょう',
    submit: '送信',
    finishNotice: 'このセッションはここで終了できます。',
    finishEarly: '今日はここまでにする',
  },
  feedback: {
    eyebrow: 'フィードバック',
    title: (termName: string) => `${termName} のセッションが終わりました`,
    goodPoint: '良かった点',
    nextPoint: '次に意識する点',
    modelAnswer: '模範解答',
    masteryPrefix: '理解度:',
    masteryLabels: {
      low: 'もう少し',
      medium: 'あと一歩',
      high: 'よく理解できています',
    } satisfies Record<Feedback['mastery_level'], string>,
    selectAnother: '別の用語に挑戦',
    retrySame: 'もう一度同じ用語に挑戦',
  },
  nvidia: {
    missingApiKey: 'NVIDIA_API_KEY is not configured.',
    emptyResponse: 'NVIDIA NIM returned an empty response.',
    missingDialogueKeyWarning: 'NVIDIA_API_KEY is not set. Using local dialogue fallback in development.',
    missingFeedbackKeyWarning: 'NVIDIA_API_KEY is not set. Using local feedback fallback in development.',
    speakerLabels: {
      student: '生徒',
      ai: 'AI',
    },
    termContextLabels: {
      term: '用語',
      category: 'カテゴリ',
      referenceText: '基準説明',
      keyPoints: '重要ポイント',
      commonMistakes: 'よくある誤解',
      questionHints: '問い返しヒント',
      conversation: '会話履歴',
    },
    dialogueSystemPrompt: (weakTags: string, questionTypes: string) =>
      [
        'あなたは中学社会の説明問題を支援する学習コーチです。',
        '生徒の理解を深める短い問い返しを1つだけ返してください。',
        '必ずJSONのみで返してください。',
        `weak_tag は次から選んでください: ${weakTags}`,
        `question_type は次から選んでください: ${questionTypes}`,
        '出力形式: {"reply":"...","weak_tag":"...","question_type":"...","continue_session":true}',
      ].join('\n'),
    dialogueUserPrompt: (turnNumber: number, studentMessage: string) =>
      [
        `現在の入力回数: ${turnNumber}`,
        `最新の生徒入力: ${studentMessage}`,
        '生徒が終了を望む、学習継続が難しい、または話題から大きく外れた場合のみ continue_session を false にしてください。',
      ].join('\n'),
    feedbackSystemPrompt: (weakTags: string) =>
      [
        'あなたは中学社会の説明問題を採点する学習コーチです。',
        '生徒が次に直す点を短く具体的に伝えてください。',
        '必ずJSONのみで返してください。',
        `weak_tag は次から選んでください: ${weakTags}`,
        'mastery_level は low / medium / high のいずれかです。',
        '出力形式: {"good_point":"...","next_point":"...","model_answer":"...","weak_tag":"...","mastery_level":"medium"}',
      ].join('\n'),
    feedbackUserPrompt: 'model_answer には中学生向けの模範解答を1文から2文で入れてください。',
  },
} as const
