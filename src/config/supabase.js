import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  throw new Error('Missing Supabase server configuration')
}

const supabase = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

export const bookingDb = supabase.schema('booking_svc')
export const supabaseAuth = supabase
export const identityDb = supabase.schema('auth_svc')