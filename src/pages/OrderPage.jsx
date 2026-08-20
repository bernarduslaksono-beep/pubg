import { useState, useMemo } from 'react'
import { supabase } from '../supabase.js'
import { PACKAGES, PAYMENT_METHODS, WHATSAPP_NUMBER } from '../data/packages.js'

function genOrderId() {
  return (
    'OA-' +
    Date.now().toString(36).toUpperCase().slice(-5) +
    Math.random().toString(36).toUpperCase().slice(2, 5)
  )
}

function CoinIcon({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="17" cy="17" r="15" fill="url(#coinGrad)" stroke="#B8860B" strokeWidth="1.5" />
      <text x="17" y="22" textAnchor="middle" fontFamily="Rajdhani, sans-serif" fontWeight="700" fontSize="13" fill="#7A5B00">UC</text>
      <defs>
        <linearGradient id="coinGrad" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE38A" />
          <stop offset="1" stopColor="#F0B93E" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function OrderPage() {
  const [step, setStep] = useState(1) // 1 = hili pakote, 2 = pagamentu
  const [selectedPkg, setSelectedPkg] = useState(null)
  const [qty, setQty] = useState(1)
  const [showNote, setShowNote] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [proofFile, setProofFile] = useState(null)
  const [proofPreview, setProofPreview] = useState(null)
  const [form, setForm] = useState({ name: '', wa: '', gameId: '', ign: '', note: '' })
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState(null)
  const [lastOrderId, setLastOrderId] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const handleGameIdField = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '')
    setForm((f) => ({ ...f, gameId: digitsOnly }))
  }

  const subtotal = useMemo(() => (selectedPkg ? selectedPkg.price * qty : 0), [selectedPkg, qty])

  const step1Valid =
    selectedPkg && form.name.trim() && form.wa.trim() && form.gameId.trim() && form.ign.trim()

  const step2Valid = selectedPayment && proofFile

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setProofFile(file)
    const reader = new FileReader()
    reader.onload = () => setProofPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const resetAll = () => {
    setStep(1)
    setSelectedPkg(null)
    setQty(1)
    setShowNote(false)
    setSelectedPayment(null)
    setProofFile(null)
    setProofPreview(null)
    setForm({ name: '', wa: '', gameId: '', ign: '', note: '' })
  }

  const handleSubmit = async () => {
    if (!step1Valid || !step2Valid) return
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
        pkg_uc: selectedPkg.uc * qty,
        pkg_price: subtotal,
        proof_url: proofUrl,
        status: 'menunggu_verifikasi',
      })
      if (insertError) throw insertError

      setLastOrderId(orderId)
      setMsg({ type: 'success' })
      setShowSuccessModal(true)
      setCopied(false)
      resetAll()
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

      <div className="step-indicator">
        <div className={`step ${step === 1 ? 'active' : 'done'}`}><span className="num">{step > 1 ? '✓' : '1'}</span> Hili Pakote</div>
        <div className="sep"></div>
        <div className={`step ${step === 2 ? 'active' : ''}`}><span className="num">2</span> Pagamentu</div>
      </div>

      {step === 1 && (
        <div className="split-layout">
          <div className="panel-card">
            <div className="shop-header">
              <div className="badge-icon">UC</div>
              <div>
                <h1>Top Up UC PUBG</h1>
                <div className="avail"><i>✓</i> Disponivel ba Timor-Leste</div>
              </div>
            </div>

            <div className="select-product-label">Hili Produtu</div>

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
                      <div className="pkg-icon"><CoinIcon /></div>
                      <div className="uc">{item.uc.toLocaleString()} UC</div>
                      <div className="price">${item.price.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="panel-card sticky-checkout">
            <div className="checkout-header">
              <div className="avatar"><CoinIcon size={20} /></div>
              <div>
                <div className="name">UC-PUBG Timor Leste</div>
                <div className="sub">Prosesu haruka: 15 menit</div>
              </div>
            </div>

            {selectedPkg ? (
              <div className="selected-pkg">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CoinIcon size={28} />
                  <div>
                    <div className="label">Pakote hili</div>
                    <div className="val">{selectedPkg.uc.toLocaleString()} UC</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="label">Osan / unidade</div>
                  <div className="val">${selectedPkg.price.toFixed(2)}</div>
                </div>
              </div>
            ) : (
              <div className="selected-pkg empty">Hili pakote UC iha karik</div>
            )}

            <div className="field">
              <label htmlFor="f-gameid">User ID</label>
              <input id="f-gameid" value={form.gameId} onChange={handleGameIdField} inputMode="numeric" pattern="[0-9]*" placeholder="Contoh: 1234567891234567" />
            </div>
            <div className="field">
              <label htmlFor="f-ign">Nickname PUBG Mobile</label>
              <input id="f-ign" value={form.ign} onChange={handleField('ign')} placeholder="Contoh: ucpubgtl2026" />
            </div>

            {selectedPkg && (
              <div className="field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ margin: 0 }}>Kuantidade</label>
                <div className="qty-stepper">
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
                  <span className="qty-val">{qty}</span>
                  <button type="button" onClick={() => setQty((q) => Math.min(99, q + 1))}>+</button>
                </div>
              </div>
            )}

            <div className="field">
              <label htmlFor="f-name">Naran completu</label>
              <input id="f-name" value={form.name} onChange={handleField('name')} placeholder="Naran ita boot" />
            </div>
            <div className="field">
              <label htmlFor="f-wa">Numeru WhatsApp</label>
              <input id="f-wa" value={form.wa} onChange={handleField('wa')} placeholder="7XXXXXXX" />
            </div>

            {!showNote ? (
              <button className="note-toggle" onClick={() => setShowNote(true)}>+ Hatama nota ba seller</button>
            ) : (
              <div className="field">
                <label htmlFor="f-note">Nota ba seller</label>
                <textarea id="f-note" rows={2} value={form.note} onChange={handleField('note')} placeholder="Informasaun adisional" />
              </div>
            )}

            <div className="subtotal-row">
              <div>
                <div className="lbl">Subtotal</div>
                <div className="val">${subtotal.toFixed(2)}</div>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                {selectedPkg ? `${(selectedPkg.uc * qty).toLocaleString()} UC × ${qty}` : '-'}
              </div>
            </div>

            <div className="buy-row">
              <div className="cart-btn">🛒</div>
              <button
                className="btn btn-primary"
                disabled={!step1Valid}
                onClick={() => setStep(2)}
              >
                Sosa
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && selectedPkg && (
        <div className="split-layout">
          <div className="panel-card">
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
                <div className="upload-preview-row">
                  <img src={proofPreview} alt="bukti transfer" />
                  <div className="upload-preview-meta">
                    <div className="upload-filename">{proofFile?.name}</div>
                    <div className="upload-file-ok">✓ Imajen ona hili</div>
                    <span className="upload-change-btn">Troka imajen</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="upload-icon-circle">⬆</div>
                  <div className="upload-text-main">Upload bukti transfer</div>
                  <div className="upload-text-sub">PNG ka JPG, até 5MB</div>
                  <span className="upload-btn-fake">Hili Imajen</span>
                </div>
              )}
            </label>
          </div>

          <div className="panel-card">
            <h3>Order Information</h3>
            <div className="order-info-card">
              <div className="order-info-head">
                <CoinIcon size={40} />
                <div className="meta">
                  <div className="uc-line">{(selectedPkg.uc * qty).toLocaleString()} UC × {qty}</div>
                  <div className="sub-line">User ID: {form.gameId} · {form.ign}<button className="edit-link" onClick={() => setStep(1)}>Edit</button></div>
                </div>
                <div className="price-col">${subtotal.toFixed(2)}</div>
              </div>
            </div>

            <h3 style={{ marginTop: 22 }}>Payment Details</h3>
            <div className="summary-row">
              <span className="k">Metode Pagamentu</span>
              <span>{selectedPayment ? selectedPayment.name : '-'}</span>
            </div>
            <div className="summary-row">
              <span className="k">Total Pedidu</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span className="k">Total Pagamentu</span>
              <span className="v">${subtotal.toFixed(2)}</span>
            </div>

            <button
              className="btn btn-primary"
              style={{ marginTop: 18 }}
              disabled={!step2Valid || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Haruka...' : 'Haruka Pedidu'}
            </button>

            {msg?.type === 'error' && <div className="msg error show">{msg.text}</div>}
          </div>
        </div>
      )}

      <div className={`modal-overlay${showSuccessModal ? ' show' : ''}`} onClick={(e) => e.target.classList.contains('modal-overlay') && setShowSuccessModal(false)}>
        <div className="modal success-modal">
          <div className="icon-circle">✓</div>
          <h3>Pedidu Submete!</h3>
          <p>
            Ami sei verifika pagamentu no haruka UC ba game ID ita boot. Guarda Order ID ne'e atu
            cek status, no konfirma liu husi WhatsApp <b>{WHATSAPP_NUMBER}</b>.
          </p>
          <div className="oid-copy-row">
            <span className="oid-text mono">{lastOrderId}</span>
            <button
              className={`copy-btn${copied ? ' copied' : ''}`}
              onClick={() => {
                navigator.clipboard.writeText(lastOrderId || '')
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
            >
              {copied ? '✓ Tersalin' : '⧉ Copy'}
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowSuccessModal(false)}>Diak</button>
        </div>
      </div>
    </>
  )
}
