import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabase.js'

const AUTO_ADVANCE_MS = 5000

export default function BannerCarousel() {
  const [banners, setBanners] = useState([])
  const [index, setIndex] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('portal_banners')
      .select('slot, image_url')
      .order('slot', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && !cancelled) setBanners(data)
      })
    return () => { cancelled = true }
  }, [])

  const activeBanners = banners.filter((b) => b.image_url)

  useEffect(() => {
    if (activeBanners.length <= 1) return
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % activeBanners.length)
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(timerRef.current)
  }, [activeBanners.length])

  if (activeBanners.length === 0) return null

  const goPrev = () => setIndex((i) => (i - 1 + activeBanners.length) % activeBanners.length)
  const goNext = () => setIndex((i) => (i + 1) % activeBanners.length)

  return (
    <div className="banner-carousel">
      <div className="banner-carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {activeBanners.map((b, i) => (
          <div className="banner-slide" key={b.slot}>
            {/* Slide 0 is above-the-fold (LCP candidate) — never lazy-load it. */}
            <img src={b.image_url} alt="" loading={i === 0 ? 'eager' : 'lazy'} />
          </div>
        ))}
      </div>

      {activeBanners.length > 1 && (
        <>
          <button className="banner-nav-btn prev" onClick={goPrev} aria-label="Prev">‹</button>
          <button className="banner-nav-btn next" onClick={goNext} aria-label="Next">›</button>
          <div className="banner-dots" role="tablist" aria-label="Banner slides">
            {activeBanners.map((b, i) => (
              <button
                key={b.slot}
                type="button"
                className={`banner-dot${i === index ? ' active' : ''}`}
                onClick={() => setIndex(i)}
                role="tab"
                aria-selected={i === index}
                aria-label={`Banner ${i + 1} husi ${activeBanners.length}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
