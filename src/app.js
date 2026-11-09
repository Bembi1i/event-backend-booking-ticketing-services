import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { requireAuth } from './middleware/auth.middleware.js'
import { ticketsRoutes } from './features/tickets/tickets.routes.js'
export const app = express()

app.use(helmet())
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use('/api/tickets', ticketsRoutes)

app.get('/auth-check', requireAuth, (_req, res) => {
  res.json({ authenticated: true })
})

app.get('/health', (_req, res) => {
  res.json({
    service: 'booking-ticketing',
    status: 'ok',
  })
})