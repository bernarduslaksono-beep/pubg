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

  useEffect(() => {
    setDone(loadRatedIds().has(orderId))
  }, [orderId])

  const submitRating = async (value) => {
    setSaving(true)
    const { error } = await supabase.from('order_feedback').insert({ order_id: orderId, rating: value })
    setSaving(false)
    // Ignora erru "duplikadu" (ita boot ona avalia pedidu ne'e antes) — hatudu
    // de'it hanesan "obrigadu" iha rua-rua kazu, la halo cliente hanoin lia.
    saveRatedId(orderId)
    setDone(true)
    if (error) console.error(error)
  }

  if (done) {
    return <div className="order-rating-thanks">✓ {t('rating_thanks')}</div>
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
