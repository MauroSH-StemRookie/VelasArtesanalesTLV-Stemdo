import { useState } from 'react'
import { IconBack, IconPackage, IconPlus, IconClipboard, IconUsers, IconFlame, IconEdit, IconTrash } from '../icons/Icons'
import ProductEditModal from './ProductEditModal'
import ConfirmModal from './ConfirmModal'

/* ==========================================================================
   PANEL DE ADMINISTRACION — solo para sergioAdmin@gmail.com
   4 pestanas tipo outlet: Productos, Anadir, Pedidos, Usuarios
   ========================================================================== */
export default function AdminPanel({ onBack }) {
  const [activeTab, setActiveTab] = useState('products')
  // TODO BACKEND: GET /api/productos, /api/pedidos, /api/usuarios
  const [products, setProducts] = useState([
    { id: 1, nombre: 'Rosa & Lavanda', descripcion: 'Vela aromatica 220g', precio: 14.90, categoria: 'aromatica', stock: 25, oferta: 0, precio_oferta: 0 },
    { id: 2, nombre: 'Cirio Clasico', descripcion: 'Cera de abeja pura', precio: 22.50, categoria: 'cirio', stock: 12, oferta: 10, precio_oferta: 20.25 },
    { id: 3, nombre: 'Zen Meditacion', descripcion: 'Soja & sandalo', precio: 18.90, categoria: 'decorativa', stock: 8, oferta: 0, precio_oferta: 0 },
    { id: 4, nombre: 'Pascual Artesano', descripcion: 'Tradicion y devocion', precio: 35.00, categoria: 'liturgica', stock: 5, oferta: 0, precio_oferta: 0 },
  ])
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
  const [newProduct, setNewProduct] = useState({ nombre: '', descripcion: '', precio: '', categoria: 'aromatica', stock: '' })

  const handleStockChange = (id, val) => { setProducts(p => p.map(x => x.id === id ? { ...x, stock: Math.max(0, val) } : x)) }
  const handleSaveEdit = (updated) => { setProducts(p => p.map(x => x.id === updated.id ? updated : x)) }
  const handleDeleteConfirm = () => { if (deleteProduct) setProducts(p => p.filter(x => x.id !== deleteProduct.id)); setDeleteProduct(null) }
  const handleAddProduct = (e) => {
    e.preventDefault()
    // TODO BACKEND: POST /api/productos (+ subida de imagen)
    setProducts(p => [...p, { id: Date.now(), ...newProduct, precio: parseFloat(newProduct.precio) || 0, stock: parseInt(newProduct.stock) || 0, oferta: 0, precio_oferta: 0 }])
    setNewProduct({ nombre: '', descripcion: '', precio: '', categoria: 'aromatica', stock: '' })
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
      <div className="admin-content">
        {activeTab === 'products' && (
          <div className="admin-section">
            <h3>Todos los productos</h3><p className="admin-section-desc">Gestiona, modifica, elimina y controla el stock.</p>
            <div className="admin-products-grid">{products.map(p => (
              <div className="admin-product-card" key={p.id}>
                <div className="admin-product-img"><IconFlame /><span className="admin-product-cat">{p.categoria}</span></div>
                <div className="admin-product-info"><h4>{p.nombre}</h4><p className="admin-product-desc">{p.descripcion}</p><div className="admin-product-price">{p.precio.toFixed(2)} €</div>{p.oferta > 0 && <span className="admin-product-offer">-{p.oferta}%</span>}</div>
                <div className="admin-stock-control"><label>Stock:</label><div className="stock-adjuster"><button onClick={() => handleStockChange(p.id, p.stock - 1)}>--</button><span>{p.stock}</span><button onClick={() => handleStockChange(p.id, p.stock + 1)}>+</button></div></div>
                <div className="admin-product-actions"><button className="btn-edit" onClick={() => setEditProduct(p)}><IconEdit /> Modificar</button><button className="btn-delete" onClick={() => setDeleteProduct(p)}><IconTrash /> Eliminar</button></div>
              </div>
            ))}</div>
          </div>
        )}
        {activeTab === 'add' && (
          <div className="admin-section">
            <h3>Anadir nuevo producto</h3><p className="admin-section-desc">Rellena los datos para crear un nuevo producto.</p>
            <div className="admin-add-form">
              <div className="form-group"><label>Nombre</label><input type="text" placeholder="Ej: Vela de lavanda" value={newProduct.nombre} onChange={(e) => setNewProduct(p => ({ ...p, nombre: e.target.value }))} /></div>
              <div className="form-group"><label>Descripcion</label><textarea rows="3" placeholder="Descripcion..." value={newProduct.descripcion} onChange={(e) => setNewProduct(p => ({ ...p, descripcion: e.target.value }))} /></div>
              <div className="form-row">
                <div className="form-group"><label>Precio</label><input type="number" step="0.01" placeholder="14.90" value={newProduct.precio} onChange={(e) => setNewProduct(p => ({ ...p, precio: e.target.value }))} /></div>
                <div className="form-group"><label>Categoria</label><select value={newProduct.categoria} onChange={(e) => setNewProduct(p => ({ ...p, categoria: e.target.value }))}><option value="aromatica">Aromatica</option><option value="decorativa">Decorativa</option><option value="cirio">Cirio</option><option value="liturgica">Liturgica</option></select></div>
                <div className="form-group"><label>Stock</label><input type="number" placeholder="10" value={newProduct.stock} onChange={(e) => setNewProduct(p => ({ ...p, stock: e.target.value }))} /></div>
              </div>
              <div className="form-group"><label>Imagen</label><div className="file-upload-placeholder"><IconPlus /><span>Subida disponible con backend</span></div></div>
              <button className="btn-auth" onClick={handleAddProduct} disabled={!newProduct.nombre || !newProduct.precio}>Anadir producto</button>
            </div>
          </div>
        )}
        {activeTab === 'orders' && (
          <div className="admin-section">
            <h3>Revision de pedidos</h3><p className="admin-section-desc">Pedidos recibidos. Invitados muestran datos del checkout.</p>
            <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>ID</th><th>Cliente</th><th>Correo</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>{orders.map(o => (<tr key={o.id}><td>#{o.id}</td><td>{o.nombre}</td><td>{o.correo}</td><td>{o.total.toFixed(2)} €</td><td><span className={`status-badge status-${o.estado.toLowerCase()}`}>{o.estado}</span></td><td><button className="btn-table-action">Ver detalle</button></td></tr>))}</tbody></table></div>
          </div>
        )}
        {activeTab === 'users' && (
          <div className="admin-section">
            <h3>Usuarios registrados</h3><p className="admin-section-desc">Compradores invitados van vinculados al pedido, no aparecen aqui.</p>
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
