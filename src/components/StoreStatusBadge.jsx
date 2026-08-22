import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'

export default function StoreStatusBadge() {
  const [isOpen, setIsOpen] = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase.rpc('get_store_status').then(({ data, error }) => {
      if (!error && data && data.length > 0 && !cancelled) setIsOpen(data[0].is_open)
    })
    return () => { cancelled = true }
  }, [])

  if (isOpen === null) return null

  return (
    <div className={`store-status-pill${isOpen ? ' open' : ' closed'}`}>
      <span className="dot"></span>{isOpen ? 'Aberta' : 'Taka'}
    </div>
  )
}
