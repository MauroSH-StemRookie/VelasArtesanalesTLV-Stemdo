import { useState, useEffect } from "react";
import { productosAPI } from "../../services/api";
import { IconClose, IconTrash, IconPlus, IconFlame } from "../icons/Icons";
import ImageCropModal from "../shared/ImageCropModal";
import "../shared/ImageCarousel.css";

/* ==========================================================================
   MODAL DE EDICION DE PRODUCTO (ADMIN)
   --------------------------------------
   Campos del backend (PUT /api/productos/:id con FormData):
     nombre, descripcion, precio, stock, oferta, precio_oferta,
     categoria (id), aromas [ids], colores [ids],
     imagenesConfig (JSON string con el estado final del carrusel),
     imagenes (File[] que emparejan con entradas tipo "nueva")

   Al abrir, hace getById para obtener aromas, colores e imagenes actuales.
   Muestra un carrusel de imagenes existentes con opcion de eliminar,
   y permite Añadir nuevas imagenes hasta un maximo de 3 en total.
   Al guardar, construye imagenesConfig con el orden final.
   ========================================================================== */

var MAX_IMAGES = 3;

function PillSelector({ label, items, selected, onToggle }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="pill-selector">
        {items.map(function (item) {
          var cls = "pill";
          if (selected.includes(item.id)) cls += " pill--active";
          return (
            <button
              key={item.id}
              type="button"
              className={cls}
              onClick={function () {
                onToggle(item.id);
              }}
            >
              {item.nombre}
            </button>
          );
        })}
        {items.length === 0 && (
          <span className="pill-empty">Sin opciones disponibles</span>
        )}
      </div>
    </div>
  );
}

