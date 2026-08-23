import { useEffect, useState } from 'react'

export default function UpdateBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = () => setShow(true)
    window.addEventListener('app-update-available', handler)
    return () => window.removeEventListener('app-update-available', handler)
  }, [])

  if (!show) return null

  return (
    <div className="update-banner">
      <span>🔄 Iha versaun foun ba website ne'e.</span>
      <button onClick={() => window.location.reload()}>Update Agora</button>
    </div>
  )
}
