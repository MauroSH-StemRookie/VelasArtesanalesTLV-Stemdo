import { useState, useEffect } from "react";
import { productosAPI } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { IconClose, IconCart } from "../icons/Icons";
import ImageCarousel from "../shared/ImageCarousel";

/* ==========================================================================
   MODAL DE DETALLE DE PRODUCTO (CATALOGO)
   ----------------------------------------
   Al abrir hace GET /api/productos/:id con aromas, colores e imagenes.
   Si el producto tiene varias imagenes, las muestra en un carrusel.
   El usuario elige color, aroma y cantidad antes de Añadir al carrito.
   ========================================================================== */

export default function ProductDetailModal({ productId, isOpen, onClose }) {
  var cart = useCart();
  var addToCart = cart.addToCart;

  var [product, setProduct] = useState(null);
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState("");
  var [selectedColor, setSelectedColor] = useState(null);
  var [selectedAroma, setSelectedAroma] = useState(null);
  var [cantidad, setCantidad] = useState(1);
  var [added, setAdded] = useState(false);

  useEffect(
    function loadOnOpen() {
      if (!productId) return;
      setLoading(true);
      setError("");
      setAdded(false);
      setCantidad(1);

      productosAPI
        .getById(productId)
        .then(function (data) {
          setProduct(data);
          if (data.colores && data.colores.length > 0) {
            setSelectedColor(data.colores[0].id);
          } else {
            setSelectedColor(null);
          }
          if (data.aromas && data.aromas.length > 0) {
            setSelectedAroma(data.aromas[0].id);
          } else {
            setSelectedAroma(null);
          }
        })
        .catch(function (err) {
          setError("Error al cargar el producto: " + err.message);
        })
        .finally(function () {
          setLoading(false);
        });
    },
    [productId],
  );

  if (!isOpen) return null;

  var precio = product ? parseFloat(product.precio) : 0;
  var precioOferta = product ? parseFloat(product.precio_oferta) : 0;
  var enOferta = product && product.oferta && precioOferta < precio;
  var precioFinal = enOferta ? precioOferta : precio;

  function handleAddToCart() {
    if (!product) return;

    var colorNombre = null;
    if (product.colores) {
      var colorObj = product.colores.find(function (c) {
        return c.id === selectedColor;
      });
      if (colorObj) colorNombre = colorObj.nombre;
    }

    var aromaNombre = null;
    if (product.aromas) {
      var aromaObj = product.aromas.find(function (a) {
        return a.id === selectedAroma;
      });
      if (aromaObj) aromaNombre = aromaObj.nombre;
    }

    for (var i = 0; i < cantidad; i++) {
      addToCart({
        id: product.id,
        nombre: product.nombre,
        precio: precioFinal,
        imagen: product.imagen_id,
        color: colorNombre,
        aroma: aromaNombre,
      });
    }
    setAdded(true);
    setTimeout(function () {
      setAdded(false);
    }, 2000);
  }

  function decrementCantidad() {
    setCantidad(function (q) {
      return Math.max(1, q - 1);
    });
  }

  function incrementCantidad() {
    if (!product) return;
    setCantidad(function (q) {
      return Math.min(product.stock, q + 1);
    });
  }

  function handleCantidadChange(e) {
    var val = parseInt(e.target.value, 10);
    if (!isNaN(val) && product) {
      setCantidad(Math.min(product.stock, Math.max(1, val)));
    }
  }

  function handleCantidadBlur() {
    if (!product) return;
    setCantidad(function (prev) {
      if (isNaN(prev) || prev < 1) return 1;
      if (prev > product.stock) return product.stock;
      return prev;
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container detail-modal"
        onClick={function (e) {
          e.stopPropagation();
        }}
      >
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          <IconClose />
        </button>

        {/* Estado de carga */}
        {loading && (
          <div className="detail-loading">
            <p>Cargando producto…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="auth-error" style={{ margin: "1.5rem" }}>
            {error}
          </div>
        )}

        {/* Contenido principal */}
        {product && !loading && (
          <div className="detail-content">
            {/* ── Imagen / Carrusel ── */}
            <div className="detail-image">
              <ImageCarousel
                images={product.imagenes || []}
                alt={product.nombre}
              />
              {enOferta && <span className="catalog-card-badge">Oferta</span>}
            </div>

            {/* ── Info ── */}
            <div className="detail-info">
              {product.categoria_nombre && (
                <p className="detail-category">{product.categoria_nombre}</p>
              )}

              <h2 className="detail-name">{product.nombre}</h2>
              <p className="detail-desc">{product.descripcion}</p>

              {/* Precio */}
              <div className="detail-price-row">
                <span className="detail-price">
                  {precioFinal.toFixed(2)} &euro;
                </span>
                {enOferta && (
                  <span className="detail-price-old">
                    {precio.toFixed(2)} &euro;
                  </span>
                )}
              </div>

              {/* Colores */}
              {product.colores && product.colores.length > 0 && (
                <div className="detail-option">
                  <label>Color</label>
                  <div className="detail-option-list">
                    {product.colores.map(function (c) {
                      var btnClass = "detail-option-btn";
                      if (selectedColor === c.id) btnClass += " active";
                      return (
                        <button
                          key={c.id}
                          className={btnClass}
                          onClick={function () {
                            setSelectedColor(c.id);
                          }}
                        >
                          {c.nombre}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Aromas */}
              {product.aromas && product.aromas.length > 0 && (
                <div className="detail-option">
                  <label>Aroma</label>
                  <div className="detail-option-list">
                    {product.aromas.map(function (a) {
                      var btnClass = "detail-option-btn";
                      if (selectedAroma === a.id) btnClass += " active";
                      return (
                        <button
                          key={a.id}
                          className={btnClass}
                          onClick={function () {
                            setSelectedAroma(a.id);
                          }}
                        >
                          {a.nombre}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cantidad + Añadir al carrito */}
              <div className="detail-add-row">
                <div className="catalog-qty">
                  <button
                    onClick={decrementCantidad}
                    disabled={product.stock === 0}
                  >
                    &minus;
                  </button>
                  <input
                    type="number"
                    className="qty-input"
                    min="1"
                    max={product.stock}
                    value={cantidad}
                    disabled={product.stock === 0}
                    onChange={handleCantidadChange}
                    onBlur={handleCantidadBlur}
                  />
                  <button
                    onClick={incrementCantidad}
                    disabled={product.stock === 0}
                  >
                    +
                  </button>
                </div>
                <button
                  className="detail-add-btn"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <span>
                    {product.stock === 0 ? "Sin stock" : "Añadir al carrito"}
                  </span>
                  <IconCart />
                </button>
              </div>

              {added && (
                <p className="detail-added-msg">
                  &#10003; Producto anadido al carrito
                </p>
              )}

              <p className="detail-stock">
                {product.stock > 0
                  ? product.stock + " unidades disponibles"
                  : "Sin stock"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
