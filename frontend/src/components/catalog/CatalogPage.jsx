import { useState, useEffect } from "react";
import "./CatalogPage.css";
import {
  productosAPI,
  categoriaAPI,
  aromaAPI,
  colorAPI,
} from "../../services/api";
import { useCart } from "../../context/CartContext";
import { IconSearch, IconFlame, IconCart, IconClose } from "../icons/Icons";
import ProductDetailModal from "./ProductDetailModal";

/* ==========================================================================
   CATALOGO DE PRODUCTOS
   ---------------------
   Tres zonas principales:
   1. Panel de filtros a la izquierda (categorias, precio, aromas, colores)
   2. Barra de busqueda por nombre arriba
   3. Grid de cards de producto
   ========================================================================== */

export default function CatalogPage({ initialSearch }) {
  const { addToCart } = useCart();

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Listas para los filtros (vienen de la API)
  const [categories, setCategories] = useState([]);
  const [aromas, setAromas] = useState([]);
  const [colors, setColors] = useState([]);

  // Filtros activos
  const [searchTerm, setSearchTerm] = useState(initialSearch || "");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAroma, setSelectedAroma] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [priceRange, setPriceRange] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false); // movil

  // Acordeon: que secciones estan abiertas
  const [openSections, setOpenSections] = useState({
    categorias: true,
    precio: true,
    aromas: false,
    colores: false,
  });
  function toggleSection(key) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // Modal de detalle
  const [detailProductId, setDetailProductId] = useState(null);

  // Cantidades por producto
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (initialSearch !== undefined) setSearchTerm(initialSearch);
  }, [initialSearch]);

  // Normaliza la respuesta del backend a un array de { id, nombre }.
  // Cubre los casos mas comunes:
  //   - Array directo:              [{ id, nombre }, ...]
  //   - Objeto envuelto:            { data: [...] } / { categorias: [...] } / { rows: [...] }
  //   - Campos con nombre distinto: { id_categoria, nombre } / { id, name } / etc.
  function normalizeList(raw) {
    // Si el backend devuelve { data: [...] } u objeto similar, extraemos el array
    const arr = Array.isArray(raw)
      ? raw
      : (raw?.data ?? raw?.rows ?? raw?.result ?? Object.values(raw)[0] ?? []);

    return arr.map((item) => ({
      // Intentamos los nombres de campo mas habituales para el ID
      id:
        item.id ??
        item.id_categoria ??
        item.id_aroma ??
        item.id_color ??
        item.categoria_id ??
        item.aroma_id ??
        item.color_id,
      // Intentamos los nombres de campo mas habituales para el nombre
      // ORDEN IMPORTANTE: los campos reales de la BD van primero
      //   categoria → nombre_categoria
      //   aroma     → nombre_aroma
      //   color     → color  (la tabla color usa la columna "color", no "nombre_color")
      nombre:
        item.nombre ??
        item.nombre_categoria ??
        item.nombre_aroma ??
        item.color ?? // tabla color: columna se llama "color"
        item.name ??
        item.categoria_nombre ??
        item.aroma_nombre ??
        item.color_nombre ??
        item.label ??
        "",
    }));
  }

  // Carga productos, categorias, aromas y colores en paralelo
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [productosData, categoriasData, aromasData, coloresData] =
          await Promise.all([
            productosAPI.getAll(),
            categoriaAPI.getAll(),
            aromaAPI.getAll(),
            colorAPI.getAll(),
          ]);
        setAllProducts(productosData);
        setCategories(normalizeList(categoriasData));
        setAromas(normalizeList(aromasData));
        setColors(normalizeList(coloresData));
      } catch (err) {
        setError("Error al cargar productos: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Logica de filtrado ──────────────────────────────────────────────────────
  // NOTA sobre aromas y colores:
  // El filtro funciona si getAll() devuelve los productos con p.aromas[] y p.colores[].
  // Si el backend no los incluye en el listado general, los filtros no tendran efecto
  // (no rompen nada, simplemente no filtran). En ese caso habria que anadir los arrays
  // al endpoint GET /api/productos del backend.
  const filtered = allProducts.filter((p) => {
    if (
      searchTerm &&
      !p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    if (selectedCategory && p.categoria_id !== selectedCategory) return false;
    if (selectedAroma && !p.aromas?.some((a) => a.id === selectedAroma))
      return false;
    if (selectedColor && !p.colores?.some((c) => c.id === selectedColor))
      return false;
    const { precioFinal: precio } = getPrecioFinal(p);
    if (priceRange === "under15" && precio >= 15) return false;
    if (priceRange === "15to25" && (precio < 15 || precio > 25)) return false;
    if (priceRange === "over25" && precio <= 25) return false;
    return true;
  });

  function getQty(id) {
    return quantities[id] || 1;
  }
  // Cambia setQty para aceptar strings vacíos
  function setQty(id, val) {
    // Si es string vacío lo guardamos tal cual para que se pueda borrar
    if (val === "" || val === "-") {
      setQuantities((prev) => ({ ...prev, [id]: val }));
      return;
    }
    const n = Math.max(1, Math.min(999, Number(val) || 1));
    setQuantities((prev) => ({ ...prev, [id]: n }));
  }

  function handleQuickAdd(e, product) {
    e.stopPropagation();
    const qty = getQty(product.id);
    const { precioFinal } = getPrecioFinal(product);
    for (let i = 0; i < qty; i++) {
      addToCart({
        id: product.id,
        nombre: product.nombre,
        precio: precioFinal,
        imagen: product.imagen,
      });
    }
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
  }

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategory(null);
    setSelectedAroma(null);
    setSelectedColor(null);
    setPriceRange("all");
  }

  const hasActiveFilters =
    searchTerm ||
    selectedCategory ||
    selectedAroma ||
    selectedColor ||
    priceRange !== "all";

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

  // SVG chevron reutilizable
  const Chevron = ({ open }) => (
    <svg
      className={"filter-chevron" + (open ? " filter-chevron--open" : "")}
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

  // Seccion de filtro generica reutilizable (reduce repeticion)
  function FilterSection({ sectionKey, label, items, selected, onSelect }) {
    return (
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection(sectionKey)}
          aria-expanded={openSections[sectionKey]}
        >
          <span>{label}</span>
          <Chevron open={openSections[sectionKey]} />
        </button>
        {openSections[sectionKey] && (
          <ul className="filter-list" role="list">
            <li>
              <button
                className={
                  "filter-option" + (selected === null ? " active" : "")
                }
                onClick={() => onSelect(null)}
              >
                Todos
              </button>
            </li>
            {items.map((item) => (
              <li key={item.id}>
                <button
                  className={
                    "filter-option" + (selected === item.id ? " active" : "")
                  }
                  onClick={() => onSelect(item.id)}
                >
                  {item.nombre}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="catalog-page">
      {/* Cabecera y busqueda */}
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

      {/* Toggle filtros movil */}
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
        {/* Panel de filtros (acordeon) */}
        <aside className={"catalog-filters" + (filtersOpen ? " open" : "")}>
          {/* Botón cerrar — solo visible en móvil cuando el panel está abierto */}
          <button
            className="catalog-filters-close"
            onClick={() => setFiltersOpen(false)}
            aria-label="Cerrar filtros"
          >
            <IconClose />
            <span>Cerrar</span>
          </button>

          {/* Categorias */}
          <FilterSection
            sectionKey="categorias"
            label="Categorias"
            items={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />

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
                {[
                  { value: "all", label: "Todos" },
                  { value: "under15", label: "Menos de 15\u20ac" },
                  { value: "15to25", label: "15\u20ac \u2013 25\u20ac" },
                  { value: "over25", label: "M\u00e1s de 25\u20ac" },
                ].map(({ value, label }) => (
                  <li key={value}>
                    <button
                      className={
                        "filter-option" +
                        (priceRange === value ? " active" : "")
                      }
                      onClick={() => setPriceRange(value)}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Aromas — solo se muestra si la API devuelve aromas */}
          {aromas.length > 0 && (
            <FilterSection
              sectionKey="aromas"
              label="Aroma"
              items={aromas}
              selected={selectedAroma}
              onSelect={setSelectedAroma}
            />
          )}

          {/* Colores — solo se muestra si la API devuelve colores */}
          {colors.length > 0 && (
            <FilterSection
              sectionKey="colores"
              label="Color"
              items={colors}
              selected={selectedColor}
              onSelect={setSelectedColor}
            />
          )}

          {/* Limpiar filtros */}
          {hasActiveFilters && (
            <button className="filter-clear" onClick={clearFilters}>
              Limpiar filtros
            </button>
          )}
        </aside>

        {/* Grid de productos */}
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
                            {precioFinal.toFixed(2)}&euro;
                          </span>
                          {enOferta && (
                            <span className="catalog-price-old">
                              {precio.toFixed(2)}&euro;
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
                              disabled={p.stock === 0}
                            >
                              &minus;
                            </button>
                            <input
                              type="number"
                              className="qty-input"
                              min="1"
                              max={p.stock}
                              value={getQty(p.id)}
                              disabled={p.stock === 0}
                              onClick={(e) => e.stopPropagation()}
                              onBlur={(e) => {
                                // Al salir del campo, convierte a número válido
                                const val = parseInt(e.target.value, 10);
                                setQty(
                                  p.id,
                                  isNaN(val)
                                    ? 1
                                    : Math.min(p.stock, Math.max(1, val)),
                                );
                              }}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val))
                                  setQty(
                                    p.id,
                                    isNaN(val)
                                      ? 1
                                      : Math.min(p.stock, Math.max(1, val)),
                                  );
                              }}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setQty(
                                  p.id,
                                  Math.min(p.stock, getQty(p.id) + 1),
                                );
                              }}
                              disabled={p.stock === 0}
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
                              {p.stock === 0 ? "Sin stock" : "A\u00f1adir"}
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
