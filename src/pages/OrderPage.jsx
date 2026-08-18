import { useState } from 'react'
import { supabase } from '../supabase.js'
import { PACKAGES, PAYMENT_METHODS, WHATSAPP_NUMBER } from '../data/packages.js'

function genOrderId() {
  return (
    'OA-' +
    Date.now().toString(36).toUpperCase().slice(-5) +
    Math.random().toString(36).toUpperCase().slice(2, 5)
  )
}

export default function OrderPage() {
  const [selectedPkg, setSelectedPkg] = useState(null)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [proofFile, setProofFile] = useState(null)
  const [proofPreview, setProofPreview] = useState(null)
  const [form, setForm] = useState({ name: '', wa: '', gameId: '', ign: '', note: '' })
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState(null)
  const [lastOrderId, setLastOrderId] = useState(null)

  const handleField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setProofFile(file)
    const reader = new FileReader()
    reader.onload = () => setProofPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const isValid =
    selectedPkg && selectedPayment && proofFile &&
    form.name.trim() && form.wa.trim() && form.gameId.trim() && form.ign.trim()

  const handleSubmit = async () => {
    if (!isValid) return
    setSubmitting(true)
    setMsg(null)
    try {
      const orderId = genOrderId()
      const fileExt = proofFile.name.split('.').pop()
      const filePath = `${orderId}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('proofs')
        .upload(filePath, proofFile, { upsert: false })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('proofs').getPublicUrl(filePath)
      const proofUrl = urlData.publicUrl

      const { error: insertError } = await supabase.from('orders').insert({
        id: orderId,
        customer_name: form.name.trim(),
        whatsapp: form.wa.trim(),
        game_id: form.gameId.trim(),
        ign: form.ign.trim(),
        note: form.note.trim(),
        payment_method: selectedPayment.name,
        pkg_uc: selectedPkg.uc,
        pkg_price: selectedPkg.price,
        proof_url: proofUrl,
        status: 'menunggu_verifikasi',
      })
      if (insertError) throw insertError

      setLastOrderId(orderId)
      setMsg({ type: 'success' })

      setSelectedPkg(null)
      setSelectedPayment(null)
      setProofFile(null)
      setProofPreview(null)
      setForm({ name: '', wa: '', gameId: '', ign: '', note: '' })
    } catch (err) {
      console.error(err)
      setMsg({ type: 'error', text: 'Falha atu haruka pedidu. Favor tenta fila fali.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="hero">
        <h1>Top up UC PUBG</h1>
        <p>
          Hili paket UC, halo transferensia, upload bukti transferensia, kria pedidu — ami sei
          verifika no haruka UC ba game ID ita boot (Prosesu 15 menit).
        </p>
        <div className="contact">WhatsApp konfirmasaun: <b>{WHATSAPP_NUMBER}</b></div>
      </div>

      {PACKAGES.map((group) => (
        <div className="tier-block" key={group.tier}>
          <div className="tier-head">
            <h3>{group.tier}</h3>
            <span className="count">{group.items.length} pakote</span>
          </div>
          <div className="pkg-grid">
            {group.items.map((item) => (
              <div
                key={item.uc}
                className={`pkg-card${selectedPkg?.uc === item.uc ? ' selected' : ''}`}
                onClick={() => setSelectedPkg(item)}
              >
                <div className="uc">{item.uc.toLocaleString()} UC</div>
                <div className="price">${item.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="order-panel">
        <div>
          <h3>Detalha Pedidu</h3>
          {selectedPkg ? (
            <div className="selected-pkg">
              <div>
                <div className="label">Pakote hili</div>
                <div className="val">{selectedPkg.uc.toLocaleString()} UC</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="label">Osan</div>
                <div className="val">${selectedPkg.price.toFixed(2)}</div>
              </div>
            </div>
          ) : (
            <div className="selected-pkg empty">Hili pakote UC iha leten lai</div>
          )}

          <div className="field">
            <label htmlFor="f-name">Naran completu</label>
            <input id="f-name" value={form.name} onChange={handleField('name')} placeholder="Naran ita boot" />
          </div>
          <div className="field">
            <label htmlFor="f-wa">Numeru WhatsApp</label>
            <input id="f-wa" value={form.wa} onChange={handleField('wa')} placeholder="7XXXXXXX" />
          </div>
          <div className="field">
            <label htmlFor="f-gameid">PUBG Game ID</label>
            <input id="f-gameid" value={form.gameId} onChange={handleField('gameId')} placeholder="Character ID iha jogu laran" />
          </div>
          <div className="field">
            <label htmlFor="f-ign">Naran PUBG (IGN)</label>
            <input id="f-ign" value={form.ign} onChange={handleField('ign')} placeholder="Naran karakter iha jogu laran" />
          </div>
          <div className="field">
            <label htmlFor="f-note">Nota (opsional)</label>
            <textarea id="f-note" rows={2} value={form.note} onChange={handleField('note')} placeholder="Informasaun adisional" />
          </div>
        </div>

        <div>
          <h3>Metode Pagamentu</h3>
          <div className="field">
            <div className="pay-grid">
              {PAYMENT_METHODS.map((pm) => (
                <div
                  key={pm.id}
                  className={`pay-card${selectedPayment?.id === pm.id ? ' selected' : ''}`}
                  onClick={() => setSelectedPayment(pm)}
                >
                  <div className="pay-card-head">
                    <span className="pay-radio"></span>
                    <span className="pay-name">{pm.name}</span>
                  </div>
                  <div className="pay-detail">
                    <span className="pay-num mono">{pm.number}</span>
                    <span className="pay-holder">{pm.holder}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <h3 style={{ marginTop: 22 }}>Bukti Transferénsia</h3>
          <div className="field-hint" style={{ marginBottom: 10 }}>
            Transfere osan ba konta ami, depois upload screenshot bukti transfer iha ne'e.
          </div>
          <label className={`upload-box${proofPreview ? ' has-file' : ''}`}>
            <input type="file" accept="image/*" onChange={handleFile} />
            {proofPreview ? (
              <img src={proofPreview} alt="bukti transfer" />
            ) : (
              <div>
                <div className="icon">⬆</div>
                <div className="txt">Klik ka drag imajen bukti transfer</div>
              </div>
            )}
          </label>

          <button className="btn btn-primary" style={{ marginTop: 20 }} disabled={!isValid || submitting} onClick={handleSubmit}>
            {submitting ? 'Haruka...' : 'Haruka Pedidu'}
          </button>

          {msg?.type === 'success' && (
            <div className="msg success show">
              Pedidu submete ho susesu! Order ID ita boot: <b className="mono">{lastOrderId}</b>. Guarda
              ID ne'e atu cek status. Konfirma liu husi WhatsApp <b>{WHATSAPP_NUMBER}</b>.
            </div>
          )}
          {msg?.type === 'error' && <div className="msg error show">{msg.text}</div>}
        </div>
      </div>
    </>
  )
}
