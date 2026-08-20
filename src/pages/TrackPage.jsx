import { useState } from 'react'
import { supabase } from '../supabase.js'
import { STATUS_LABELS } from '../data/packages.js'

export default function TrackPage() {
  const [oid, setOid] = useState('')
  const [wa, setWa] = useState('')
  const [msg, setMsg] = useState(null)
  const [orders, setOrders] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleTrack = async () => {
    setOrders(null)
    setMsg(null)
    const trimmedOid = oid.trim().toUpperCase()
    const trimmedWa = wa.trim()

    if (!trimmedOid && !trimmedWa) {
      setMsg('Favor hatama Order ID ka numeru WhatsApp (ida ka rua-rua).')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('track_orders', {
        p_order_id: trimmedOid || null,
        p_whatsapp: trimmedWa || null,
      })
      if (error) throw error
      if (!data || data.length === 0) {
        setMsg('Pedidu la hetan. Verifika Order ID ka numeru WhatsApp.')
        return
      }
      setOrders(data)
    } catch (err) {
      console.error(err)
      setMsg('Falha atu buka pedidu. Favor tenta fila fali.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (ts) => (ts ? new Date(ts).toLocaleString('id-ID') : '-')

  return (
    <>
      <div className="hero">
        <div className="eyebrow"><span className="dot"></span> Status Pedidu</div>
        <h1>Cek progress<br /><span>UC ita boot nian.</span></h1>
        <p>Hatama Order ID, numeru WhatsApp, ka rua-rua atu buka pedidu ita boot. Uza rua-rua atu buka espesifiku liu.</p>
      </div>
      <div className="track-box">
        <div className="field">
          <label htmlFor="t-oid">Order ID <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(opsional)</span></label>
          <input id="t-oid" className="mono" value={oid} onChange={(e) => setOid(e.target.value)} placeholder="cth. OA-M2K3X9" />
        </div>
        <div className="field">
          <label htmlFor="t-wa">Numeru WhatsApp <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(opsional)</span></label>
          <input id="t-wa" value={wa} onChange={(e) => setWa(e.target.value)} placeholder="7XXXXXXX" />
        </div>
        <button className="btn btn-primary" onClick={handleTrack} disabled={loading}>
          {loading ? 'Buka...' : 'Cek Status'}
        </button>
        {msg && <div className="msg error show">{msg}</div>}

        {orders && orders.map((order) => (
          <div className="order-result" key={order.id}>
            <div className="oid">{order.id}</div>
            <div className={`status-badge status-${order.status}`}>
              <span className="dot"></span>{STATUS_LABELS[order.status]}
            </div>
            <div style={{ marginTop: 16 }}>
              <div className="result-row">
                <span className="k">Pakote UC</span>
                <span className="v">
                  {order.pkg_unit_uc ? `${order.pkg_unit_uc.toLocaleString()} UC × ${order.qty}` : `${order.pkg_uc.toLocaleString()} UC`}
                </span>
              </div>
              <div className="result-row"><span className="k">Total UC</span><span className="v">{order.pkg_uc.toLocaleString()} UC</span></div>
              <div className="result-row"><span className="k">Osan</span><span className="v">${Number(order.pkg_price).toFixed(2)}</span></div>
              <div className="result-row"><span className="k">Game ID</span><span className="v">{order.game_id}</span></div>
              <div className="result-row"><span className="k">Naran PUBG</span><span className="v">{order.ign || '-'}</span></div>
              <div className="result-row"><span className="k">Metode Pagamentu</span><span className="v">{order.payment_method || '-'}</span></div>
              <div className="result-row"><span className="k">Data</span><span className="v">{formatDate(order.created_at)}</span></div>
            </div>
            {order.status === 'dibatalkan' && order.admin_comment && (
              <div className="admin-comment-box">
                <div className="admin-comment-label">Nota husi seller</div>
                <div className="admin-comment-text">{order.admin_comment}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
