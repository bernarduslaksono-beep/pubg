import { useEffect, useState } from 'react'
import logo from '../assets/logo-lojagame.png'

export default function LoadingScreen({ onDone }) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 650)
    const t2 = setTimeout(() => onDone?.(), 950)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onDone])

  return (
    <div className={`loading-screen${fadeOut ? ' fade-out' : ''}`}>
      <img src={logo} alt="Loja-Game" className="loading-logo" />
      <div className="loading-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  )
}
