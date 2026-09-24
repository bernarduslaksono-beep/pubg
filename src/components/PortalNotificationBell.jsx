import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getUnreadGames,
  getGamesWithHistory,
  refreshHistoryStatuses,
  subscribeHistoryChanges,
} from '../lib/orderHistory.js'
import { GAMES } from '../data/games.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

export default function PortalNotificationBell() {
  const { t } = useLanguage()
  const [unreadGames, setUnreadGames] = useState([])
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const wrapRef = useRef(null)

  useEffect(() => {
    const check = () => setUnreadGames(getUnreadGames())
    check()

    // Buka fila fali status husi database ba hotu-hotu jogu ne'ebe iha ona
    // riwayat lokal — atu lonceng ne'e la'os de'it fiar ba cache tuan.
    const gamesToRefresh = getGamesWithHistory()
    Promise.all(gamesToRefresh.map((g) => refreshHistoryStatuses(g))).then(check)

    const unsubscribe = subscribeHistoryChanges(check)
    return unsubscribe
  }, [])

  useEffect(() => {
    function handleOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const hasUnread = unreadGames.length > 0

  const handleClick = () => {
    if (!hasUnread) return
    if (unreadGames.length === 1) {
      navigate(`/${unreadGames[0]}/track`)
      return
    }
    setOpen((o) => !o)
  }

  return (
    <div className="portal-bell-wrap" ref={wrapRef}>
      <button
        className="portal-bell-btn"
        onClick={handleClick}
        aria-label={hasUnread ? t('notification_bell_label_unread') : t('notification_bell_label')}
        aria-haspopup={unreadGames.length > 1 ? 'true' : undefined}
        aria-expanded={unreadGames.length > 1 ? open : undefined}
      >
        <span aria-hidden="true">🔔</span>
        {hasUnread && <span className="portal-bell-dot" aria-hidden="true"></span>}
      </button>
      {open && unreadGames.length > 1 && (
        <div className="portal-bell-dropdown" role="menu">
          <div className="portal-bell-dropdown-title">{t('notification_bell_dropdown_title')}</div>
          {unreadGames.map((gameKey) => (
            <button key={gameKey} role="menuitem" onClick={() => navigate(`/${gameKey}/track`)}>
              {GAMES[gameKey]?.name || gameKey}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
