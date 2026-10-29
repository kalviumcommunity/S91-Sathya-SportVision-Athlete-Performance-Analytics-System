import { Router } from 'express'
import { Athlete } from '../models/Athlete.js'
import { TrainingSession } from '../models/TrainingSession.js'
import { HttpError, getBodyFields, getObjectId } from '../lib/http.js'

export const trainingSessionRoutes = Router()

const trainingSessionFields = [
  'title',
  'description',
  'scheduledAt',
  'durationMinutes',
  'focusAreas',
  'athletes',
  'status',
]

async function validateAthletes(athleteIds: unknown): Promise<void> {
  if (!Array.isArray(athleteIds) || athleteIds.length === 0 ||
    athleteIds.some((id) => typeof id !== 'string')) {
    throw new HttpError(400, 'A training session must include one or more athlete IDs.')
  }
  const count = await Athlete.countDocuments({ _id: { $in: athleteIds } })
  if (count !== new Set(athleteIds).size) {
    throw new HttpError(400, 'All training session athletes must reference existing athletes.')
  }
}

trainingSessionRoutes.get('/', async (_request, response) => {
  const sessions = await TrainingSession.find().sort({ scheduledAt: 1 }).populate('athletes')
  response.json(sessions)
})

trainingSessionRoutes.get('/:id', async (request, response) => {
  const session = await TrainingSession.findById(getObjectId(request)).populate('athletes')
  if (!session) {
    throw new HttpError(404, 'Training session not found.')
  }
  response.json(session)
})

trainingSessionRoutes.post('/', async (request, response) => {
  const fields = getBodyFields(request, trainingSessionFields)
  await validateAthletes(fields.athletes)
  const session = await TrainingSession.create(fields)
  response.status(201).json(session)
})

trainingSessionRoutes.patch('/:id', async (request, response) => {
  const fields = getBodyFields(request, trainingSessionFields)
  if (fields.athletes !== undefined) {
    await validateAthletes(fields.athletes)
  }
  const session = await TrainingSession.findByIdAndUpdate(
    getObjectId(request),
    { $set: fields },
    { new: true, runValidators: true },
  )
  if (!session) {
    throw new HttpError(404, 'Training session not found.')
  }
  response.json(session)
})

trainingSessionRoutes.delete('/:id', async (request, response) => {
  const session = await TrainingSession.findByIdAndDelete(getObjectId(request))
  if (!session) {
    throw new HttpError(404, 'Training session not found.')
  }
  response.status(204).end()
})
