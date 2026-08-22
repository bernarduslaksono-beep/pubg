import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabase.js'
import { isNotificationActive } from '../lib/notificationStatus.js'
import StoreHoursControl from './StoreHoursControl.jsx'
import StockControl from './StockControl.jsx'
import NotificationSetup from './NotificationSetup.jsx'

export default function AdminMenu() {
  const [open, setOpen] = useState(false)
  const [activeModal, setActiveModal] = useState(null) // 'hours' | 'stock' | 'notif' | null
  const [notifActive, setNotifActive] = useState(true) // default true = la hatudu dot to'o verifika
  const wrapRef = useRef(null)

  useEffect(() => {
    isNotificationActive().then(setNotifActive)
  }, [])

  useEffect(() => {
    function handleOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const openModal = (key) => {
    setActiveModal(key)
    setOpen(false)
    if (key === 'notif') {
      // hafoin loke popup notifikasaun, verifika fila fali estadu bainhira tuir hotu
      isNotificationActive().then(setNotifActive)
    }
  }

  return (
    <>
      <div className="admin-menu-wrap" ref={wrapRef}>
        <button className="admin-hamburger-btn" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          ☰
          {!notifActive && <span className="admin-menu-dot"></span>}
        </button>
        {open && (
          <div className="admin-menu-dropdown">
            <button onClick={() => openModal('hours')}>Oras Operasaun Loja</button>
            <button onClick={() => openModal('stock')}>Kontrola Stock</button>
            <button onClick={() => openModal('notif')}>
              Notifikasaun Ativu
              {!notifActive && <span className="admin-menu-dot inline"></span>}
            </button>
            <button className="danger" onClick={() => supabase.auth.signOut()}>Sai</button>
          </div>
        )}
      </div>

      <div className={`modal-overlay${activeModal === 'hours' ? ' show' : ''}`} onClick={(e) => e.target.classList.contains('modal-overlay') && setActiveModal(null)}>
        {activeModal === 'hours' && (
          <div className="modal">
            <div className="modal-head">
              <h3>Oras Operasaun Loja</h3>
              <button onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <StoreHoursControl />
          </div>
        )}
      </div>

      <div className={`modal-overlay${activeModal === 'stock' ? ' show' : ''}`} onClick={(e) => e.target.classList.contains('modal-overlay') && setActiveModal(null)}>
        {activeModal === 'stock' && (
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-head">
              <h3>Kontrola Stock</h3>
              <button onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <StockControl />
          </div>
        )}
      </div>

      <div className={`modal-overlay${activeModal === 'notif' ? ' show' : ''}`} onClick={(e) => e.target.classList.contains('modal-overlay') && setActiveModal(null)}>
        {activeModal === 'notif' && (
          <div className="modal">
            <div className="modal-head">
              <h3>Notifikasaun Ativu</h3>
              <button onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <NotificationSetup />
          </div>
        )}
      </div>
    </>
  )
}
