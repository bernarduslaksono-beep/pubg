import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase.js'
import { STATUS_LABELS } from '../data/packages.js'

const FILTERS = [
  { key: 'all', label: 'Hotu' },
  { key: 'menunggu_verifikasi', label: 'Menunggu' },
  { key: 'terverifikasi', label: 'Terverifikasi' },
  { key: 'terkirim', label: 'Terkirim' },
  { key: 'dibatalkan', label: 'Dibatalkan' },
]

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

function Dashboard() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')
  const [modalUrl, setModalUrl] = useState(null)

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setOrders(data)
  }

  useEffect(() => {
    loadOrders()
    // Realtime: update automatik bainhira iha pedidu foun ka status muda
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
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

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  const handleStatusChange = async (orderId, newStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    if (error) {
      console.error(error)
      alert('Falha atu update status.')
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

      <div className="stat-grid">
        <div className="stat-card red"><div className="lbl">Total Pedidu</div><div className="num">{stats.total}</div></div>
        <div className="stat-card gold"><div className="lbl">Menunggu Verifikasi</div><div className="num">{stats.pending}</div></div>
        <div className="stat-card green"><div className="lbl">UC Terkirim</div><div className="num">{stats.sent}</div></div>
        <div className="stat-card"><div className="lbl">Total Revenue</div><div className="num">${stats.revenue.toFixed(2)}</div></div>
      </div>

      <div className="toolbar">
        <div className="filter-tabs">
          {FILTERS.map((f) => (
            <button key={f.key} className={filter === f.key ? 'active' : ''} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
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
                <th>Bukti</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td className="oid-cell">{o.id}</td>
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
                    <select
                      className="status-select"
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    >
                      {Object.entries(STATUS_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button className="link-btn" onClick={() => setModalUrl(o.proof_url)}>Haree</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={`modal-overlay${modalUrl ? ' show' : ''}`} onClick={(e) => e.target.classList.contains('modal-overlay') && setModalUrl(null)}>
        <div className="modal">
          <div className="modal-head">
            <h3>Bukti Transferénsia</h3>
            <button onClick={() => setModalUrl(null)}>✕</button>
          </div>
          {modalUrl && <img src={modalUrl} alt="bukti transfer" />}
        </div>
      </div>
    </>
  )
}

export default function AdminPage() {
  const [session, setSession] = useState(undefined) // undefined = loading, null = logged out

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => listener.subscription.unsubscribe()
  }, [])

  if (session === undefined) return null
  return session ? <Dashboard /> : <AdminLogin />
}
