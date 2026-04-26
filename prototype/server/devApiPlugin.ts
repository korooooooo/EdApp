import type { Plugin } from 'vite'
import { createDialogueResponse, createFeedbackResponse } from './openaiAi'
import { readJsonBody, sendJson, sendMethodNotAllowed, sendServerError } from './http'
import type { DialogueRequest, FeedbackRequest } from '../shared/types'

export function devApiPlugin(): Plugin {
  return {
    name: 'dev-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/dialogue', async (request, response) => {
        if (request.method !== 'POST') {
          sendMethodNotAllowed(response)
          return
        }

        try {
          const body = (await readJsonBody(request)) as DialogueRequest
          const result = await createDialogueResponse(body)
          sendJson(response, 200, result)
        } catch (error) {
          sendServerError(response, error)
        }
      })

      server.middlewares.use('/api/feedback', async (request, response) => {
        if (request.method !== 'POST') {
          sendMethodNotAllowed(response)
          return
        }

        try {
          const body = (await readJsonBody(request)) as FeedbackRequest
          const result = await createFeedbackResponse(body)
          sendJson(response, 200, result)
        } catch (error) {
          sendServerError(response, error)
        }
      })
    },
  }
}
