import { useEffect } from 'react'
import { joinPresence } from '../lib/presence.js'

export default function PresenceTracker() {
  useEffect(() => {
    joinPresence()
  }, [])

  return null
}
