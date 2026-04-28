import type { IncomingMessage, ServerResponse } from 'node:http'
import { MESSAGES } from '../shared/messages'

export async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  const rawBody = Buffer.concat(chunks).toString('utf-8')

  if (!rawBody) {
    return {}
  }

  return JSON.parse(rawBody) as unknown
}

export function sendJson(response: ServerResponse, statusCode: number, data: unknown) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(data))
}

export function sendMethodNotAllowed(response: ServerResponse) {
  sendJson(response, 405, { error: MESSAGES.api.methodNotAllowed })
}
