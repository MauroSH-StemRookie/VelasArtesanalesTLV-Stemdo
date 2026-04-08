import { useState, useEffect } from 'react'
import { productosAPI } from '../../services/api'
import { useCart } from '../../context/CartContext'
import { IconClose, IconFlame, IconCart } from '../icons/Icons'

/* ==========================================================================
   MODAL DE DETALLE DE PRODUCTO
   ----------------------------
   Al abrir, hace GET /api/productos/:id que devuelve el producto completo
   con sus aromas y colores disponibles.

   El usuario puede elegir un color, un aroma y una cantidad antes de
   anadir al carrito. Si no elige nada, se anade con las opciones por defecto
   (primer color y primer aroma de la lista).
   ========================================================================== */
export default function ProductDetailModal({ productId, isOpen, onClose }) {
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Opciones seleccionadas por el usuario
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedAroma, setSelectedAroma] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [added, setAdded] = useState(false)

  // Cada vez que se abre con un nuevo producto, pedimos el detalle al backend
  useEffect(() => {
    if (!productId) return

    async function loadDetail() {
      setLoading(true)
      setError('')
      setAdded(false)
      setCantidad(1)
      try {
        const data = await productosAPI.getById(productId)
        setProduct(data)
        // Seleccionamos la primera opcion de cada lista como valor por defecto
        setSelectedColor(data.colores?.length ? data.colores[0].id : null)
        setSelectedAroma(data.aromas?.length ? data.aromas[0].id : null)
      } catch (err) {
        setError('Error al cargar el producto: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    loadDetail()
  }, [productId])

  if (!isOpen) return null

  const precio = product ? parseFloat(product.precio) : 0
  const precioOferta = product ? parseFloat(product.precio_oferta) : 0
  const enOferta = product?.oferta && precioOferta < precio
  const precioFinal = enOferta ? precioOferta : precio

  // Anadir al carrito con las opciones elegidas
  function handleAddToCart() {
    if (!product) return
    // Buscamos los nombres del color y aroma seleccionados para mostrarlos en el carrito
    const colorNombre = product.colores?.find(c => c.id === selectedColor)?.nombre || null
    const aromaNombre = product.aromas?.find(a => a.id === selectedAroma)?.nombre || null

    for (let i = 0; i < cantidad; i++) {
      addToCart({
        id: product.id,
        nombre: product.nombre,
        precio: precioFinal,
        imagen: product.imagen,
        // Guardamos las opciones elegidas para que se vean en el carrito/checkout
        color: colorNombre,
        aroma: aromaNombre,
      })
    }
    setAdded(true)
    // El mensaje de confirmacion se quita solo tras 2 segundos
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><IconClose /></button>

        {loading && <p style={{ padding: '2rem', textAlign: 'center' }}>Cargando detalle...</p>}
        {error && <div className="auth-error">{error}</div>}

        {product && !loading && (
          <div className="detail-content">
            {/* Imagen grande del producto */}
            <div className="detail-image">
              {product.imagen
                ? <img src={product.imagen} alt={product.nombre} />
                : <div className="detail-image-placeholder"><IconFlame /></div>
              }
            </div>

            {/* Informacion y opciones */}
            <div className="detail-info">
              {product.categoria_nombre && (
                <span className="detail-category">{product.categoria_nombre}</span>
              )}
              <h2 className="detail-name">{product.nombre}</h2>
              <p className="detail-desc">{product.descripcion}</p>

              {/* Precio */}
              <div className="detail-price-row">
                {enOferta ? (
                  <>
                    <span className="detail-price-old">{precio.toFixed(2)} &euro;</span>
                    <span className="detail-price">{precioOferta.toFixed(2)} &euro;</span>
                  </>
                ) : (
                  <span className="detail-price">{precio.toFixed(2)} &euro;</span>
                )}
              </div>

              {/* Selector de color — solo si el producto tiene colores */}
              {product.colores && product.colores.length > 0 && (
                <div className="detail-option">
                  <label>Color</label>
                  <div className="detail-option-list">
                    {product.colores.map(c => (
                      <button
                        key={c.id}
                        className={`detail-option-btn ${selectedColor === c.id ? 'active' : ''}`}
                        onClick={() => setSelectedColor(c.id)}
                      >
                        {c.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selector de aroma — solo si el producto tiene aromas */}
              {product.aromas && product.aromas.length > 0 && (
                <div className="detail-option">
                  <label>Aroma</label>
                  <div className="detail-option-list">
                    {product.aromas.map(a => (
                      <button
                        key={a.id}
                        className={`detail-option-btn ${selectedAroma === a.id ? 'active' : ''}`}
                        onClick={() => setSelectedAroma(a.id)}
                      >
                        {a.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cantidad + Boton de anadir */}
              <div className="detail-add-row">
                <div className="catalog-qty">
                  <button onClick={() => setCantidad(c => Math.max(1, c - 1))}>&minus;</button>
                  <span>{cantidad}</span>
                  <button onClick={() => setCantidad(c => Math.min(99, c + 1))}>+</button>
                </div>
                <button
                  className="detail-add-btn"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                >
                  <IconCart />
                  {product.stock <= 0 ? 'Agotado' : `Anadir al carrito \u2014 ${(precioFinal * cantidad).toFixed(2)} \u20AC`}
                </button>
              </div>

              {added && <p className="detail-added-msg">Anadido al carrito</p>}

              {/* Stock disponible */}
              <p className="detail-stock">
                {product.stock > 0
                  ? `${product.stock} unidades disponibles`
                  : 'Sin stock actualmente'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
