import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import { GAMES } from '../data/games.js'

const RATING_META = {
  1: { icon: '😞', label: 'La Kontente', cls: 'bad' },
  2: { icon: '😐', label: 'Neutru', cls: 'neutral' },
  3: { icon: '😊', label: 'Kontente', cls: 'good' },
}

function formatDate(ts) {
  return ts ? new Date(ts).toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }) : '-'
}

export default function RatingsReview({ onOpenOrder }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('bad') // 'bad' | 'all'

  useEffect(() => {
    let cancelled = false
    supabase
      .from('order_feedback')
      .select('order_id, rating, comment, created_at, orders(game, status)')
      .order('rating', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && !cancelled) setRows(data)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const filtered = filter === 'bad' ? rows.filter((r) => r.rating <= 2) : rows

  return (
    <div>
      <div className="stock-game-tabs">
        <button className={filter === 'bad' ? 'active' : ''} onClick={() => setFilter('bad')}>La Diak / Neutru</button>
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Hotu-hotu</button>
      </div>

      {loading ? (
        <div className="field-hint">Buka...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: '30px 0' }}>
          <div className="big">🎉</div>
          {filter === 'bad' ? "La iha avaliasaun la diak — di'ak liu!" : 'Seidauk iha avaliasaun.'}
        </div>
      ) : (
        <div className="ratings-review-list">
          {filtered.map((r) => {
            const meta = RATING_META[r.rating]
            const gameName = GAMES[r.orders?.game]?.name || r.orders?.game || '-'
            return (
              <div className={`rating-review-row ${meta.cls}`} key={r.order_id}>
                <div className="rating-review-top">
                  <span className="rating-review-icon">{meta.icon}</span>
                  <button className="link-btn" onClick={() => onOpenOrder?.(r.order_id)}>{r.order_id}</button>
                  <span className="game-tag" style={{ '--tag-color': GAMES[r.orders?.game]?.accentColor || '#6E7787' }}>{gameName}</span>
                  <span className="rating-review-date">{formatDate(r.created_at)}</span>
                </div>
                {r.comment && <div className="rating-review-comment">"{r.comment}"</div>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
