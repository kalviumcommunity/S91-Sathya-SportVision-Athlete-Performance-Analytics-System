import bcrypt from 'bcryptjs'
import { rateLimit } from 'express-rate-limit'
import { Router, type Request } from 'express'
import { User } from '../models/User.js'
import { HttpError, getBodyFields } from '../lib/http.js'

export const authRoutes = Router()

const usernamePattern = /^[a-zA-Z0-9._-]{3,32}$/
const passwordMinimumLength = 8
const passwordMaximumBytes = 72
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many accounts created from this address. Try again later.' },
})
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many sign-in attempts. Try again later.' },
})

function readCredentials(request: Parameters<typeof getBodyFields>[0]) {
  const fields = getBodyFields(request, ['username', 'password'])
  const username = fields.username
  const password = fields.password

  if (typeof username !== 'string' || !usernamePattern.test(username)) {
    throw new HttpError(400, 'Username must be 3–32 characters using letters, numbers, dots, underscores, or hyphens.')
  }
  if (typeof password !== 'string' || password.length < passwordMinimumLength || Buffer.byteLength(password, 'utf8') > passwordMaximumBytes) {
    throw new HttpError(400, `Password must be at least ${passwordMinimumLength} characters and no more than ${passwordMaximumBytes} UTF-8 bytes.`)
  }
  return { username: username.toLowerCase(), password }
}

function regenerateSession(request: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    request.session.regenerate((error) => error ? reject(error) : resolve())
  })
}

function saveSession(request: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    request.session.save((error) => error ? reject(error) : resolve())
  })
}

authRoutes.post('/signup', signupLimiter, async (request, response) => {
  const { username, password } = readCredentials(request)
  const passwordHash = await bcrypt.hash(password, 12)
  const user = await User.create({ username, passwordHash })

  await regenerateSession(request)
  request.session.userId = String(user._id)
  await saveSession(request)
  response.status(201).json({ id: String(user._id), username: user.username })
})

authRoutes.post('/login', loginLimiter, async (request, response) => {
  const { username, password } = readCredentials(request)
  const user = await User.findOne({ username }).select('+passwordHash')
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    throw new HttpError(401, 'Invalid username or password.')
  }

  await regenerateSession(request)
  request.session.userId = String(user._id)
  await saveSession(request)
  response.json({ id: String(user._id), username: user.username })
})

authRoutes.get('/me', async (request, response) => {
  const userId = request.session.userId
  if (!userId) {
    throw new HttpError(401, 'Authentication required.')
  }

  const user = await User.findById(userId).select('username')
  if (!user) {
    await new Promise<void>((resolve, reject) => {
      request.session.destroy((error) => error ? reject(error) : resolve())
    })
    throw new HttpError(401, 'Authentication required.')
  }
  response.json({ id: String(user._id), username: user.username })
})

authRoutes.post('/logout', async (request, response) => {
  if (request.session) {
    await new Promise<void>((resolve, reject) => {
      request.session.destroy((error) => error ? reject(error) : resolve())
    })
  }
  response.clearCookie('sportvision.sid', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' })
  response.status(204).end()
})
