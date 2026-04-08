import { useState, useEffect } from 'react'
import './CatalogPage.css'
import { productosAPI } from '../../services/api'
import { useCart } from '../../context/CartContext'
import { IconSearch, IconFlame, IconCart, IconClose } from '../icons/Icons'
import ProductDetailModal from './ProductDetailModal'

/* ==========================================================================
   CATALOGO DE PRODUCTOS
   ---------------------
   Tres zonas principales:
   1. Panel de filtros a la izquierda (categorias, precio)
   2. Barra de busqueda por nombre arriba
   3. Grid de cards de producto

   Los datos vienen del backend via GET /api/productos.
   Las opciones de filtro (categorias) se extraen de los propios productos
   porque el backend no tiene un endpoint separado para listar categorias.

   Al pulsar en una card se abre el modal de detalle con aromas/colores.
   Al pulsar "Anadir al carrito" desde la card, se anade con opciones por defecto.
   ========================================================================== */
export default function CatalogPage({ initialSearch }) {
  const { addToCart } = useCart()

  // Todos los productos que vienen del backend
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Estado de los filtros
  const [searchTerm, setSearchTerm] = useState(initialSearch || '')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [priceRange, setPriceRange] = useState('all')
  const [filtersOpen, setFiltersOpen] = useState(false) // para movil

  // Modal de detalle
  const [detailProductId, setDetailProductId] = useState(null)

  // Cantidades individuales por producto (para el selector en cada card)
  const [quantities, setQuantities] = useState({})

  // Cuando llega una busqueda nueva desde la navbar, actualizamos
  useEffect(() => {
    if (initialSearch !== undefined) setSearchTerm(initialSearch)
  }, [initialSearch])

  // Cargamos todos los productos al montar el componente
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await productosAPI.getAll()
        setAllProducts(data)
      } catch (err) {
        setError('Error al cargar productos: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Extraemos las categorias unicas de los productos para los filtros
  const categories = [...new Map(
    allProducts
      .filter(p => p.categoria_id && p.categoria_nombre)
      .map(p => [p.categoria_id, { id: p.categoria_id, nombre: p.categoria_nombre }])
  ).values()]

  // Aplicamos todos los filtros activos sobre la lista de productos
  const filtered = allProducts.filter(p => {
    // Filtro por nombre (busqueda)
    if (searchTerm && !p.nombre.toLowerCase().includes(searchTerm.toLowerCase())) return false
    // Filtro por categoria
    if (selectedCategory && p.categoria_id !== selectedCategory) return false
    // Filtro por rango de precio
    const precio = parseFloat(p.oferta ? p.precio_oferta : p.precio)
    if (priceRange === 'under15' && precio >= 15) return false
    if (priceRange === '15to25' && (precio < 15 || precio > 25)) return false
    if (priceRange === 'over25' && precio <= 25) return false
    return true
  })

  // Obtener la cantidad seleccionada para un producto (por defecto 1)
  function getQty(id) { return quantities[id] || 1 }
  function setQty(id, val) {
    const n = Math.max(1, Math.min(99, Number(val) || 1))
    setQuantities(prev => ({ ...prev, [id]: n }))
  }

  // Anadir al carrito con la cantidad elegida en la card
  function handleQuickAdd(e, product) {
    // Paramos la propagacion para que no se abra el modal de detalle
    e.stopPropagation()
    const qty = getQty(product.id)
    for (let i = 0; i < qty; i++) {
      addToCart({
        id: product.id,
        nombre: product.nombre,
        precio: parseFloat(product.oferta ? product.precio_oferta : product.precio),
        imagen: product.imagen,
      })
    }
    // Reseteamos la cantidad a 1 despues de anadir
    setQuantities(prev => ({ ...prev, [product.id]: 1 }))
  }

  // Limpiar todos los filtros
  function clearFilters() {
    setSearchTerm('')
    setSelectedCategory(null)
    setPriceRange('all')
  }

  const hasActiveFilters = searchTerm || selectedCategory || priceRange !== 'all'

  return (
    <div className="catalog-page">
      {/* Cabecera del catalogo con barra de busqueda */}
      <div className="catalog-header">
        <h1 className="catalog-title">Nuestra Coleccion</h1>
        <p className="catalog-subtitle">Descubre todas nuestras velas artesanales</p>

        <div className="catalog-search">
          <IconSearch />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="catalog-search-clear" onClick={() => setSearchTerm('')}>
              <IconClose />
            </button>
          )}
        </div>
      </div>

      <div className="catalog-body">
        {/* Boton para abrir filtros en movil */}
        <button className="catalog-filters-toggle" onClick={() => setFiltersOpen(!filtersOpen)}>
          Filtros {hasActiveFilters && <span className="filter-badge" />}
        </button>

        {/* Panel de filtros lateral */}
        <aside className={`catalog-filters ${filtersOpen ? 'open' : ''}`}>
          <div className="filter-section">
            <h4>Categorias</h4>
            <button
              className={`filter-option ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              Todas
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`filter-option ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          <div className="filter-section">
            <h4>Precio</h4>
            {[
              { value: 'all', label: 'Todos' },
              { value: 'under15', label: 'Menos de 15\u20AC' },
              { value: '15to25', label: '15\u20AC - 25\u20AC' },
              { value: 'over25', label: 'Mas de 25\u20AC' },
            ].map(opt => (
              <button
                key={opt.value}
                className={`filter-option ${priceRange === opt.value ? 'active' : ''}`}
                onClick={() => setPriceRange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button className="filter-clear" onClick={clearFilters}>Limpiar filtros</button>
          )}
        </aside>

        {/* Grid de productos */}
        <main className="catalog-grid-area">
          {loading && <p className="catalog-loading">Cargando productos...</p>}
          {error && <div className="auth-error">{error}</div>}

          {!loading && !error && filtered.length === 0 && (
            <div className="catalog-empty">
              <IconFlame />
              <p>No se encontraron productos con esos filtros.</p>
              {hasActiveFilters && <button className="filter-clear" onClick={clearFilters}>Limpiar filtros</button>}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <>
              <p className="catalog-count">{filtered.length} producto{filtered.length !== 1 ? 's' : ''}</p>
              <div className="catalog-grid">
                {filtered.map(p => {
                  const precio = parseFloat(p.precio)
                  const precioOferta = parseFloat(p.precio_oferta)
                  const enOferta = p.oferta && precioOferta < precio

                  return (
                    <div
                      className="catalog-card"
                      key={p.id}
                      onClick={() => setDetailProductId(p.id)}
                    >
                      {/* Imagen del producto o placeholder */}
                      <div className="catalog-card-img">
                        {p.imagen
                          ? <img src={p.imagen} alt={p.nombre} />
                          : <div className="catalog-card-placeholder"><IconFlame /></div>
                        }
                        {enOferta && <span className="catalog-card-badge">Oferta</span>}
                        {p.categoria_nombre && <span className="catalog-card-cat">{p.categoria_nombre}</span>}
                      </div>

                      {/* Info del producto */}
                      <div className="catalog-card-body">
                        <h3 className="catalog-card-name">{p.nombre}</h3>
                        <p className="catalog-card-desc">{p.descripcion}</p>

                        <div className="catalog-card-price-row">
                          {enOferta ? (
                            <>
                              <span className="catalog-price-old">{precio.toFixed(2)} &euro;</span>
                              <span className="catalog-price">{precioOferta.toFixed(2)} &euro;</span>
                            </>
                          ) : (
                            <span className="catalog-price">{precio.toFixed(2)} &euro;</span>
                          )}
                        </div>

                        {/* Selector de cantidad + boton de carrito */}
                        <div className="catalog-card-actions" onClick={(e) => e.stopPropagation()}>
                          <div className="catalog-qty">
                            <button onClick={() => setQty(p.id, getQty(p.id) - 1)}>&minus;</button>
                            <span>{getQty(p.id)}</span>
                            <button onClick={() => setQty(p.id, getQty(p.id) + 1)}>+</button>
                          </div>
                          <button
                            className="catalog-add-btn"
                            onClick={(e) => handleQuickAdd(e, p)}
                            disabled={p.stock <= 0}
                          >
                            <IconCart /> {p.stock <= 0 ? 'Agotado' : 'Anadir'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modal de detalle de producto — se abre al pulsar en una card */}
      <ProductDetailModal
        productId={detailProductId}
        isOpen={!!detailProductId}
        onClose={() => setDetailProductId(null)}
      />
    </div>
  )
}
