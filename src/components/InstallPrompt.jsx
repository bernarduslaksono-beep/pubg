import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function isIos() {
  return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

export default function InstallPrompt() {
  const { t } = useLanguage()
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)
  const [showIosHint, setShowIosHint] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    if (sessionStorage.getItem('installPromptDismissed') === '1') return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS Safari la suporta beforeinstallprompt — hatudu instrusaun manual
    if (isIos()) {
      setShowIosHint(true)
      setShowBanner(true)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    setShowBanner(false)
    sessionStorage.setItem('installPromptDismissed', '1')
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="install-banner">
      <div className="install-banner-icon" aria-hidden="true">📲</div>
      <div className="install-banner-text">
        {showIosHint ? (
          <>
            <div className="install-banner-title">{t('install_ios_title')}</div>
            <div className="install-banner-sub">{t('install_ios_sub')}</div>
          </>
        ) : (
          <>
            <div className="install-banner-title">{t('install_title')}</div>
            <div className="install-banner-sub">{t('install_sub')}</div>
          </>
        )}
      </div>
      {!showIosHint && (
        <button className="install-banner-btn" onClick={handleInstall}>{t('install_btn')}</button>
      )}
      <button className="install-banner-close" onClick={dismiss} aria-label={t('close_btn')}>✕</button>
    </div>
  )
}
