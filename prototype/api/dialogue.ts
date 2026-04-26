import type { DialogueRequest } from '../shared/types'
import { createDialogueResponse } from '../server/openaiAi'

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
    const result = await createDialogueResponse(request.body as DialogueRequest)
    response.status(200).json(result)
  } catch (error) {
    console.error(error)
    response.status(500).json({ error: 'Internal server error' })
  }
}
