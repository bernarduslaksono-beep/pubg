import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase.js'
import { STATUS_LABELS } from '../data/packages.js'
import { GAMES } from '../data/games.js'
import AdminMenu from '../components/AdminMenu.jsx'
import AdminOnlineCount from '../components/AdminOnlineCount.jsx'
import StoreStatusBadge from '../components/StoreStatusBadge.jsx'
import OrderToast from '../components/OrderToast.jsx'

const FILTERS = [
  { key: 'all', label: 'Hotu' },
  { key: 'menunggu_verifikasi', label: 'Hein Verifikasaun' },
  { key: 'terverifikasi', label: 'Verifikadu' },
  { key: 'terkirim', label: 'Haruka Ona' },
  { key: 'dibatalkan', label: 'Kanseladu' },
]

const GAME_FILTERS = [
  { key: 'all', label: 'Hotu Jogu' },
  { key: 'pubg', label: 'PUBG' },
  { key: 'ml', label: 'Mobile Legends' },
  { key: 'ff', label: 'Free Fire' },
  { key: 'roblox', label: 'Robux Roblox' },
]

function currencyOf(gameKey) {
  return GAMES[gameKey]?.currencyLabel || 'UC'
}
function gameNameOf(gameKey) {
  return GAMES[gameKey]?.name || gameKey
}
function gameColorOf(gameKey) {
  return GAMES[gameKey]?.accentColor || '#6E7787'
}

// Foti path storage husi public URL, ba ne'ebe presiza atu apaga file husi bucket
function storagePathFromUrl(url) {
  if (!url) return null
  const marker = '/proofs/'
  const idx = url.indexOf(marker)
  return idx >= 0 ? url.slice(idx + marker.length) : null
}

function formatDate(ts) {
  return ts ? new Date(ts).toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }) : '-'
}

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email ka password sala.')
    setLoading(false)
  }

  return (
    <div className="login-box">
      <h3>Admin Login</h3>
      <p>Hatama email no password atu asesu dashboard.</p>
      <div className="field">
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
      </div>
      <button className="btn btn-primary" onClick={handleLogin} disabled={loading}>
        {loading ? 'Tama...' : 'Tama'}
      </button>
      {error && <div className="msg error show">{error}</div>}
    </div>
  )
}

