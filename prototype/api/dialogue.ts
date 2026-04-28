import { MESSAGES } from '../shared/messages'
import type { DialogueRequest } from '../shared/types'
import { createDialogueResponse } from '../server/nvidiaNim'

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
    const result = await createDialogueResponse(request.body as DialogueRequest)
    response.status(200).json(result)
  } catch (error) {
    console.error(error)
    response.status(500).json({ error: MESSAGES.api.internalServerError })
  }
}
