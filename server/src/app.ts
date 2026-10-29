import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import { errorHandler } from './lib/http.js'
import { athleteRoutes } from './routes/athletes.js'
import { assessmentRoutes } from './routes/assessments.js'
import { dashboardRoutes } from './routes/dashboard.js'
import { trainingSessionRoutes } from './routes/trainingSessions.js'

export const app = express()

if (process.env.CLIENT_ORIGIN) {
  app.use(cors({ origin: process.env.CLIENT_ORIGIN }))
}
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_request, response) => {
  const databaseConnected = mongoose.connection.readyState === 1
  response.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'ok' : 'unavailable',
    database: databaseConnected ? 'connected' : 'disconnected',
  })
})

app.use('/api/athletes', athleteRoutes)
app.use('/api/assessments', assessmentRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/training-sessions', trainingSessionRoutes)
app.use(errorHandler)
