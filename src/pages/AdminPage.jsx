import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase.js'
import { STATUS_LABELS } from '../data/packages.js'
import NotificationSetup from '../components/NotificationSetup.jsx'
import OrderToast from '../components/OrderToast.jsx'

const FILTERS = [
  { key: 'all', label: 'Hotu' },
  { key: 'menunggu_verifikasi', label: 'Hein Verifikasaun' },
  { key: 'terverifikasi', label: 'Verifikadu' },
  { key: 'terkirim', label: 'Haruka Ona' },
  { key: 'dibatalkan', label: 'Kanseladu' },
]

// Foti path storage husi public URL, ba ne'ebe presiza atu apaga file husi bucket
function storagePathFromUrl(url) {
  if (!url) return null
  const marker = '/proofs/'
  const idx = url.indexOf(marker)
  return idx >= 0 ? url.slice(idx + marker.length) : null
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

function OrderDetailModal({ order, onClose, onStatusSaved, onDeleted }) {
  const [status, setStatus] = useState(order.status)
  const [adminComment, setAdminComment] = useState(order.admin_comment || '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  return (
    <div className="modal-overlay show" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="modal-head">
          <h3>Detalha Pedidu</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="mono" style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>{order.id}</div>

        <div className="result-row"><span className="k">Cliente</span><span className="v">{order.customer_name}</span></div>
        <div className="result-row"><span className="k">WhatsApp</span><span className="v">{order.whatsapp}</span></div>
        <div className="result-row"><span className="k">User ID</span><span className="v">{order.game_id}</span></div>
        <div className="result-row"><span className="k">Nickname</span><span className="v">{order.ign}</span></div>
        <div className="result-row">
          <span className="k">Pakote UC</span>
          <span className="v">
            {order.pkg_unit_uc ? `${order.pkg_unit_uc.toLocaleString()} UC × ${order.qty}` : `${order.pkg_uc.toLocaleString()} UC`}
          </span>
        </div>
        <div className="result-row"><span className="k">Total UC</span><span className="v">{order.pkg_uc.toLocaleString()} UC</span></div>
        <div className="result-row"><span className="k">Osan</span><span className="v">${Number(order.pkg_price).toFixed(2)}</span></div>
        <div className="result-row"><span className="k">Metode Pagamentu</span><span className="v">{order.payment_method}</span></div>
        {order.note && <div className="result-row"><span className="k">Nota</span><span className="v">{order.note}</span></div>}

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

        {status === 'dibatalkan' && (
          <div className="field">
            <label>Komentariu ba cliente (razaun kanselamentu)</label>
            <textarea
              rows={3}
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              placeholder="Ezemplu: prova transferénsia la klaru, favor haruka fila fali"
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
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [toastOrder, setToastOrder] = useState(null)
  const [seenIds, setSeenIds] = useState(loadSeenIds)

  const markSeen = (orderId) => {
    setSeenIds((prev) => {
      if (prev.has(orderId)) return prev
      const next = new Set(prev)
      next.add(orderId)
      persistSeenIds(next)
      return next
    })
  }

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setOrders(data)
  }

  useEffect(() => {
    loadOrders()
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
    return { total, pending, sent, revenue }
  }, [orders])

  const filtered = useMemo(() => {
    let list = filter === 'all' ? orders : orders.filter((o) => o.status === filter)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((o) =>
        [o.id, o.customer_name, o.whatsapp, o.game_id, o.ign]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q))
      )
    }
    return list
  }, [orders, filter, search])

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

  const formatDate = (ts) => (ts ? new Date(ts).toLocaleDateString('id-ID') : '-')

  return (
    <>
      <div className="hero" style={{ marginBottom: 24 }}>
        <div className="eyebrow"><span className="dot"></span> Dashboard</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <h1>Tracking & Laporan Fatin</h1>
          <button className="btn btn-ghost btn-small" onClick={() => supabase.auth.signOut()}>Sai</button>
        </div>
      </div>

      <NotificationSetup />

      <div className="stat-grid">
        <div className="stat-card red"><div className="lbl">Total Pedidu</div><div className="num">{stats.total}</div></div>
        <div className="stat-card gold"><div className="lbl">Hein Verifikasaun</div><div className="num">{stats.pending}</div></div>
        <div className="stat-card green"><div className="lbl">UC Haruka Ona</div><div className="num">{stats.sent}</div></div>
        <div className="stat-card"><div className="lbl">Rendimentu Totál</div><div className="num">${stats.revenue.toFixed(2)}</div></div>
      </div>

      <div className="toolbar">
        <div className="filter-tabs">
          {FILTERS.map((f) => (
            <button key={f.key} className={filter === f.key ? 'active' : ''} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
        <input
          className="admin-search"
          placeholder="Buka Order ID, naran, WhatsApp, User ID..."
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
                <th>Cliente</th>
                <th>Pakote UC</th>
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
                    </td>
                    <td>
                      {o.customer_name}
                      <br />
                      <span style={{ color: 'var(--muted)', fontSize: 11.5 }}>
                        {o.whatsapp} · {o.game_id}{o.ign ? ` · ${o.ign}` : ''}
                      </span>
                    </td>
                    <td>{o.pkg_uc.toLocaleString()} UC</td>
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
