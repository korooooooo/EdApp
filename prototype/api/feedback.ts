import { MESSAGES } from '../shared/messages'
import type { FeedbackRequest } from '../shared/types'
import { createApiErrorFeedbackFallback } from '../server/apiFallback'
import { createFeedbackResponse } from '../server/nvidiaNim'

interface ApiRequest {
  method?: string
  body?: unknown
}

interface ApiResponse {
  status: (statusCode: number) => {
    json: (data: unknown) => void
  }
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: MESSAGES.api.methodNotAllowed })
    return
  }

  try {
    const result = await createFeedbackResponse(request.body as FeedbackRequest)
    response.status(200).json(result)
  } catch (error) {
    console.error(error)
    response.status(200).json(createApiErrorFeedbackFallback())
  }
}
