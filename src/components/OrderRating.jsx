import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

const RATED_ORDERS_KEY = 'rated_order_ids'

function loadRatedIds() {
  try {
    const raw = localStorage.getItem(RATED_ORDERS_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveRatedId(orderId) {
  try {
    const set = loadRatedIds()
    set.add(orderId)
    localStorage.setItem(RATED_ORDERS_KEY, JSON.stringify(Array.from(set)))
  } catch {
    /* ignora se localStorage la disponivel */
  }
}

const OPTIONS = [
  { value: 1, icon: '😞' },
  { value: 2, icon: '😐' },
  { value: 3, icon: '😊' },
]

export default function OrderRating({ orderId }) {
  const { t } = useLanguage()
  const [done, setDone] = useState(() => loadRatedIds().has(orderId))
  const [saving, setSaving] = useState(false)
  // null = seidauk hili; 'comment' = hili ona rating baixu/neutru, hein komentáriu
  const [stage, setStage] = useState(null)
  const [comment, setComment] = useState('')

  useEffect(() => {
    setDone(loadRatedIds().has(orderId))
  }, [orderId])

  const submitRating = async (value) => {
    setSaving(true)
    const { error } = await supabase.from('order_feedback').insert({ order_id: orderId, rating: value })
    setSaving(false)
    if (error) console.error(error)

    // Rating 3 (kontente) → hotu tiha ona, la presiza komentáriu.
    // Rating 1/2 (la diak/neutru) → oferese kotak komentáriu opsional.
    if (value <= 2) {
      setStage('comment')
    } else {
      saveRatedId(orderId)
      setDone(true)
    }
  }

  const submitComment = async () => {
    if (comment.trim()) {
      setSaving(true)
      const { error } = await supabase
        .from('order_feedback')
        .update({ comment: comment.trim() })
        .eq('order_id', orderId)
      setSaving(false)
      if (error) console.error(error)
    }
    saveRatedId(orderId)
    setDone(true)
  }

  if (done) {
    return <div className="order-rating-thanks">✓ {t('rating_thanks')}</div>
  }

  if (stage === 'comment') {
    return (
      <div className="order-rating-box">
        <div className="order-rating-question">{t('rating_comment_prompt')}</div>
        <textarea
          className="order-rating-comment-input"
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('rating_comment_placeholder')}
        />
        <div className="order-rating-comment-actions">
          <button className="link-btn" onClick={submitComment} disabled={saving}>{t('rating_skip_btn')}</button>
          <button className="btn btn-primary btn-small" onClick={submitComment} disabled={saving}>
            {saving ? '...' : t('rating_send_btn')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="order-rating-box">
      <div className="order-rating-question">{t('rating_question')}</div>
      <div className="order-rating-options">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className="order-rating-btn"
            onClick={() => submitRating(opt.value)}
            disabled={saving}
            aria-label={`rating-${opt.value}`}
          >
            {opt.icon}
          </button>
        ))}
      </div>
    </div>
  )
}
