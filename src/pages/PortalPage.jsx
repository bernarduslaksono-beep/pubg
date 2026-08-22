import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function HelmetIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="helmetGrad" x1="8" y1="10" x2="40" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.98" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <path d="M8 30c0-11 7.5-19 16-19s16 8 16 19" fill="url(#helmetGrad)" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M13 27c1-8 5.5-14 11-14" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M6 30h36v4a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-4z" fill="#fff" />
      <rect x="14" y="31" width="20" height="2.2" rx="1.1" fill="rgba(0,0,0,0.12)" />
      <rect x="20" y="8.5" width="8" height="6.5" rx="1.5" fill="#fff" />
      <circle cx="11" cy="29" r="1.3" fill="rgba(0,0,0,0.18)" />
      <circle cx="37" cy="29" r="1.3" fill="rgba(0,0,0,0.18)" />
      <path d="M14 30v5M34 30v5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

function DiamondIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="diamondGrad" x1="10" y1="6" x2="38" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <path d="M24 6 L38 18 L24 42 L10 18 Z" fill="url(#diamondGrad)" />
      <path d="M10 18 L38 18 M17 18 L24 6 L31 18 M17 18 L24 42 M31 18 L24 42 M13.5 18 L24 27 L34.5 18"
            stroke="rgba(37,99,235,0.5)" strokeWidth="1.3" strokeLinejoin="round" fill="none" />
      <path d="M20 12 L24 9 L27 12 L24 16 Z" fill="#fff" opacity="0.9" />
    </svg>
  )
}

function FlameIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 4c2 6-4 8-4 14 0 3 2 5 4 5s4-2 4-5c3 2 5 6 5 10 0 8-6 14-14 14S5 36 5 28c0-9 6-13 9-19 1 5 3 6 5 5-1-4 1-7 5-10z"
            fill="#fff" opacity="0.95" />
      <path d="M24 16c1 3-2 4-2 7 0 1.5 1 2.5 2 2.5s2-1 2-2.5c1.5 1 2.5 3 2.5 5 0 4-3 7-7 7s-7-3-7-7c0-4.5 3-6.5 4.5-9.5 0.5 2 1.5 3 2.5 2.5-0.5-2 0.5-3.5 2.5-5z"
            fill="rgba(255,176,50,0.9)" />
    </svg>
  )
}

function RobuxIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="robuxPortalGrad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="19" fill="rgba(255,255,255,0.12)" stroke="url(#robuxPortalGrad)" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="14" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1" />
      <ellipse cx="18" cy="14" rx="6" ry="3" fill="#fff" opacity="0.25" />
      <text x="24" y="30" textAnchor="middle" fontFamily="Rajdhani, sans-serif" fontWeight="700" fontSize="16" fill="#fff">R$</text>
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
  {
    id: 'roblox',
    name: 'Robux Roblox',
    tagline: 'Robux',
    color: '#00A651',
    colorDim: 'rgba(0,166,81,0.10)',
    Icon: RobuxIcon,
    available: true,
    path: '/roblox',
  },
]

export default function PortalPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()

  useEffect(() => {
    // Konta vizita ba portal ida-ida (de'it dala ida ba kada sesaun browser).
    // Total ne'e hatudu iha Footer, la iha ne'e ona.
    if (!sessionStorage.getItem('visit_counted')) {
      supabase.rpc('increment_visitor_count').then(({ error }) => {
        if (!error) sessionStorage.setItem('visit_counted', '1')
      })
    }
  }, [])

  const handleSelect = (game) => {
    if (!game.available) return
    navigate(game.path)
  }

  return (
    <>
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
