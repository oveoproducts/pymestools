import { createClient as _createClient } from '@supabase/supabase-js'
import ws from 'ws'

export { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl) {
  throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseKey) {
  throw new Error('Missing env var: SUPABASE_SERVICE_KEY')
}

export const supabase = _createClient(supabaseUrl, supabaseKey, {
  // ws needed for Node.js < 22 which lacks native WebSocket
  realtime: { transport: ws as unknown as typeof WebSocket },
})
