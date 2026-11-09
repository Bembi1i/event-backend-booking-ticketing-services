import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { findUserTickets } from './tickets.repository.js'

export const ticketsRoutes = Router()

ticketsRoutes.get('/', requireAuth, async (req, res) => {
  try {
    const rows = await findUserTickets(req.authUser.id)

    const tickets = rows.map((row) => {
      const {
        snapshot_event_title,
        snapshot_event_date,
        snapshot_tier_name,
        ...ticket
      } = row

      return {
        ...ticket,
        event_title: snapshot_event_title,
        event_date: snapshot_event_date,
        tier_name: snapshot_tier_name,
      }
    })

    return res.status(200).json({ data: tickets })
  } catch {
    return res.status(500).json({
      error: {
        code: 'BOOKING_DATABASE_ERROR',
        message: 'Unable to fetch tickets.',
      },
    })
  }
})