function OrderDetailModal({ order, onClose, onStatusSaved, onDeleted, deviceStats, isBlocked, onBlockToggle, onFilterByDevice }) {
  const [status, setStatus] = useState(order.status)
  const [adminComment, setAdminComment] = useState(order.admin_comment || '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [blocking, setBlocking] = useState(false)
  const currency = currencyOf(order.game)

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('orders')
      .update({ status, admin_comment: adminComment.trim() })
      .eq('id', order.id)
    setSaving(false)
    if (error) {
      alert('Falha atu update status.')
      return
    }
    onStatusSaved(order.id, status, adminComment.trim())
    onClose()
  }

  const handleDelete = async () => {
    if (!confirm(`Apaga pedidu ${order.id}? Asaun ne'e la bele fila fali.`)) return
    setDeleting(true)
    try {
      const path = storagePathFromUrl(order.proof_url)
      if (path) {
        await supabase.storage.from('proofs').remove([path])
      }
      const { error } = await supabase.from('orders').delete().eq('id', order.id)
      if (error) throw error
      onDeleted(order.id)
      onClose()
    } catch (err) {
      console.error(err)
      alert('Falha atu apaga pedidu.')
    } finally {
      setDeleting(false)
    }
  }

  const handleBlock = async () => {
    if (!order.device_fingerprint) return
    const confirmMsg = isBlocked
      ? 'Buka blokir device ne\'e? Nia sei bele halo pedidu fila fali.'
      : 'Blokeia device ne\'e? Nia sei la bele halo pedidu foun to\'o ita boot buka blokir fila fali.'
    if (!confirm(confirmMsg)) return
    setBlocking(true)
    await onBlockToggle(order.device_fingerprint, isBlocked)
    setBlocking(false)
  }

  return (
    <div className="modal-overlay show" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="modal-head">
          <h3>Detalha Pedidu</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span className="mono" style={{ fontSize: 13, color: 'var(--muted)' }}>{order.id}</span>
          <span className="game-tag" style={{ '--tag-color': gameColorOf(order.game) }}>{gameNameOf(order.game)}</span>
        </div>

        {order.game_id && <div className="result-row"><span className="k">User ID</span><span className="v">{order.game_id}</span></div>}
        {order.zone_id && <div className="result-row"><span className="k">Zone ID</span><span className="v">{order.zone_id}</span></div>}
        {order.ign && <div className="result-row"><span className="k">Nickname</span><span className="v">{order.ign}</span></div>}
        <div className="result-row">
          <span className="k">Pakote {currency}</span>
          <span className="v">
            {order.pkg_unit_uc ? `${order.pkg_unit_uc.toLocaleString()} ${currency} × ${order.qty}` : `${order.pkg_uc.toLocaleString()} ${currency}`}
          </span>
        </div>
        <div className="result-row"><span className="k">Total {currency}</span><span className="v">{order.pkg_uc.toLocaleString()} {currency}</span></div>
        <div className="result-row"><span className="k">Osan</span><span className="v">${Number(order.pkg_price).toFixed(2)}</span></div>
        <div className="result-row"><span className="k">Metode Pagamentu</span><span className="v">{order.payment_method}</span></div>
        <div className="result-row"><span className="k">Data</span><span className="v">{formatDate(order.created_at)}</span></div>
        {order.note && <div className="result-row"><span className="k">Nota</span><span className="v">{order.note}</span></div>}

        {order.device_fingerprint && (
          <div className={`device-info-box${isBlocked ? ' blocked' : ''}`}>
            <div className="device-info-row">
              <span className="mono">{order.device_fingerprint.slice(0, 10)}…</span>
              {isBlocked && <span className="device-blocked-tag">BLOKEADU</span>}
            </div>
            <div className="device-info-stats">
              {deviceStats.total} pedidu hotu-hotu ({deviceStats.pending} hein verifikasaun, {deviceStats.cancelled} kanseladu)
            </div>
            <div className="device-info-actions">
              <button type="button" className="link-btn" onClick={() => onFilterByDevice(order.device_fingerprint)}>
                Haree Hotu-hotu Pedidu Husi Device Ne'e
              </button>
              <button
                type="button"
                className={`link-btn${isBlocked ? '' : ' danger'}`}
                onClick={handleBlock}
                disabled={blocking}
              >
                {blocking ? '...' : isBlocked ? 'Buka Blokir' : 'Blokeia Device Ne\'e'}
              </button>
            </div>
          </div>
        )}

        <div style={{ margin: '16px 0' }}>
          <div className="field-hint" style={{ marginBottom: 8 }}>Prova Transferénsia</div>
          <img src={order.proof_url} alt="prova transferénsia" style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border)' }} />
        </div>

        <div className="field">
          <label>Status</label>
          <select className="status-select" style={{ width: '100%' }} value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {(status === 'dibatalkan' || status === 'terkirim') && (
          <div className="field">
            <label>
              {status === 'terkirim'
                ? 'Mensajen ba cliente (opsional)'
                : 'Komentariu ba cliente (razaun kanselamentu)'}
            </label>
            <textarea
              rows={3}
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              placeholder={
                status === 'terkirim'
                  ? "Ezemplu: kode redeem, ka informasaun adisional ba cliente"
                  : "Ezemplu: prova transferénsia la klaru, favor haruka fila fali"
              }
            />
          </div>
        )}

        <button className="btn btn-primary" style={{ marginTop: 6 }} onClick={handleSave} disabled={saving || deleting}>
          {saving ? 'Haruka...' : 'Verifika / Update Status'}
        </button>
        <button
          className="btn btn-ghost"
          style={{ marginTop: 10, color: 'var(--danger)', borderColor: 'var(--danger)' }}
          onClick={handleDelete}
          disabled={saving || deleting}
        >
          {deleting ? 'Apaga...' : 'Apaga Pedidu Ne\'e'}
        </button>
      </div>
    </div>
  )
}

