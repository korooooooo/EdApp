export interface Term {
  id: string
  category: '公民' | '歴史'
  name: string
  reference_text: string
  key_points: string[]
  common_mistakes: string[]
  question_hints: string[]
}

export interface Message {
  role: 'student' | 'ai'
  content: string
  weak_tag?: WeakTag
  question_type?: QuestionType
}

export type WeakTag =
  | '理由説明不足'
  | '具体例不足'
  | '用語理解不足'
  | '因果関係不足'
  | '目的理解不足'
  | '仕組み理解不足'
  | '誤解あり'
  | '回答が短すぎる'
  | '話題逸脱'
  | '大きな不足なし'
  | 'システムエラー'

export type QuestionType =
  | '理由を問う'
  | '具体例を問う'
  | '目的を問う'
  | '仕組みを問う'
  | '比較させる'
  | 'もう少し詳しく促す'
  | '身近な例で考えさせる'
  | '学習に戻す'
  | '終了を提案する'

export interface DialogueResponse {
  reply: string
  weak_tag: WeakTag
  question_type: QuestionType
  continue_session: boolean
}

export interface DialogueRequest {
  term: Term
  messages: Message[]
  student_message: string
  turn_count: number
}

export interface Feedback {
  good_point: string
  next_point: string
  model_answer: string
  weak_tag: WeakTag
  mastery_level: 'low' | 'medium' | 'high'
}

export interface FeedbackRequest {
  term: Term
  messages: Message[]
}

export type AppPhase = 'selecting' | 'dialoguing' | 'feedback'
