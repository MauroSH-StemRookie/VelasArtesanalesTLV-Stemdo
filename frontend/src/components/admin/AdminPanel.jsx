import { useState, useEffect } from 'react'
import { productosAPI } from '../../services/api'
import { IconBack, IconPackage, IconPlus, IconClipboard, IconUsers, IconFlame, IconEdit, IconTrash } from '../icons/Icons'
import ProductEditModal from './ProductEditModal'
import ConfirmModal from './ConfirmModal'

/* ==========================================================================
   PANEL DE ADMINISTRACION — conectado al backend
   -----------------------------------------------
   La pestana de Productos ya carga datos reales del backend:
   - GET /api/productos al entrar
   - POST /api/productos para anadir
   - PUT /api/productos/:id para modificar (desde ProductEditModal)
   - DELETE /api/productos/:id para eliminar

   Las pestanas de Pedidos y Usuarios siguen con datos de ejemplo porque
   el backend aun no tiene esas rutas implementadas.
   ========================================================================== */
export default function AdminPanel({ onBack }) {
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Al montar el componente, pedimos los productos al backend
  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    setLoading(true)
    setError('')
    try {
      const data = await productosAPI.getAll()
      setProducts(data)
    } catch (err) {
      setError('Error al cargar los productos: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // TODO BACKEND: cuando /api/pedidos y /api/usuarios esten listos,
  // reemplazar estos arrays por llamadas a la API como arriba
  const [orders] = useState([
    { id: 101, nombre: 'Maria Lopez', correo: 'maria@email.com', total: 37.80, estado: 'Pendiente' },
    { id: 102, nombre: 'Invitado', correo: 'guest@email.com', total: 22.50, estado: 'Enviado' },
  ])
  const [users] = useState([
    { id: 1, nombre: 'Sergio Admin', correo: 'sergioAdmin@gmail.com', tipo: 'admin' },
    { id: 2, nombre: 'Maria Lopez', correo: 'maria@email.com', tipo: 'cliente' },
  ])

  const [editProduct, setEditProduct] = useState(null)
  const [deleteProduct, setDeleteProduct] = useState(null)
  const [newProduct, setNewProduct] = useState({
    nombre: '', descripcion: '', precio: '', categoria: '', stock: '', imagen: ''
  })

  // Modificar stock: actualizamos localmente Y en el backend con PUT
  const handleStockChange = async (product, newStock) => {
    const val = Math.max(0, newStock)
    // Actualizamos la UI inmediatamente para que se sienta rapido
    setProducts(p => p.map(x => x.id === product.id ? { ...x, stock: val } : x))
    try {
      // Enviamos el PUT con todos los campos que el backend espera
      await productosAPI.update(product.id, {
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio: parseFloat(product.precio),
        stock: val,
        oferta: product.oferta || 0,
        precio_oferta: parseFloat(product.precio_oferta) || parseFloat(product.precio),
        categoria: product.categoria_id || product.categoria,
      })
    } catch (err) {
      // Si falla, recargamos para tener el estado real
      setError('Error al actualizar stock: ' + err.message)
      loadProducts()
    }
  }

  // Guardar cambios del modal de edicion
  const handleSaveEdit = async (updatedProduct) => {
    try {
      await productosAPI.update(updatedProduct.id, {
        nombre: updatedProduct.nombre,
        descripcion: updatedProduct.descripcion,
        precio: parseFloat(updatedProduct.precio),
        stock: parseInt(updatedProduct.stock),
        oferta: parseInt(updatedProduct.oferta) || parseInt(updatedProduct.oferta),
        precio_oferta: parseFloat(updatedProduct.precio_oferta) || parseFloat(updatedProduct.precio),
        categoria: parseInt(updatedProduct.categoria),
        imagen: updatedProduct.imagen || null,
      })
      // Recargamos la lista completa para tener los datos frescos
      loadProducts()
    } catch (err) {
      setError('Error al modificar: ' + err.message)
    }
  }

  // Eliminar producto tras confirmacion
  const handleDeleteConfirm = async () => {
    if (!deleteProduct) return
    try {
      await productosAPI.delete(deleteProduct.id)
      // Quitamos el producto de la lista local
      setProducts(p => p.filter(x => x.id !== deleteProduct.id))
    } catch (err) {
      setError('Error al eliminar: ' + err.message)
    }
    setDeleteProduct(null)
  }

  // Anadir producto nuevo
  const handleAddProduct = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await productosAPI.create({
        nombre: newProduct.nombre,
        descripcion: newProduct.descripcion,
        precio: parseFloat(newProduct.precio),
        stock: parseInt(newProduct.stock) || 0,
        categoria: parseInt(newProduct.categoria) || 1,
        imagen: newProduct.imagen || null,
      })
      setNewProduct({ nombre: '', descripcion: '', precio: '', categoria: '', stock: '', imagen: '' })
      // Recargamos la lista para ver el producto nuevo
      loadProducts()
    } catch (err) {
      setError('Error al crear producto: ' + err.message)
    }
  }

  const tabs = [
    { key: 'products', label: 'Administrar Productos', icon: <IconPackage /> },
    { key: 'add', label: 'Anadir Producto', icon: <IconPlus /> },
    { key: 'orders', label: 'Revision Pedidos', icon: <IconClipboard /> },
    { key: 'users', label: 'Usuarios', icon: <IconUsers /> },
  ]

  return (
    <div className="admin-panel">
      <div className="admin-header"><button className="admin-back" onClick={onBack}><IconBack /> Volver a la tienda</button><h2>Panel de Administracion</h2></div>
      <div className="admin-tabs">{tabs.map(t => (<button key={t.key} className={`admin-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>{t.icon} {t.label}</button>))}</div>

      {error && <div className="auth-error" style={{ margin: '0 0 1rem' }}>{error}</div>}

      <div className="admin-content">
        {/* PESTANA 1: Lista de productos — datos reales del backend */}
        {activeTab === 'products' && (
          <div className="admin-section">
            <h3>Todos los productos</h3>
            <p className="admin-section-desc">Gestiona, modifica, elimina y controla el stock.</p>
            {loading ? <p>Cargando productos...</p> : (
              <div className="admin-products-grid">{products.map(p => (
                <div className="admin-product-card" key={p.id}>
                  <div className="admin-product-img">
                    {p.imagen ? <img src={p.imagen} alt={p.nombre} style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <IconFlame />}
                    <span className="admin-product-cat">{p.categoria_nombre || 'Sin categoria'}</span>
                  </div>
                  <div className="admin-product-info">
                    <h4>{p.nombre}</h4>
                    <p className="admin-product-desc">{p.descripcion}</p>
                    <div className="admin-product-price">{parseFloat(p.precio).toFixed(2)} &euro;</div>
                    {p.oferta && <span className="admin-product-offer">Oferta: {parseFloat(p.precio_oferta).toFixed(2)} &euro;</span>}
                  </div>
                  <div className="admin-stock-control">
                    <label>Stock:</label>
                    <div className="stock-adjuster">
                      <button onClick={() => handleStockChange(p, p.stock - 1)}>&minus;</button>
                      <span>{p.stock}</span>
                      <button onClick={() => handleStockChange(p, p.stock + 1)}>+</button>
                    </div>
                  </div>
                  <div className="admin-product-actions">
                    <button className="btn-edit" onClick={() => setEditProduct(p)}><IconEdit /> Modificar</button>
                    <button className="btn-delete" onClick={() => setDeleteProduct(p)}><IconTrash /> Eliminar</button>
                  </div>
                </div>
              ))}</div>
            )}
          </div>
        )}

        {/* PESTANA 2: Anadir producto — conectado al backend */}
        {activeTab === 'add' && (
          <div className="admin-section">
            <h3>Anadir nuevo producto</h3>
            <p className="admin-section-desc">Rellena los datos para crear un nuevo producto.</p>
            <div className="admin-add-form">
              <div className="form-group"><label>Nombre</label><input type="text" placeholder="Ej: Vela de lavanda" value={newProduct.nombre} onChange={(e) => setNewProduct(p => ({ ...p, nombre: e.target.value }))} /></div>
              <div className="form-group"><label>Descripcion</label><textarea rows="3" placeholder="Descripcion..." value={newProduct.descripcion} onChange={(e) => setNewProduct(p => ({ ...p, descripcion: e.target.value }))} /></div>
              <div className="form-row">
                <div className="form-group"><label>Precio</label><input type="number" step="0.01" placeholder="14.90" value={newProduct.precio} onChange={(e) => setNewProduct(p => ({ ...p, precio: e.target.value }))} /></div>
                <div className="form-group"><label>ID Categoria</label><input type="number" placeholder="1" value={newProduct.categoria} onChange={(e) => setNewProduct(p => ({ ...p, categoria: e.target.value }))} /></div>
                <div className="form-group"><label>Stock</label><input type="number" placeholder="10" value={newProduct.stock} onChange={(e) => setNewProduct(p => ({ ...p, stock: e.target.value }))} /></div>
              </div>
              <div className="form-group"><label>URL Imagen (opcional)</label><input type="text" placeholder="https://..." value={newProduct.imagen} onChange={(e) => setNewProduct(p => ({ ...p, imagen: e.target.value }))} /></div>
              <button className="btn-auth" onClick={handleAddProduct} disabled={!newProduct.nombre || !newProduct.precio}>Anadir producto</button>
            </div>
          </div>
        )}

        {/* PESTANA 3: Pedidos — TODO BACKEND: reemplazar cuando la API este lista */}
        {activeTab === 'orders' && (
          <div className="admin-section">
            <h3>Revision de pedidos</h3>
            <p className="admin-section-desc">Pedidos recibidos. <em>(Datos de ejemplo — pendiente de API)</em></p>
            <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>ID</th><th>Cliente</th><th>Correo</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>{orders.map(o => (<tr key={o.id}><td>#{o.id}</td><td>{o.nombre}</td><td>{o.correo}</td><td>{o.total.toFixed(2)} &euro;</td><td><span className={`status-badge status-${o.estado.toLowerCase()}`}>{o.estado}</span></td><td><button className="btn-table-action">Ver detalle</button></td></tr>))}</tbody></table></div>
          </div>
        )}

        {/* PESTANA 4: Usuarios — TODO BACKEND: crear endpoint GET /api/usuarios */}
        {activeTab === 'users' && (
          <div className="admin-section">
            <h3>Usuarios registrados</h3>
            <p className="admin-section-desc">Compradores invitados van vinculados al pedido. <em>(Datos de ejemplo — pendiente de API)</em></p>
            <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Tipo</th></tr></thead>
            <tbody>{users.map(u => (<tr key={u.id}><td>#{u.id}</td><td>{u.nombre}</td><td>{u.correo}</td><td><span className={`type-badge type-${u.tipo}`}>{u.tipo === 'admin' ? 'Administrador' : 'Cliente'}</span></td></tr>))}</tbody></table></div>
          </div>
        )}
      </div>

      <ProductEditModal isOpen={!!editProduct} onClose={() => setEditProduct(null)} product={editProduct} onSave={handleSaveEdit} />
      <ConfirmModal isOpen={!!deleteProduct} onClose={() => setDeleteProduct(null)} onConfirm={handleDeleteConfirm} title="Eliminar producto" message={`Seguro que quieres eliminar "${deleteProduct?.nombre}"? No se puede deshacer.`} />
    </div>
  )
}
