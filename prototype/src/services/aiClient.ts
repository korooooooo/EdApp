import type { DialogueRequest, DialogueResponse, Feedback, FeedbackRequest } from '@shared/types'

async function postJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`${path} request failed with status ${response.status}`)
  }

  return (await response.json()) as TResponse
}

export function requestDialogueResponse(request: DialogueRequest): Promise<DialogueResponse> {
  return postJson<DialogueResponse>('/api/dialogue', request)
}

export function requestFeedback(request: FeedbackRequest): Promise<Feedback> {
  return postJson<Feedback>('/api/feedback', request)
}
