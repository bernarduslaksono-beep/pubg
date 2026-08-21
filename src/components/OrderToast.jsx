import { useEffect, useRef } from 'react'
import { GAMES } from '../data/games.js'

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start()
    osc.stop(ctx.currentTime + 0.4)
  } catch (e) {
    /* silent fail on unsupported browsers */
  }
}

export default function OrderToast({ order, onDismiss }) {
  const timerRef = useRef(null)
  const gameName = order ? (GAMES[order.game]?.name || order.game) : ''
  const currency = order ? (GAMES[order.game]?.currencyLabel || 'UC') : 'UC'

  useEffect(() => {
    if (!order) return
    playBeep()

    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
      new Notification(`🔔 Pedidu ${gameName} Foun!`, {
        body: `${order.customer_name} — ${order.pkg_uc.toLocaleString()} ${currency}`,
        icon: '/icons/icon-192.png',
      })
    }

    timerRef.current = setTimeout(onDismiss, 6000)
    return () => clearTimeout(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order])

  if (!order) return null

  return (
    <div className="order-toast">
      <div className="order-toast-icon">🔔</div>
      <div className="order-toast-body">
        <div className="order-toast-title">Pedidu {gameName} Foun!</div>
        <div className="order-toast-sub">{order.customer_name} — {order.pkg_uc.toLocaleString()} {currency} (${Number(order.pkg_price).toFixed(2)})</div>
      </div>
      <button className="order-toast-close" onClick={onDismiss}>✕</button>
    </div>
  )
}
