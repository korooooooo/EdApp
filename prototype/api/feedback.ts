import type { FeedbackRequest } from '../shared/types'
import { createFeedbackResponse } from '../server/openaiAi'

interface ApiResponse {
  status: (statusCode: number) => {
    json: (data: unknown) => void
  }
}

interface ApiRequest {
  method?: string
  body?: unknown
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const result = await createFeedbackResponse(request.body as FeedbackRequest)
    response.status(200).json(result)
  } catch (error) {
    console.error(error)
    response.status(500).json({ error: 'Internal server error' })
  }
}
