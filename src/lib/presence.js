import { supabase } from '../supabase.js'

const PRESENCE_CHANNEL = 'site-visitors'
let joined = false

// Kliente (jogu/portal) hatama an ba kanál presence — la iha dadus pesoál
// haruka, cuma "hela iha" sensaun. Ida ne'e de'it xama dala ida ba sesaun
// browser tab ida-ida.
export function joinPresence() {
  if (joined) return
  joined = true
  const channel = supabase.channel(PRESENCE_CHANNEL)
  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ online_at: new Date().toISOString() })
    }
  })
}

export { PRESENCE_CHANNEL }
