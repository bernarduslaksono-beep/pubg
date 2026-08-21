import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function HelmetIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 30c0-11 7.5-19 16-19s16 8 16 19" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="rgba(255,255,255,0.12)"/>
      <path d="M6 30h36v4a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-4z" fill="#fff" opacity="0.9"/>
      <rect x="20" y="9" width="8" height="6" rx="1.5" fill="#fff"/>
      <path d="M14 30v5M34 30v5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"/>
    </svg>
  )
}

function DiamondIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 6 L38 18 L24 42 L10 18 Z" fill="#fff" opacity="0.92"/>
      <path d="M10 18 L38 18 M17 18 L24 6 L31 18 M17 18 L24 42 M31 18 L24 42" stroke="rgba(37,99,235,0.55)" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  )
}

function FlameIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 4c2 6-4 8-4 14 0 3 2 5 4 5s4-2 4-5c3 2 5 6 5 10 0 8-6 14-14 14S5 36 5 28c0-9 6-13 9-19 1 5 3 6 5 5-1-4 1-7 5-10z"
            fill="#fff" opacity="0.92"/>
    </svg>
  )
}

const GAMES = [
  {
    id: 'pubg',
    name: 'PUBG Mobile',
    tagline: 'UC — Unknown Cash',
    color: '#E7343F',
    colorDim: 'rgba(231,52,63,0.10)',
    Icon: HelmetIcon,
    available: true,
    path: '/pubg',
  },
  {
    id: 'ml',
    name: 'Mobile Legends',
    tagline: 'Diamonds',
    color: '#2563EB',
    colorDim: 'rgba(37,99,235,0.10)',
    Icon: DiamondIcon,
    available: true,
    path: '/ml',
  },
  {
    id: 'ff',
    name: 'Free Fire',
    tagline: 'Diamonds',
    color: '#F97316',
    colorDim: 'rgba(249,115,22,0.10)',
    Icon: FlameIcon,
    available: true,
    path: '/ff',
  },
]

export default function PortalPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [visitorCount, setVisitorCount] = useState(null)

  useEffect(() => {
    let cancelled = false
    const alreadyCounted = sessionStorage.getItem('visit_counted')

    async function countVisit() {
      try {
        if (!alreadyCounted) {
          const { data, error } = await supabase.rpc('increment_visitor_count')
          if (!error && !cancelled) {
            setVisitorCount(data)
            sessionStorage.setItem('visit_counted', '1')
            return
          }
        }
        // Fallback: cuma haree total ne'ebe ona iha, la aumenta fila fali
        const { data, error } = await supabase.rpc('get_visitor_count')
        if (!error && !cancelled) setVisitorCount(data)
      } catch (err) {
        console.error(err)
      }
    }
    countVisit()
    return () => { cancelled = true }
  }, [])

  const handleSelect = (game) => {
    if (!game.available) return
    navigate(game.path)
  }

  return (
    <>
      <div className="hero">
        <p className="portal-desc">{t('portal_desc')}</p>
        {visitorCount !== null && (
          <div className="visitor-badge">
            👁 {t('visitor_label')}: <b>{visitorCount.toLocaleString()}</b>
          </div>
        )}
      </div>

      <div className="game-grid">
        {GAMES.map((game) => (
          <div
            key={game.id}
            className={`game-card${!game.available ? ' disabled' : ''}`}
            onClick={() => handleSelect(game)}
            style={{ '--game-color': game.color, '--game-color-dim': game.colorDim }}
          >
            {!game.available && <span className="game-soon-badge">{t('coming_soon')}</span>}
            <div className="game-badge-icon"><game.Icon /></div>
            <div className="game-name">{game.name}</div>
            <div className="game-tagline">{game.tagline}</div>
            {game.available && <div className="game-cta">{t('portal_topup_btn')} →</div>}
          </div>
        ))}
      </div>
    </>
  )
}
