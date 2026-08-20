import { useEffect, useState, useRef } from 'react'

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

  useEffect(() => {
    if (!order) return
    playBeep()

    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
      new Notification('🔔 Pedidu UC Foun!', {
        body: `${order.customer_name} — ${order.pkg_uc.toLocaleString()} UC`,
        icon: '/icons/icon-192.png',
      })
    }

    timerRef.current = setTimeout(onDismiss, 6000)
    return () => clearTimeout(timerRef.current)
  }, [order])

  if (!order) return null

  return (
    <div className="order-toast">
      <div className="order-toast-icon">🔔</div>
      <div className="order-toast-body">
        <div className="order-toast-title">Pedidu UC Foun!</div>
        <div className="order-toast-sub">{order.customer_name} — {order.pkg_uc.toLocaleString()} UC (${Number(order.pkg_price).toFixed(2)})</div>
      </div>
      <button className="order-toast-close" onClick={onDismiss}>✕</button>
    </div>
  )
}
