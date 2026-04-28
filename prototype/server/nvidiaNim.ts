import OpenAI from 'openai'
import { MESSAGES, QUESTION_TYPES, WEAK_TAGS } from '../shared/messages'
import type {
  DialogueRequest,
  DialogueResponse,
  Feedback,
  FeedbackRequest,
} from '../shared/types'
import { createFallbackDialogueResponse, createFallbackFeedback } from './nimFallback'

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1'
const DEFAULT_NVIDIA_MODEL = 'deepseek-ai/deepseek-v4-pro'
const MAX_DIALOGUE_REPLY_LENGTH = 180
const MAX_FEEDBACK_TEXT_LENGTH = 400

function getNvidiaApiKey() {
  return process.env.NVIDIA_API_KEY
}

function getNvidiaModel() {
  return process.env.NVIDIA_MODEL || DEFAULT_NVIDIA_MODEL
}

function canUseLocalFallback() {
  return process.env.NODE_ENV !== 'production'
}

function getNimClient() {
  const apiKey = getNvidiaApiKey()

  if (!apiKey) {
    return null
  }

  return new OpenAI({
    apiKey,
    baseURL: NVIDIA_BASE_URL,
  })
}

function parseJsonObject<T>(content: string): T {
  const trimmed = content.trim()
  const jsonText = trimmed.startsWith('```')
    ? trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
    : trimmed

  return JSON.parse(jsonText) as T
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeText(value: unknown, fallback: string, maxLength: number) {
  if (typeof value !== 'string') {
    return fallback
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return fallback
  }

  return trimmed.slice(0, maxLength)
}

function normalizeBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

function sanitizeDialogueResponse(value: unknown): DialogueResponse {
  const response = isRecord(value) ? value : {}
  const weakTag = response.weak_tag
  const questionType = response.question_type

  return {
    reply: normalizeText(response.reply, MESSAGES.api.fallback.dialogueReply, MAX_DIALOGUE_REPLY_LENGTH),
    weak_tag: WEAK_TAGS.includes(weakTag as DialogueResponse['weak_tag'])
      ? (weakTag as DialogueResponse['weak_tag'])
      : MESSAGES.aiFallback.weakTags.systemError,
    question_type: QUESTION_TYPES.includes(questionType as DialogueResponse['question_type'])
      ? (questionType as DialogueResponse['question_type'])
      : MESSAGES.aiFallback.questionTypes.promptDetail,
    continue_session: normalizeBoolean(response.continue_session, true),
  }
}

function sanitizeFeedback(value: unknown): Feedback {
  const response = isRecord(value) ? value : {}
  const masteryLevels: Feedback['mastery_level'][] = ['low', 'medium', 'high']
  const weakTag = response.weak_tag
  const masteryLevel = response.mastery_level

  return {
    good_point: normalizeText(
      response.good_point,
      MESSAGES.api.fallback.feedback.goodPoint,
      MAX_FEEDBACK_TEXT_LENGTH,
    ),
    next_point: normalizeText(response.next_point, MESSAGES.api.fallback.feedback.nextPoint, MAX_FEEDBACK_TEXT_LENGTH),
    model_answer: normalizeText(
      response.model_answer,
      MESSAGES.api.fallback.feedback.modelAnswer,
      MAX_FEEDBACK_TEXT_LENGTH,
    ),
    weak_tag: WEAK_TAGS.includes(weakTag as Feedback['weak_tag'])
      ? (weakTag as Feedback['weak_tag'])
      : MESSAGES.aiFallback.weakTags.systemError,
    mastery_level: masteryLevels.includes(masteryLevel as Feedback['mastery_level'])
      ? (masteryLevel as Feedback['mastery_level'])
      : 'low',
  }
}

function formatConversation(messages: DialogueRequest['messages']) {
  return messages
    .map((message) => {
      const speaker =
        message.role === 'student' ? MESSAGES.nvidia.speakerLabels.student : MESSAGES.nvidia.speakerLabels.ai

      return `${speaker}: ${message.content}`
    })
    .join('\n')
}

function buildTermContext(request: DialogueRequest | FeedbackRequest) {
  const labels = MESSAGES.nvidia.termContextLabels

  return [
    `${labels.term}: ${request.term.name}`,
    `${labels.category}: ${request.term.category}`,
    `${labels.referenceText}: ${request.term.reference_text}`,
    `${labels.keyPoints}: ${request.term.key_points.join(' / ')}`,
    `${labels.commonMistakes}: ${request.term.common_mistakes.join(' / ')}`,
    `${labels.questionHints}: ${request.term.question_hints.join(' / ')}`,
    `${labels.conversation}:\n${formatConversation(request.messages)}`,
  ].join('\n')
}

async function createJsonCompletion<T>(systemPrompt: string, userPrompt: string): Promise<T> {
  const client = getNimClient()

  if (!client) {
    throw new Error(MESSAGES.nvidia.missingApiKey)
  }

  const completion = await client.chat.completions.create({
    model: getNvidiaModel(),
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    stream: false,
  })

  const content = completion.choices[0]?.message?.content

  if (!content) {
    throw new Error(MESSAGES.nvidia.emptyResponse)
  }

  return parseJsonObject<T>(content)
}

export async function createDialogueResponse(request: DialogueRequest): Promise<DialogueResponse> {
  if (!getNvidiaApiKey() && canUseLocalFallback()) {
    console.warn(MESSAGES.nvidia.missingDialogueKeyWarning)
    return createFallbackDialogueResponse(request.student_message)
  }

  const result = await createJsonCompletion<DialogueResponse>(
    MESSAGES.nvidia.dialogueSystemPrompt(WEAK_TAGS.join(', '), QUESTION_TYPES.join(', ')),
    [
      buildTermContext(request),
      MESSAGES.nvidia.dialogueUserPrompt(request.turn_count + 1, request.student_message),
    ].join('\n'),
  )

  return sanitizeDialogueResponse(result)
}

export async function createFeedbackResponse(request: FeedbackRequest): Promise<Feedback> {
  if (!getNvidiaApiKey() && canUseLocalFallback()) {
    console.warn(MESSAGES.nvidia.missingFeedbackKeyWarning)
    return createFallbackFeedback()
  }

  const result = await createJsonCompletion<Feedback>(
    MESSAGES.nvidia.feedbackSystemPrompt(WEAK_TAGS.join(', ')),
    [
      buildTermContext(request),
      MESSAGES.nvidia.feedbackUserPrompt,
    ].join('\n'),
  )

  return sanitizeFeedback(result)
}
