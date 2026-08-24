import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import { PRESENCE_CHANNEL } from '../lib/presence.js'

export default function AdminOnlineCount() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const channel = supabase.channel(PRESENCE_CHANNEL)
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setCount(Object.keys(state).length)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="online-count-badge">
      <span className="online-dot"></span>
      <span className="label-full">Online Agora:</span>
      <span className="label-short">Online:</span> <b>{count}</b>
    </div>
  )
}
