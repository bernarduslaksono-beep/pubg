import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

// Hotu-hotu 2 estatístika ne'e tenki hatudu HAMUTUK — la'os ida-idak.
// De'it hatudu bainhira pedidu kompletu ona ≥20 NO pelumenus 3 avaliasaun ona
// tama (numeru ki'ik liu maka'as bele hasai konfiansa, la'os aumenta).
const MIN_COMPLETED_TO_SHOW = 20
const MIN_RATINGS_TO_SHOW = 3

export default function TrustStatsBanner() {
  const { t } = useLanguage()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase.rpc('get_public_trust_stats').then(({ data, error }) => {
      if (!error && data && data.length > 0 && !cancelled) setStats(data[0])
    })
    return () => { cancelled = true }
  }, [])

  if (!stats) return null

  const shouldShow = stats.completed_orders >= MIN_COMPLETED_TO_SHOW
    && stats.satisfaction_percent !== null
    && stats.rating_count >= MIN_RATINGS_TO_SHOW
  if (!shouldShow) return null

  return (
    <div className="trust-stats-banner">
      <div className="trust-stat-item">
        <span className="trust-stat-icon">✅</span>
        <span className="trust-stat-num">{Number(stats.completed_orders).toLocaleString()}</span>
        <span className="trust-stat-label">{t('trust_completed_label')}</span>
      </div>
      <div className="trust-stat-item">
        <span className="trust-stat-icon">😊</span>
        <span className="trust-stat-num">{stats.satisfaction_percent}%</span>
        <span className="trust-stat-label">{t('trust_satisfaction_label')}</span>
      </div>
    </div>
  )
}
