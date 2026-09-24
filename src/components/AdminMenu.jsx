import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabase.js'
import { isNotificationActive } from '../lib/notificationStatus.js'
import Modal from './Modal.jsx'
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
  const triggerRef = useRef(null)

  useEffect(() => {
    isNotificationActive().then(setNotifActive)
  }, [])

  useEffect(() => {
    function handleOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    function handleEscape(e) {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEscape)
    }
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
        <button
          ref={triggerRef}
          className="admin-hamburger-btn"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu Admin"
          aria-haspopup="true"
          aria-expanded={open}
        >
          ☰
          {!notifActive && (
            <span className="admin-menu-dot">
              <span className="sr-only">Notifikasaun la ativu</span>
            </span>
          )}
        </button>
        {open && (
          <div className="admin-menu-dropdown" role="menu">
            <button role="menuitem" onClick={() => openModal('hours')}>Oras Operasaun Loja</button>
            <button role="menuitem" onClick={() => openModal('price')}>Kontrola Presu & Stok</button>
            <button role="menuitem" onClick={() => openModal('visual')}>Kontrola Konteúdu Visual</button>
            <button role="menuitem" onClick={() => openModal('ratings')}>Haree Avaliasaun</button>
            <button role="menuitem" onClick={() => openModal('notif')}>
              Notifikasaun Ativu
              {!notifActive && (
                <span className="admin-menu-dot inline">
                  <span className="sr-only">— la ativu</span>
                </span>
              )}
            </button>
            <button role="menuitem" className="danger" onClick={() => supabase.auth.signOut()}>Sai</button>
          </div>
        )}
      </div>

      <Modal open={activeModal === 'hours'} onClose={() => setActiveModal(null)} title="Oras Operasaun Loja">
        <StoreHoursControl />
      </Modal>

      <Modal open={activeModal === 'price'} onClose={() => setActiveModal(null)} title="Kontrola Presu & Stok" maxWidth={520}>
        <PriceStockControl />
      </Modal>

      <Modal open={activeModal === 'visual'} onClose={() => setActiveModal(null)} title="Kontrola Konteúdu Visual" maxWidth={480}>
        <VisualContentControl />
      </Modal>

      <Modal open={activeModal === 'ratings'} onClose={() => setActiveModal(null)} title="Haree Avaliasaun" maxWidth={520}>
        <RatingsReview onOpenOrder={handleOpenOrderFromRatings} />
      </Modal>

      <Modal open={activeModal === 'notif'} onClose={() => setActiveModal(null)} title="Notifikasaun Ativu">
        <NotificationSetup />
      </Modal>
    </>
  )
}
