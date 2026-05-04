import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
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
import usePagination from "../../hooks/usePagination";
import Paginator from "../shared/paginator/Paginator";

/* ==========================================================================
   CATALOGO DE PRODUCTOS
   ---------------------
   Tres zonas principales:
   1. Panel de filtros a la izquierda (categorias, precio, aromas, colores)
   2. Barra de busqueda por nombre arriba + selector de ordenacion
   3. Grid de cards de producto + Paginator al final

   FILTROS Y PAGINACION — REPARTO CLARO:
   El backend soporta de forma nativa estos filtros a traves de endpoints
   distintos: /productos, /productos/categoria/:id, /productos/aroma/:id y
   /productos/color/:id. Los tres son excluyentes: el usuario puede filtrar
   por UNO de los tres a la vez (categoria, aroma o color).

   La paginacion se aplica siempre sobre el endpoint que toque, con los query
   params ?page=&limit=&sort=. Cuando el usuario cambia el filtro server-side
   (seleccionar otra categoria, por ejemplo), usePagination detecta el cambio
   en sus `deps` y resetea a page=1 automaticamente.

   La busqueda por texto y el filtro de precio son CLIENT-SIDE: operan solo
   sobre la pagina actualmente cargada. Para un catalogo pequeno esto es
   aceptable. Si el catalogo crece, TODO BACKEND: soportar `?q=` y rango de
   precio en el backend para que estos filtros operen sobre todo el dataset.
   ========================================================================== */

