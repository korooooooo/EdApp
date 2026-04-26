import OpenAI from 'openai'
import type {
  DialogueRequest,
  DialogueResponse,
  Feedback,
  FeedbackRequest,
  QuestionType,
  WeakTag,
} from '../shared/types'
import { createFallbackDialogueResponse, createFallbackFeedback } from './aiFallback'

const DEFAULT_MODEL = 'gpt-5.2'

const weakTags: WeakTag[] = [
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
]

const questionTypes: QuestionType[] = [
  '理由を問う',
  '具体例を問う',
  '目的を問う',
  '仕組みを問う',
  '比較させる',
  'もう少し詳しく促す',
  '身近な例で考えさせる',
  '学習に戻す',
  '終了を提案する',
]

const dialogueResponseFormat = {
  type: 'json_schema',
  name: 'dialogue_response',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      reply: { type: 'string' },
      weak_tag: { type: 'string', enum: weakTags },
      question_type: { type: 'string', enum: questionTypes },
      continue_session: { type: 'boolean' },
    },
    required: ['reply', 'weak_tag', 'question_type', 'continue_session'],
  },
} as const

const feedbackResponseFormat = {
  type: 'json_schema',
  name: 'feedback_response',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      good_point: { type: 'string' },
      next_point: { type: 'string' },
      model_answer: { type: 'string' },
      weak_tag: { type: 'string', enum: weakTags },
      mastery_level: { type: 'string', enum: ['low', 'medium', 'high'] },
    },
    required: ['good_point', 'next_point', 'model_answer', 'weak_tag', 'mastery_level'],
  },
} as const

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return null
  }

  return new OpenAI({ apiKey })
}

function getModel() {
  return process.env.OPENAI_MODEL || DEFAULT_MODEL
}

function parseJson<T>(value: string): T {
  try {
    return JSON.parse(value) as T
  } catch {
    throw new Error('OpenAI response was not valid JSON.')
  }
}

function buildConversationSummary(messages: DialogueRequest['messages']) {
  return messages
    .map((message) => `${message.role === 'student' ? '生徒' : 'AI'}: ${message.content}`)
    .join('\n')
}

export async function createDialogueResponse(request: DialogueRequest): Promise<DialogueResponse> {
  const client = getClient()

  if (!client) {
    return createFallbackDialogueResponse(request.student_message)
  }

  const response = await client.responses.create({
    model: getModel(),
    input: [
      {
        role: 'system',
        content:
          'あなたは中学社会の説明問題を支援する学習コーチです。短く安心できる日本語で、生徒の理解を深める問い返しを1つだけ返してください。',
      },
      {
        role: 'user',
        content: [
          `用語: ${request.term.name}`,
          `カテゴリ: ${request.term.category}`,
          `基準説明: ${request.term.reference_text}`,
          `重要ポイント: ${request.term.key_points.join(' / ')}`,
          `よくある誤解: ${request.term.common_mistakes.join(' / ')}`,
          `問い返しヒント: ${request.term.question_hints.join(' / ')}`,
          `現在の入力回数: ${request.turn_count + 1}`,
          `会話履歴:\n${buildConversationSummary(request.messages)}`,
          `最新の生徒入力: ${request.student_message}`,
          '生徒が終了を望む、または学習継続が難しい場合のみ continue_session を false にしてください。',
        ].join('\n'),
      },
    ],
    text: {
      format: dialogueResponseFormat,
    },
  })

  return parseJson<DialogueResponse>(response.output_text)
}

export async function createFeedbackResponse(request: FeedbackRequest): Promise<Feedback> {
  const client = getClient()

  if (!client) {
    return createFallbackFeedback()
  }

  const response = await client.responses.create({
    model: getModel(),
    input: [
      {
        role: 'system',
        content:
          'あなたは中学社会の説明問題を採点する学習コーチです。生徒が次に何を直せばよいかが分かる、短く具体的なフィードバックを日本語で返してください。',
      },
      {
        role: 'user',
        content: [
          `用語: ${request.term.name}`,
          `カテゴリ: ${request.term.category}`,
          `基準説明: ${request.term.reference_text}`,
          `重要ポイント: ${request.term.key_points.join(' / ')}`,
          `よくある誤解: ${request.term.common_mistakes.join(' / ')}`,
          `会話履歴:\n${buildConversationSummary(request.messages)}`,
          'model_answer には中学生向けの模範解答を1文から2文で入れてください。',
        ].join('\n'),
      },
    ],
    text: {
      format: feedbackResponseFormat,
    },
  })

  return parseJson<Feedback>(response.output_text)
}
