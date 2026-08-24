import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getUnreadGames,
  getGamesWithHistory,
  refreshHistoryStatuses,
  subscribeHistoryChanges,
} from '../lib/orderHistory.js'
import { GAMES } from '../data/games.js'

export default function PortalNotificationBell() {
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
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
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
      <button className="portal-bell-btn" onClick={handleClick} aria-label="Notifikasaun">
        🔔
        {hasUnread && <span className="portal-bell-dot"></span>}
      </button>
      {open && unreadGames.length > 1 && (
        <div className="portal-bell-dropdown">
          <div className="portal-bell-dropdown-title">Iha atualizasaun:</div>
          {unreadGames.map((gameKey) => (
            <button key={gameKey} onClick={() => navigate(`/${gameKey}/track`)}>
              {GAMES[gameKey]?.name || gameKey}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
