import { MESSAGES } from '@shared/messages'
import type { DialogueRequest, DialogueResponse, Feedback, FeedbackRequest } from '@shared/types'
import { mockDialogueResponse, mockFeedback } from '../mocks/mockAi'

const USE_MOCK_AI = import.meta.env.VITE_USE_MOCK_AI !== 'false'

async function postJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(MESSAGES.aiClient.requestFailed(path, response.status))
  }

  return (await response.json()) as TResponse
}

export function requestDialogueResponse(request: DialogueRequest): Promise<DialogueResponse> {
  if (USE_MOCK_AI) {
    return mockDialogueResponse(request.student_message, request.term, request.messages)
  }

  return postJson<DialogueResponse>('/api/dialogue', request)
}

export function requestFeedback(request: FeedbackRequest): Promise<Feedback> {
  if (USE_MOCK_AI) {
    return mockFeedback(request.term, request.messages)
  }

  return postJson<Feedback>('/api/feedback', request)
}
