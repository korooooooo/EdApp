import { MESSAGES } from '../shared/messages'
import type { DialogueResponse, Feedback } from '../shared/types'

export function createFallbackDialogueResponse(inputText: string): DialogueResponse {
  const isExplicitEndRequest =
    inputText.startsWith(MESSAGES.aiFallback.endCommand) ||
    MESSAGES.aiFallback.endKeywords.some((keyword) => inputText.includes(keyword))

  if (isExplicitEndRequest) {
    return {
      reply: MESSAGES.aiFallback.endReply,
      weak_tag: MESSAGES.aiFallback.weakTags.offTopic,
      question_type: MESSAGES.aiFallback.questionTypes.suggestEnd,
      continue_session: false,
    }
  }

  return {
    reply: MESSAGES.aiFallback.dialogueReply,
    weak_tag: MESSAGES.aiFallback.weakTags.reasonMissing,
    question_type: MESSAGES.aiFallback.questionTypes.askReason,
    continue_session: true,
  }
}

export function createFallbackFeedback(): Feedback {
  return {
    good_point: MESSAGES.aiFallback.feedback.goodPoint,
    next_point: MESSAGES.aiFallback.feedback.nextPoint,
    model_answer: MESSAGES.aiFallback.feedback.modelAnswer,
    weak_tag: MESSAGES.aiFallback.weakTags.reasonMissing,
    mastery_level: 'medium',
  }
}
