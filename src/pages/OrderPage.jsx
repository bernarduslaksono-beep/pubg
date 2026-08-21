import { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { supabase } from '../supabase.js'
import { PAYMENT_METHODS, PAYMENT_METHOD_STORAGE_LABEL, WHATSAPP_NUMBER } from '../data/packages.js'
import { getGame } from '../data/games.js'
import DenomIcon from '../components/DenomIcon.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function genOrderId(prefix) {
  return (
    `${prefix}-` +
    Date.now().toString(36).toUpperCase().slice(-5) +
    Math.random().toString(36).toUpperCase().slice(2, 5)
  )
}

export default function OrderPage() {
  const { gameKey } = useParams()
  const game = getGame(gameKey)
  const { t } = useLanguage()

  const [step, setStep] = useState(1) // 1 = hili pakote, 2 = pagamentu
  const [selectedPkg, setSelectedPkg] = useState(null)
  const [qty, setQty] = useState(1)
  const [showNote, setShowNote] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [proofFile, setProofFile] = useState(null)
  const [proofPreview, setProofPreview] = useState(null)
  const [form, setForm] = useState({ name: '', wa: '', gameId: '', zoneId: '', ign: '', note: '' })
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState(null)
  const [lastOrderId, setLastOrderId] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [openTiers, setOpenTiers] = useState(() =>
    Object.fromEntries((game?.tiers ?? []).map((g) => [g.tierKey, true]))
  )
  const toggleTier = (tierKey) => setOpenTiers((o) => ({ ...o, [tierKey]: !o[tierKey] }))

  // Alfa navigasaun (1=Hili Pakote, 2=Halo Transferénsia, 3=Upload Prova, 4=Kria Pedidu)
  // — de'it aumenta, la volta ba kotuk bainhira cliente halo Edit.
  const [flowStage, setFlowStage] = useState(1)
  const userIdRef = useRef(null)
  const stepIndicatorRef = useRef(null)

  const isPubg = game?.key === 'pubg'

  const handleField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const handleGameIdField = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '')
    setForm((f) => ({ ...f, gameId: digitsOnly }))
  }
  const handleZoneIdField = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '')
    setForm((f) => ({ ...f, zoneId: digitsOnly }))
  }
  const gameIdStartsWrong = isPubg && form.gameId.length > 0 && !form.gameId.startsWith('5')

  const subtotal = useMemo(() => (selectedPkg ? selectedPkg.price * qty : 0), [selectedPkg, qty])

  const step1Valid =
    selectedPkg && form.name.trim() && form.wa.trim() && form.ign.trim() &&
    (isPubg ? (form.gameId.length > 1 && form.gameId.startsWith('5')) : form.gameId.trim().length > 0) &&
    (!game?.hasZoneId || form.zoneId.trim().length > 0)

  const step2Valid = selectedPayment && proofFile

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setProofFile(file)
    setFlowStage((s) => Math.max(s, 4))
    const reader = new FileReader()
    reader.onload = () => setProofPreview(reader.result)
    reader.readAsDataURL(file)
  }

  // Set-focus: bainhira cliente hili denom no kolona User ID sei mamuk,
  // foka automátikamente ba kolona User ID, ho movimentu scroll neneik (la'os lalais/diretu).
  useEffect(() => {
    if (selectedPkg && form.gameId.length === 0 && userIdRef.current) {
      userIdRef.current.focus({ preventScroll: true })
      userIdRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPkg])

  // Set-focus: bainhira tama ba pasu 2 (hafoin click Sosa), foka ba step-indicator
  // ("Hili Pakote --- Pagamentu") — ne'e halo hotu-hotu opsaun metode pagamentu bele
  // aparese iha ecrã smartphone, tanba pajina la scroll toman ba kraik.
  useEffect(() => {
    if (step === 2 && stepIndicatorRef.current) {
      stepIndicatorRef.current.focus({ preventScroll: true })
      stepIndicatorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [step])

  const resetAll = () => {
    setStep(1)
    setSelectedPkg(null)
    setQty(1)
    setShowNote(false)
    setSelectedPayment(null)
    setProofFile(null)
    setProofPreview(null)
    setForm({ name: '', wa: '', gameId: '', zoneId: '', ign: '', note: '' })
    setFlowStage(1)
  }

  const handleSubmit = async () => {
    if (!step1Valid || !step2Valid) return
    setSubmitting(true)
    setMsg(null)
    try {
      const orderId = genOrderId(game.orderPrefix)
      const rawExt = proofFile.name.includes('.') ? proofFile.name.split('.').pop() : ''
      const fileExt = (rawExt || (proofFile.type ? proofFile.type.split('/').pop() : '') || 'jpg')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 5) || 'jpg'
      const filePath = `${orderId}.${fileExt}`

      // Nota: la haruka objetu File diretamente — Safari/WebKit (iPhone) iha bug
      // konhesidu ne'ebe kadaan haruka konteudu mamuk ("No content provided").
      // Lee file ba ArrayBuffer lai antes upload, ne'e funsiona ho fiar iha
      // hotu-hotu browser.
      const fileBuffer = await proofFile.arrayBuffer()

      const { error: uploadError } = await supabase.storage
        .from('proofs')
        .upload(filePath, fileBuffer, {
          upsert: false,
          contentType: proofFile.type || 'image/jpeg',
        })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('proofs').getPublicUrl(filePath)
      const proofUrl = urlData.publicUrl

      const { error: insertError } = await supabase.from('orders').insert({
        id: orderId,
        game: game.key,
        customer_name: form.name.trim(),
        whatsapp: form.wa.trim(),
        game_id: form.gameId.trim(),
        zone_id: game.hasZoneId ? form.zoneId.trim() : null,
        ign: form.ign.trim(),
        note: form.note.trim(),
        payment_method: PAYMENT_METHOD_STORAGE_LABEL[selectedPayment.id],
        pkg_uc: selectedPkg.amount * qty,
        pkg_unit_uc: selectedPkg.amount,
        qty: qty,
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
      const detail = err?.message || err?.error_description || String(err)
      setMsg({ type: 'error', text: `${t('submit_error')} (${detail})` })
    } finally {
      setSubmitting(false)
    }
  }

  if (!game) return <Navigate to="/" replace />

  const userIdLabel = isPubg ? t('user_id_label') : t('user_id_label_generic')
  const userIdPlaceholder = isPubg ? t('user_id_placeholder') : t('user_id_placeholder_generic')

  return (
    <>
      <div className="hero">
        <h1>{t('hero_title_for', game.name)}</h1>
        <div className="flow-track">
          <span className="flow-flag" aria-hidden="true">🚩</span>
          <span className="flow-line"></span>
          <span className={`flow-step${flowStage === 1 ? ' active' : ''}`}>{t('step1')}</span>
          <span className="flow-line"></span>
          <span className={`flow-step${flowStage === 2 ? ' active' : ''}`}>{t('step2')}</span>
          <span className="flow-line"></span>
          <span className={`flow-step${flowStage === 3 ? ' active' : ''}`}>{t('step3')}</span>
          <span className="flow-line"></span>
          <span className={`flow-step${flowStage === 4 ? ' active' : ''}`}>{t('step4')}</span>
          <span className="flow-line"></span>
          <span className="flow-flag" aria-hidden="true">🏁</span>
        </div>
        <p>{t('hero_desc')}</p>
        <a
          className="whatsapp-badge"
          href={`https://wa.me/670${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          💬 {t('whatsapp_confirm')}: <b>{WHATSAPP_NUMBER}</b>
        </a>
      </div>

      <div className="step-indicator" ref={stepIndicatorRef} tabIndex={-1} style={{ outline: 'none' }}>
        <div className={`step ${step === 1 ? 'active' : 'done'}`}><span className="num">{step > 1 ? '✓' : '1'}</span> {t('step_indicator_pick')}</div>
        <div className="sep"></div>
        <div className={`step ${step === 2 ? 'active' : ''}`}><span className="num">2</span> {t('step_indicator_pay')}</div>
      </div>

      {step === 1 && (
        <div className="split-layout">
          <div className="panel-card">
            <div className="shop-header">
              <div className="badge-icon" style={{ background: game.accentColor }}>{game.currencyLabel === 'UC' ? 'UC' : '◆'}</div>
              <div>
                <h1>{t('shop_title_for', game.name)}</h1>
                <div className="avail"><i>✓</i> {t('shop_avail')}</div>
              </div>
            </div>

            <div className="select-product-label">{t('select_product_label')}</div>

            {game.tiers.map((group) => (
              <div className="tier-block" key={group.tierKey}>
                <div className="tier-head tier-head-toggle" onClick={() => toggleTier(group.tierKey)}>
                  <h3>{t(`tier_${group.tierKey}`)}</h3>
                  <span className="count">{group.items.length} {t('pkg_count_suffix')}</span>
                  <span className={`tier-chevron${openTiers[group.tierKey] ? ' open' : ''}`}>▾</span>
                </div>
                {openTiers[group.tierKey] && (
                  <div className="pkg-grid">
                    {group.items.map((item) => (
                      <div
                        key={item.amount}
                        className={`pkg-card${selectedPkg?.amount === item.amount ? ' selected' : ''}`}
                        onClick={() => setSelectedPkg(item)}
                      >
                        <div className="pkg-card-top">
                          <DenomIcon game={game} size={28} />
                          <div className="pkg-uc-big">{item.amount.toLocaleString()}<span className="pkg-uc-label">{game.currencyLabel}</span></div>
                        </div>
                        <div className="price">${item.price.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="panel-card sticky-checkout">
            <div className="checkout-header">
              <div className="avatar"><DenomIcon game={game} size={20} /></div>
              <div>
                <div className="name">{game.name} — Timor Leste</div>
                <div className="sub">{t('checkout_process_time')}</div>
              </div>
            </div>

            {selectedPkg ? (
              <div className="selected-pkg">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <DenomIcon game={game} size={28} />
                  <div>
                    <div className="label">{t('selected_pkg_label')}</div>
                    <div className="val">{selectedPkg.amount.toLocaleString()} {game.currencyLabel}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="label">{t('price_per_unit_label')}</div>
                  <div className="val">${selectedPkg.price.toFixed(2)}</div>
                </div>
              </div>
            ) : (
              <div className="selected-pkg empty">{t('select_pkg_empty')}</div>
            )}

            <div className="field">
              <label htmlFor="f-gameid">{userIdLabel}</label>
              <input
                id="f-gameid"
                ref={userIdRef}
                value={form.gameId}
                onChange={handleGameIdField}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={userIdPlaceholder}
                style={gameIdStartsWrong ? { borderColor: 'var(--danger)' } : undefined}
              />
              {gameIdStartsWrong && (
                <div className="field-error">{t('user_id_must_start_5')}</div>
              )}
            </div>

            {game.hasZoneId && (
              <div className="field">
                <label htmlFor="f-zoneid">{t('zone_id_label')}</label>
                <input
                  id="f-zoneid"
                  value={form.zoneId}
                  onChange={handleZoneIdField}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder={t('zone_id_placeholder')}
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="f-ign">{t('nickname_label')}</label>
              <input id="f-ign" value={form.ign} onChange={handleField('ign')} placeholder={t('nickname_placeholder')} />
            </div>

            {selectedPkg && (
              <div className="field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ margin: 0 }}>{t('quantity_label')}</label>
                <div className="qty-stepper">
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
                  <span className="qty-val">{qty}</span>
                  <button type="button" onClick={() => setQty((q) => Math.min(99, q + 1))}>+</button>
                </div>
              </div>
            )}

            <div className="field">
              <label htmlFor="f-name">{t('fullname_label')}</label>
              <input id="f-name" value={form.name} onChange={handleField('name')} placeholder={t('fullname_placeholder')} />
            </div>
            <div className="field">
              <label htmlFor="f-wa">{t('whatsapp_label')}</label>
              <input id="f-wa" value={form.wa} onChange={handleField('wa')} placeholder={t('whatsapp_placeholder')} />
            </div>

            {!showNote ? (
              <button className="note-toggle" onClick={() => setShowNote(true)}>{t('add_note_btn')}</button>
            ) : (
              <div className="field">
                <label htmlFor="f-note">{t('note_label')}</label>
                <textarea id="f-note" rows={2} value={form.note} onChange={handleField('note')} placeholder={t('note_placeholder')} />
              </div>
            )}

            {selectedPkg && (
              <div className="uc-breakdown">
                <div className="uc-breakdown-row">
                  <span>{selectedPkg.amount.toLocaleString()} {game.currencyLabel} × {qty}</span>
                </div>
                <div className="uc-breakdown-row total">
                  <span>{t('total_uc_label')}</span>
                  <span>{(selectedPkg.amount * qty).toLocaleString()} {game.currencyLabel}</span>
                </div>
              </div>
            )}

            <div className="subtotal-row">
              <div>
                <div className="lbl">{t('subtotal_label')}</div>
                <div className="val">${subtotal.toFixed(2)}</div>
              </div>
            </div>

            <div className="buy-row">
              <div className="cart-btn">🛒</div>
              <button
                className="btn btn-primary"
                disabled={!step1Valid}
                onClick={() => {
                  setStep(2)
                  setFlowStage((s) => Math.max(s, 2))
                }}
              >
                {t('buy_btn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && selectedPkg && (
        <div className="split-layout">
          <div className="panel-card">
            <h3>{t('payment_method_title')}</h3>
            <div className="field">
              <div className="pay-grid">
                {PAYMENT_METHODS.map((pm) => (
                  <div
                    key={pm.id}
                    className={`pay-card${selectedPayment?.id === pm.id ? ' selected' : ''}`}
                    onClick={() => {
                      setSelectedPayment(pm)
                      setFlowStage((s) => Math.max(s, 3))
                    }}
                  >
                    <div className="pay-card-head">
                      <span className="pay-radio"></span>
                      <span className="pay-name">{t(pm.typeKey)} — {pm.brand}</span>
                    </div>
                    <div className="pay-detail">
                      <span className="pay-num mono">{pm.number}</span>
                      <span className="pay-holder">{pm.holder}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <h3 style={{ marginTop: 22 }}>{t('upload_title')}</h3>
            <div className="field-hint" style={{ marginBottom: 10 }}>
              {selectedPayment ? t('upload_hint') : t('upload_locked_hint')}
            </div>
            <label className={`upload-box${proofPreview ? ' has-file' : ''}${!selectedPayment ? ' disabled' : ''}`}>
              <input type="file" accept="image/*" onChange={handleFile} disabled={!selectedPayment} />
              {proofPreview ? (
                <div className="upload-preview-row">
                  <img src={proofPreview} alt="proof" />
                  <div className="upload-preview-meta">
                    <div className="upload-filename">{proofFile?.name}</div>
                    <div className="upload-file-ok">✓ {t('upload_file_ok')}</div>
                    <span className="upload-change-btn">{t('upload_change_btn')}</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="upload-icon-circle">{selectedPayment ? '⬆' : '🔒'}</div>
                  <div className="upload-text-main">{selectedPayment ? t('upload_main') : t('upload_locked_main')}</div>
                  <div className="upload-text-sub">{t('upload_sub')}</div>
                  {selectedPayment && <span className="upload-btn-fake">{t('upload_btn')}</span>}
                </div>
              )}
            </label>
          </div>

          <div className="panel-card">
            <h3>{t('order_info_title')}</h3>
            <div className="order-info-card">
              <div className="order-info-head">
                <DenomIcon game={game} size={40} />
                <div className="meta">
                  <div className="uc-line">{selectedPkg.amount.toLocaleString()} {game.currencyLabel} × {qty}</div>
                  <div className="sub-line">
                    {userIdLabel}: {form.gameId}{game.hasZoneId ? ` (${form.zoneId})` : ''} · {form.ign}
                    <button className="edit-link" onClick={() => setStep(1)}>{t('edit_link')}</button>
                  </div>
                </div>
                <div className="price-col">${subtotal.toFixed(2)}</div>
              </div>
              <div className="order-info-total-row">
                <span>{t('total_uc_label')}</span>
                <span>{(selectedPkg.amount * qty).toLocaleString()} {game.currencyLabel}</span>
              </div>
            </div>

            <h3 style={{ marginTop: 22 }}>{t('payment_details_title')}</h3>
            <div className="summary-row">
              <span className="k">{t('payment_method_title')}</span>
              <span>{selectedPayment ? `${t(selectedPayment.typeKey)} — ${selectedPayment.brand}` : '-'}</span>
            </div>
            <div className="summary-row">
              <span className="k">{t('total_order_label')}</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span className="k">{t('total_payment_label')}</span>
              <span className="v">${subtotal.toFixed(2)}</span>
            </div>

            <button
              className="btn btn-primary"
              style={{ marginTop: 18 }}
              disabled={!step2Valid || submitting}
              onClick={handleSubmit}
            >
              {submitting ? t('submitting_label') : t('submit_btn')}
            </button>

            {msg?.type === 'error' && <div className="msg error show">{msg.text}</div>}
          </div>
        </div>
      )}

      <div className={`modal-overlay${showSuccessModal ? ' show' : ''}`} onClick={(e) => e.target.classList.contains('modal-overlay') && setShowSuccessModal(false)}>
        <div className="modal success-modal">
          <div className="icon-circle">✓</div>
          <h3>{t('success_title')}</h3>
          <p>{t('success_desc', WHATSAPP_NUMBER)}</p>
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
              {copied ? `✓ ${t('copied_btn')}` : `⧉ ${t('copy_btn')}`}
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowSuccessModal(false)}>{t('ok_btn')}</button>
        </div>
      </div>
    </>
  )
}
