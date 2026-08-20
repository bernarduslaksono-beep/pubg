import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export default function NotificationSetup() {
  const [status, setStatus] = useState('idle') // idle | asking | on | denied | unsupported
  const [installEvent, setInstallEvent] = useState(null)

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    checkExistingSubscription()

    const handler = (e) => {
      e.preventDefault()
      setInstallEvent(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const checkExistingSubscription = async () => {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub && Notification.permission === 'granted') setStatus('on')
  }

  const handleEnable = async () => {
    setStatus('asking')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('denied')
        return
      }
      const reg = await navigator.serviceWorker.ready
      let sub = await reg.pushManager.getSubscription()
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        })
      }
      const json = sub.toJSON()
      await supabase.from('push_subscriptions').upsert({
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      })
      setStatus('on')
    } catch (err) {
      console.error(err)
      setStatus('idle')
      alert('Falha atu ativa notifikasaun. Favor tenta fila fali.')
    }
  }

  const handleInstall = async () => {
    if (!installEvent) return
    installEvent.prompt()
    await installEvent.userChoice
    setInstallEvent(null)
  }

  if (status === 'unsupported') return null

  return (
    <div className="notif-setup-card">
      <div className="notif-setup-icon">🔔</div>
      <div className="notif-setup-text">
        <div className="notif-setup-title">
          {status === 'on' ? 'Notifikasaun ativu' : 'Ativa notifikasaun pedidu foun'}
        </div>
        <div className="notif-setup-sub">
          {status === 'on'
            ? "Ita boot sei simu notifikasaun bainhira iha pedidu foun tama, maski app taka."
            : "Install app ne'e no ativa notifikasaun atu simu alerta lalais bainhira cliente halo pedidu."}
        </div>
      </div>
      <div className="notif-setup-actions">
        {installEvent && (
          <button className="btn btn-ghost btn-small" onClick={handleInstall}>Install App</button>
        )}
        {status !== 'on' && (
          <button className="btn btn-primary btn-small" onClick={handleEnable} disabled={status === 'asking'}>
            {status === 'asking' ? 'Hein...' : status === 'denied' ? 'Blokeadu — troka iha setting browser' : 'Ativa Notifikasaun'}
          </button>
        )}
        {status === 'on' && <span className="notif-setup-badge">✓ Ativu</span>}
      </div>
    </div>
  )
}
