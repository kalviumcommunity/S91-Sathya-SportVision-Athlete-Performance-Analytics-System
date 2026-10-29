import { Router } from 'express'
import { Assessment } from '../models/Assessment.js'
import { Athlete } from '../models/Athlete.js'
import { TrainingSession } from '../models/TrainingSession.js'
import { HttpError, getBodyFields, getObjectId } from '../lib/http.js'

export const athleteRoutes = Router()

const athleteFields = ['firstName', 'lastName', 'sport', 'group', 'position', 'dateOfBirth', 'status']

athleteRoutes.get('/', async (_request, response) => {
  const athletes = await Athlete.find().sort({ lastName: 1, firstName: 1 }).lean()
  const athleteIds = athletes.map((athlete) => athlete._id)
  const assessments = athleteIds.length
    ? await Assessment.find({ athlete: { $in: athleteIds } })
      .sort({ assessedAt: -1 })
      .lean()
    : []
  const latestAssessments = new Map<string, (typeof assessments)[number]>()

  for (const assessment of assessments) {
    const athleteId = String(assessment.athlete)
    if (!latestAssessments.has(athleteId)) {
      latestAssessments.set(athleteId, assessment)
    }
  }

  response.json(athletes.map((athlete) => ({
    id: String(athlete._id),
    firstName: athlete.firstName,
    lastName: athlete.lastName,
    sport: athlete.sport,
    group: athlete.group,
    position: athlete.position,
    status: athlete.status,
    latestAssessment: latestAssessments.get(String(athlete._id)) ?? null,
  })))
})

athleteRoutes.get('/:id', async (request, response) => {
  const athlete = await Athlete.findById(getObjectId(request))
  if (!athlete) {
    throw new HttpError(404, 'Athlete not found.')
  }
  response.json(athlete)
})

athleteRoutes.post('/', async (request, response) => {
  const athlete = await Athlete.create(getBodyFields(request, athleteFields))
  response.status(201).json(athlete)
})

athleteRoutes.patch('/:id', async (request, response) => {
  const athlete = await Athlete.findByIdAndUpdate(
    getObjectId(request),
    { $set: getBodyFields(request, athleteFields) },
    { new: true, runValidators: true },
  )
  if (!athlete) {
    throw new HttpError(404, 'Athlete not found.')
  }
  response.json(athlete)
})

athleteRoutes.delete('/:id', async (request, response) => {
  const id = getObjectId(request)
  const [assessmentCount, sessionCount] = await Promise.all([
    Assessment.countDocuments({ athlete: id }),
    TrainingSession.countDocuments({ athletes: id }),
  ])
  if (assessmentCount > 0 || sessionCount > 0) {
    throw new HttpError(409, 'Athlete cannot be deleted while assessments or training sessions reference them.')
  }

  const athlete = await Athlete.findByIdAndDelete(id)
  if (!athlete) {
    throw new HttpError(404, 'Athlete not found.')
  }
  response.status(204).end()
})
