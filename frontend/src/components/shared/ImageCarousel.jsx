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
     baseUrl  — URL base para construir el src (opcional)
   ========================================================================== */

export default function ImageCarousel({ images, alt, baseUrl }) {
  var [current, setCurrent] = useState(0);

  var apiBase = baseUrl || "http://localhost:3000/api/productos/imagen/";

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
    <div className="carousel-container">
      <div className="carousel-track">
        <img
          src={apiBase + images[current].id}
          alt={(alt || "Producto") + " — imagen " + (current + 1)}
          loading="lazy"
          className="carousel-img"
        />
      </div>

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
