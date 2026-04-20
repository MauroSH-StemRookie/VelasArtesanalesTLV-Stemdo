import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  productosAPI,
  categoriaAPI,
  aromaAPI,
  colorAPI,
  usuarioAPI,
} from "../../services/api";
import {
  IconBack,
  IconPackage,
  IconPlus,
  IconClipboard,
  IconUsers,
  IconFlame,
  IconEdit,
  IconTrash,
  IconSettings,
  IconClose,
} from "../icons/Icons";
import ProductEditModal from "./ProductEditModal";
import ConfirmModal from "./ConfirmModal";
import ImageCropModal from "../shared/ImageCropModal";
import "./AdminPanel.css";
import "./ProductEditModal.css";

/* ==========================================================================
   PANEL DE ADMINISTRACION — conectado al backend
   Pestanas:
   1. Productos   — lista, stock, editar, eliminar
   2. Anadir      — formulario con imagenes (hasta 3), categorias, aromas, colores
   3. Catalogo    — CRUD de categorias, aromas y colores
   4. Pedidos     — TODO BACKEND
   5. Usuarios    — lista, cambiar tipo, eliminar
   ========================================================================== */

var MAX_IMAGES = 3;

function normalizeItems(raw, nameField) {
  if (!Array.isArray(raw)) return [];
  return raw.map(function (item) {
    return { id: item.id, nombre: item[nameField] || "" };
  });
}

function PillSelector({ label, items, selected, onToggle, emptyText }) {
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
          <span className="pill-empty">
            {emptyText || "Sin opciones disponibles"}
          </span>
        )}
      </div>
    </div>
  );
}

