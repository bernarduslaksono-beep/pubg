import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabase.js'
import { isNotificationActive } from '../lib/notificationStatus.js'
import StoreHoursControl from './StoreHoursControl.jsx'
import PriceStockControl from './PriceStockControl.jsx'
import NotificationSetup from './NotificationSetup.jsx'
import VisualContentControl from './VisualContentControl.jsx'
import RatingsReview from './RatingsReview.jsx'

export default function AdminMenu({ onOpenOrder }) {
  const [open, setOpen] = useState(false)
  const [activeModal, setActiveModal] = useState(null) // 'hours' | 'stock' | 'notif' | 'ratings' | null
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

  const handleOpenOrderFromRatings = (orderId) => {
    setActiveModal(null)
    onOpenOrder?.(orderId)
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
            <button onClick={() => openModal('price')}>Kontrola Presu & Stok</button>
            <button onClick={() => openModal('visual')}>Kontrola Konteúdu Visual</button>
            <button onClick={() => openModal('ratings')}>Haree Avaliasaun</button>
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

      <div className={`modal-overlay${activeModal === 'price' ? ' show' : ''}`} onClick={(e) => e.target.classList.contains('modal-overlay') && setActiveModal(null)}>
        {activeModal === 'price' && (
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-head">
              <h3>Kontrola Presu & Stok</h3>
              <button onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <PriceStockControl />
          </div>
        )}
      </div>

      <div className={`modal-overlay${activeModal === 'visual' ? ' show' : ''}`} onClick={(e) => e.target.classList.contains('modal-overlay') && setActiveModal(null)}>
        {activeModal === 'visual' && (
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-head">
              <h3>Kontrola Konteúdu Visual</h3>
              <button onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <VisualContentControl />
          </div>
        )}
      </div>

      <div className={`modal-overlay${activeModal === 'ratings' ? ' show' : ''}`} onClick={(e) => e.target.classList.contains('modal-overlay') && setActiveModal(null)}>
        {activeModal === 'ratings' && (
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-head">
              <h3>Haree Avaliasaun</h3>
              <button onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <RatingsReview onOpenOrder={handleOpenOrderFromRatings} />
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
