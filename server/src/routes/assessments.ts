import { Router } from 'express'
import mongoose from 'mongoose'
import { Assessment } from '../models/Assessment.js'
import { Athlete } from '../models/Athlete.js'
import { HttpError, getBodyFields, getObjectId } from '../lib/http.js'

export const assessmentRoutes = Router()

const assessmentFields = ['athlete', 'assessedAt', 'overallScore', 'metrics', 'notes']

assessmentRoutes.get('/', async (request, response) => {
  const athleteId = request.query.athlete
  if (athleteId !== undefined &&
    (typeof athleteId !== 'string' || !mongoose.isValidObjectId(athleteId))) {
    throw new HttpError(400, 'Invalid athlete ID.')
  }
  const filter = typeof athleteId === 'string' ? { athlete: athleteId } : {}
  const assessments = await Assessment.find(filter).sort({ assessedAt: -1 }).populate('athlete')
  response.json(assessments)
})

assessmentRoutes.get('/:id', async (request, response) => {
  const assessment = await Assessment.findById(getObjectId(request)).populate('athlete')
  if (!assessment) {
    throw new HttpError(404, 'Assessment not found.')
  }
  response.json(assessment)
})

assessmentRoutes.post('/', async (request, response) => {
  const fields = getBodyFields(request, assessmentFields)
  if (typeof fields.athlete !== 'string' || !fields.athlete || !await Athlete.exists({ _id: fields.athlete })) {
    throw new HttpError(400, 'Assessment athlete must reference an existing athlete.')
  }
  const assessment = await Assessment.create(fields)
  response.status(201).json(assessment)
})

assessmentRoutes.patch('/:id', async (request, response) => {
  const fields = getBodyFields(request, assessmentFields)
  if (fields.athlete !== undefined &&
    (typeof fields.athlete !== 'string' || !fields.athlete || !await Athlete.exists({ _id: fields.athlete }))) {
    throw new HttpError(400, 'Assessment athlete must reference an existing athlete.')
  }
  const assessment = await Assessment.findByIdAndUpdate(
    getObjectId(request),
    { $set: fields },
    { new: true, runValidators: true },
  )
  if (!assessment) {
    throw new HttpError(404, 'Assessment not found.')
  }
  response.json(assessment)
})

assessmentRoutes.delete('/:id', async (request, response) => {
  const assessment = await Assessment.findByIdAndDelete(getObjectId(request))
  if (!assessment) {
    throw new HttpError(404, 'Assessment not found.')
  }
  response.status(204).end()
})
