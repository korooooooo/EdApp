import type { Plugin } from 'vite'
import type { DialogueRequest, FeedbackRequest } from '../shared/types'
import { createApiErrorDialogueFallback, createApiErrorFeedbackFallback } from './apiFallback'
import { readJsonBody, sendJson, sendMethodNotAllowed } from './http'
import { createDialogueResponse, createFeedbackResponse } from './nvidiaNim'

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
          console.error(error)
          sendJson(response, 200, createApiErrorDialogueFallback())
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
          console.error(error)
          sendJson(response, 200, createApiErrorFeedbackFallback())
        }
      })
    },
  }
}
