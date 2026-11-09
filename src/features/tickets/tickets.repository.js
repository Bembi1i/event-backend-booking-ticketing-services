import { bookingDb } from '../../config/supabase.js'

export async function findUserTickets(userId) {
  if (!userId) {
    throw new Error('Authenticated user ID is required')
  }

  const { data, error } = await bookingDb
    .from('v_user_tickets')
    .select(`
      id,
      booking_id,
      ticket_no,
      attendee_name,
      attendee_email,
      qr_code_data,
      ticket_status,
      entry_status,
      scanned_at,
      scanned_by_user_id,
      created_at,
      event_id,
      snapshot_event_title,
      snapshot_event_date,
      snapshot_tier_name
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Unable to fetch tickets')
  }

  return data ?? []
}