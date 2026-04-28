import { MESSAGES } from '../shared/messages'
import type { DialogueResponse, Feedback } from '../shared/types'

export function createApiErrorDialogueFallback(): DialogueResponse {
  return {
    reply: MESSAGES.api.fallback.dialogueReply,
    weak_tag: MESSAGES.aiFallback.weakTags.systemError,
    question_type: MESSAGES.aiFallback.questionTypes.promptDetail,
    continue_session: true,
  }
}

export function createApiErrorFeedbackFallback(): Feedback {
  return {
    good_point: MESSAGES.api.fallback.feedback.goodPoint,
    next_point: MESSAGES.api.fallback.feedback.nextPoint,
    model_answer: MESSAGES.api.fallback.feedback.modelAnswer,
    weak_tag: MESSAGES.aiFallback.weakTags.systemError,
    mastery_level: 'low',
  }
}
