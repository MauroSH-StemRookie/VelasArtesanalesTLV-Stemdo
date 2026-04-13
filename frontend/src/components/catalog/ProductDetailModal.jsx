import { useState, useEffect } from "react";
import { productosAPI } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { IconClose, IconFlame, IconCart } from "../icons/Icons";

/* ==========================================================================
   MODAL DE DETALLE DE PRODUCTO
   Al abrir hace GET /api/productos/:id con aromas y colores.
   El usuario elige color, aroma y cantidad antes de añadir al carrito.
   ========================================================================== */

export default function ProductDetailModal({ productId, isOpen, onClose }) {
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedAroma, setSelectedAroma] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!productId) return;
    async function loadDetail() {
      setLoading(true);
      setError("");
      setAdded(false);
      setCantidad(1);
      try {
        const data = await productosAPI.getById(productId);
        setProduct(data);
        setSelectedColor(data.colores?.length ? data.colores[0].id : null);
        setSelectedAroma(data.aromas?.length ? data.aromas[0].id : null);
      } catch (err) {
        setError("Error al cargar el producto: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [productId]);

  if (!isOpen) return null;

  const precio = product ? parseFloat(product.precio) : 0;
  const precioOferta = product ? parseFloat(product.precio_oferta) : 0;
  const enOferta = product?.oferta && precioOferta < precio;
  const precioFinal = enOferta ? precioOferta : precio;

  function handleAddToCart() {
    if (!product) return;
    const colorNombre =
      product.colores?.find((c) => c.id === selectedColor)?.nombre || null;
    const aromaNombre =
      product.aromas?.find((a) => a.id === selectedAroma)?.nombre || null;
    for (let i = 0; i < cantidad; i++) {
      addToCart({
        id: product.id,
        nombre: product.nombre,
        precio: precioFinal,
        imagen: product.imagen,
        color: colorNombre,
        aroma: aromaNombre,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container detail-modal"
        onClick={(e) => e.stopPropagation()}
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
            {/* ── Imagen ── */}
            <div className="detail-image">
              {product.imagen ? (
                <img src={product.imagen} alt={product.nombre} loading="lazy" />
              ) : (
                <div className="detail-image-placeholder">
                  <IconFlame />
                </div>
              )}
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
                <span className="detail-price">{precioFinal.toFixed(2)} €</span>
                {enOferta && (
                  <span className="detail-price-old">
                    {precio.toFixed(2)} €
                  </span>
                )}
              </div>

              {/* Colores */}
              {product.colores?.length > 0 && (
                <div className="detail-option">
                  <label>Color</label>
                  <div className="detail-option-list">
                    {product.colores.map((c) => (
                      <button
                        key={c.id}
                        className={`detail-option-btn${selectedColor === c.id ? " active" : ""}`}
                        onClick={() => setSelectedColor(c.id)}
                      >
                        {c.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Aromas */}
              {product.aromas?.length > 0 && (
                <div className="detail-option">
                  <label>Aroma</label>
                  <div className="detail-option-list">
                    {product.aromas.map((a) => (
                      <button
                        key={a.id}
                        className={`detail-option-btn${selectedAroma === a.id ? " active" : ""}`}
                        onClick={() => setSelectedAroma(a.id)}
                      >
                        {a.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cantidad + Añadir al carrito */}
              <div className="detail-add-row">
                <div className="catalog-qty">
                  <button
                    onClick={() => setCantidad((q) => Math.max(1, q - 1))}
                    disabled={product.stock === 0}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    className="qty-input"
                    min="1"
                    max={product.stock}
                    value={cantidad}
                    disabled={product.stock === 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val))
                        setCantidad(Math.min(product.stock, Math.max(1, val)));
                    }}
                    onBlur={(e) => {
                      // Al salir del campo, convierte a número válido
                      const val = parseInt(e.target.value, 10);
                      setQty(
                        p.id,
                        isNaN(val) ? 1 : Math.min(p.stock, Math.max(1, val)),
                      );
                    }}
                  />
                  <button
                    onClick={() =>
                      setCantidad((q) => Math.min(product.stock, q + 1))
                    }
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
                  ✓ Producto añadido al carrito
                </p>
              )}

              <p className="detail-stock">
                {product.stock > 0
                  ? `${product.stock} unidades disponibles`
                  : "Sin stock"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
