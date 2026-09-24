import { useRef } from 'react'
import Modal from './Modal.jsx'

// ConfirmDialog — Phase 2A accessibility foundation.
//
// Reusable replacement for the browser's native confirm()/alert(), built on
// top of Modal (so it gets role="dialog", Escape-to-close, focus trap and
// focus return for free). Not wired into any existing confirm()/alert() call
// yet — this is the foundation piece; Admin's delete/block/error flows can
// be migrated to it incrementally, one call site at a time.
//
// Usage:
//   <ConfirmDialog
//     open={showConfirm}
//     title="Apaga pedidu?"
//     description="Asaun ne'e la bele fila fali."
//     confirmLabel="Apaga"
//     variant="danger"
//     loading={deleting}
//     onConfirm={handleDelete}
//     onCancel={() => setShowConfirm(false)}
//   />
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Konfirma',
  cancelLabel = 'Kansela',
  variant = 'primary', // 'primary' | 'danger'
  loading = false,
  onConfirm,
  onCancel,
}) {
  const confirmBtnRef = useRef(null)

  return (
    <Modal open={open} onClose={onCancel} title={title} maxWidth={380} initialFocusRef={confirmBtnRef}>
      {description && <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 18 }}>{description}</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelLabel}
        </button>
        <button
          ref={confirmBtnRef}
          type="button"
          className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? '...' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
