import { Router } from 'express'
import { Athlete } from '../models/Athlete.js'
import { Assessment } from '../models/Assessment.js'
import { TrainingSession } from '../models/TrainingSession.js'
import { HttpError } from '../lib/http.js'

export const dashboardRoutes = Router()

dashboardRoutes.get('/summary', async (request, response) => {
  const period = request.query.period ?? 'month'
  if (typeof period !== 'string' || !['week', 'month', 'quarter'].includes(period)) {
    throw new HttpError(400, 'The period must be week, month, or quarter.')
  }

  const periodStart = new Date()
  periodStart.setUTCDate(periodStart.getUTCDate() - (
    period === 'week' ? 7 : period === 'quarter' ? 90 : 30
  ))

  const [totalAthletes, activeAthletes, completedSessions, plannedSessions, scores] = await Promise.all([
    Athlete.countDocuments(),
    Athlete.countDocuments({ status: 'active' }),
    TrainingSession.countDocuments({ status: 'completed' }),
    TrainingSession.countDocuments({ status: 'planned' }),
    Assessment.aggregate<{ averagePerformance: number }>([
      { $match: { assessedAt: { $gte: periodStart } } },
      { $sort: { assessedAt: -1 } },
      { $group: { _id: '$athlete', score: { $first: '$overallScore' } } },
      { $group: { _id: null, averagePerformance: { $avg: '$score' } } },
    ]),
  ])

  response.json({
    period,
    totalAthletes,
    activeAthletes,
    averagePerformance: scores[0]?.averagePerformance ?? null,
    completedSessions,
    plannedSessions,
  })
})

dashboardRoutes.get('/performance-trend', async (_request, response) => {
  const currentWeek = new Date()
  currentWeek.setUTCHours(0, 0, 0, 0)
  const mondayOffset = (currentWeek.getUTCDay() + 6) % 7
  currentWeek.setUTCDate(currentWeek.getUTCDate() - mondayOffset)
  const firstWeek = new Date(currentWeek)
  firstWeek.setUTCDate(firstWeek.getUTCDate() - 7 * 7)

  const weeklyAverages = await Assessment.aggregate<{
    _id: Date
    averageScore: number
    assessmentCount: number
  }>([
    { $match: { assessedAt: { $gte: firstWeek, $lt: new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000) } } },
    {
      $group: {
        _id: { $dateTrunc: { date: '$assessedAt', unit: 'week', startOfWeek: 'monday' } },
        averageScore: { $avg: '$overallScore' },
        assessmentCount: { $sum: 1 },
      },
    },
  ])

  const averagesByWeek = new Map<string, (typeof weeklyAverages)[number]>()
  for (const week of weeklyAverages) {
    averagesByWeek.set(new Date(week._id).toISOString(), week)
  }

  response.json(Array.from({ length: 8 }, (_, index) => {
    const weekStart = new Date(firstWeek)
    weekStart.setUTCDate(weekStart.getUTCDate() + index * 7)
    const week = averagesByWeek.get(weekStart.toISOString())

    return {
      weekStart: weekStart.toISOString(),
      averageScore: week?.averageScore ?? null,
      assessmentCount: week?.assessmentCount ?? 0,
    }
  }))
})

dashboardRoutes.get('/upcoming-sessions', async (request, response) => {
  const rawLimit = request.query.limit ?? '5'
  if (typeof rawLimit !== 'string' || !/^\d+$/.test(rawLimit)) {
    throw new HttpError(400, 'The limit must be a whole number between 1 and 20.')
  }
  const limit = Number(rawLimit)
  if (limit < 1 || limit > 20) {
    throw new HttpError(400, 'The limit must be a whole number between 1 and 20.')
  }

  const sessions = await TrainingSession.find({
    status: 'planned',
    scheduledAt: { $gte: new Date() },
  })
    .sort({ scheduledAt: 1 })
    .limit(limit)
    .populate('athletes', 'firstName lastName group')
    .lean()

  response.json(sessions)
})
