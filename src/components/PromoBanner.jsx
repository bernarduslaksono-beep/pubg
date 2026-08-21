import { useEffect, useState } from 'react'

export default function PromoBanner({ items }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (items.length <= 1) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % items.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [items.length])

  return (
    <div className="promo-banner">
      {items.map((item, i) => (
        <div key={i} className={`promo-slide${i === index ? ' active' : ''}`}>
          <span className="promo-icon">{item.icon}</span>
          <span>{item.text}</span>
        </div>
      ))}
      <div className="promo-dots">
        {items.map((_, i) => (
          <span key={i} className={`promo-dot${i === index ? ' active' : ''}`} onClick={() => setIndex(i)} />
        ))}
      </div>
    </div>
  )
}
