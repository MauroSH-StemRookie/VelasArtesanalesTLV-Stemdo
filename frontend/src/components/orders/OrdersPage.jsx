import { IconBack } from '../icons/Icons'

/* ==========================================================================
   MIS PEDIDOS — historial de pedidos del usuario
   ========================================================================== */
export default function OrdersPage({ onBack }) {
  // TODO BACKEND: GET /api/pedidos/mis-pedidos (filtrado por JWT)
  const sampleOrders = [
    { id: 101, fecha: '20/03/2026', total: 37.80, estado: 'Enviado', items: 2 },
    { id: 98, fecha: '12/03/2026', total: 14.90, estado: 'Entregado', items: 1 },
  ]
  return (
    <div className="orders-page">
      <div className="admin-header"><button className="admin-back" onClick={onBack}><IconBack /> Volver a la tienda</button><h2>Mis Pedidos</h2></div>
      <div className="orders-content">
        {sampleOrders.length === 0 ? <p className="orders-empty">Aun no has realizado ningun pedido.</p> : (
          <div className="orders-list">{sampleOrders.map(o => (
            <div className="order-card" key={o.id}>
              <div className="order-card-header"><span className="order-id">Pedido #{o.id}</span><span className={`status-badge status-${o.estado.toLowerCase()}`}>{o.estado}</span></div>
              <div className="order-card-body"><p><strong>Fecha:</strong> {o.fecha}</p><p><strong>Articulos:</strong> {o.items}</p><p><strong>Total:</strong> {o.total.toFixed(2)} €</p></div>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  )
}
