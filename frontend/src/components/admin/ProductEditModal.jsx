import { useState, useEffect } from 'react'
import { IconClose } from '../icons/Icons'

/* ==========================================================================
   MODAL DE EDICION DE PRODUCTO — adaptado al PUT del backend
   -----------------------------------------------------------
   Los campos que el backend espera en PUT /api/productos/:id:
   nombre, descripcion, precio, stock, oferta, precio_oferta, categoria, imagen
   ========================================================================== */
export default function ProductEditModal({ isOpen, onClose, product, onSave }) {
  const [form, setForm] = useState({
    nombre: '', descripcion: '', precio: '', stock: '',
    oferta: false, precio_oferta: '', categoria: '', imagen: ''
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

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }))

  const handleSave = () => {
    // Pasamos los datos al AdminPanel, que se encarga del fetch al backend
    onSave({ ...product, ...form })
    onClose()
  }

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
            <div className="form-group"><label>Stock</label><input type="number" value={form.stock} onChange={(e) => update('stock', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>ID Categoria</label><input type="number" value={form.categoria} onChange={(e) => update('categoria', e.target.value)} /></div>
            <div className="form-group"><label>URL Imagen</label><input type="text" value={form.imagen} onChange={(e) => update('imagen', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>En oferta</label>
              <select value={String(form.oferta)} onChange={(e) => update('oferta', e.target.value)}>
                <option value="false">No</option>
                <option value="true">Si</option>
              </select>
            </div>
            <div className="form-group"><label>Precio oferta</label><input type="number" step="0.01" value={form.precio_oferta} onChange={(e) => update('precio_oferta', e.target.value)} /></div>
          </div>
          <button className="btn-auth" onClick={handleSave}>Guardar cambios</button>
        </div>
      </div>
    </div>
  )
}
