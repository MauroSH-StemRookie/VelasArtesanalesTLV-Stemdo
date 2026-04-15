import { useState, useRef, useEffect, useCallback } from "react";
import { IconClose } from "../icons/Icons";
import "./ImageCropModal.css";

/* ==========================================================================
   MODAL DE RECORTE Y AJUSTE DE IMAGEN
   ------------------------------------
   Se abre al subir una imagen. Permite:
   - Zoom con slider
   - Rotacion en pasos de 90 grados
   - Arrastrar la imagen para reposicionar
   - Confirmar genera un File recortado listo para enviar al backend
   ========================================================================== */

export default function ImageCropModal({ file, isOpen, onConfirm, onCancel }) {
  var canvasRef = useRef(null);
  var imgRef = useRef(null);
  var containerRef = useRef(null);

  var [imgSrc, setImgSrc] = useState(null);
  var [zoom, setZoom] = useState(1);
  var [rotation, setRotation] = useState(0);
  var [offset, setOffset] = useState({ x: 0, y: 0 });
  var [dragging, setDragging] = useState(false);
  var [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  var [imgLoaded, setImgLoaded] = useState(false);

  /* Cuando llega un archivo nuevo, creamos un object URL para previsualizarlo */
  useEffect(function onFileChange() {
    if (!file) return;
    var url = URL.createObjectURL(file);
    setImgSrc(url);
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
    setImgLoaded(false);
    return function cleanup() {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  /* Cuando la imagen carga, centramos */
  var handleImgLoad = useCallback(function () {
    setImgLoaded(true);
  }, []);

  /* Drag para reposicionar la imagen dentro del visor */
  function handlePointerDown(e) {
    e.preventDefault();
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

  /* Rotar en pasos de 90 grados */
  function handleRotate() {
    setRotation(function (prev) {
      return (prev + 90) % 360;
    });
  }

  /* Generar imagen recortada con canvas y devolver como File */
  function handleConfirm() {
    var canvas = canvasRef.current;
    var img = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;

    var size = 800;
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(offset.x / 2, offset.y / 2);

    var scale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
    var w = img.naturalWidth * scale;
    var h = img.naturalHeight * scale;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();

    canvas.toBlob(
      function (blob) {
        if (!blob) return;
        var croppedFile = new File(
          [blob],
          file.name.replace(/\.[^.]+$/, "") + "_crop.webp",
          { type: "image/webp" }
        );
        onConfirm(croppedFile);
      },
      "image/webp",
      0.85
    );
  }

  if (!isOpen || !file) return null;

  var transformStyle =
    "translate(" +
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
          Arrastra para reposicionar. Ajusta el zoom y la rotacion.
        </p>

        {/* Visor de recorte */}
        <div
          className="crop-viewport"
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {imgSrc && (
            <img
              ref={imgRef}
              src={imgSrc}
              alt="Previsualización"
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
              min="0.5"
              max="3"
              step="0.05"
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
          <button className="btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button
            className="btn-auth"
            onClick={handleConfirm}
            disabled={!imgLoaded}
          >
            Confirmar
          </button>
        </div>

        {/* Canvas oculto para generar la imagen final */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}
