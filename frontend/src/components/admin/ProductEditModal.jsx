import { useState, useEffect } from 'react'
import { IconClose } from '../icons/Icons'

/* ==========================================================================
   MODAL DE EDICION DE PRODUCTO — usa las clases de App.css
   -----------------------------------------------------------
   Los campos que el backend espera en PUT /api/productos/:id:
     nombre, descripcion, precio, stock, oferta, precio_oferta, categoria, imagen

   Comportamiento de "En oferta":
   - Checkbox ACTIVADO  → precio_oferta es editable libremente.
   - Checkbox DESACTIVADO → precio_oferta se deshabilita y se iguala
     automáticamente al precio normal.
   ========================================================================== */

export default function ProductEditModal({ isOpen, onClose, product, onSave }) {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    oferta: false,
    precio_oferta: '',
    categoria: '',
    imagen: '',
  })

  // Al abrir con un producto, rellenamos el formulario con sus datos actuales
  useEffect(() => {
    if (product) {
      setForm({
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        precio: product.precio || '',
        stock: product.stock || '',
        oferta: product.oferta || false,
        precio_oferta: product.precio_oferta || product.precio || '',
        // El backend devuelve "categoria_id", lo mapeamos a "categoria" para el PUT
        categoria: product.categoria_id || product.categoria || '',
        imagen: product.imagen || '',
      })
    }
  }, [product])

  if (!isOpen || !product) return null

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  // ── Lógica del checkbox "En oferta" ──────────────────────────────────────
  // Al desactivar: precio_oferta se iguala al precio normal automáticamente
  function handleOfertaChange(checked) {
    setForm(prev => ({
      ...prev,
      oferta: checked,
      precio_oferta: checked ? prev.precio_oferta : prev.precio,
    }))
  }

  // Al cambiar el precio normal sin oferta activa: sincroniza precio_oferta también
  function handlePrecioChange(value) {
    setForm(prev => ({
      ...prev,
      precio: value,
      precio_oferta: prev.oferta ? prev.precio_oferta : value,
    }))
  }

  const handleSave = () => {
    onSave({ ...product, ...form })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container product-modal" onClick={e => e.stopPropagation()}>

        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          <IconClose />
        </button>

        <h3>Modificar producto</h3>

        <div className="auth-form">

          {/* Nombre */}
          <div className="form-group">
            <label htmlFor="edit-nombre">Nombre</label>
            <input
              id="edit-nombre"
              type="text"
              value={form.nombre}
              onChange={e => update('nombre', e.target.value)}
            />
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label htmlFor="edit-descripcion">Descripción</label>
            <textarea
              id="edit-descripcion"
              rows={3}
              value={form.descripcion}
              onChange={e => update('descripcion', e.target.value)}
            />
          </div>

          {/* Precio + Stock en la misma fila */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-precio">Precio normal (€)</label>
              <input
                id="edit-precio"
                type="number"
                min="0"
                step="0.01"
                value={form.precio}
                onChange={e => handlePrecioChange(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-stock">Stock</label>
              <input
                id="edit-stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={e => update('stock', e.target.value)}
              />
            </div>
          </div>

          {/* ── En oferta (checkbox) ── */}
          <div className="form-group">
            <label className="edit-checkbox-label">
              <input
                type="checkbox"
                checked={form.oferta}
                onChange={e => handleOfertaChange(e.target.checked)}
              />
              <span>En oferta</span>
            </label>
          </div>

          {/* Precio oferta — deshabilitado si no hay oferta activa */}
          <div className="form-group">
            <label htmlFor="edit-precio-oferta">
              Precio oferta (€)
              {!form.oferta && (
                <span className="edit-field-hint"> — activa la oferta para editarlo</span>
              )}
            </label>
            <input
              id="edit-precio-oferta"
              type="number"
              min="0"
              step="0.01"
              value={form.precio_oferta}
              disabled={!form.oferta}
              onChange={e => update('precio_oferta', e.target.value)}
            />
          </div>

          {/* Categoría */}
          <div className="form-group">
            <label htmlFor="edit-categoria">Categoría (ID)</label>
            <input
              id="edit-categoria"
              type="text"
              value={form.categoria}
              onChange={e => update('categoria', e.target.value)}
            />
          </div>

          {/* Imagen */}
          <div className="form-group">
            <label htmlFor="edit-imagen">URL imagen</label>
            <input
              id="edit-imagen"
              type="text"
              value={form.imagen}
              onChange={e => update('imagen', e.target.value)}
            />
          </div>

          {/* Acciones */}
          <div className="confirm-actions">
            <button className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button className="btn-auth" onClick={handleSave}>Guardar cambios</button>
          </div>

        </div>
      </div>
    </div>
  )
}