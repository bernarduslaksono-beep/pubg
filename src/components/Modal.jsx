import { useEffect, useRef } from 'react'

// Modal — Phase 2A accessibility foundation.
//
// Reuses the EXACT same CSS classes the app's existing ad-hoc modals already
// use (`.modal-overlay`, `.modal`, `.modal-head`), so visually nothing
// changes when a modal is migrated to this component. What it adds is the
// behavior those modals are missing: role="dialog", aria-modal, Escape to
// close, a focus trap while open, and focus return to whatever triggered it
// on close.
//
// This is a FOUNDATION component — existing modals (AdminPage, AdminMenu,
// TrackPage, OrderPage) are not migrated yet. It's here so they can be,
// one at a time, without re-solving accessibility each time.
export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth,
  closeLabel = 'Taka',
  className = '',
  bodyClassName = '',
  ariaLabel,
  initialFocusRef,
}) {
  const modalRef = useRef(null)
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2, 9)}`)
  const previouslyFocused = useRef(null)

  useEffect(() => {
    if (!open) return

    previouslyFocused.current = document.activeElement

    const node = modalRef.current
    const getFocusable = () =>
      node
        ? Array.from(
            node.querySelectorAll(
              'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          )
        : []

    const focusables = getFocusable()
    // Prefer an explicit initial-focus target (e.g. a dialog's primary action)
    // over the first focusable element in DOM order — set imperatively here,
    // never via the `autoFocus` DOM attribute, which would race this effect
    // and also get wrongly captured below as "previously focused".
    ;(initialFocusRef?.current || focusables[0] || node)?.focus()

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
        return
      }
      if (e.key !== 'Tab') return
      const items = getFocusable()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // Kembali foka ba elementu ne'ebe loke modal — importante ba keyboard user.
      previouslyFocused.current?.focus?.()
    }
  }, [open, onClose, initialFocusRef])

  if (!open) return null

  return (
    <div
      className={`modal-overlay show${className ? ` ${className}` : ''}`}
      onClick={(e) => e.target.classList.contains('modal-overlay') && onClose?.()}
    >
      <div
        className={`modal${bodyClassName ? ` ${bodyClassName}` : ''}`}
        style={maxWidth ? { maxWidth } : undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId.current : undefined}
        aria-label={!title ? ariaLabel : undefined}
        ref={modalRef}
        tabIndex={-1}
      >
        {title && (
          <div className="modal-head">
            <h3 id={titleId.current}>{title}</h3>
            <button onClick={onClose} aria-label={closeLabel}>✕</button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
