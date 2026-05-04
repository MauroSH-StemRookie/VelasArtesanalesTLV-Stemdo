import { useState } from "react";
import { IconFlame } from "../icons/Icons";
import "./ImageCarousel.css";

/* ==========================================================================
   CARRUSEL DE IMAGENES DE PRODUCTO
   --------------------------------
   Recibe un array de imagenes con sus IDs y las muestra en un carrusel
   con flechas de navegacion y puntos indicadores.
   Si solo hay una imagen, la muestra sin controles.
   Si no hay imagenes, muestra el placeholder.

   Props:
     images   — array de objetos { id, orden } del producto
     alt      — texto alternativo para las imagenes
     baseUrl  — URL base completa para construir el src (opcional).
                Si no se pasa, se usa VITE_API_URL del .env.
   ========================================================================== */

var API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function ImageCarousel({ images, alt, baseUrl }) {
  var [current, setCurrent] = useState(0);

  var apiBase = baseUrl || API_URL + "/productos/imagen/";

  /* Sin imagenes: placeholder */
  if (!images || images.length === 0) {
    return (
      <div className="carousel-placeholder">
        <IconFlame />
      </div>
    );
  }

  /* Una sola imagen: sin controles */
  if (images.length === 1) {
    return (
      <div className="carousel-single">
        <img
          src={apiBase + images[0].id}
          alt={alt || "Producto"}
          loading="lazy"
        />
      </div>
    );
  }

  /* Multiples imagenes: carrusel completo */
  var total = images.length;

  function goTo(index) {
    setCurrent(index);
  }

  function goPrev() {
    setCurrent(function (prev) {
      return prev === 0 ? total - 1 : prev - 1;
    });
  }

  function goNext() {
    setCurrent(function (prev) {
      return prev === total - 1 ? 0 : prev + 1;
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
                baseUrl={API_URL}
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

      {/* Flechas de navegacion */}
      <button
        className="carousel-arrow carousel-arrow--left"
        onClick={goPrev}
        aria-label="Imagen anterior"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        className="carousel-arrow carousel-arrow--right"
        onClick={goNext}
        aria-label="Imagen siguiente"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </button>

      {/* Indicadores (puntos) */}
      <div className="carousel-dots">
        {images.map(function (img, i) {
          var dotClass = "carousel-dot";
          if (i === current) dotClass += " carousel-dot--active";
          return (
            <button
              key={img.id}
              className={dotClass}
              onClick={function () {
                goTo(i);
              }}
              aria-label={"Ir a imagen " + (i + 1)}
            />
          );
        })}
      </div>

      {/* Contador */}
      <span className="carousel-counter">
        {current + 1} / {total}
      </span>
    </div>
  );
}
