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

function sanitizeDialogueResponse(value: DialogueResponse): DialogueResponse {
  return {
    reply: String(value.reply || ''),
    weak_tag: WEAK_TAGS.includes(value.weak_tag) ? value.weak_tag : MESSAGES.aiFallback.weakTags.systemError,
    question_type: QUESTION_TYPES.includes(value.question_type)
      ? value.question_type
      : MESSAGES.aiFallback.questionTypes.promptDetail,
    continue_session: Boolean(value.continue_session),
  }
}

function sanitizeFeedback(value: Feedback): Feedback {
  const masteryLevels: Feedback['mastery_level'][] = ['low', 'medium', 'high']

  return {
    good_point: String(value.good_point || ''),
    next_point: String(value.next_point || ''),
    model_answer: String(value.model_answer || ''),
    weak_tag: WEAK_TAGS.includes(value.weak_tag) ? value.weak_tag : MESSAGES.aiFallback.weakTags.systemError,
    mastery_level: masteryLevels.includes(value.mastery_level) ? value.mastery_level : 'medium',
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
