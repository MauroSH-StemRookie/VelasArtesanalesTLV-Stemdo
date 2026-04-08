import { useState, useEffect } from "react";
import "./CatalogPage.css";
import { productosAPI } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { IconSearch, IconFlame, IconCart, IconClose } from "../icons/Icons";
import ProductDetailModal from "./ProductDetailModal";

/* ==========================================================================
   CATALOGO DE PRODUCTOS
   ---------------------
   Tres zonas principales:
   1. Panel de filtros a la izquierda (categorias, precio) — acordeón colapsable
   2. Barra de busqueda por nombre arriba
   3. Grid de cards de producto
   ========================================================================== */

export default function CatalogPage({ initialSearch }) {
  const { addToCart } = useCart();

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros
  const [searchTerm, setSearchTerm] = useState(initialSearch || "");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceRange, setPriceRange] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false); // móvil

  // Acordeón: qué secciones están abiertas
  const [openSections, setOpenSections] = useState({
    categorias: true,
    precio: true,
  });
  function toggleSection(key) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // Modal de detalle
  const [detailProductId, setDetailProductId] = useState(null);

  // Cantidades
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (initialSearch !== undefined) setSearchTerm(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await productosAPI.getAll();
        setAllProducts(data);
      } catch (err) {
        setError("Error al cargar productos: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = [
    ...new Map(
      allProducts
        .filter((p) => p.categoria_id && p.categoria_nombre)
        .map((p) => [
          p.categoria_id,
          { id: p.categoria_id, nombre: p.categoria_nombre },
        ]),
    ).values(),
  ];

  const filtered = allProducts.filter((p) => {
    if (
      searchTerm &&
      !p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    if (selectedCategory && p.categoria_id !== selectedCategory) return false;
    const { precioFinal: precio } = getPrecioFinal(p);
    if (priceRange === "under15" && precio >= 15) return false;
    if (priceRange === "15to25" && (precio < 15 || precio > 25)) return false;
    if (priceRange === "over25" && precio <= 25) return false;
    return true;
  });

  function getQty(id) {
    return quantities[id] || 1;
  }
  function setQty(id, val) {
    const n = Math.max(1, Math.min(99, Number(val) || 1));
    setQuantities((prev) => ({ ...prev, [id]: n }));
  }

  function handleQuickAdd(e, product) {
    e.stopPropagation();
    const qty = getQty(product.id);
    for (let i = 0; i < qty; i++) {
      addToCart({
        id: product.id,
        nombre: product.nombre,
        precio: getPrecioFinal(p).precioFinal,
        imagen: product.imagen,
      });
    }
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
  }

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategory(null);
    setPriceRange("all");
  }

  const hasActiveFilters =
    searchTerm || selectedCategory || priceRange !== "all";

  // SVG chevron reutilizable
  const Chevron = ({ open }) => (
    <svg
      className={`filter-chevron ${open ? "filter-chevron--open" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
  function getPrecioFinal(p) {
    const precio = parseFloat(p.precio) || 0;
    const precioOferta = parseFloat(p.precio_oferta) || 0;
    const enOferta = precioOferta > 0 && precioOferta < precio;
    return {
      precio,
      precioOferta,
      enOferta,
      precioFinal: enOferta ? precioOferta : precio,
    };
  }

  return (
    <div className="catalog-page">
      {/* Cabecera y búsqueda */}
      <div className="catalog-header">
        <h1 className="catalog-title">Nuestras Velas</h1>
        <p className="catalog-subtitle">
          Descubre todas nuestras velas artesanales
        </p>
        <div className="catalog-search">
          <IconSearch />
          <input
            type="text"
            placeholder="Buscar velas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="catalog-search-clear"
              onClick={() => setSearchTerm("")}
            >
              <IconClose />
            </button>
          )}
        </div>
      </div>

      {/* Toggle filtros móvil */}
      <button
        className="catalog-filters-toggle"
        onClick={() => setFiltersOpen((o) => !o)}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="14" y2="12" />
          <line x1="4" y1="18" x2="10" y2="18" />
        </svg>
        Filtros
        {hasActiveFilters && <span className="filter-badge" />}
      </button>

      <div className="catalog-body">
        {/* ── Panel de filtros (acordeón) ── */}
        <aside className={`catalog-filters ${filtersOpen ? "open" : ""}`}>
          {/* Categorías */}
          <div className="filter-section">
            <button
              className="filter-section-header"
              onClick={() => toggleSection("categorias")}
              aria-expanded={openSections.categorias}
            >
              <span>Categorías</span>
              <Chevron open={openSections.categorias} />
            </button>

            {openSections.categorias && (
              <ul className="filter-list" role="list">
                <li>
                  <button
                    className={`filter-option ${selectedCategory === null ? "active" : ""}`}
                    onClick={() => setSelectedCategory(null)}
                  >
                    Todas
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      className={`filter-option ${selectedCategory === cat.id ? "active" : ""}`}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      {cat.nombre}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Precio */}
          <div className="filter-section">
            <button
              className="filter-section-header"
              onClick={() => toggleSection("precio")}
              aria-expanded={openSections.precio}
            >
              <span>Precio</span>
              <Chevron open={openSections.precio} />
            </button>

            {openSections.precio && (
              <ul className="filter-list" role="list">
                <li>
                  <button
                    className={`filter-option ${priceRange === "all" ? "active" : ""}`}
                    onClick={() => setPriceRange("all")}
                  >
                    Todos
                  </button>
                </li>
                <li>
                  <button
                    className={`filter-option ${priceRange === "under15" ? "active" : ""}`}
                    onClick={() => setPriceRange("under15")}
                  >
                    Menos de 15€
                  </button>
                </li>
                <li>
                  <button
                    className={`filter-option ${priceRange === "15to25" ? "active" : ""}`}
                    onClick={() => setPriceRange("15to25")}
                  >
                    15€ – 25€
                  </button>
                </li>
                <li>
                  <button
                    className={`filter-option ${priceRange === "over25" ? "active" : ""}`}
                    onClick={() => setPriceRange("over25")}
                  >
                    Más de 25€
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* Limpiar filtros */}
          {hasActiveFilters && (
            <button className="filter-clear" onClick={clearFilters}>
              Limpiar filtros
            </button>
          )}
        </aside>

        {/* ── Grid de productos ── */}
        <div className="catalog-main">
          {loading && (
            <div className="catalog-loading">Cargando productos...</div>
          )}
          {error && <div className="catalog-error">{error}</div>}

          {!loading && !error && filtered.length === 0 && (
            <div className="catalog-empty">
              <svg viewBox="0 0 24 24">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              <p>No se encontraron productos con esos filtros.</p>
              {hasActiveFilters && (
                <button className="filter-clear" onClick={clearFilters}>
                  Limpiar filtros
                </button>
              )}
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <>
              <p className="catalog-count">
                {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="catalog-grid">
                {filtered.map((p) => {
                  const { precio, enOferta, precioFinal } = getPrecioFinal(p);
                  return (
                    <article
                      key={p.id}
                      className="catalog-card"
                      onClick={() => setDetailProductId(p.id)}
                    >
                      <div className="catalog-card-img">
                        {p.imagen ? (
                          <img src={p.imagen} alt={p.nombre} loading="lazy" />
                        ) : (
                          <div className="catalog-card-placeholder">
                            <IconFlame />
                          </div>
                        )}
                        {enOferta && (
                          <span className="catalog-card-badge">Oferta</span>
                        )}
                        {p.categoria_nombre && (
                          <span className="catalog-card-cat">
                            {p.categoria_nombre}
                          </span>
                        )}
                      </div>
                      <div className="catalog-card-body">
                        <h3 className="catalog-card-name">{p.nombre}</h3>
                        <p className="catalog-card-desc">{p.descripcion}</p>
                        <div className="catalog-card-price-row">
                          <span className="catalog-price">
                            {precioFinal.toFixed(2)}€
                          </span>
                          {enOferta && (
                            <span className="catalog-price-old">
                              {precio.toFixed(2)}€
                            </span>
                          )}
                        </div>
                        <div
                          className="catalog-card-actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="catalog-qty">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setQty(p.id, getQty(p.id) - 1);
                              }}
                            >
                              −
                            </button>
                            <span>{getQty(p.id)}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setQty(p.id, getQty(p.id) + 1);
                              }}
                            >
                              +
                            </button>
                          </div>
                          <button
                            className="catalog-add-btn"
                            onClick={(e) => handleQuickAdd(e, p)}
                            disabled={p.stock === 0}
                          >
                            <IconCart />
                            <span>
                              {p.stock === 0 ? "Sin stock" : "Añadir"}
                            </span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de detalle */}
      <ProductDetailModal
        productId={detailProductId}
        isOpen={detailProductId !== null}
        onClose={() => setDetailProductId(null)}
      />
    </div>
  );
}
