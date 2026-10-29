import cors from 'cors'
import express from 'express'
import session, { type Store } from 'express-session'
import mongoose from 'mongoose'
import MongoStore from 'connect-mongo'
import { errorHandler } from './lib/http.js'
import { requireAuth } from './middleware/requireAuth.js'
import { authRoutes } from './routes/auth.js'
import { athleteRoutes } from './routes/athletes.js'
import { assessmentRoutes } from './routes/assessments.js'
import { dashboardRoutes } from './routes/dashboard.js'
import { trainingSessionRoutes } from './routes/trainingSessions.js'

export function createApp(sessionStore?: Store) {
  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error('SESSION_SECRET must be configured with at least 32 characters.')
  }

  const app = express()

  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1)
  }

  if (process.env.CLIENT_ORIGIN) {
    app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }))
  }
  app.use(express.json({ limit: '1mb' }))
  app.use(session({
    name: 'sportvision.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: sessionStore ?? MongoStore.create({
      client: mongoose.connection.getClient(),
      collectionName: 'sessions',
      ttl: 8 * 60 * 60,
      touchAfter: 24 * 60 * 60,
    }),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60 * 1000,
      path: '/',
    },
  }))

  app.get('/api/health', (_request, response) => {
    const databaseConnected = mongoose.connection.readyState === 1
    response.status(databaseConnected ? 200 : 503).json({
      status: databaseConnected ? 'ok' : 'unavailable',
      database: databaseConnected ? 'connected' : 'disconnected',
    })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api', requireAuth)
  app.use('/api/athletes', athleteRoutes)
  app.use('/api/assessments', assessmentRoutes)
  app.use('/api/dashboard', dashboardRoutes)
  app.use('/api/training-sessions', trainingSessionRoutes)
  app.use(errorHandler)

  return app
}
