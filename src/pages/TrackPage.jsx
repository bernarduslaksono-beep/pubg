import { useEffect, useRef, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { supabase } from '../supabase.js'
import { getGame } from '../data/games.js'
import { WHATSAPP_NUMBER } from '../data/packages.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { refreshHistoryStatuses, markAsRead } from '../lib/orderHistory.js'
import OrderRating from '../components/OrderRating.jsx'
import InteractiveCard from '../components/InteractiveCard.jsx'

const PROGRESS_STEPS = ['menunggu_verifikasi', 'terverifikasi', 'terkirim']

// Status explanation (Phase 2D) — one short, non-invented sentence per actual
// status value, sourced from the app's own i18n. No fake ETA/percentage, no
// status the app doesn't have.
const STATUS_EXPLAIN_KEY = {
  menunggu_verifikasi: 'track_explain_menunggu_verifikasi',
  terverifikasi: 'track_explain_terverifikasi',
  terkirim: 'track_explain_terkirim',
  dibatalkan: 'track_explain_dibatalkan',
}

function OrderProgressTrack({ status, statusLabel }) {
  if (status === 'dibatalkan') {
    return (
      <div className="order-progress-track cancelled">
        <span className="opt-cancelled-icon">✕</span>
        <span className="opt-cancelled-text">{statusLabel('dibatalkan')}</span>
      </div>
    )
  }

  const currentIndex = PROGRESS_STEPS.indexOf(status)

  return (
    <div className="order-progress-track">
      {PROGRESS_STEPS.map((key, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        const lineFilled = i > 0 && i <= currentIndex
        return (
          <div
            key={key}
            className={`opt-step${done ? ' done' : ''}${active ? ' active' : ''}${lineFilled ? ' line-filled' : ''}`}
          >
            <span className="opt-circle">{done ? '✓' : i + 1}</span>
            <span className="opt-label">{statusLabel(key)}</span>
          </div>
        )
      })}
    </div>
  )
}

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
  const [copiedOid, setCopiedOid] = useState(false)
  const orderModalRef = useRef(null)
  const previouslyFocusedRef = useRef(null)

  // Order-detail modal accessibility (Phase 2G) — this modal keeps its own
  // custom head (Order ID + copy button + close button) so it isn't a plain
  // string `title` the shared Modal component can render; the same
  // focus-trap / Escape / focus-return behavior Modal provides is applied
  // here directly, on the same DOM classes (.modal-overlay/.modal), so
  // nothing changes visually.
  useEffect(() => {
    if (!selectedOrder) return

    previouslyFocusedRef.current = document.activeElement

    const node = orderModalRef.current
    const getFocusable = () =>
      node
        ? Array.from(
            node.querySelectorAll(
              'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          )
        : []

    const focusables = getFocusable()
    ;(focusables[0] || node)?.focus()

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setSelectedOrder(null)
        return
      }
      if (e.key !== 'Tab') return
      const items = getFocusable()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocusedRef.current?.focus?.()
    }
  }, [selectedOrder])

  useEffect(() => {
    if (!game) return
    let cancelled = false

    async function loadHistory() {
      setHistoryLoading(true)
      const result = await refreshHistoryStatuses(game.key)
      if (cancelled) return
      setHistory(result)
      setHistoryLoading(false)
    }
    loadHistory()
    return () => { cancelled = true }
  }, [game])

  const openOrder = (order) => {
    setSelectedOrder(order)
    setCopiedOid(false)
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
          <input
            id="t-oid"
            className="mono"
            value={oid}
            onChange={(e) => setOid(e.target.value)}
            placeholder={t('order_id_placeholder_example', game.orderPrefix)}
            disabled={loading}
            aria-describedby={msg ? 't-oid-msg' : undefined}
            aria-invalid={msg ? true : undefined}
            onKeyDown={(e) => { if (e.key === 'Enter') handleTrack() }}
          />
        </div>
        <button className="btn btn-primary" onClick={handleTrack} disabled={loading}>
          {loading ? t('track_loading') : t('track_btn')}
        </button>
        {msg && <div id="t-oid-msg" className="msg error show" role="alert">{msg}</div>}

        {historyLoading && (
          <div className="order-history">
            <div className="order-history-title">{t('order_history_label')}</div>
            <div className="loading-dots" style={{ margin: '4px 0 6px' }} aria-label={t('track_history_loading')}>
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        {!historyLoading && history.length > 0 && (
          <div className="order-history">
            <div className="order-history-title">{t('order_history_label')}</div>
            {history.map((h) => (
              <InteractiveCard
                className={`order-history-item${h.unread ? ' unread' : ''}`}
                key={h.id}
                onClick={() => openOrder(h)}
                ariaLabel={`${h.id} — ${statusLabel(h.status)}`}
              >
                <div>
                  <div className="oh-id">
                    {h.unread && <span className="unread-dot" title={t('unread_badge_label')} aria-label={t('unread_badge_label')}></span>}
                    {h.id}
                  </div>
                  <div className="oh-meta">{formatDate(h.created_at)}</div>
                </div>
                <span className={`status-badge status-${h.status} oh-status`}>
                  <span className="dot"></span>{statusLabel(h.status)}
                </span>
              </InteractiveCard>
            ))}
          </div>
        )}

        {!historyLoading && history.length === 0 && (
          <div className="empty-state" style={{ padding: '24px 0 4px' }}>
            <div className="big">🧾</div>
            {t('track_history_empty')}
          </div>
        )}
      </div>

      <div className={`modal-overlay${selectedOrder ? ' show' : ''}`} onClick={(e) => e.target.classList.contains('modal-overlay') && setSelectedOrder(null)}>
        {selectedOrder && (
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${t('order_id_label')} ${selectedOrder.id}`}
            ref={orderModalRef}
            tabIndex={-1}
          >
            <div className="modal-head">
              <div className="track-oid-block">
                <div className="track-oid-label">{t('order_id_label')}</div>
                <div className="track-oid-row">
                  <span className="track-oid-value mono">{selectedOrder.id}</span>
                  <button
                    type="button"
                    className={`copy-btn${copiedOid ? ' copied' : ''}`}
                    onClick={() => {
                      navigator.clipboard.writeText(selectedOrder.id)
                      setCopiedOid(true)
                      setTimeout(() => setCopiedOid(false), 1800)
                    }}
                    aria-label={`${t('copy_btn')} Order ID`}
                  >
                    {copiedOid ? `✓ ${t('copied_btn')}` : `⧉ ${t('copy_btn')}`}
                  </button>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} aria-label={t('ok_btn')}>✕</button>
            </div>

            <div className="track-status-card">
              <div className="track-status-row">
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
              <p className="track-status-explain" aria-live="polite">
                {t(STATUS_EXPLAIN_KEY[selectedOrder.status] || 'track_explain_menunggu_verifikasi')}
              </p>
            </div>

            <OrderProgressTrack status={selectedOrder.status} statusLabel={statusLabel} />

            <div className="select-product-label" style={{ margin: '4px 0 8px' }}>{t('order_detail_title')}</div>
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
            <div className="result-row"><span className="k">{t('date_row_label')}</span><span className="v">{formatDate(selectedOrder.created_at)}</span></div>

            <div className="select-product-label" style={{ margin: '16px 0 8px' }}>{t('payment_details_title')}</div>
            <div className="result-row"><span className="k">{t('payment_method_title')}</span><span className="v">{selectedOrder.payment_method || '-'}</span></div>

            {(selectedOrder.status === 'dibatalkan' || selectedOrder.status === 'terkirim') && selectedOrder.admin_comment && (
              <div className={`admin-comment-box${selectedOrder.status === 'terkirim' ? ' success' : ''}`}>
                <div className="admin-comment-label">{t('seller_note_label')}</div>
                <div className="admin-comment-text">{selectedOrder.admin_comment}</div>
              </div>
            )}

            {selectedOrder.status === 'dibatalkan' && !selectedOrder.admin_comment && (
              <a
                className="btn btn-primary"
                style={{ marginTop: 14, display: 'block', textAlign: 'center' }}
                href={`https://wa.me/670${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('track_contact_whatsapp_btn')}
              </a>
            )}

            {selectedOrder.status === 'terkirim' && <OrderRating orderId={selectedOrder.id} />}
          </div>
        )}
      </div>
    </>
  )
}