const SEEN_ORDERS_KEY = 'admin_seen_order_ids'
function loadSeenIds() {
  try {
    const raw = localStorage.getItem(SEEN_ORDERS_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}
function persistSeenIds(set) {
  try {
    // Guarda de'it 300 ida ikus, atu la aumenta infinitu
    const arr = Array.from(set).slice(-300)
    localStorage.setItem(SEEN_ORDERS_KEY, JSON.stringify(arr))
  } catch {
    /* ignora se localStorage la disponivel */
  }
}

function Dashboard() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')
  const [gameFilter, setGameFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [toastOrder, setToastOrder] = useState(null)
  const [seenIds, setSeenIds] = useState(loadSeenIds)
  const [blockedFingerprints, setBlockedFingerprints] = useState(new Set())
  const [statsCollapsed, setStatsCollapsed] = useState(true)

  const markSeen = (orderId) => {
    setSeenIds((prev) => {
      if (prev.has(orderId)) return prev
      const next = new Set(prev)
      next.add(orderId)
      persistSeenIds(next)
      return next
    })
  }

  const loadBlockedDevices = async () => {
    const { data, error } = await supabase.from('blocked_devices').select('device_fingerprint')
    if (!error && data) setBlockedFingerprints(new Set(data.map((d) => d.device_fingerprint)))
  }

  const handleBlockToggle = async (fingerprint, currentlyBlocked) => {
    if (currentlyBlocked) {
      const { error } = await supabase.from('blocked_devices').delete().eq('device_fingerprint', fingerprint)
      if (!error) {
        setBlockedFingerprints((prev) => {
          const next = new Set(prev)
          next.delete(fingerprint)
          return next
        })
      } else {
        alert('Falha atu buka blokir.')
      }
    } else {
      const { error } = await supabase.from('blocked_devices').insert({ device_fingerprint: fingerprint })
      if (!error) {
        setBlockedFingerprints((prev) => new Set(prev).add(fingerprint))
      } else {
        alert('Falha atu blokeia device.')
      }
    }
  }

  const handleFilterByDevice = (fingerprint) => {
    setSearch(fingerprint)
    setSelected(null)
  }

  // Sujarrafia pedidu tuir device_fingerprint — atu hatudu hira ida pedidu
  // husi device hanesan, no badge "🔁 Nx" iha tabela.
  const fingerprintCounts = useMemo(() => {
    const map = {}
    for (const o of orders) {
      if (!o.device_fingerprint) continue
      if (!map[o.device_fingerprint]) map[o.device_fingerprint] = { total: 0, pending: 0, cancelled: 0 }
      map[o.device_fingerprint].total += 1
      if (o.status === 'menunggu_verifikasi') map[o.device_fingerprint].pending += 1
      if (o.status === 'dibatalkan') map[o.device_fingerprint].cancelled += 1
    }
    return map
  }, [orders])

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setOrders(data)
  }

  const [ratings, setRatings] = useState([])
  const loadRatings = async () => {
    const { data, error } = await supabase.from('order_feedback').select('rating')
    if (!error && data) setRatings(data)
  }

  useEffect(() => {
    loadOrders()
    loadBlockedDevices()
    loadRatings()
    const channel = supabase
      .channel(`orders-changes-${Date.now()}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        setToastOrder(payload.new)
        loadOrders()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => {
        loadOrders()
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'orders' }, () => {
        loadOrders()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_feedback' }, () => {
        loadRatings()
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const stats = useMemo(() => {
    const total = orders.length
    const pending = orders.filter((o) => o.status === 'menunggu_verifikasi').length
    const sent = orders.filter((o) => o.status === 'terkirim').length
    const revenue = orders
      .filter((o) => o.status !== 'dibatalkan')
      .reduce((sum, o) => sum + Number(o.pkg_price || 0), 0)
    // Konverte média rating (1-3) ba persentu (1=0%, 2=50%, 3=100%)
    const satisfaction = ratings.length > 0
      ? Math.round(((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) - 1) / 2 * 100)
      : null
    return { total, pending, sent, revenue, satisfaction, satisfactionCount: ratings.length }
  }, [orders, ratings])

  const filtered = useMemo(() => {
    let list = filter === 'all' ? orders : orders.filter((o) => o.status === filter)
    list = gameFilter === 'all' ? list : list.filter((o) => o.game === gameFilter)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((o) =>
        [o.id, o.game_id, o.zone_id, o.ign, o.device_fingerprint]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q))
      )
    }
    return list
  }, [orders, filter, gameFilter, search])

  const handleQuickDelete = async (order, e) => {
    e.stopPropagation()
    if (!confirm(`Apaga pedidu ${order.id}? Asaun ne'e la bele fila fali.`)) return
    try {
      const path = storagePathFromUrl(order.proof_url)
      if (path) await supabase.storage.from('proofs').remove([path])
      const { error } = await supabase.from('orders').delete().eq('id', order.id)
      if (error) throw error
      setOrders((prev) => prev.filter((o) => o.id !== order.id))
    } catch (err) {
      console.error(err)
      alert('Falha atu apaga pedidu.')
    }
  }

  return (
    <>
      <div className="hero" style={{ marginBottom: 24 }}>
        <div className="admin-top-row">
          <div className="eyebrow"><span className="dot"></span> Dashboard <StoreStatusBadge /> <AdminOnlineCount /></div>
          <AdminMenu />
        </div>
        <h1>Tracking & Laporan Fatin</h1>
      </div>

      <div className="tier-head tier-head-toggle" onClick={() => setStatsCollapsed((c) => !c)} style={{ marginBottom: statsCollapsed ? 24 : 14 }}>
        <h3>Estatístika</h3>
        <span className={`tier-chevron${statsCollapsed ? '' : ' open'}`}>▾</span>
      </div>
      {!statsCollapsed && (
        <div className="stat-grid">
          <div className="stat-card red"><div className="lbl">Total Pedidu</div><div className="num">{stats.total}</div></div>
          <div className="stat-card gold"><div className="lbl">Hein Verifikasaun</div><div className="num">{stats.pending}</div></div>
          <div className="stat-card green"><div className="lbl">Haruka Ona</div><div className="num">{stats.sent}</div></div>
          <div className="stat-card"><div className="lbl">Rendimentu Totál</div><div className="num">${stats.revenue.toFixed(2)}</div></div>
          <div className="stat-card green">
            <div className="lbl">Kepuasan Rata-rata</div>
            <div className="num">{stats.satisfaction !== null ? `${stats.satisfaction}%` : '—'}</div>
            {stats.satisfactionCount > 0 && (
              <div className="stat-sub">{stats.satisfactionCount} avaliasaun</div>
            )}
          </div>
        </div>
      )}

      <div className="toolbar admin-filter-row">
        <select className="filter-select" value={gameFilter} onChange={(e) => setGameFilter(e.target.value)}>
          {GAME_FILTERS.map((f) => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </select>
        <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          {FILTERS.map((f) => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </select>
        <input
          className="admin-search"
          placeholder="Buka Order ID, User ID, Zone ID, Nickname..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="big">📭</div>
          Seidauk iha pedidu.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="order-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Jogu</th>
                <th>User ID</th>
                <th>Pakote</th>
                <th>Osan</th>
                <th>Pagamentu</th>
                <th>Data</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const isUnread = !seenIds.has(o.id)
                const currency = currencyOf(o.game)
                const deviceTotal = o.device_fingerprint ? (fingerprintCounts[o.device_fingerprint]?.total || 0) : 0
                return (
                  <tr
                    key={o.id}
                    className={isUnread ? 'unread-row' : ''}
                    onClick={() => { setSelected(o); markSeen(o.id) }}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="oid-cell">
                      {isUnread && <span className="unread-dot" title="Pedidu foun"></span>}
                      {o.id}
                      {deviceTotal > 1 && (
                        <span className="repeat-device-badge" title={`Device ne'e halo ona ${deviceTotal} pedidu`}>🔁 {deviceTotal}x</span>
                      )}
                    </td>
                    <td>
                      <span className="game-tag" style={{ '--tag-color': gameColorOf(o.game) }}>{gameNameOf(o.game)}</span>
                    </td>
                    <td>
                      {o.game_id ? `${o.game_id}${o.zone_id ? ` (${o.zone_id})` : ''}` : '-'}
                      <br />
                      <span style={{ color: 'var(--muted)', fontSize: 11.5 }}>
                        {o.ign || '-'}
                      </span>
                    </td>
                    <td>{o.pkg_uc.toLocaleString()} {currency}</td>
                    <td>${Number(o.pkg_price).toFixed(2)}</td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>{o.payment_method || '-'}</td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>{formatDate(o.created_at)}</td>
                    <td>
                      <span className={`status-badge status-${o.status}`}><span className="dot"></span>{STATUS_LABELS[o.status]}</span>
                    </td>
                    <td>
                      <button className="link-btn" style={{ color: 'var(--danger)' }} onClick={(e) => handleQuickDelete(o, e)}>Apaga</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onStatusSaved={(id, status, adminComment) => setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status, admin_comment: adminComment } : o)))}
          onDeleted={(id) => setOrders((prev) => prev.filter((o) => o.id !== id))}
          deviceStats={fingerprintCounts[selected.device_fingerprint] || { total: 0, pending: 0, cancelled: 0 }}
          isBlocked={blockedFingerprints.has(selected.device_fingerprint)}
          onBlockToggle={handleBlockToggle}
          onFilterByDevice={handleFilterByDevice}
        />
      )}

      <OrderToast order={toastOrder} onDismiss={() => setToastOrder(null)} />
    </>
  )
}

export default function AdminPage() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => listener.subscription.unsubscribe()
  }, [])

  if (session === undefined) return null
  return session ? <Dashboard /> : <AdminLogin />
}
