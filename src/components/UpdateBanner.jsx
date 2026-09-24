import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext.jsx'

export default function UpdateBanner() {
  const { t } = useLanguage()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handler = () => setShow(true)
    window.addEventListener('app-update-available', handler)
    return () => window.removeEventListener('app-update-available', handler)
  }, [])

  if (!show) return null

  return (
    <div className="update-banner" role="status">
      <span><span aria-hidden="true">🔄</span> {t('update_available_message')}</span>
      <button onClick={() => window.location.reload()}>{t('update_now_btn')}</button>
    </div>
  )
}
