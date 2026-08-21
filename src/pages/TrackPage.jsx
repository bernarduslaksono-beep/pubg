import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { supabase } from '../supabase.js'
import { getGame } from '../data/games.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

const ORDER_HISTORY_KEY = 'order_history'

function loadOrderHistory(gameKey) {
  try {
    const raw = localStorage.getItem(ORDER_HISTORY_KEY)
    const list = raw ? JSON.parse(raw) : []
    return list.filter((o) => o.game === gameKey).slice(0, 5)
  } catch {
    return []
  }
}

export default function TrackPage() {
  const { gameKey } = useParams()
  const game = getGame(gameKey)
  const { t, statusLabel } = useLanguage()
  const [oid, setOid] = useState('')
  const [msg, setMsg] = useState(null)
  const [orders, setOrders] = useState(null)
  const [loading, setLoading] = useState(false)
  const [refreshingIds, setRefreshingIds] = useState(new Set())
  const [history, setHistory] = useState([])

  useEffect(() => {
    if (game) setHistory(loadOrderHistory(game.key))
  }, [game])

  const handleTrack = async (directId) => {
    setOrders(null)
    setMsg(null)
    const trimmedOid = (directId ?? oid).trim().toUpperCase()

    if (!trimmedOid) {
      setMsg(t('track_empty_input'))
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('track_orders', {
        p_order_id: trimmedOid,
        p_whatsapp: null,
        p_game: game.key,
      })
      if (error) throw error
      if (!data || data.length === 0) {
        setMsg(t('track_not_found'))
        return
      }
      setOrders(data)
    } catch (err) {
      console.error(err)
      setMsg(t('track_error'))
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshOne = async (orderId) => {
    setRefreshingIds((prev) => new Set(prev).add(orderId))
    try {
      const { data, error } = await supabase.rpc('track_orders', {
        p_order_id: orderId,
        p_whatsapp: null,
        p_game: game.key,
      })
      if (!error && data && data.length > 0) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data[0] : o)))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setRefreshingIds((prev) => {
        const next = new Set(prev)
        next.delete(orderId)
        return next
      })
    }
  }

  const formatDate = (ts) => (ts ? new Date(ts).toLocaleString('id-ID') : '-')

  if (!game) return <Navigate to="/" replace />

  return (
    <>
      <div className="hero">
        <div className="eyebrow"><span className="dot"></span> {t('track_eyebrow')}</div>
        <h1>{t('track_title_line1')}<br /><span>{game.name}.</span></h1>
        <p>{t('track_desc')}</p>
      </div>
      <div className="track-box">
        <div className="field">
          <label htmlFor="t-oid">{t('order_id_label')}</label>
          <input id="t-oid" className="mono" value={oid} onChange={(e) => setOid(e.target.value)} placeholder={`cth. ${game.orderPrefix}-M2K3X9`} />
        </div>
        <button className="btn btn-primary" onClick={() => handleTrack()} disabled={loading}>
          {loading ? t('track_loading') : t('track_btn')}
        </button>
        {msg && <div className="msg error show">{msg}</div>}

        {!orders && history.length > 0 && (
          <div className="order-history">
            <div className="order-history-title">{t('order_history_label')}</div>
            {history.map((h) => (
              <div className="order-history-item" key={h.id} onClick={() => { setOid(h.id); handleTrack(h.id) }}>
                <div>
                  <div className="oh-id">{h.id}</div>
                  <div className="oh-meta">{new Date(h.createdAt).toLocaleDateString('id-ID')}</div>
                </div>
                <span className="oh-arrow">→</span>
              </div>
            ))}
          </div>
        )}

        {orders && orders.map((order) => {
          const isRefreshing = refreshingIds.has(order.id)
          return (
            <div className="order-result" key={order.id}>
              <div className="order-result-head">
                <div className="oid">{order.id}</div>
                <button
                  className={`refresh-btn${isRefreshing ? ' spinning' : ''}`}
                  onClick={() => handleRefreshOne(order.id)}
                  disabled={isRefreshing}
                  title={t('refresh_status_label')}
                  aria-label={t('refresh_status_label')}
                >
                  ↻
                </button>
              </div>
              <div className={`status-badge status-${order.status}`}>
                <span className="dot"></span>{statusLabel(order.status)}
              </div>
              <div style={{ marginTop: 16 }}>
                <div className="result-row">
                  <span className="k">{t('pkg_row_label')}</span>
                  <span className="v">
                    {order.pkg_unit_uc ? `${order.pkg_unit_uc.toLocaleString()} ${game.currencyLabel} × ${order.qty}` : `${order.pkg_uc.toLocaleString()} ${game.currencyLabel}`}
                  </span>
                </div>
                <div className="result-row"><span className="k">{t('total_uc_label')}</span><span className="v">{order.pkg_uc.toLocaleString()} {game.currencyLabel}</span></div>
                <div className="result-row"><span className="k">{t('price_row_label')}</span><span className="v">${Number(order.pkg_price).toFixed(2)}</span></div>
                <div className="result-row"><span className="k">{t('game_id_row_label')}</span><span className="v">{order.game_id}</span></div>
                {game.hasZoneId && (
                  <div className="result-row"><span className="k">{t('zone_id_label')}</span><span className="v">{order.zone_id || '-'}</span></div>
                )}
                <div className="result-row"><span className="k">{t('pubg_name_row_label')}</span><span className="v">{order.ign || '-'}</span></div>
                <div className="result-row"><span className="k">{t('payment_method_title')}</span><span className="v">{order.payment_method || '-'}</span></div>
                <div className="result-row"><span className="k">{t('date_row_label')}</span><span className="v">{formatDate(order.created_at)}</span></div>
              </div>
              {order.status === 'dibatalkan' && order.admin_comment && (
                <div className="admin-comment-box">
                  <div className="admin-comment-label">{t('seller_note_label')}</div>
                  <div className="admin-comment-text">{order.admin_comment}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
