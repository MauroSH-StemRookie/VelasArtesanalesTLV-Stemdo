import { useState, useEffect } from 'react'
import { IconClose } from '../icons/Icons'

/* ==========================================================================
   MODAL DE EDICION DE PRODUCTO — campos de la tabla "producto" de la BBDD
   ========================================================================== */
export default function ProductEditModal({ isOpen, onClose, product, onSave }) {
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', categoria: '', stock: '', oferta: '', precio_oferta: '' })

  useEffect(() => {
    if (product) setForm({ nombre: product.nombre || '', descripcion: product.descripcion || '', precio: product.precio || '', categoria: product.categoria || '', stock: product.stock || '', oferta: product.oferta || '0', precio_oferta: product.precio_oferta || '' })
  }, [product])

  if (!isOpen || !product) return null
  const update = (f, v) => setForm(p => ({ ...p, [f]: v }))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container product-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><IconClose /></button>
        <h3>Modificar producto</h3>
        <div className="auth-form">
          <div className="form-group"><label>Nombre</label><input type="text" value={form.nombre} onChange={(e) => update('nombre', e.target.value)} /></div>
          <div className="form-group"><label>Descripcion</label><textarea rows="3" value={form.descripcion} onChange={(e) => update('descripcion', e.target.value)} /></div>
          <div className="form-row">
            <div className="form-group"><label>Precio</label><input type="number" step="0.01" value={form.precio} onChange={(e) => update('precio', e.target.value)} /></div>
            <div className="form-group"><label>Categoria</label>
              <select value={form.categoria} onChange={(e) => update('categoria', e.target.value)}>
                <option value="aromatica">Aromatica</option><option value="decorativa">Decorativa</option>
                <option value="cirio">Cirio</option><option value="liturgica">Liturgica</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Oferta (%)</label><input type="number" value={form.oferta} onChange={(e) => update('oferta', e.target.value)} /></div>
            <div className="form-group"><label>Precio oferta</label><input type="number" step="0.01" value={form.precio_oferta} onChange={(e) => update('precio_oferta', e.target.value)} /></div>
          </div>
          {/* TODO BACKEND: PUT /api/productos/:id */}
          <button className="btn-auth" onClick={() => { onSave({ ...product, ...form }); onClose() }}>Guardar cambios</button>
        </div>
      </div>
    </div>
  )
}
