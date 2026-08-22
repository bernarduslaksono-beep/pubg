import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { supabase } from '../supabase.js'
import { getGame } from '../data/games.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { loadHistoryIds, pruneAndSync, markAsRead } from '../lib/orderHistory.js'

export default function TrackPage() {
  const { gameKey } = useParams()
  const game = getGame(gameKey)
  const { t, statusLabel } = useLanguage()
  const [oid, setOid] = useState('')
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!game) return
    let cancelled = false

    async function loadHistory() {
      setHistoryLoading(true)
      const localEntries = loadHistoryIds(game.key)
      if (localEntries.length === 0) {
        setHistory([])
        setHistoryLoading(false)
        return
      }
      const results = await Promise.all(
        localEntries.map(async (h) => {
          const { data, error } = await supabase.rpc('track_orders', {
            p_order_id: h.id,
            p_whatsapp: null,
            p_game: game.key,
          })
          if (error || !data || data.length === 0) return null
          return { ...data[0], unread: Boolean(h.unread) }
        })
      )
      if (cancelled) return
      const stillValid = results.filter(Boolean)
      pruneAndSync(game.key, stillValid.map((o) => ({ id: o.id, unread: o.unread })))
      setHistory(stillValid)
      setHistoryLoading(false)
    }
    loadHistory()
    return () => { cancelled = true }
  }, [game])

  const openOrder = (order) => {
    setSelectedOrder(order)
    if (order.unread) {
      markAsRead(order.id)
      setHistory((prev) => prev.map((o) => (o.id === order.id ? { ...o, unread: false } : o)))
    }
  }

  const handleTrack = async () => {
    setMsg(null)
    const trimmedOid = oid.trim().toUpperCase()

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
      openOrder(data[0])
    } catch (err) {
      console.error(err)
      setMsg(t('track_error'))
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    if (!selectedOrder) return
    setRefreshing(true)
    try {
      const { data, error } = await supabase.rpc('track_orders', {
        p_order_id: selectedOrder.id,
        p_whatsapp: null,
        p_game: game.key,
      })
      if (!error && data && data.length > 0) {
        setSelectedOrder((prev) => ({ ...data[0], unread: prev?.unread ?? false }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setRefreshing(false)
    }
  }

  const formatDate = (ts) => (ts ? new Date(ts).toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }) : '-')

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
        <button className="btn btn-primary" onClick={handleTrack} disabled={loading}>
          {loading ? t('track_loading') : t('track_btn')}
        </button>
        {msg && <div className="msg error show">{msg}</div>}

        {!historyLoading && history.length > 0 && (
          <div className="order-history">
            <div className="order-history-title">{t('order_history_label')}</div>
            {history.map((h) => (
              <div
                className={`order-history-item${h.unread ? ' unread' : ''}`}
                key={h.id}
                onClick={() => openOrder(h)}
              >
                <div>
                  <div className="oh-id">
                    {h.unread && <span className="unread-dot" title="Foun"></span>}
                    {h.id}
                  </div>
                  <div className="oh-meta">{formatDate(h.created_at)}</div>
                </div>
                <span className={`status-badge status-${h.status} oh-status`}>
                  <span className="dot"></span>{statusLabel(h.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`modal-overlay${selectedOrder ? ' show' : ''}`} onClick={(e) => e.target.classList.contains('modal-overlay') && setSelectedOrder(null)}>
        {selectedOrder && (
          <div className="modal">
            <div className="modal-head">
              <h3 className="mono" style={{ fontSize: 16 }}>{selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} aria-label={t('ok_btn')}>✕</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div className={`status-badge status-${selectedOrder.status}`}>
                <span className="dot"></span>{statusLabel(selectedOrder.status)}
              </div>
              <button
                className={`refresh-btn${refreshing ? ' spinning' : ''}`}
                onClick={handleRefresh}
                disabled={refreshing}
                title={t('refresh_status_label')}
                aria-label={t('refresh_status_label')}
              >
                ↻
              </button>
            </div>

            <div className="result-row">
              <span className="k">{t('pkg_row_label')}</span>
              <span className="v">
                {selectedOrder.pkg_unit_uc ? `${selectedOrder.pkg_unit_uc.toLocaleString()} ${game.currencyLabel} × ${selectedOrder.qty}` : `${selectedOrder.pkg_uc.toLocaleString()} ${game.currencyLabel}`}
              </span>
            </div>
            <div className="result-row"><span className="k">{t('total_uc_label')}</span><span className="v">{selectedOrder.pkg_uc.toLocaleString()} {game.currencyLabel}</span></div>
            <div className="result-row"><span className="k">{t('price_row_label')}</span><span className="v">${Number(selectedOrder.pkg_price).toFixed(2)}</span></div>
            {selectedOrder.game_id && (
              <div className="result-row"><span className="k">{t('game_id_row_label')}</span><span className="v">{selectedOrder.game_id}</span></div>
            )}
            {game.hasZoneId && (
              <div className="result-row"><span className="k">{t('zone_id_label')}</span><span className="v">{selectedOrder.zone_id || '-'}</span></div>
            )}
            {selectedOrder.ign && (
              <div className="result-row"><span className="k">{t('pubg_name_row_label')}</span><span className="v">{selectedOrder.ign}</span></div>
            )}
            <div className="result-row"><span className="k">{t('payment_method_title')}</span><span className="v">{selectedOrder.payment_method || '-'}</span></div>
            <div className="result-row"><span className="k">{t('date_row_label')}</span><span className="v">{formatDate(selectedOrder.created_at)}</span></div>

            {(selectedOrder.status === 'dibatalkan' || selectedOrder.status === 'terkirim') && selectedOrder.admin_comment && (
              <div className={`admin-comment-box${selectedOrder.status === 'terkirim' ? ' success' : ''}`}>
                <div className="admin-comment-label">{t('seller_note_label')}</div>
                <div className="admin-comment-text">{selectedOrder.admin_comment}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