export default function CatalogPage() {
  const { addToCart } = useCart();
  var API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  /* La busqueda desde la navbar llega ahora por query string (?q=...). La
     leemos con useSearchParams para que cualquier usuario pueda compartir
     un enlace filtrado y llegue al catalogo con la busqueda ya aplicada. */
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("q") || "";

  // Listas para los filtros (vienen de la API). No paginadas: son catalogos pequenos.
  const [categories, setCategories] = useState([]);
  const [aromas, setAromas] = useState([]);
  const [colors, setColors] = useState([]);

  // Filtros activos
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedAroma, setSelectedAroma] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [priceRange, setPriceRange] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false); // movil
  const ofertaFromUrl = searchParams.get("oferta");

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

  /* Si el usuario llega al catalogo con un ?q= nuevo (por ejemplo, pulsa la
     lupa, escribe otra busqueda y envia), refrescamos el searchTerm con el
     valor entrante. Mantiene la misma semantica que tenia el prop
     initialSearch en el sistema anterior. */
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) setSearchTerm(q);
  }, [searchParams]);

  /* ── Fetcher para usePagination ───────────────────────────────────────
     Selecciona el endpoint adecuado segun el filtro server-side activo.
     Los filtros son excluyentes: si hay categoria, se usa /categoria;
     si no, se mira aroma; si no, color; si no, el listado general.
     El hook llamara a este fetcher cada vez que cambien page, limit o sort. */
  const fetcher = useCallback(
    function (params) {
      if (selectedCategory !== null) {
        return productosAPI.getByCategoria(selectedCategory, params);
      }
      if (selectedAroma !== null) {
        return productosAPI.getByAroma(selectedAroma, params);
      }
      if (selectedColor !== null) {
        return productosAPI.getByColor(selectedColor, params);
      }
      return productosAPI.getAll(params);
    },
    [selectedCategory, selectedAroma, selectedColor],
  );

  /* Hook de paginacion. Al cambiar cualquiera de los filtros server-side,
     el hook detecta el cambio en `deps` y resetea a page=1. */
  const {
    items: productosPagina,
    page,
    limit,
    sort,
    loading,
    error,
    hasMore,
    setPage,
    setLimit,
    setSort,
  } = usePagination({
    fetcher: fetcher,
    initialLimit: 15,
    initialSort: "nuevos",
    deps: [selectedCategory, selectedAroma, selectedColor],
  });

  // Normaliza la respuesta del backend a un array de { id, nombre }.
  // Cubre los casos mas comunes:
  //   - Array directo:              [{ id, nombre }, ...]
  //   - Objeto envuelto:            { data: [...] } / { categorias: [...] } / { rows: [...] }
  //   - Campos con nombre distinto: { id_categoria, nombre } / { id, name } / etc.
  function normalizeList(raw) {
    const arr = Array.isArray(raw)
      ? raw
      : (raw?.data ?? raw?.rows ?? raw?.result ?? Object.values(raw)[0] ?? []);

    return arr.map((item) => ({
      id:
        item.id ??
        item.id_categoria ??
        item.id_aroma ??
        item.id_color ??
        item.categoria_id ??
        item.aroma_id ??
        item.color_id,
      nombre:
        item.nombre ??
        item.nombre_categoria ??
        item.nombre_aroma ??
        item.color ??
        item.name ??
        item.categoria_nombre ??
        item.aroma_nombre ??
        item.color_nombre ??
        item.label ??
        "",
    }));
  }

  // Carga categorias, aromas y colores al montar (los productos los gestiona usePagination)
  useEffect(() => {
    async function loadFiltros() {
      try {
        const [categoriasData, aromasData, coloresData] = await Promise.all([
          categoriaAPI.getAll(),
          aromaAPI.getAll(),
          colorAPI.getAll(),
        ]);
        setCategories(normalizeList(categoriasData));
        setAromas(normalizeList(aromasData));
        setColors(normalizeList(coloresData));
      } catch (err) {
        // Si fallan los filtros, los dejamos vacios y no bloqueamos el catalogo
        console.warn("Error cargando filtros:", err.message);
      }
    }
    loadFiltros();
  }, []);

  /* ── Filtros CLIENT-SIDE: busqueda y rango de precio ──────────────────
     Se aplican sobre `productosPagina` (lo que devuelve la pagina actual).
     Si el usuario busca "lavanda" y no aparece en la pagina actual, hay
     que navegar a otras paginas o limpiar filtros. Cuando se mueva la
     busqueda al backend, este filtrado desaparece. */
  const productosFiltrados = productosPagina.filter(function (p) {
    // 🔥 FILTRO OFERTA (desde URL)
    if (ofertaFromUrl === "true") {
      const precio = parseFloat(p.precio) || 0;
      const precioOferta = parseFloat(p.precio_oferta) || 0;

      const enOferta = precioOferta > 0 && precioOferta < precio;

      if (!enOferta) return false;
    }
    if (
      searchTerm &&
      !p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
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
  function setQty(id, val) {
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

  /* ── Handlers de filtros server-side: excluyentes entre si ──
     Si el usuario selecciona una categoria, limpiamos aroma y color
     (y viceversa), para que el backend reciba un filtro limpio. */
  function handleSelectCategory(id) {
    setSelectedCategory(id);
    if (id !== null) {
      setSelectedAroma(null);
      setSelectedColor(null);
    }
  }

  function handleSelectAroma(id) {
    setSelectedAroma(id);
    if (id !== null) {
      setSelectedCategory(null);
      setSelectedColor(null);
    }
  }

  function handleSelectColor(id) {
    setSelectedColor(id);
    if (id !== null) {
      setSelectedCategory(null);
      setSelectedAroma(null);
    }
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
      className={
        open ? "filter-chevron filter-chevron--open" : "filter-chevron"
      }
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

  // Seccion de filtro generica reutilizable
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
                  selected === null ? "filter-option active" : "filter-option"
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
                    selected === item.id
                      ? "filter-option active"
                      : "filter-option"
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
        <aside
          className={filtersOpen ? "catalog-filters open" : "catalog-filters"}
        >
          <button
            className="catalog-filters-close"
            onClick={() => setFiltersOpen(false)}
            aria-label="Cerrar filtros"
          >
            <IconClose />
            <span>Cerrar</span>
          </button>

          <FilterSection
            sectionKey="categorias"
            label="Categorias"
            items={categories}
            selected={selectedCategory}
            onSelect={handleSelectCategory}
          />

          {/* Precio — filtro client-side (sobre la pagina actual) */}
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
                        priceRange === value
                          ? "filter-option active"
                          : "filter-option"
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

          {aromas.length > 0 && (
            <FilterSection
              sectionKey="aromas"
              label="Aroma"
              items={aromas}
              selected={selectedAroma}
              onSelect={handleSelectAroma}
            />
          )}

          {colors.length > 0 && (
            <FilterSection
              sectionKey="colores"
              label="Color"
              items={colors}
              selected={selectedColor}
              onSelect={handleSelectColor}
            />
          )}

          {hasActiveFilters && (
            <button className="filter-clear" onClick={clearFilters}>
              Limpiar filtros
            </button>
          )}
        </aside>

        {/* Grid de productos */}
        <div className="catalog-main">
          {/* Barra superior: count + selector de ordenacion */}
          {!loading && !error && (
            <div className="catalog-toolbar">
              <p className="catalog-count">
                {productosFiltrados.length} producto
                {productosFiltrados.length !== 1 ? "s" : ""}
                {hasMore && " en esta pagina"}
              </p>
              <div className="catalog-sort">
                <label htmlFor="catalog-sort-select">Ordenar por</label>
                <select
                  id="catalog-sort-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="catalog-sort-select"
                >
                  <option value="nuevos">Mas nuevos</option>
                  <option value="oferta">En oferta</option>
                  <option value="precio_asc">Precio: menor a mayor</option>
                  <option value="precio_desc">Precio: mayor a menor</option>
                </select>
              </div>
            </div>
          )}

          {loading && (
            <div className="catalog-loading">Cargando productos...</div>
          )}
          {error && <div className="catalog-error">{error}</div>}

          {!loading && !error && productosFiltrados.length === 0 && (
            <div className="catalog-empty">
              <svg viewBox="0 0 24 24">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              <p>
                No se encontraron productos
                {hasActiveFilters ? " con esos filtros" : " en esta pagina"}.
              </p>
              {hasActiveFilters && (
                <button className="filter-clear" onClick={clearFilters}>
                  Limpiar filtros
                </button>
              )}
            </div>
          )}

          {!loading && !error && productosFiltrados.length > 0 && (
            <div className="catalog-grid">
              {productosFiltrados.map((p) => {
                const { precio, enOferta, precioFinal } = getPrecioFinal(p);
                return (
                  <article
                    key={p.id}
                    className="catalog-card"
                    onClick={() => setDetailProductId(p.id)}
                  >
                    <div className="catalog-card-img">
                      {p.imagen_id ? (
                        <img
                          src={`${API_URL}/productos/imagen/${p.imagen_id}`}
                          alt={p.nombre}
                          loading="lazy"
                        />
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
                              setQty(p.id, Math.min(p.stock, getQty(p.id) + 1));
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
          )}

          {/* Paginator al final — se oculta solo si no hay nada que paginar */}
          {!loading && !error && (productosPagina.length > 0 || page > 1) && (
            <Paginator
              page={page}
              limit={limit}
              hasMore={hasMore}
              onPageChange={setPage}
              onLimitChange={setLimit}
              limitOptions={[15, 30, 50]}
            />
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
