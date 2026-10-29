import mongoose from 'mongoose'
import type { ErrorRequestHandler, Request } from 'express'

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

export function getObjectId(request: Request, parameter = 'id'): string {
  const id = request.params[parameter]
  if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
    throw new HttpError(400, `Invalid ${parameter}.`)
  }
  return id
}

export function getBodyFields(request: Request, allowedFields: string[]): Record<string, unknown> {
  const body: unknown = request.body
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object.')
  }

  const fields = Object.keys(body)
  const unknownFields = fields.filter((field) => !allowedFields.includes(field))
  if (unknownFields.length > 0) {
    throw new HttpError(400, `Unknown field(s): ${unknownFields.join(', ')}.`)
  }
  if (fields.length === 0) {
    throw new HttpError(400, 'Request body must include at least one field.')
  }

  const record = body as Record<string, unknown>
  return Object.fromEntries(fields.map((field) => [field, record[field]]))
}

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof HttpError) {
    response.status(error.status).json({ error: error.message })
    return
  }
  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    response.status(400).json({ error: error.message })
    return
  }
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
    response.status(409).json({ error: 'A record with the same unique value already exists.' })
    return
  }
  if (typeof error === 'object' && error !== null && 'status' in error && error.status === 400) {
    response.status(400).json({ error: 'Invalid request.' })
    return
  }

  console.error('Unhandled API error:', error)
  response.status(500).json({ error: 'An unexpected server error occurred.' })
}
