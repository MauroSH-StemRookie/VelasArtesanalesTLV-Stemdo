import { useState, useEffect } from "react";
import { productosAPI } from "../../services/api";
import { IconClose } from "../icons/Icons";

/* ==========================================================================
   MODAL DE EDICION DE PRODUCTO
   ------------------------------------------------
   Campos del backend (PUT /api/productos/:id):
     nombre, descripcion, precio, stock, oferta, precio_oferta,
     categoria (id), imagen, aromas [ids], colores [ids]

   Al abrir, hace getById para obtener los aromas y colores actuales
   del producto (getAll no los incluye).
   ========================================================================== */

function PillSelector({ label, items, selected, onToggle }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="pill-selector">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              "pill" + (selected.includes(item.id) ? " pill--active" : "")
            }
            onClick={() => onToggle(item.id)}
          >
            {item.nombre}
          </button>
        ))}
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
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    oferta: false,
    precio_oferta: "",
    categoria: "",
    imagen: "",
    aromas: [],
    colores: [],
  });
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!product) return;
    // Rellenamos los datos basicos inmediatamente
    setForm({
      nombre: product.nombre || "",
      descripcion: product.descripcion || "",
      precio: product.precio || "",
      stock: product.stock || "",
      oferta: !!product.oferta,
      precio_oferta: product.precio_oferta || product.precio || "",
      categoria: product.categoria_id || product.categoria || "",
      imagen: product.imagen || "",
      aromas: [],
      colores: [],
    });
    // Luego cargamos el detalle completo para obtener aromas y colores actuales
    setLoadingDetail(true);
    productosAPI
      .getById(product.id)
      .then((detail) => {
        const aromaIds = (detail.aromas || []).map((a) => a.id);
        const colorIds = (detail.colores || []).map((c) => c.id);
        setForm((prev) => ({ ...prev, aromas: aromaIds, colores: colorIds }));
      })
      .catch(() => {
        /* si falla, se queda con arrays vacios */
      })
      .finally(() => setLoadingDetail(false));
  }, [product]);

  if (!isOpen || !product) return null;

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleOfertaChange(checked) {
    setForm((prev) => ({
      ...prev,
      oferta: checked,
      precio_oferta: checked ? prev.precio_oferta : prev.precio,
    }));
  }

  function handlePrecioChange(value) {
    setForm((prev) => ({
      ...prev,
      precio: value,
      precio_oferta: prev.oferta ? prev.precio_oferta : value,
    }));
  }

  function toggleAroma(id) {
    setForm((prev) => ({
      ...prev,
      aromas: prev.aromas.includes(id)
        ? prev.aromas.filter((x) => x !== id)
        : [...prev.aromas, id],
    }));
  }

  function toggleColor(id) {
    setForm((prev) => ({
      ...prev,
      colores: prev.colores.includes(id)
        ? prev.colores.filter((x) => x !== id)
        : [...prev.colores, id],
    }));
  }

  function handleSave() {
    onSave({ ...product, ...form });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container product-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          <IconClose />
        </button>
        <h3>Modificar producto</h3>

        <div className="auth-form">
          <div className="form-group">
            <label htmlFor="edit-nombre">Nombre</label>
            <input
              id="edit-nombre"
              type="text"
              value={form.nombre}
              onChange={(e) => update("nombre", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-desc">Descripcion</label>
            <textarea
              id="edit-desc"
              rows={3}
              value={form.descripcion}
              onChange={(e) => update("descripcion", e.target.value)}
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
                onChange={(e) => handlePrecioChange(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-stock">Stock</label>
              <input
                id="edit-stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => update("stock", e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="edit-checkbox-label">
              <input
                type="checkbox"
                checked={form.oferta}
                onChange={(e) => handleOfertaChange(e.target.checked)}
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
                  — activa la oferta para editarlo
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
              onChange={(e) => update("precio_oferta", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-categoria">Categoria</label>
            <select
              id="edit-categoria"
              value={form.categoria}
              onChange={(e) => update("categoria", e.target.value)}
            >
              <option value="">-- Selecciona una categoria --</option>
              {(categories || []).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
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

          <div className="form-group">
            <label htmlFor="edit-imagen">URL imagen</label>
            <input
              id="edit-imagen"
              type="text"
              value={form.imagen}
              onChange={(e) => update("imagen", e.target.value)}
            />
          </div>

          <div className="confirm-actions">
            <button className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn-auth" onClick={handleSave}>
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
