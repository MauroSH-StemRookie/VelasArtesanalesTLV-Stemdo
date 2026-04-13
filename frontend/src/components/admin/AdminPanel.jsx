import { useState, useEffect } from "react";
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
} from "../icons/Icons";
import ProductEditModal from "./ProductEditModal";
import ConfirmModal from "./ConfirmModal";
import "./AdminPanel.css";

/* ==========================================================================
   PANEL DE ADMINISTRACION — conectado al backend
   Pestanas:
   1. Productos   — lista, stock, editar, eliminar
   2. Añadir      — formulario con categoria real, aromas y colores como pills
   3. Catalogo    — CRUD de categorias, aromas y colores
   4. Pedidos     — TODO BACKEND
   5. Usuarios    — TODO BACKEND
   ========================================================================== */

function normalizeItems(raw, nameField) {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => ({ id: item.id, nombre: item[nameField] || "" }));
}

function PillSelector({ label, items, selected, onToggle, emptyText }) {
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
        {items.map((item) => {
          const isEditing = editing && editing.id === item.id;
          return (
            <li key={item.id} className="catalog-mgmt-item">
              {isEditing ? (
                <>
                  <input
                    className="catalog-mgmt-inline-input"
                    value={editing.nombre}
                    autoFocus
                    onChange={(e) =>
                      setEditing({ ...editing, nombre: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && editing.nombre.trim())
                        onSave(editing);
                      if (e.key === "Escape") setEditing(null);
                    }}
                  />
                  <button
                    className="catalog-mgmt-btn catalog-mgmt-btn--save"
                    onClick={() => editing.nombre.trim() && onSave(editing)}
                    title="Guardar"
                  >
                    &#10003;
                  </button>
                  <button
                    className="catalog-mgmt-btn catalog-mgmt-btn--cancel"
                    onClick={() => setEditing(null)}
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
                      onClick={() => setEditing(item)}
                      title="Editar"
                    >
                      <IconEdit />
                    </button>
                    <button
                      className="catalog-mgmt-btn catalog-mgmt-btn--del"
                      onClick={() => onDelete(item.id)}
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
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newName.trim()) onAdd();
          }}
        />
        <button
          className="catalog-mgmt-btn-add"
          onClick={onAdd}
          disabled={!newName.trim()}
        >
          <IconPlus /> Añadir
        </button>
      </div>
    </div>
  );
}

export default function AdminPanel({ onBack }) {
  const [activeTab, setActiveTab] = useState("products");
  const [error, setError] = useState("");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [aromas, setAromas] = useState([]);
  const [colors, setColors] = useState([]);

  const [editingCat, setEditingCat] = useState(null);
  const [editingAroma, setEditingAroma] = useState(null);
  const [editingColor, setEditingColor] = useState(null);
  const [newCatNombre, setNewCatNombre] = useState("");
  const [newAromaNombre, setNewAromaNombre] = useState("");
  const [newColorNombre, setNewColorNombre] = useState("");

  const [newProduct, setNewProduct] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "",
    stock: "",
    imagen: "",
    aromas: [],
    colores: [],
  });
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);

  const [orders] = useState([
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
  // Usuarios reales del backend (GET /api/usuario)
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);

  // Cargamos la lista de usuarios cuando se abre esa pestana
  useEffect(() => {
    if (activeTab === "users") loadUsers();
  }, [activeTab]);

  async function loadUsers() {
    setUsersLoading(true);
    try {
      const data = await usuarioAPI.getAll();
      setUsers(data);
    } catch (err) {
      setError("Error al cargar usuarios: " + err.message);
    } finally {
      setUsersLoading(false);
    }
  }

  // Eliminar usuario con confirmacion (DELETE /api/usuario/:id)
  // Le enviamos el tipo para que el backend compruebe si es el ultimo admin
  async function handleDeleteUser() {
    if (!deleteUser) return;
    try {
      await usuarioAPI.delete(deleteUser.id, deleteUser.tipo);
      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
    } catch (err) {
      setError("Error al eliminar usuario: " + err.message);
    }
    setDeleteUser(null);
  }

  // Cambiar tipo de usuario: admin <-> cliente
  // El backend recibe el tipo actual y lo invierte automaticamente
  async function handleToggleTipo(user) {
    try {
      const updated = await usuarioAPI.cambiarTipo(user.id, user.tipo);
      // Actualizamos el usuario en la lista local con el tipo nuevo
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, tipo: updated.tipo } : u)),
      );
    } catch (err) {
      setError("Error al cambiar tipo: " + err.message);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [productosData, catsData, aromasData, coloresData] =
        await Promise.all([
          productosAPI.getAll(),
          categoriaAPI.getAll(),
          aromaAPI.getAll(),
          colorAPI.getAll(),
        ]);
      setProducts(productosData);
      setCategories(normalizeItems(catsData, "nombre_categoria"));
      setAromas(normalizeItems(aromasData, "nombre_aroma"));
      setColors(normalizeItems(coloresData, "color"));
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
      const [c, a, col] = await Promise.all([
        categoriaAPI.getAll(),
        aromaAPI.getAll(),
        colorAPI.getAll(),
      ]);
      setCategories(normalizeItems(c, "nombre_categoria"));
      setAromas(normalizeItems(a, "nombre_aroma"));
      setColors(normalizeItems(col, "color"));
    } catch (err) {
      setError("Error al recargar catalogo: " + err.message);
    }
  }

  async function handleStockChange(product, newStock) {
    const val = Math.max(0, newStock);
    setProducts((prev) =>
      prev.map((x) => (x.id === product.id ? { ...x, stock: val } : x)),
    );
    try {
      await productosAPI.update(product.id, {
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio: parseFloat(product.precio),
        stock: val,
        oferta: product.oferta || 0,
        precio_oferta:
          parseFloat(product.precio_oferta) || parseFloat(product.precio),
        categoria: product.categoria_id || product.categoria,
        aromas: product.aromas ? product.aromas.map((a) => a.id) : [],
        colores: product.colores ? product.colores.map((c) => c.id) : [],
      });
    } catch (err) {
      setError("Error al actualizar stock: " + err.message);
      loadProducts();
    }
  }

  async function handleSaveEdit(updatedProduct) {
    try {
      await productosAPI.update(updatedProduct.id, {
        nombre: updatedProduct.nombre,
        descripcion: updatedProduct.descripcion,
        precio: parseFloat(updatedProduct.precio),
        stock: parseInt(updatedProduct.stock),
        oferta: updatedProduct.oferta ? 1 : 0,
        precio_oferta:
          parseFloat(updatedProduct.precio_oferta) ||
          parseFloat(updatedProduct.precio),
        categoria: parseInt(updatedProduct.categoria),
        imagen: updatedProduct.imagen || null,
        aromas: updatedProduct.aromas || [],
        colores: updatedProduct.colores || [],
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
      setProducts((prev) => prev.filter((x) => x.id !== deleteProduct.id));
    } catch (err) {
      setError("Error al eliminar: " + err.message);
    }
    setDeleteProduct(null);
  }

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
        imagen: newProduct.imagen || null,
        aromas: newProduct.aromas,
        colores: newProduct.colores,
      });
      setNewProduct({
        nombre: "",
        descripcion: "",
        precio: "",
        categoria: "",
        stock: "",
        imagen: "",
        aromas: [],
        colores: [],
      });
      loadProducts();
    } catch (err) {
      setError("Error al crear producto: " + err.message);
    }
  }

  function toggleNewAroma(id) {
    setNewProduct((prev) => ({
      ...prev,
      aromas: prev.aromas.includes(id)
        ? prev.aromas.filter((x) => x !== id)
        : [...prev.aromas, id],
    }));
  }

  function toggleNewColor(id) {
    setNewProduct((prev) => ({
      ...prev,
      colores: prev.colores.includes(id)
        ? prev.colores.filter((x) => x !== id)
        : [...prev.colores, id],
    }));
  }

  async function handleAddCategoria() {
    if (!newCatNombre.trim()) return;
    try {
      await categoriaAPI.create({ nombre_categoria: newCatNombre.trim() });
      setNewCatNombre("");
      loadCatalogs();
    } catch (err) {
      setError("Error al Añadir categoria: " + err.message);
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
      setError("Error al Añadir aroma: " + err.message);
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
      setError("Error al Añadir color: " + err.message);
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

  const tabs = [
    { key: "products", label: "Productos", icon: <IconPackage /> },
    { key: "add", label: "Añadir Producto", icon: <IconPlus /> },
    // Características = catalog. Llamarlo catalogo quedaba demasiado ambiguo por si no se lee el manuel de instrucciones
    { key: "catalog", label: "Características", icon: <IconSettings /> },
    { key: "orders", label: "Pedidos", icon: <IconClipboard /> },
    { key: "users", label: "Usuarios", icon: <IconUsers /> },
  ];

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <button className="admin-back" onClick={onBack}>
          <IconBack /> Volver a la tienda
        </button>
        <h2>Panel de Administracion</h2>
      </div>

      <div className="admin-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={"admin-tab" + (activeTab === t.key ? " active" : "")}
            onClick={() => setActiveTab(t.key)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="auth-error" style={{ margin: "0 0 1.25rem" }}>
          {error}
        </div>
      )}

      <div className="admin-content">
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
                {products.map((p) => (
                  <div className="admin-product-card" key={p.id}>
                    <div className="admin-product-img">
                      {p.imagen ? (
                        <img
                          src={p.imagen}
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
                          onClick={() => handleStockChange(p, p.stock - 1)}
                        >
                          &minus;
                        </button>
                        <span>{p.stock}</span>
                        <button
                          onClick={() => handleStockChange(p, p.stock + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="admin-product-actions">
                      <button
                        className="btn-edit"
                        onClick={() => setEditProduct(p)}
                      >
                        <IconEdit /> Modificar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => setDeleteProduct(p)}
                      >
                        <IconTrash /> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "add" && (
          <div className="admin-section">
            <h3>Añadir nuevo producto</h3>
            <p className="admin-section-desc">
              Rellena los datos para crear un nuevo producto en la tienda.
            </p>
            <div className="admin-add-form">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  placeholder="Ej: Vela de lavanda"
                  value={newProduct.nombre}
                  onChange={(e) =>
                    setNewProduct((p) => ({ ...p, nombre: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label>Descripcion</label>
                <textarea
                  rows={3}
                  placeholder="Descripcion del producto..."
                  value={newProduct.descripcion}
                  onChange={(e) =>
                    setNewProduct((p) => ({
                      ...p,
                      descripcion: e.target.value,
                    }))
                  }
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
                    onChange={(e) =>
                      setNewProduct((p) => ({ ...p, precio: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="10"
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct((p) => ({ ...p, stock: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Categoria</label>
                <select
                  value={newProduct.categoria}
                  onChange={(e) =>
                    setNewProduct((p) => ({ ...p, categoria: e.target.value }))
                  }
                >
                  <option value="">-- Selecciona una categoria --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="form-hint">
                    No hay categorias aun. Añádelas en la pestana Catalogo.
                  </p>
                )}
              </div>
              <PillSelector
                label="Aromas"
                items={aromas}
                selected={newProduct.aromas}
                onToggle={toggleNewAroma}
                emptyText="No hay aromas. Anaadelos en la pestana Catalogo."
              />
              <PillSelector
                label="Colores"
                items={colors}
                selected={newProduct.colores}
                onToggle={toggleNewColor}
                emptyText="No hay colores. Anaadelos en la pestana Catalogo."
              />
              <div className="form-group">
                <label>URL Imagen (opcional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newProduct.imagen}
                  onChange={(e) =>
                    setNewProduct((p) => ({ ...p, imagen: e.target.value }))
                  }
                />
              </div>
              <button
                className="btn-auth"
                onClick={handleAddProduct}
                disabled={!newProduct.nombre || !newProduct.precio}
              >
                Añadir producto
              </button>
            </div>
          </div>
        )}

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
                  {orders.map((o) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>#{u.id}</td>
                        <td>{u.nombre}</td>
                        <td>{u.correo}</td>
                        <td>
                          <span
                            className={
                              "type-badge type-" +
                              (Number(u.tipo) === 1 ? "admin" : "cliente")
                            }
                          >
                            {Number(u.tipo) === 1 ? "Administrador" : "Cliente"}
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
                            {/* Boton para alternar entre admin y cliente */}
                            <button
                              className="btn-edit"
                              onClick={() => handleToggleTipo(u)}
                            >
                              <IconEdit />{" "}
                              {Number(u.tipo) === 1
                                ? "Quitar admin"
                                : "Hacer admin"}
                            </button>
                            {/* Solo se puede eliminar si no es admin (o si hay mas de un admin, eso lo controla el backend) */}
                            <button
                              className="btn-delete"
                              onClick={() => setDeleteUser(u)}
                            >
                              <IconTrash /> Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <ProductEditModal
        isOpen={!!editProduct}
        onClose={() => setEditProduct(null)}
        product={editProduct}
        onSave={handleSaveEdit}
        categories={categories}
        aromas={aromas}
        colors={colors}
      />
      <ConfirmModal
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
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
        onClose={() => setDeleteUser(null)}
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
