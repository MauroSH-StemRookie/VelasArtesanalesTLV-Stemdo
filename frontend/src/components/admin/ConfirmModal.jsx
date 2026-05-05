import React from 'react'

/* ==========================================================================
   MODAL DE CONFIRMACION — reutilizable para acciones peligrosas (borrar, etc.)
   ========================================================================== */
export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3><p>{message}</p>
        <div className="confirm-actions">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-danger" onClick={() => { onConfirm(); onClose() }}>Confirmar</button>
        </div>
      </div>
    </div>
  )
}
