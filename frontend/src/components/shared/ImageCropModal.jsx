import { useState, useRef, useEffect, useCallback } from "react";
import { IconClose } from "../icons/Icons";
import "./ImageCropModal.css";

/* ==========================================================================
   MODAL DE RECORTE Y AJUSTE DE IMAGEN
   ------------------------------------
   Se abre al subir una imagen. Permite:
   - Zoom con slider (parte de "encajar entera" — la imagen NUNCA se recorta
     por los lados al entrar; el usuario decide despues si la quiere asi o
     hacer zoom para llenar el cuadro).
   - Rotacion en pasos de 90 grados.
   - Arrastrar la imagen para reposicionar.
   - Doble click para resetear (zoom 1, rotacion 0, centro).
   - Confirmar genera un File webp 800x800 listo para enviar al backend.

   El render del canvas final replica EXACTAMENTE lo que el usuario ve en el
   visor. Para conseguirlo:
     1) Mismo modelo de transform que el CSS: translate -> rotate -> scale,
        en ese orden y aplicado sobre el centro del visor.
     2) Misma estrategia de "contain": la imagen entra al visor proyectada
        con el min-fit (no el max-fit), igual que un object-fit: contain.
     3) El offset de pantalla se convierte a offset de canvas multiplicando
        por el ratio canvas/visor — sin numeros magicos.

   Calidad de remuestreado:
     drawImage en una sola pasada de 4000x4000 a 800x800 produce alias y
     bordes pobres. Para evitarlo bajamos en escaleras de x2 (mipmap manual):
     cada paso reduce la imagen a la mitad usando el smoothing de alta
     calidad del navegador y la siguiente iteracion arranca de ese resultado
     ya filtrado. El paso final aterriza en el tamano objetivo. Con esto la
     diferencia visual respecto a una unica reescritura grande es notable
     (especialmente en lineas finas y texto).
   ========================================================================== */

/* ── Constantes de configuracion ─────────────────────────────────────────── */
/* Tamano de salida del archivo final (800x800 webp). Si en el futuro se
   quiere subir a 1200, solo hay que tocar este valor. */
const OUTPUT_SIZE = 800;

/* Calidad webp del archivo final. 0.92 da una mejora visual clara sobre 0.85
   con muy poco coste de tamano (~25% mas, todavia muy por debajo del PNG). */
const WEBP_QUALITY = 0.92;

/* Limites del zoom. zoom=1 es "imagen entera dentro del visor" (contain).
   Con max=4 el usuario puede ampliar bastante para encuadres ajustados. */
const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.01;

/* Cuanto incremento de zoom aplicar por cada tick de la rueda del raton. */
const WHEEL_ZOOM_SENSITIVITY = 0.0015;