export default function ProductEditModal({
  isOpen,
  onClose,
  product,
  onSave,
  categories,
  aromas,
  colors,
}) {
  var [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    oferta: false,
    precio_oferta: "",
    categoria: "",
    aromas: [],
    colores: [],
  });
  var [loadingDetail, setLoadingDetail] = useState(false);

  /* Imagenes existentes que vienen del backend (con id y orden) */
  var [existingImages, setExistingImages] = useState([]);
  /* IDs de imagenes existentes que el usuario quiere conservar */
  var [keptIds, setKeptIds] = useState([]);
  /* Archivos nuevos que el usuario ha subido */
  var [newImages, setNewImages] = useState([]);
  /* Previews de las imagenes nuevas (object URLs) */
  var [newPreviews, setNewPreviews] = useState([]);
  /* Indice del carrusel visible */
  var [carouselIndex, setCarouselIndex] = useState(0);

  /* Crop modal */
  var [cropFile, setCropFile] = useState(null);
  var [showCrop, setShowCrop] = useState(false);

  /* Cargar detalle cuando se abre el modal */
  useEffect(
    function onProductChange() {
      if (!product) return;
      setForm({
        nombre: product.nombre || "",
        descripcion: product.descripcion || "",
        precio: product.precio || "",
        stock: product.stock || "",
        oferta: Number(product.oferta) > 0,
        precio_oferta: product.precio_oferta || product.precio || "",
        categoria: product.categoria_id || product.categoria || "",
        aromas: [],
        colores: [],
      });
      setNewImages([]);
      setNewPreviews([]);
      setCarouselIndex(0);

      setLoadingDetail(true);
      productosAPI
        .getById(product.id)
        .then(function (detail) {
          var aromaIds = (detail.aromas || []).map(function (a) {
            return a.id;
          });
          var colorIds = (detail.colores || []).map(function (c) {
            return c.id;
          });
          var imgs = detail.imagenes || [];
          setForm(function (prev) {
            return { ...prev, aromas: aromaIds, colores: colorIds };
          });
          setExistingImages(imgs);
          setKeptIds(
            imgs.map(function (img) {
              return img.id;
            }),
          );
        })
        .catch(function () {
          setExistingImages([]);
          setKeptIds([]);
        })
        .finally(function () {
          setLoadingDetail(false);
        });
    },
    [product],
  );

  /* Limpiar object URLs al desmontar */
  useEffect(
    function cleanupPreviews() {
      return function () {
        newPreviews.forEach(function (url) {
          URL.revokeObjectURL(url);
        });
      };
    },
    [newPreviews],
  );

  if (!isOpen || !product) return null;

  /* Imagenes conservadas (existentes que no se han eliminado) */
  var keptImages = existingImages.filter(function (img) {
    return keptIds.includes(img.id);
  });
  var totalImages = keptImages.length + newImages.length;
  var canAddMore = totalImages < MAX_IMAGES;

  /* Construir array visual del carrusel: conservadas + nuevas */
  var carouselItems = [];
  keptImages.forEach(function (img) {
    carouselItems.push({ type: "existing", id: img.id, orden: img.orden });
  });
  newImages.forEach(function (file, i) {
    carouselItems.push({ type: "new", index: i, preview: newPreviews[i] });
  });

  /* Helpers de formulario */
  function update(field, value) {
    setForm(function (prev) {
      return { ...prev, [field]: value };
    });
  }

  function handleOfertaChange(checked) {
    setForm(function (prev) {
      return {
        ...prev,
        oferta: checked,
        precio_oferta: checked ? prev.precio_oferta : prev.precio,
      };
    });
  }

  function handlePrecioChange(value) {
    setForm(function (prev) {
      return {
        ...prev,
        precio: value,
        precio_oferta: prev.oferta ? prev.precio_oferta : value,
      };
    });
  }

  function toggleAroma(id) {
    setForm(function (prev) {
      var has = prev.aromas.includes(id);
      return {
        ...prev,
        aromas: has
          ? prev.aromas.filter(function (x) {
              return x !== id;
            })
          : prev.aromas.concat([id]),
      };
    });
  }

  function toggleColor(id) {
    setForm(function (prev) {
      var has = prev.colores.includes(id);
      return {
        ...prev,
        colores: has
          ? prev.colores.filter(function (x) {
              return x !== id;
            })
          : prev.colores.concat([id]),
      };
    });
  }

  /* ── Gestion de imagenes ── */

  function handleRemoveExisting(imgId) {
    setKeptIds(function (prev) {
      return prev.filter(function (id) {
        return id !== imgId;
      });
    });
    setCarouselIndex(0);
  }

  function handleRemoveNew(index) {
    URL.revokeObjectURL(newPreviews[index]);
    setNewImages(function (prev) {
      return prev.filter(function (_, i) {
        return i !== index;
      });
    });
    setNewPreviews(function (prev) {
      return prev.filter(function (_, i) {
        return i !== index;
      });
    });
    setCarouselIndex(0);
  }

  function handleFileSelect(e) {
    var files = e.target.files;
    if (!files || files.length === 0) return;
    var file = files[0];
    e.target.value = "";
    setCropFile(file);
    setShowCrop(true);
  }

  function handleCropConfirm(croppedFile) {
    setShowCrop(false);
    setCropFile(null);
    var preview = URL.createObjectURL(croppedFile);
    setNewImages(function (prev) {
      return prev.concat([croppedFile]);
    });
    setNewPreviews(function (prev) {
      return prev.concat([preview]);
    });
  }

  function handleCropCancel() {
    setShowCrop(false);
    setCropFile(null);
  }

  /* Navegacion del carrusel */
  function carouselPrev() {
    setCarouselIndex(function (prev) {
      return prev === 0 ? carouselItems.length - 1 : prev - 1;
    });
  }

  function carouselNext() {
    setCarouselIndex(function (prev) {
      return prev === carouselItems.length - 1 ? 0 : prev + 1;
    });
  }

  /* ── Guardar — construye imagenesConfig para el backend ── */
  function handleSave() {
    /* Recorremos carouselItems (que ya esta en orden visual)
       y generamos el array imagenesConfig que el backend espera.
       Los archivos nuevos se recogen aparte en el mismo orden. */
    var config = [];
    var newFileList = [];

    carouselItems.forEach(function (item, i) {
      if (item.type === "existing") {
        config.push({ tipo: "existente", id: item.id, orden: i });
      } else {
        config.push({ tipo: "nueva", orden: i });
        newFileList.push(newImages[item.index]);
      }
    });

    /* Coercion numerica antes de mandar al backend.
       Los inputs HTML siempre devuelven strings (incluso type="number"),
       asi que form.precio = "12.50" y form.stock = "5" llegarian como
       texto. Si despues alguien hace product.stock + 1 en otro sitio,
       JavaScript concatena: "5" + 1 = "51". El handleSaveEdit del
       AdminPanel ya hace parseFloat(updatedProduct.precio) para algunos
       campos, pero no para stock — y ademas asi nos curamos en salud
       para cualquier consumer futuro. */
    var formNormalizado = {
      ...form,
      precio: parseFloat(form.precio) || 0,
      stock: Math.max(0, parseInt(form.stock, 10) || 0),
      precio_oferta:
        parseFloat(form.precio_oferta) || parseFloat(form.precio) || 0,
    };

    onSave({
      ...product,
      ...formNormalizado,
      imagenesConfig: config,
      imagenesNuevas: newFileList,
    });
    onClose();
  }

  /* Indice seguro */
  var safeIndex =
    carouselItems.length > 0
      ? Math.min(carouselIndex, carouselItems.length - 1)
      : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container product-modal product-edit-modal"
        onClick={function (e) {
          e.stopPropagation();
        }}
      >
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          <IconClose />
        </button>
        <h3>Modificar producto</h3>

        <div className="edit-modal-layout">
          {/* ── Columna izquierda: formulario ── */}
          <div className="edit-modal-form">
            <div className="auth-form">
              <div className="form-group">
                <label htmlFor="edit-nombre">Nombre</label>
                <input
                  id="edit-nombre"
                  type="text"
                  value={form.nombre}
                  onChange={function (e) {
                    update("nombre", e.target.value);
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-desc">Descripcion</label>
                <textarea
                  id="edit-desc"
                  rows={3}
                  value={form.descripcion}
                  onChange={function (e) {
                    update("descripcion", e.target.value);
                  }}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-precio">Precio normal (&euro;)</label>
                  <input
                    id="edit-precio"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.precio}
                    onChange={function (e) {
                      handlePrecioChange(e.target.value);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-stock">Stock</label>
                  <input
                    id="edit-stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={function (e) {
                      update("stock", e.target.value);
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="edit-checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.oferta}
                    onChange={function (e) {
                      handleOfertaChange(e.target.checked);
                    }}
                  />
                  <span>En oferta</span>
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="edit-precio-oferta">
                  Precio oferta (&euro;)
                  {!form.oferta && (
                    <span className="edit-field-hint">
                      {" "}
                      &mdash; activa la oferta para editarlo
                    </span>
                  )}
                </label>
                <input
                  id="edit-precio-oferta"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.precio_oferta}
                  disabled={!form.oferta}
                  onChange={function (e) {
                    update("precio_oferta", e.target.value);
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-categoria">Categoria</label>
                <select
                  id="edit-categoria"
                  value={form.categoria}
                  onChange={function (e) {
                    update("categoria", e.target.value);
                  }}
                >
                  <option value="">-- Selecciona una categoria --</option>
                  {(categories || []).map(function (cat) {
                    return (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    );
                  })}
                </select>
              </div>

              {loadingDetail ? (
                <div className="form-group">
                  <label>Aromas y Colores</label>
                  <p className="pill-loading">Cargando seleccion actual...</p>
                </div>
              ) : (
                <>
                  <PillSelector
                    label="Aromas"
                    items={aromas || []}
                    selected={form.aromas}
                    onToggle={toggleAroma}
                  />
                  <PillSelector
                    label="Colores"
                    items={colors || []}
                    selected={form.colores}
                    onToggle={toggleColor}
                  />
                </>
              )}
            </div>
          </div>

          {/* ── Columna derecha: imagenes ── */}
          <div className="edit-modal-images">
            <label className="img-section-label">
              Imagenes
              <span className="img-section-count">
                {totalImages} / {MAX_IMAGES}
              </span>
            </label>

            {/* Visor carrusel */}
            <div className="edit-img-viewer">
              {carouselItems.length === 0 ? (
                <div className="edit-img-empty">
                  <IconFlame />
                  <span>Sin imagenes</span>
                </div>
              ) : (
                <>
                  {carouselItems[safeIndex].type === "existing" ? (
                    <img
                      src={
                        "http://localhost:3000/api/productos/imagen/" +
                        carouselItems[safeIndex].id
                      }
                      alt={form.nombre}
                      className="edit-img-preview"
                    />
                  ) : (
                    <img
                      src={carouselItems[safeIndex].preview}
                      alt="Nueva imagen"
                      className="edit-img-preview"
                    />
                  )}

                  <span className="edit-img-order-tag">
                    {safeIndex === 0
                      ? "Vista previa"
                      : "Imagen " + (safeIndex + 1)}
                  </span>

                  {carouselItems.length > 1 && (
                    <>
                      <button
                        className="carousel-arrow carousel-arrow--left"
                        onClick={carouselPrev}
                        type="button"
                      >
                        <svg viewBox="0 0 24 24" width="20" height="20">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>
                      <button
                        className="carousel-arrow carousel-arrow--right"
                        onClick={carouselNext}
                        type="button"
                      >
                        <svg viewBox="0 0 24 24" width="20" height="20">
                          <polyline points="9 6 15 12 9 18" />
                        </svg>
                      </button>
                    </>
                  )}

                  {carouselItems.length > 1 && (
                    <div className="carousel-dots">
                      {carouselItems.map(function (_, i) {
                        var cls = "carousel-dot";
                        if (i === safeIndex) cls += " carousel-dot--active";
                        return (
                          <button
                            key={i}
                            className={cls}
                            onClick={function () {
                              setCarouselIndex(i);
                            }}
                            type="button"
                          />
                        );
                      })}
                    </div>
                  )}

                  <button
                    className="edit-img-remove-btn"
                    onClick={function () {
                      var item = carouselItems[safeIndex];
                      if (item.type === "existing") {
                        handleRemoveExisting(item.id);
                      } else {
                        handleRemoveNew(item.index);
                      }
                    }}
                    type="button"
                    title="Eliminar esta imagen"
                  >
                    <IconTrash />
                  </button>
                </>
              )}
            </div>

            {canAddMore && (
              <label className="edit-img-add-btn">
                <IconPlus />
                <span>Añadir imagen</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
              </label>
            )}

            {!canAddMore && totalImages > 0 && (
              <p className="edit-img-limit-msg">
                Maximo de {MAX_IMAGES} imagenes alcanzado
              </p>
            )}
          </div>
        </div>

        <div className="confirm-actions" style={{ marginTop: "1.5rem" }}>
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-auth" onClick={handleSave}>
            Guardar cambios
          </button>
        </div>

        <ImageCropModal
          file={cropFile}
          isOpen={showCrop}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      </div>
    </div>
  );
}
