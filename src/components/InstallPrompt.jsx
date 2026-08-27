import { useEffect, useState } from 'react'

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
      <div className="install-banner-icon">📲</div>
      <div className="install-banner-text">
        {showIosHint ? (
          <>
            <div className="install-banner-title">Hatama Loja-Game ba Ecrã Inísiu</div>
            <div className="install-banner-sub">Tap ikon Share ⬆️ iha Safari, hafoin hili "Add to Home Screen"</div>
          </>
        ) : (
          <>
            <div className="install-banner-title">Install Loja-Game</div>
            <div className="install-banner-sub">Hatama app ne'e ba ecrã inísiu ita boot nian</div>
          </>
        )}
      </div>
      {!showIosHint && (
        <button className="install-banner-btn" onClick={handleInstall}>Install</button>
      )}
      <button className="install-banner-close" onClick={dismiss} aria-label="Taka">✕</button>
    </div>
  )
}