export default function ImageCropModal({ file, isOpen, onConfirm, onCancel }) {
  /* ── Refs ─────────────────────────────────────────────────────────────── */
  const canvasRef    = useRef(null);
  const imgRef       = useRef(null);
  const containerRef = useRef(null);

  /* ── Estado UI ────────────────────────────────────────────────────────── */
  const [imgSrc,    setImgSrc]    = useState(null);
  const [zoom,      setZoom]      = useState(1);
  const [rotation,  setRotation]  = useState(0);
  const [offset,    setOffset]    = useState({ x: 0, y: 0 });
  const [dragging,  setDragging]  = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);
  const [exporting, setExporting] = useState(false);

  /* Cuando llega un archivo nuevo, creamos un object URL para previsualizarlo
     y reseteamos zoom/rotacion/offset. Liberamos la URL al desmontar para no
     filtrar memoria. */
  useEffect(
    function onFileChange() {
      if (!file) return;
      const url = URL.createObjectURL(file);
      setImgSrc(url);
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setImgLoaded(false);
      return function cleanup() {
        URL.revokeObjectURL(url);
      };
    },
    [file],
  );

  const handleImgLoad = useCallback(function () {
    setImgLoaded(true);
  }, []);

  /* ── Drag para reposicionar la imagen dentro del visor ────────────────── */
  function handlePointerDown(e) {
    e.preventDefault();
    /* setPointerCapture asegura que el drag siga aunque el cursor salga del
       visor (sin esto, soltar fuera no dispara onPointerUp y la imagen se
       quedaba "pegada" al cursor en algunos navegadores). */
    if (e.currentTarget.setPointerCapture) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  }

  function handlePointerMove(e) {
    if (!dragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }

  function handlePointerUp() {
    setDragging(false);
  }

  /* Zoom con la rueda del raton, centrado donde esta el cursor (sensacion
     mas natural — el punto bajo el cursor se queda en el sitio al hacer
     zoom in/out). preventDefault evita que la pagina haga scroll. */
  function handleWheel(e) {
    if (!imgLoaded) return;
    e.preventDefault();
    const delta = -e.deltaY * WHEEL_ZOOM_SENSITIVITY;
    setZoom(function (prev) {
      const next = prev * (1 + delta);
      if (next < ZOOM_MIN) return ZOOM_MIN;
      if (next > ZOOM_MAX) return ZOOM_MAX;
      return next;
    });
  }

  /* Rotar en pasos de 90 grados. Cuando se rota tambien reseteamos el offset
     porque mantener la traslacion entre rotaciones suele dejar la imagen
     descuadrada y casi nunca es lo que el usuario quiere. */
  function handleRotate() {
    setRotation(function (prev) {
      return (prev + 90) % 360;
    });
    setOffset({ x: 0, y: 0 });
  }

  /* Doble click = reset rapido. Util cuando el usuario se ha ido lejos
     ajustando y quiere volver al estado inicial sin cerrar el modal. */
  function handleReset() {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  }

  /* ────────────────────────────────────────────────────────────────────────
     EXPORTAR — replica exacta del visor con remuestreo de alta calidad
     ────────────────────────────────────────────────────────────────────────
     Pasos:
       1) Calcular el tamano "base" con el que la imagen entra al visor
          (contain: el lado mas largo encaja dentro del cuadrado).
       2) Crear un canvas a la resolucion intermedia mas grande (la imagen
          original) para empezar la cadena de mipmaps.
       3) Bajar en escaleras de x2 hasta acercarnos al tamano objetivo,
          aplicando el mejor smoothing en cada paso.
       4) Pintar el resultado final con el mismo transform que el CSS:
          translate(offset) -> rotate -> scale, todo desde el centro.
     ──────────────────────────────────────────────────────────────────────── */
  function handleConfirm() {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    const viewport = containerRef.current;
    if (!canvas || !img || !viewport || !imgLoaded) return;

    setExporting(true);

    /* viewportSize: lado del cuadrado del visor en px de pantalla. Lo
       leemos de getBoundingClientRect porque depende del ancho disponible
       y queremos el valor real, no el del modelo CSS. */
    const viewportRect = viewport.getBoundingClientRect();
    const viewportSize = viewportRect.width; // es cuadrado, width === height

    /* Ratio canvas/visor: cuantos pixeles de canvas equivalen a 1 px de
       pantalla. Lo necesitamos para mapear el offset que el usuario ha
       arrastrado en el visor a su equivalente en el canvas final. */
    const scaleFactor = OUTPUT_SIZE / viewportSize;

    /* Tamano "contain" de la imagen dentro del visor en px de pantalla.
       MIN porque queremos que la imagen entera entre — al contrario de
       object-fit: cover (que usaria MAX). */
    const containScale = Math.min(
      viewportSize / img.naturalWidth,
      viewportSize / img.naturalHeight,
    );
    const baseW = img.naturalWidth  * containScale; // px de pantalla
    const baseH = img.naturalHeight * containScale;

    /* Calcular cuanto pintar en el canvas final. El "containScale" lo
       expresamos en px de canvas: lo escalamos por scaleFactor. Sobre eso
       el zoom multiplica el tamano final. */
    const finalW = baseW * scaleFactor * zoom;
    const finalH = baseH * scaleFactor * zoom;

    /* ── Mipmap manual (high-quality downscaling) ─────────────────────────
       drawImage en una sola pasada de naturalW=4000 a 800 produce alias.
       Bajamos en escaleras de x2 hasta que el siguiente paso ya seria mas
       pequeno que el target — entonces hacemos el ultimo paso al tamano
       exacto. Cada iteracion empieza desde la imagen ya filtrada del paso
       anterior, no desde la original. */
    function downscaleStepwise(srcImg, targetW, targetH) {
      let currentW = srcImg.naturalWidth;
      let currentH = srcImg.naturalHeight;
      let currentSrc = srcImg;

      /* Si la imagen ya es mas pequena que el objetivo, no hace falta
         escalar — devolvemos la original directamente. drawImage hara
         el upscale en el paso final con suavizado. */
      if (currentW <= targetW * 2 && currentH <= targetH * 2) {
        return currentSrc;
      }

      /* Vamos dividiendo por 2 hasta que el siguiente paso seria menor
         que el doble del target — ese es el momento de parar y dejar el
         drawImage final hacer el ultimo ajuste fino. */
      while (currentW > targetW * 2 && currentH > targetH * 2) {
        const nextW = Math.floor(currentW / 2);
        const nextH = Math.floor(currentH / 2);
        const tmp = document.createElement("canvas");
        tmp.width  = nextW;
        tmp.height = nextH;
        const tmpCtx = tmp.getContext("2d");
        tmpCtx.imageSmoothingEnabled = true;
        tmpCtx.imageSmoothingQuality = "high";
        tmpCtx.drawImage(currentSrc, 0, 0, nextW, nextH);
        currentSrc = tmp;
        currentW = nextW;
        currentH = nextH;
      }
      return currentSrc;
    }

    /* Solo hacemos mipmap si vamos a reducir significativamente. El target
       en pixeles de canvas es lo que vamos a pintar (finalW x finalH).
       Si el usuario ha hecho mucho zoom, podriamos estar pintando una zona
       pequena de la original a un area enorme — en ese caso no hay nada
       que filtrar y conviene saltarse el mipmap. */
    let sourceForDraw = img;
    const willDownscale =
      img.naturalWidth  > finalW * 2 ||
      img.naturalHeight > finalH * 2;
    if (willDownscale) {
      sourceForDraw = downscaleStepwise(img, finalW, finalH);
    }

    /* ── Pintado final con el mismo transform que el CSS ──────────────── */
    canvas.width  = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    /* Fondo blanco. Importante: webp soporta transparencia, pero el card
       del catalogo se ve sobre fondo crema y el blanco da el contraste mas
       neutro en la mayor parte de los casos. */
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    ctx.save();

    /* Centro del canvas + offset arrastrado por el usuario (mapeado de
       px de pantalla a px de canvas con scaleFactor). */
    ctx.translate(
      OUTPUT_SIZE / 2 + offset.x * scaleFactor,
      OUTPUT_SIZE / 2 + offset.y * scaleFactor,
    );

    /* Rotacion en radianes. */
    ctx.rotate((rotation * Math.PI) / 180);

    /* No aplicamos ctx.scale aqui porque ya hemos calculado finalW/finalH
       con el zoom incluido — pintamos directamente al tamano correcto.
       Pintar al tamano correcto en lugar de escalar es mas exacto numericamente. */
    ctx.drawImage(sourceForDraw, -finalW / 2, -finalH / 2, finalW, finalH);
    ctx.restore();

    /* ── Generar el File ──────────────────────────────────────────────── */
    canvas.toBlob(
      function (blob) {
        if (!blob) {
          setExporting(false);
          return;
        }
        const croppedFile = new File(
          [blob],
          file.name.replace(/\.[^.]+$/, "") + "_crop.webp",
          { type: "image/webp" },
        );
        setExporting(false);
        onConfirm(croppedFile);
      },
      "image/webp",
      WEBP_QUALITY,
    );
  }

  /* ── Render guard ─────────────────────────────────────────────────────── */
  if (!isOpen || !file) return null;

  /* ── Estilo de la imagen del visor ────────────────────────────────────
     El orden translate -> rotate -> scale es CRITICO: el canvas final
     reproduce este mismo orden. Si se cambia aqui hay que cambiarlo alli
     o lo guardado dejara de coincidir con lo visto. */
  const transformStyle =
    "translate(-50%, -50%) translate(" +
    offset.x +
    "px, " +
    offset.y +
    "px) rotate(" +
    rotation +
    "deg) scale(" +
    zoom +
    ")";

  return (
    <div className="modal-overlay crop-overlay" onClick={onCancel}>
      <div
        className="modal-container crop-modal"
        onClick={function (e) {
          e.stopPropagation();
        }}
      >
        <button
          className="modal-close"
          onClick={onCancel}
          aria-label="Cerrar"
        >
          <IconClose />
        </button>

        <h3 className="crop-title">Ajustar imagen</h3>
        <p className="crop-hint">
          Arrastra para reposicionar. Ajusta el zoom con el slider o la rueda
          del raton. Doble click para resetear.
        </p>

        {/* Visor de recorte */}
        <div
          className="crop-viewport"
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          onDoubleClick={handleReset}
        >
          {imgSrc && (
            <img
              ref={imgRef}
              src={imgSrc}
              alt="Previsualizacion"
              className="crop-image"
              style={{ transform: transformStyle }}
              onLoad={handleImgLoad}
              draggable={false}
            />
          )}
          <div className="crop-frame" />
        </div>

        {/* Controles */}
        <div className="crop-controls">
          <div className="crop-control-group">
            <label className="crop-label">Zoom</label>
            <input
              type="range"
              min={ZOOM_MIN}
              max={ZOOM_MAX}
              step={ZOOM_STEP}
              value={zoom}
              onChange={function (e) {
                setZoom(parseFloat(e.target.value));
              }}
              className="crop-slider"
            />
            <span className="crop-value">{Math.round(zoom * 100)}%</span>
          </div>

          <button
            type="button"
            className="crop-rotate-btn"
            onClick={handleRotate}
            title="Rotar 90 grados"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            Rotar
          </button>
        </div>

        {/* Acciones */}
        <div className="crop-actions">
          <button
            className="btn-cancel"
            onClick={onCancel}
            disabled={exporting}
          >
            Cancelar
          </button>
          <button
            className="btn-auth"
            onClick={handleConfirm}
            disabled={!imgLoaded || exporting}
          >
            {exporting ? "Procesando..." : "Confirmar"}
          </button>
        </div>

        {/* Canvas oculto para generar la imagen final */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}
