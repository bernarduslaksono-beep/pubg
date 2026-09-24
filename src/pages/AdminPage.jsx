import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase.js'
import { STATUS_LABELS } from '../data/packages.js'
import { GAMES } from '../data/games.js'
import AdminMenu from '../components/AdminMenu.jsx'
import AdminOnlineCount from '../components/AdminOnlineCount.jsx'
import StoreStatusBadge from '../components/StoreStatusBadge.jsx'
import OrderToast from '../components/OrderToast.jsx'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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
  { key: 'bigo', label: 'Bigo Live' },
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
      <h1>Admin Login</h1>
      <p>Hatama email no password atu asesu dashboard.</p>
      <div className="field">
        <label htmlFor="admin-login-email">Email</label>
        <input
          id="admin-login-email"
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'admin-login-error' : undefined}
        />
      </div>
      <div className="field">
        <label htmlFor="admin-login-password">Password</label>
        <input
          id="admin-login-password"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'admin-login-error' : undefined}
        />
      </div>
      <button className="btn btn-primary" onClick={handleLogin} disabled={loading}>
        {loading ? 'Tama...' : 'Tama'}
      </button>
      {error && <div id="admin-login-error" className="msg error show" role="alert">{error}</div>}
    </div>
  )
}

function OrderDetailModal({ order, onClose, onStatusSaved, onDeleted, deviceStats, isBlocked, onBlockToggle, onFilterByDevice }) {
  const [status, setStatus] = useState(order.status)
  const [adminComment, setAdminComment] = useState(order.admin_comment || '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [blocking, setBlocking] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [copiedOid, setCopiedOid] = useState(false)
  // 'delete' | 'block' | null — which confirmation dialog is open. Replaces
  // the native confirm() popups with the app's own accessible ConfirmDialog
  // (Phase 2A foundation), same action/payload/callback underneath.
  const [confirmAction, setConfirmAction] = useState(null)
  const currency = currencyOf(order.game)

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    const { error } = await supabase
      .from('orders')
      .update({ status, admin_comment: adminComment.trim() })
      .eq('id', order.id)
    setSaving(false)
    if (error) {
      setSaveError('Falha atu update status. Favor tenta fila fali.')
      return
    }
    onStatusSaved(order.id, status, adminComment.trim())
    onClose()
  }

  const performDelete = async () => {
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
      setSaveError('Falha atu apaga pedidu. Favor tenta fila fali.')
      setConfirmAction(null)
    } finally {
      setDeleting(false)
    }
  }

  const performBlock = async () => {
    if (!order.device_fingerprint) return
    setBlocking(true)
    await onBlockToggle(order.device_fingerprint, isBlocked)
    setBlocking(false)
    setConfirmAction(null)
  }

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id)
    setCopiedOid(true)
    setTimeout(() => setCopiedOid(false), 1800)
  }

  return (
    <>
      <Modal open onClose={onClose} title="Detalha Pedidu" maxWidth={460}>
        <div className="admin-oid-row">
          <span className="mono admin-oid-value">{order.id}</span>
          <button
            type="button"
            className={`copy-btn${copiedOid ? ' copied' : ''}`}
            onClick={copyOrderId}
            aria-label="Copy Order ID"
          >
            {copiedOid ? '✓ Tersalin' : '⧉ Copy'}
          </button>
          <span className="game-tag" style={{ '--tag-color': gameColorOf(order.game) }}>{gameNameOf(order.game)}</span>
        </div>

        {/* Status atual — badge separadu husi kontrola <select> iha kraik, atu
            admin bele lee status agora ne'e lalais liu, la presiza lee kontrola forms. */}
        <div className={`status-badge status-${order.status}`} style={{ marginBottom: 16 }}>
          <span className="dot"></span>{STATUS_LABELS[order.status]}
        </div>

        <div className="admin-section-title">Detallu Pedidu</div>
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
        <div className="result-row"><span className="k">Data</span><span className="v">{formatDate(order.created_at)}</span></div>
        {order.note && <div className="result-row"><span className="k">Nota</span><span className="v">{order.note}</span></div>}

        <div className="admin-section-title" style={{ marginTop: 16 }}>Detalhus Pagamentu</div>
        <div className="result-row"><span className="k">Metode Pagamentu</span><span className="v">{order.payment_method}</span></div>
        <div style={{ margin: '12px 0 4px' }}>
          <div className="field-hint" style={{ marginBottom: 8 }}>Prova Transferénsia</div>
          <a
            href={order.proof_url}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-proof-link"
            aria-label="Haree prova transferénsia iha tamanho boot (loke iha tab foun)"
          >
            <img src={order.proof_url} alt="Prova transferénsia pagamentu" loading="lazy" />
          </a>
        </div>

        {order.device_fingerprint && (
          <>
            <div className="admin-section-title" style={{ marginTop: 16 }}>Device / Anti-Spam</div>
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
                  onClick={() => setConfirmAction('block')}
                  disabled={blocking}
                >
                  {blocking ? '...' : isBlocked ? 'Buka Blokir' : 'Blokeia Device Ne\'e'}
                </button>
              </div>
            </div>
          </>
        )}

        <div className="admin-section-title" style={{ marginTop: 16 }}>Aksaun</div>
        <div className="field">
          <label htmlFor="admin-status-select">Status</label>
          <select id="admin-status-select" className="status-select" style={{ width: '100%' }} value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {(status === 'dibatalkan' || status === 'terkirim') && (
          <div className="field">
            <label htmlFor="admin-comment-field">
              {status === 'terkirim'
                ? 'Mensajen ba cliente (opsional)'
                : 'Komentariu ba cliente (razaun kanselamentu)'}
            </label>
            <textarea
              id="admin-comment-field"
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

        {saveError && <div className="msg error show" role="alert">{saveError}</div>}

        <button className="btn btn-primary" style={{ marginTop: 6 }} onClick={handleSave} disabled={saving || deleting}>
          {saving ? 'Haruka...' : 'Verifika / Update Status'}
        </button>
        <button
          className="btn btn-outline admin-delete-btn"
          style={{ marginTop: 10 }}
          onClick={() => setConfirmAction('delete')}
          disabled={saving || deleting}
        >
          {deleting ? 'Apaga...' : 'Apaga Pedidu Ne\'e'}
        </button>
      </Modal>

      <ConfirmDialog
        open={confirmAction === 'delete'}
        title="Apaga Pedidu?"
        description={`Pedidu ${order.id} sei apaga permanente, hamutuk ho prova transferénsia iha storage. Asaun ne'e la bele fila fali.`}
        confirmLabel="Apaga"
        variant="danger"
        loading={deleting}
        onConfirm={performDelete}
        onCancel={() => setConfirmAction(null)}
      />
      <ConfirmDialog
        open={confirmAction === 'block'}
        title={isBlocked ? 'Buka Blokir Device?' : 'Blokeia Device?'}
        description={
          isBlocked
            ? "Device ne'e sei bele halo pedidu fila fali."
            : "Device ne'e la bele halo pedidu foun to'o ita boot buka blokir fila fali."
        }
        confirmLabel={isBlocked ? 'Buka Blokir' : 'Blokeia'}
        variant={isBlocked ? 'primary' : 'danger'}
        loading={blocking}
        onConfirm={performBlock}
        onCancel={() => setConfirmAction(null)}
      />
    </>
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

  const hasActiveFilters = filter !== 'all' || gameFilter !== 'all' || search.trim() !== ''
  const clearFilters = () => {
    setFilter('all')
    setGameFilter('all')
    setSearch('')
  }

  const markSeen = (orderId) => {
    setSeenIds((prev) => {
      if (prev.has(orderId)) return prev
      const next = new Set(prev)
      next.add(orderId)
      persistSeenIds(next)
      return next
    })
  }

  // Uza husi Kontrola Avaliasaun (AdminMenu) — atu klik Order ID iha lista
  // avaliasaun ne'e loke direta detalha pedidu ne'e nian.
  const openOrderById = (orderId) => {
    const order = orders.find((o) => o.id === orderId)
    if (order) {
      setSelected(order)
      markSeen(orderId)
    } else {
      alert("Pedidu ne'e la iha ona iha listajen (bele ona apaga).")
    }
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

  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState(false)

  const loadOrders = async () => {
    setOrdersError(false)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) {
      setOrders(data)
    } else {
      console.error(error)
      setOrdersError(true)
    }
    setOrdersLoading(false)
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

  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const stats = useMemo(() => {
    const start = customStart ? new Date(`${customStart}T00:00:00`) : null
    const end = customEnd ? new Date(`${customEnd}T23:59:59.999`) : null
    const inPeriod = (o) => {
      const t = new Date(o.created_at)
      if (start && t < start) return false
      if (end && t > end) return false
      return true
    }
    const periodOrders = orders.filter(inPeriod)

    const total = periodOrders.length
    const pending = orders.filter((o) => o.status === 'menunggu_verifikasi').length // sempre atual, la tuir periodu
    const sent = periodOrders.filter((o) => o.status === 'terkirim').length
    const revenue = periodOrders
      .filter((o) => o.status !== 'dibatalkan')
      .reduce((sum, o) => sum + Number(o.pkg_price || 0), 0)
    // Konverte média rating (1-3) ba persentu (1=0%, 2=50%, 3=100%)
    const satisfaction = ratings.length > 0
      ? Math.round(((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) - 1) / 2 * 100)
      : null
    return { total, pending, sent, revenue, satisfaction, satisfactionCount: ratings.length }
  }, [orders, ratings, customStart, customEnd])

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

  const [pageSize, setPageSize] = useState(10)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 760px)').matches)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)')
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))

  useEffect(() => {
    setCurrentPage(1)
  }, [filter, gameFilter, search, pageSize])

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  const exportRows = () => filtered.map((o) => ({
    'Order ID': o.id,
    'Jogu': gameNameOf(o.game),
    'User ID': o.game_id || '-',
    'Zone ID': o.zone_id || '-',
    'Nickname': o.ign || '-',
    'Pakote': o.pkg_unit_uc ? `${o.pkg_unit_uc.toLocaleString()} ${currencyOf(o.game)} x ${o.qty}` : `${o.pkg_uc.toLocaleString()} ${currencyOf(o.game)}`,
    'Osan (USD)': Number(o.pkg_price).toFixed(2),
    'Metode Pagamentu': o.payment_method || '-',
    'Status': STATUS_LABELS[o.status] || o.status,
    'Data': formatDate(o.created_at),
  }))

  const handleExportExcel = () => {
    const rows = exportRows()
    if (rows.length === 0) {
      alert('La iha dadus atu exporta.')
      return
    }
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Pedidu')
    const dateStr = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(wb, `loja-game-pedidu-${dateStr}.xlsx`)
  }

  const handleExportPDF = () => {
    const rows = exportRows()
    if (rows.length === 0) {
      alert('La iha dadus atu exporta.')
      return
    }
    const doc = new jsPDF({ orientation: 'landscape' })
    doc.setFontSize(14)
    doc.text('Loja-Game Timor Leste \u2014 Laporan Pedidu', 14, 15)
    doc.setFontSize(10)
    doc.text(`Exportadu iha: ${new Date().toLocaleString('id-ID')}`, 14, 21)
    doc.text(`Total pedidu: ${rows.length}`, 14, 26)

    autoTable(doc, {
      startY: 31,
      head: [['Order ID', 'Jogu', 'User ID', 'Pakote', 'Osan', 'Pagamentu', 'Status', 'Data']],
      body: rows.map((r) => [
        r['Order ID'], r['Jogu'], r['User ID'], r['Pakote'],
        `$${r['Osan (USD)']}`, r['Metode Pagamentu'], r['Status'], r['Data'],
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [231, 52, 63] },
    })

    const dateStr = new Date().toISOString().slice(0, 10)
    doc.save(`loja-game-pedidu-${dateStr}.pdf`)
  }

  return (
    <>
      <div className="hero" style={{ marginBottom: 24 }}>
        <div className="admin-top-row">
          <div className="eyebrow"><span className="dot"></span> Dashboard <StoreStatusBadge /> <AdminOnlineCount /></div>
          <AdminMenu onOpenOrder={openOrderById} />
        </div>
        <h1>Tracking & Laporan Fatin</h1>
      </div>

      <div
        className="tier-head tier-head-toggle"
        role="button"
        tabIndex={0}
        aria-expanded={!statsCollapsed}
        aria-controls="admin-stats-panel"
        onClick={() => setStatsCollapsed((c) => !c)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setStatsCollapsed((c) => !c)
          }
        }}
        style={{ marginBottom: statsCollapsed ? 24 : 14 }}
      >
        <h2>Estatístika</h2>
        <span className={`tier-chevron${statsCollapsed ? '' : ' open'}`} aria-hidden="true">▾</span>
      </div>
      {!statsCollapsed && (
        <div id="admin-stats-panel">
          <div className="stats-custom-range" onClick={(e) => e.stopPropagation()}>
            <div className="field">
              <label htmlFor="admin-stats-start">Husi</label>
              <input id="admin-stats-start" type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="admin-stats-end">To'o</label>
              <input id="admin-stats-end" type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
            </div>
          </div>
          <div className="stat-grid">
            <div className="stat-card red"><div className="lbl">Total Pedidu</div><div className="num">{stats.total}</div></div>
            <div className="stat-card gold">
              <div className="lbl">Hein Verifikasaun</div>
              <div className="num">{stats.pending}</div>
              <div className="stat-sub">Status atual</div>
            </div>
            <div className="stat-card green"><div className="lbl">Haruka Ona</div><div className="num">{stats.sent}</div></div>
            <div className="stat-card"><div className="lbl">Rendimentu</div><div className="num">${stats.revenue.toFixed(2)}</div></div>
            <div className="stat-card green">
              <div className="lbl">Kepuasan Rata-rata</div>
              <div className="num">{stats.satisfaction !== null ? `${stats.satisfaction}%` : '—'}</div>
              {stats.satisfactionCount > 0 && (
                <div className="stat-sub">{stats.satisfactionCount} avaliasaun</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="toolbar admin-filter-row">
        <select className="filter-select" value={gameFilter} onChange={(e) => setGameFilter(e.target.value)} aria-label="Filtru tuir jogu">
          {GAME_FILTERS.map((f) => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </select>
        <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filtru tuir status">
          {FILTERS.map((f) => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </select>
        <div className="admin-search-wrap">
          <input
            className="admin-search"
            placeholder="Buka Order ID, User ID, Zone ID, Nickname..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buka pedidu"
          />
          {search && (
            <button
              type="button"
              className="admin-search-clear"
              onClick={() => setSearch('')}
              aria-label="Hamoos buka"
            >
              ✕
            </button>
          )}
        </div>
        {hasActiveFilters && (
          <button type="button" className="link-btn admin-clear-filters" onClick={clearFilters}>
            Hamoos Filtru
          </button>
        )}
        {!isMobile && (
          <>
            <button className="export-btn" onClick={handleExportExcel} title="Exporta ba Excel"><span aria-hidden="true">📊</span> Excel</button>
            <button className="export-btn" onClick={handleExportPDF} title="Exporta ba PDF"><span aria-hidden="true">📄</span> PDF</button>
          </>
        )}
      </div>

      {ordersLoading ? (
        <div className="empty-state">
          <div className="loading-dots" style={{ justifyContent: 'center', marginBottom: 10 }}>
            <span></span><span></span><span></span>
          </div>
          Buka pedidu...
        </div>
      ) : ordersError ? (
        <div className="empty-state">
          <div className="big">⚠️</div>
          Falha atu buka pedidu husi database.
          <div style={{ marginTop: 14 }}>
            <button type="button" className="btn btn-ghost btn-small" onClick={loadOrders}>Tenta Fila Fali</button>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="big">📭</div>
          Seidauk iha pedidu tama.
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="big">🔍</div>
          Laiha pedidu ne'ebe kombina ho filtru/buka ne'e.
          <div style={{ marginTop: 14 }}>
            <button type="button" className="btn btn-ghost btn-small" onClick={clearFilters}>Hamoos Filtru</button>
          </div>
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
              </tr>
            </thead>
            <tbody>
              {paginated.map((o) => {
                const isUnread = !seenIds.has(o.id)
                const currency = currencyOf(o.game)
                const deviceTotal = o.device_fingerprint ? (fingerprintCounts[o.device_fingerprint]?.total || 0) : 0
                return (
                  <tr
                    key={o.id}
                    className={isUnread ? 'unread-row' : ''}
                    tabIndex={0}
                    role="button"
                    aria-label={`Detalha pedidu ${o.id} — ${STATUS_LABELS[o.status]}`}
                    onClick={() => { setSelected(o); markSeen(o.id) }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelected(o)
                        markSeen(o.id)
                      }
                    }}
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
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="pagination-row">
          <div className="pagination-info">
            {isMobile
              ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, filtered.length)}/${filtered.length}`
              : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filtered.length)} husi ${filtered.length} pedidu`}
          </div>
          <div className="pagination-controls">
            <select className="filter-select" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              <option value={10}>{isMobile ? '10' : '10 / pajina'}</option>
              <option value={25}>{isMobile ? '25' : '25 / pajina'}</option>
              <option value={50}>{isMobile ? '50' : '50 / pajina'}</option>
              <option value={100}>{isMobile ? '100' : '100 / pajina'}</option>
            </select>
            <button
              className="btn btn-ghost btn-small"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              {isMobile ? '<' : '‹ Antes'}
            </button>
            <span className="pagination-page-label">
              {isMobile ? `${currentPage}/${totalPages}` : `Pajina ${currentPage} husi ${totalPages}`}
            </span>
            <button
              className="btn btn-ghost btn-small"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              {isMobile ? '>' : 'Tuir mai ›'}
            </button>
          </div>
        </div>
      )}

      {selected && (
        <OrderDetailModal
          key={selected.id}
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