function CatalogSection({
  title,
  items,
  editing,
  setEditing,
  newName,
  setNewName,
  onAdd,
  onSave,
  onDelete,
  addPlaceholder,
}) {
  return (
    <div className="catalog-mgmt-section">
      <h4 className="catalog-mgmt-title">
        {title}
        <span className="catalog-mgmt-count">{items.length}</span>
      </h4>
      <ul className="catalog-mgmt-list">
        {items.map(function (item) {
          var isEditing = editing && editing.id === item.id;
          return (
            <li key={item.id} className="catalog-mgmt-item">
              {isEditing ? (
                <>
                  <input
                    className="catalog-mgmt-inline-input"
                    value={editing.nombre}
                    autoFocus
                    onChange={function (e) {
                      setEditing({ ...editing, nombre: e.target.value });
                    }}
                    onKeyDown={function (e) {
                      if (e.key === "Enter" && editing.nombre.trim())
                        onSave(editing);
                      if (e.key === "Escape") setEditing(null);
                    }}
                  />
                  <button
                    className="catalog-mgmt-btn catalog-mgmt-btn--save"
                    onClick={function () {
                      if (editing.nombre.trim()) onSave(editing);
                    }}
                    title="Guardar"
                  >
                    &#10003;
                  </button>
                  <button
                    className="catalog-mgmt-btn catalog-mgmt-btn--cancel"
                    onClick={function () {
                      setEditing(null);
                    }}
                    title="Cancelar"
                  >
                    &#10005;
                  </button>
                </>
              ) : (
                <>
                  <span className="catalog-mgmt-item-name">{item.nombre}</span>
                  <div className="catalog-mgmt-item-actions">
                    <button
                      className="catalog-mgmt-btn catalog-mgmt-btn--edit"
                      onClick={function () {
                        setEditing(item);
                      }}
                      title="Editar"
                    >
                      <IconEdit />
                    </button>
                    <button
                      className="catalog-mgmt-btn catalog-mgmt-btn--del"
                      onClick={function () {
                        onDelete(item.id);
                      }}
                      title="Eliminar"
                    >
                      <IconTrash />
                    </button>
                  </div>
                </>
              )}
            </li>
          );
        })}
        {items.length === 0 && (
          <li className="catalog-mgmt-empty">Sin registros aun</li>
        )}
      </ul>
      <div className="catalog-mgmt-add-row">
        <input
          className="catalog-mgmt-new-input"
          placeholder={addPlaceholder || "Nombre nuevo..."}
          value={newName}
          onChange={function (e) {
            setNewName(e.target.value);
          }}
          onKeyDown={function (e) {
            if (e.key === "Enter" && newName.trim()) onAdd();
          }}
        />
        <button
          className="catalog-mgmt-btn-add"
          onClick={onAdd}
          disabled={!newName.trim()}
        >
          <IconPlus /> Anadir
        </button>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  var navigate = useNavigate();
  var [activeTab, setActiveTab] = useState("products");
  var [error, setError] = useState("");

  var [products, setProducts] = useState([]);
  var [loading, setLoading] = useState(true);

  var [categories, setCategories] = useState([]);
  var [aromas, setAromas] = useState([]);
  var [colors, setColors] = useState([]);

  var [editingCat, setEditingCat] = useState(null);
  var [editingAroma, setEditingAroma] = useState(null);
  var [editingColor, setEditingColor] = useState(null);
  var [newCatNombre, setNewCatNombre] = useState("");
  var [newAromaNombre, setNewAromaNombre] = useState("");
  var [newColorNombre, setNewColorNombre] = useState("");

  var [newProduct, setNewProduct] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "",
    stock: "",
    aromas: [],
    colores: [],
  });

  /* Estado de imagenes para el formulario de creacion */
  var [addImages, setAddImages] = useState([]);
  var [addPreviews, setAddPreviews] = useState([]);
  var [addCropFile, setAddCropFile] = useState(null);
  var [addCropSlot, setAddCropSlot] = useState(-1);
  var [showAddCrop, setShowAddCrop] = useState(false);

  var [editProduct, setEditProduct] = useState(null);
  var [deleteProduct, setDeleteProduct] = useState(null);

  var [orders] = useState([
    {
      id: 101,
      nombre: "Maria Lopez",
      correo: "maria@email.com",
      total: 37.8,
      estado: "Pendiente",
    },
    {
      id: 102,
      nombre: "Invitado",
      correo: "guest@email.com",
      total: 22.5,
      estado: "Enviado",
    },
  ]);

  var [users, setUsers] = useState([]);
  var [usersLoading, setUsersLoading] = useState(false);
  var [deleteUser, setDeleteUser] = useState(null);

  useEffect(
    function loadUsersOnTab() {
      if (activeTab === "users") loadUsers();
    },
    [activeTab],
  );

  async function loadUsers() {
    setUsersLoading(true);
    try {
      var data = await usuarioAPI.getAll();
      setUsers(data);
    } catch (err) {
      setError("Error al cargar usuarios: " + err.message);
    } finally {
      setUsersLoading(false);
    }
  }

  async function handleDeleteUser() {
    if (!deleteUser) return;
    try {
      await usuarioAPI.delete(deleteUser.id, deleteUser.tipo);
      setUsers(function (prev) {
        return prev.filter(function (u) {
          return u.id !== deleteUser.id;
        });
      });
    } catch (err) {
      setError("Error al eliminar usuario: " + err.message);
    }
    setDeleteUser(null);
  }

  async function handleToggleTipo(user) {
    try {
      var updated = await usuarioAPI.cambiarTipo(user.id, user.tipo);
      setUsers(function (prev) {
        return prev.map(function (u) {
          return u.id === user.id ? { ...u, tipo: updated.tipo } : u;
        });
      });
    } catch (err) {
      setError("Error al cambiar tipo: " + err.message);
    }
  }

  useEffect(function initialLoad() {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      var results = await Promise.all([
        productosAPI.getAll(),
        categoriaAPI.getAll(),
        aromaAPI.getAll(),
        colorAPI.getAll(),
      ]);
      setProducts(results[0]);
      setCategories(normalizeItems(results[1], "nombre_categoria"));
      setAromas(normalizeItems(results[2], "nombre_aroma"));
      setColors(normalizeItems(results[3], "color"));
    } catch (err) {
      setError("Error al cargar datos: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    try {
      setProducts(await productosAPI.getAll());
    } catch (err) {
      setError("Error al cargar productos: " + err.message);
    }
  }

  async function loadCatalogs() {
    try {
      var results = await Promise.all([
        categoriaAPI.getAll(),
        aromaAPI.getAll(),
        colorAPI.getAll(),
      ]);
      setCategories(normalizeItems(results[0], "nombre_categoria"));
      setAromas(normalizeItems(results[1], "nombre_aroma"));
      setColors(normalizeItems(results[2], "color"));
    } catch (err) {
      setError("Error al recargar catalogo: " + err.message);
    }
  }

  /* ── Stock: actualiza con FormData (sin tocar imagenes) ── */
  async function handleStockChange(product, newStock) {
    var val = Math.max(0, newStock);
    setProducts(function (prev) {
      return prev.map(function (x) {
        return x.id === product.id ? { ...x, stock: val } : x;
      });
    });
    try {
      await productosAPI.update(product.id, {
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio: parseFloat(product.precio),
        stock: val,
        oferta: product.oferta || false,
        precio_oferta:
          parseFloat(product.precio_oferta) || parseFloat(product.precio),
        categoria: product.categoria_id || product.categoria,
      });
    } catch (err) {
      setError("Error al actualizar stock: " + err.message);
      loadProducts();
    }
  }

  /* ── Guardar edicion (desde ProductEditModal) ── */
  async function handleSaveEdit(updatedProduct) {
    try {
      await productosAPI.update(updatedProduct.id, {
        nombre: updatedProduct.nombre,
        descripcion: updatedProduct.descripcion,
        precio: updatedProduct.precio,
        stock: updatedProduct.stock,
        oferta: updatedProduct.oferta ? true : false,
        precio_oferta: updatedProduct.precio_oferta,
        categoria: updatedProduct.categoria,
        aromas: updatedProduct.aromas || [],
        colores: updatedProduct.colores || [],
        imagenesConfig: updatedProduct.imagenesConfig || null,
        imagenesNuevas: updatedProduct.imagenesNuevas || [],
      });
      loadProducts();
    } catch (err) {
      setError("Error al modificar: " + err.message);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteProduct) return;
    try {
      await productosAPI.delete(deleteProduct.id);
      setProducts(function (prev) {
        return prev.filter(function (x) {
          return x.id !== deleteProduct.id;
        });
      });
    } catch (err) {
      setError("Error al eliminar: " + err.message);
    }
    setDeleteProduct(null);
  }

  /* ── Crear producto con imagenes ── */
  async function handleAddProduct(e) {
    e.preventDefault();
    setError("");
    try {
      await productosAPI.create({
        nombre: newProduct.nombre,
        descripcion: newProduct.descripcion,
        precio: parseFloat(newProduct.precio),
        stock: parseInt(newProduct.stock) || 0,
        categoria: parseInt(newProduct.categoria) || null,
        aromas: newProduct.aromas,
        colores: newProduct.colores,
        imagenes: addImages,
      });
      /* Limpiar formulario */
      setNewProduct({
        nombre: "",
        descripcion: "",
        precio: "",
        categoria: "",
        stock: "",
        aromas: [],
        colores: [],
      });
      /* Limpiar imagenes */
      addPreviews.forEach(function (url) {
        URL.revokeObjectURL(url);
      });
      setAddImages([]);
      setAddPreviews([]);
      loadProducts();
    } catch (err) {
      setError("Error al crear producto: " + err.message);
    }
  }

  function toggleNewAroma(id) {
    setNewProduct(function (prev) {
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

  function toggleNewColor(id) {
    setNewProduct(function (prev) {
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

  /* ── Gestion de imagenes para el formulario de creacion ── */

  function handleAddImageSelect(slotIndex, e) {
    var files = e.target.files;
    if (!files || files.length === 0) return;
    /* Guardamos la referencia al File ANTES de limpiar el input,
       porque e.target.value = "" vacia el FileList en vivo */
    var file = files[0];
    e.target.value = "";
    setAddCropFile(file);
    setAddCropSlot(slotIndex);
    setShowAddCrop(true);
  }

  function handleAddCropConfirm(croppedFile) {
    setShowAddCrop(false);
    setAddCropFile(null);
    var preview = URL.createObjectURL(croppedFile);
    var slot = addCropSlot;

    if (slot < addImages.length) {
      /* Reemplazar imagen existente en ese slot */
      URL.revokeObjectURL(addPreviews[slot]);
      setAddImages(function (prev) {
        var next = prev.slice();
        next[slot] = croppedFile;
        return next;
      });
      setAddPreviews(function (prev) {
        var next = prev.slice();
        next[slot] = preview;
        return next;
      });
    } else {
      /* Anadir nueva imagen */
      setAddImages(function (prev) {
        return prev.concat([croppedFile]);
      });
      setAddPreviews(function (prev) {
        return prev.concat([preview]);
      });
    }
    setAddCropSlot(-1);
  }

  function handleAddCropCancel() {
    setShowAddCrop(false);
    setAddCropFile(null);
    setAddCropSlot(-1);
  }

  function handleRemoveAddImage(index) {
    URL.revokeObjectURL(addPreviews[index]);
    setAddImages(function (prev) {
      return prev.filter(function (_, i) {
        return i !== index;
      });
    });
    setAddPreviews(function (prev) {
      return prev.filter(function (_, i) {
        return i !== index;
      });
    });
  }

  /* Catalogo CRUD handlers */
  async function handleAddCategoria() {
    if (!newCatNombre.trim()) return;
    try {
      await categoriaAPI.create({ nombre_categoria: newCatNombre.trim() });
      setNewCatNombre("");
      loadCatalogs();
    } catch (err) {
      setError("Error al anadir categoria: " + err.message);
    }
  }
  async function handleSaveCategoria(item) {
    if (!item.nombre.trim()) return;
    try {
      await categoriaAPI.update(item.id, {
        nombre_categoria: item.nombre.trim(),
      });
      setEditingCat(null);
      loadCatalogs();
    } catch (err) {
      setError("Error al actualizar categoria: " + err.message);
    }
  }
  async function handleDeleteCategoria(id) {
    try {
      await categoriaAPI.delete(id);
      loadCatalogs();
    } catch (err) {
      setError("Error al eliminar categoria: " + err.message);
    }
  }

  async function handleAddAroma() {
    if (!newAromaNombre.trim()) return;
    try {
      await aromaAPI.create({ nombre_aroma: newAromaNombre.trim() });
      setNewAromaNombre("");
      loadCatalogs();
    } catch (err) {
      setError("Error al anadir aroma: " + err.message);
    }
  }
  async function handleSaveAroma(item) {
    if (!item.nombre.trim()) return;
    try {
      await aromaAPI.update(item.id, { nombre_aroma: item.nombre.trim() });
      setEditingAroma(null);
      loadCatalogs();
    } catch (err) {
      setError("Error al actualizar aroma: " + err.message);
    }
  }
  async function handleDeleteAroma(id) {
    try {
      await aromaAPI.delete(id);
      loadCatalogs();
    } catch (err) {
      setError("Error al eliminar aroma: " + err.message);
    }
  }

  async function handleAddColor() {
    if (!newColorNombre.trim()) return;
    try {
      await colorAPI.create({ nombre_color: newColorNombre.trim() });
      setNewColorNombre("");
      loadCatalogs();
    } catch (err) {
      setError("Error al anadir color: " + err.message);
    }
  }
  async function handleSaveColor(item) {
    if (!item.nombre.trim()) return;
    try {
      await colorAPI.update(item.id, { nombre_color: item.nombre.trim() });
      setEditingColor(null);
      loadCatalogs();
    } catch (err) {
      setError("Error al actualizar color: " + err.message);
    }
  }
  async function handleDeleteColor(id) {
    try {
      await colorAPI.delete(id);
      loadCatalogs();
    } catch (err) {
      setError("Error al eliminar color: " + err.message);
    }
  }

  var tabs = [
    { key: "products", label: "Productos", icon: <IconPackage /> },
    { key: "add", label: "Anadir Producto", icon: <IconPlus /> },
    { key: "catalog", label: "Caracteristicas", icon: <IconSettings /> },
    { key: "orders", label: "Pedidos", icon: <IconClipboard /> },
    { key: "users", label: "Usuarios", icon: <IconUsers /> },
  ];

  /* ── Render de los 3 slots de imagen para el tab "Anadir" ── */
  function renderImageSlots() {
    var slots = [];
    for (var i = 0; i < MAX_IMAGES; i++) {
      var hasFilled = i < addImages.length;
      var isPreviewSlot = i === 0;
      var slotClass = "add-img-slot";
      if (hasFilled) slotClass += " add-img-slot--filled";
      if (isPreviewSlot) slotClass += " add-img-slot--preview";

      slots.push(renderOneSlot(i, hasFilled, isPreviewSlot, slotClass));
    }
    return slots;
  }

  function renderOneSlot(index, hasFilled, isPreviewSlot, slotClass) {
    if (hasFilled) {
      return (
        <div key={index} className={slotClass}>
          <img src={addPreviews[index]} alt={"Imagen " + (index + 1)} />
          <span className="add-img-slot-label">
            {isPreviewSlot ? "Vista previa" : "Imagen " + (index + 1)}
          </span>
          <button
            className="add-img-remove"
            onClick={function () {
              handleRemoveAddImage(index);
            }}
            type="button"
            title="Eliminar imagen"
          >
            <IconClose />
          </button>
        </div>
      );
    }

    /* Slot vacio: solo mostrar si es el siguiente disponible */
    var isNextEmpty = index === addImages.length;
    if (!isNextEmpty) {
      return (
        <div key={index} className={slotClass} style={{ opacity: 0.35 }}>
          <div className="add-img-slot-empty">
            <IconPlus />
            <span>{isPreviewSlot ? "Preview" : "Imagen " + (index + 1)}</span>
          </div>
        </div>
      );
    }

    return (
      <label key={index} className={slotClass}>
        <div className="add-img-slot-empty">
          <IconPlus />
          <span>{isPreviewSlot ? "Subir preview" : "Anadir imagen"}</span>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={function (e) {
            handleAddImageSelect(index, e);
          }}
          style={{ display: "none" }}
        />
      </label>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <button className="admin-back" onClick={function () { navigate('/'); }}>
          <IconBack /> Volver a la tienda
        </button>
        <h2>Panel de Administracion</h2>
      </div>

      <div className="admin-tabs">
        {tabs.map(function (t) {
          var cls = "admin-tab";
          if (activeTab === t.key) cls += " active";
          return (
            <button
              key={t.key}
              className={cls}
              onClick={function () {
                setActiveTab(t.key);
              }}
            >
              {t.icon} {t.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="auth-error" style={{ margin: "0 0 1.25rem" }}>
          {error}
        </div>
      )}

      <div className="admin-content">
        {/* ════════════════════════════════════════════════════════════════
           TAB: PRODUCTOS
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "products" && (
          <div className="admin-section">
            <h3>Todos los productos</h3>
            <p className="admin-section-desc">
              Gestiona, modifica, elimina y controla el stock.
            </p>
            {loading ? (
              <p>Cargando productos...</p>
            ) : (
              <div className="admin-products-grid">
                {products.map(function (p) {
                  return (
                    <div className="admin-product-card" key={p.id}>
                      <div className="admin-product-img">
                        {p.imagen_id ? (
                          <img
                            src={
                              "http://localhost:3000/api/productos/imagen/" +
                              p.imagen_id
                            }
                            alt={p.nombre}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <IconFlame />
                        )}
                        <span className="admin-product-cat">
                          {p.categoria_nombre || "Sin categoria"}
                        </span>
                      </div>
                      <div className="admin-product-info">
                        <h4>{p.nombre}</h4>
                        <p className="admin-product-desc">{p.descripcion}</p>
                        <div className="admin-product-price">
                          {parseFloat(p.precio).toFixed(2)} &euro;
                        </div>
                        {p.oferta && (
                          <span className="admin-product-offer">
                            Oferta: {parseFloat(p.precio_oferta).toFixed(2)}{" "}
                            &euro;
                          </span>
                        )}
                      </div>
                      <div className="admin-stock-control">
                        <label>Stock:</label>
                        <div className="stock-adjuster">
                          <button
                            onClick={function () {
                              handleStockChange(p, p.stock - 1);
                            }}
                          >
                            &minus;
                          </button>
                          <span>{p.stock}</span>
                          <button
                            onClick={function () {
                              handleStockChange(p, p.stock + 1);
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="admin-product-actions">
                        <button
                          className="btn-edit"
                          onClick={function () {
                            setEditProduct(p);
                          }}
                        >
                          <IconEdit /> Modificar
                        </button>
                        <button
                          className="btn-delete"
                          onClick={function () {
                            setDeleteProduct(p);
                          }}
                        >
                          <IconTrash /> Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
           TAB: ANADIR PRODUCTO
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "add" && (
          <div className="admin-section">
            <h3>Anadir nuevo producto</h3>
            <p className="admin-section-desc">
              Rellena los datos y sube las imagenes para crear un nuevo producto
              en la tienda.
            </p>

            <div className="edit-modal-layout" style={{ maxWidth: "820px" }}>
              {/* Columna izquierda: campos del formulario */}
              <div className="admin-add-form">
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    placeholder="Ej: Vela de lavanda"
                    value={newProduct.nombre}
                    onChange={function (e) {
                      setNewProduct(function (p) {
                        return { ...p, nombre: e.target.value };
                      });
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Descripcion</label>
                  <textarea
                    rows={3}
                    placeholder="Descripcion del producto..."
                    value={newProduct.descripcion}
                    onChange={function (e) {
                      setNewProduct(function (p) {
                        return { ...p, descripcion: e.target.value };
                      });
                    }}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Precio (&euro;)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="14.90"
                      value={newProduct.precio}
                      onChange={function (e) {
                        setNewProduct(function (p) {
                          return { ...p, precio: e.target.value };
                        });
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="10"
                      value={newProduct.stock}
                      onChange={function (e) {
                        setNewProduct(function (p) {
                          return { ...p, stock: e.target.value };
                        });
                      }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Categoria</label>
                  <select
                    value={newProduct.categoria}
                    onChange={function (e) {
                      setNewProduct(function (p) {
                        return { ...p, categoria: e.target.value };
                      });
                    }}
                  >
                    <option value="">-- Selecciona una categoria --</option>
                    {categories.map(function (cat) {
                      return (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      );
                    })}
                  </select>
                  {categories.length === 0 && (
                    <p className="form-hint">
                      No hay categorias aun. Anadelas en la pestana
                      Caracteristicas.
                    </p>
                  )}
                </div>
                <PillSelector
                  label="Aromas"
                  items={aromas}
                  selected={newProduct.aromas}
                  onToggle={toggleNewAroma}
                  emptyText="No hay aromas. Anadelos en la pestana Caracteristicas."
                />
                <PillSelector
                  label="Colores"
                  items={colors}
                  selected={newProduct.colores}
                  onToggle={toggleNewColor}
                  emptyText="No hay colores. Anadelos en la pestana Caracteristicas."
                />
                <button
                  className="btn-auth"
                  onClick={handleAddProduct}
                  disabled={!newProduct.nombre || !newProduct.precio}
                >
                  Anadir producto
                </button>
              </div>

              {/* Columna derecha: imagenes */}
              <div className="edit-modal-images">
                <label className="img-section-label">
                  Imagenes del producto
                  <span className="img-section-count">
                    {addImages.length} / {MAX_IMAGES}
                  </span>
                </label>
                <p
                  className="form-hint"
                  style={{ marginTop: "-0.25rem", marginBottom: "0.25rem" }}
                >
                  La primera imagen sera la vista previa en el catalogo (orden
                  0). Puedes subir hasta {MAX_IMAGES} en total.
                </p>
                <div className="add-images-grid">{renderImageSlots()}</div>
              </div>
            </div>

            {/* Modal de recorte para el tab Anadir */}
            <ImageCropModal
              file={addCropFile}
              isOpen={showAddCrop}
              onConfirm={handleAddCropConfirm}
              onCancel={handleAddCropCancel}
            />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
           TAB: CARACTERISTICAS (catalogo)
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "catalog" && (
          <div className="admin-section">
            <h3>Gestion del Catalogo</h3>
            <p className="admin-section-desc">
              Administra las categorias, aromas y colores disponibles en la
              tienda. Los cambios se reflejan de inmediato en el formulario de
              productos.
            </p>
            <div className="catalog-mgmt-grid">
              <CatalogSection
                title="Categorias"
                items={categories}
                editing={editingCat}
                setEditing={setEditingCat}
                newName={newCatNombre}
                setNewName={setNewCatNombre}
                onAdd={handleAddCategoria}
                onSave={handleSaveCategoria}
                onDelete={handleDeleteCategoria}
                addPlaceholder="Nueva categoria..."
              />
              <CatalogSection
                title="Aromas"
                items={aromas}
                editing={editingAroma}
                setEditing={setEditingAroma}
                newName={newAromaNombre}
                setNewName={setNewAromaNombre}
                onAdd={handleAddAroma}
                onSave={handleSaveAroma}
                onDelete={handleDeleteAroma}
                addPlaceholder="Nuevo aroma..."
              />
              <CatalogSection
                title="Colores"
                items={colors}
                editing={editingColor}
                setEditing={setEditingColor}
                newName={newColorNombre}
                setNewName={setNewColorNombre}
                onAdd={handleAddColor}
                onSave={handleSaveColor}
                onDelete={handleDeleteColor}
                addPlaceholder="Nuevo color..."
              />
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
           TAB: PEDIDOS (placeholder)
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "orders" && (
          <div className="admin-section">
            <h3>Revision de pedidos</h3>
            <p className="admin-section-desc">
              Pedidos recibidos. <em>(Datos de ejemplo — pendiente de API)</em>
            </p>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Correo</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(function (o) {
                    return (
                      <tr key={o.id}>
                        <td>#{o.id}</td>
                        <td>{o.nombre}</td>
                        <td>{o.correo}</td>
                        <td>{o.total.toFixed(2)} &euro;</td>
                        <td>
                          <span
                            className={
                              "status-badge status-" + o.estado.toLowerCase()
                            }
                          >
                            {o.estado}
                          </span>
                        </td>
                        <td>
                          <button className="btn-table-action">
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
           TAB: USUARIOS
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "users" && (
          <div className="admin-section">
            <h3>Usuarios registrados</h3>
            <p className="admin-section-desc">
              Compradores invitados van vinculados al pedido, no aparecen aqui.
            </p>
            {usersLoading ? (
              <p>Cargando usuarios...</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Tipo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(function (u) {
                      var isAdmin = Number(u.tipo) === 1;
                      return (
                        <tr key={u.id}>
                          <td>#{u.id}</td>
                          <td>{u.nombre}</td>
                          <td>{u.correo}</td>
                          <td>
                            <span
                              className={
                                "type-badge type-" +
                                (isAdmin ? "admin" : "cliente")
                              }
                            >
                              {isAdmin ? "Administrador" : "Cliente"}
                            </span>
                          </td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                gap: "0.5rem",
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                className="btn-edit"
                                onClick={function () {
                                  handleToggleTipo(u);
                                }}
                              >
                                <IconEdit />{" "}
                                {isAdmin ? "Quitar admin" : "Hacer admin"}
                              </button>
                              <button
                                className="btn-delete"
                                onClick={function () {
                                  setDeleteUser(u);
                                }}
                              >
                                <IconTrash /> Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      <ProductEditModal
        isOpen={!!editProduct}
        onClose={function () {
          setEditProduct(null);
        }}
        product={editProduct}
        onSave={handleSaveEdit}
        categories={categories}
        aromas={aromas}
        colors={colors}
      />
      <ConfirmModal
        isOpen={!!deleteProduct}
        onClose={function () {
          setDeleteProduct(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar producto"
        message={
          'Seguro que quieres eliminar "' +
          (deleteProduct ? deleteProduct.nombre : "") +
          '"? No se puede deshacer.'
        }
      />
      <ConfirmModal
        isOpen={!!deleteUser}
        onClose={function () {
          setDeleteUser(null);
        }}
        onConfirm={handleDeleteUser}
        title="Eliminar usuario"
        message={
          'Seguro que quieres eliminar al usuario "' +
          (deleteUser ? deleteUser.nombre : "") +
          '" (' +
          (deleteUser ? deleteUser.correo : "") +
          ")? No se puede deshacer."
        }
      />
    </div>
  );
}
