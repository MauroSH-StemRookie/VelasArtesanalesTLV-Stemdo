import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  productosAPI,
  categoriaAPI,
  aromaAPI,
  colorAPI,
  usuarioAPI,
  pedidosAPI,
  pedidosPersonalizadosAPI,
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
import Paginator from "../shared/paginator/Paginator";
import usePagination from "../../hooks/usePagination";
import "./AdminPanel.css";
import "./ProductEditModal.css";
import "./AdminPanelEstados.css";

/* ==========================================================================
   PANEL DE ADMINISTRACION — conectado al backend
   Pestanas:
   1. Productos   — lista, stock, editar, eliminar
   2. Añadir      — formulario con imagenes (hasta 3), categorias, aromas, colores
   3. Catalogo    — CRUD de categorias, aromas y colores
   4. Pedidos     — TODO BACKEND
   5. Usuarios    — lista, cambiar tipo, eliminar
   ========================================================================== */

var MAX_IMAGES = 3;
var API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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
          <IconPlus /> Añadir
        </button>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  var navigate = useNavigate();
  var [activeTab, setActiveTab] = useState("products");
  var [error, setError] = useState("");

  /* `loading` solo cubre la carga inicial de los catalogos auxiliares
     (categorias, aromas, colores) que necesita la pestaña "Añadir" y el
     modal de edicion. La lista de productos en si la gestiona usePagination
     (busca "fetcherProducts" mas abajo) — su flag de loading es independiente
     porque solo aplica cuando el tab "products" esta activo. */
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

  /* ── Pedidos normales (tab "Pedidos") ─────────────────────────────────
     orders/ordersLoading/ordersError/ordersPage/ordersLimit ahora los
     gestiona el hook usePagination mas abajo (busca "fetcherOrders").
     Aqui solo guardamos los estados auxiliares del modal de detalle y del
     selector de estado en linea:
       - detailOrder      pedido abierto en el modal (o null)
       - detailOrderData  datos completos de ese pedido (con lineas del
                          carrito) — se cargan con GET /api/pedidos/:id
       - updatingOrderId  id del pedido cuyo estado se esta actualizando
                          ahora mismo (para deshabilitar su selector) */
  var [detailOrder, setDetailOrder] = useState(null);
  var [detailOrderData, setDetailOrderData] = useState(null);
  var [detailOrderLoading, setDetailOrderLoading] = useState(false);
  var [updatingOrderId, setUpdatingOrderId] = useState(null);

  /* ── Pedidos personalizados (tab "Personalizados") ─────────────────────
     Igual que con orders, la lista la gestiona usePagination (busca
     "fetcherPP" mas abajo). Aqui solo conservamos lo del modal de detalle
     y los estados auxiliares.
     -------------------------------------------------------------------
     IMPORTANTE: el endpoint de listado (GET /api/pedidoper) devuelve una
     version compacta de cada solicitud — solo id, correo, cantidad, fecha
     y producto_referencia. Para mostrar el modal completo (descripcion,
     nombre, telefono) necesitamos llamar ademas a GET /api/pedidoper/:id,
     que si trae todos los campos. Por eso tenemos dos estados separados:
       - detailPP      fila del listado (version compacta)
       - detailPPFull  respuesta de getById (version completa) */
  var [detailPP, setDetailPP] = useState(null);
  var [detailPPFull, setDetailPPFull] = useState(null);
  var [detailPPFullLoading, setDetailPPFullLoading] = useState(false);
  var [detailPPUser, setDetailPPUser] = useState(null);
  var [detailPPUserLoading, setDetailPPUserLoading] = useState(false);
  var [updatingPPId, setUpdatingPPId] = useState(null);

  /* ── Usuarios (tab "Usuarios") ────────────────────────────────────────
     La lista la gestiona usePagination (busca "fetcherUsers"). Aqui solo
     guardamos el usuario que esta pidiendo confirmacion para borrarse. */
  var [deleteUser, setDeleteUser] = useState(null);

  /* ── Carga de usuarios (tab "users") ───────────────────────────────────
     Mismo patron que pedidos: hook usePagination con enabled ligado al tab.
     El backend pagina por id DESC, no acepta sort. */
  const fetcherUsers = useCallback(function (params) {
    return usuarioAPI.admin.getAll({ page: params.page, limit: params.limit });
  }, []);

  const {
    items: users,
    page: usersPage,
    limit: usersLimit,
    loading: usersLoading,
    hasMore: usersHasMore,
    setPage: setUsersPage,
    setLimit: setUsersLimit,
    recargar: recargarUsers,
  } = usePagination({
    fetcher: fetcherUsers,
    initialLimit: 15,
    initialSort: "",
    enabled: activeTab === "users",
  });

  /* ── Carga de productos (tab "products") ──────────────────────────────
     Igual que el resto: usePagination con enabled ligado al tab. A
     diferencia de pedidos/usuarios, el endpoint /api/productos SI soporta
     sort — usamos "nuevos" para que Sergio vea primero lo que acaba de
     anadir.

     IMPORTANTE: el backend exige los query params en este endpoint —
     llamarlo sin ellos devuelve error. Antes el AdminPanel hacia
     productosAPI.getAll() pelado, lo que reventaba. Ahora el helper de
     paginacion siempre adjunta ?page=&limit=&sort=. */
  const fetcherProducts = useCallback(function (params) {
    return productosAPI.getAll({
      page: params.page,
      limit: params.limit,
      sort: params.sort,
    });
  }, []);

  const {
    items: products,
    page: productsPage,
    limit: productsLimit,
    loading: productsLoading,
    error: productsError,
    hasMore: productsHasMore,
    setPage: setProductsPage,
    setLimit: setProductsLimit,
    recargar: recargarProducts,
  } = usePagination({
    fetcher: fetcherProducts,
    initialLimit: 15,
    initialSort: "nuevos",
    enabled: activeTab === "products",
  });

  async function handleDeleteUser() {
    if (!deleteUser) return;
    try {
      await usuarioAPI.delete(deleteUser.id, deleteUser.tipo);
      /* Recargamos en lugar de filtrar optimistamente: si el usuario
         borrado era el ultimo de la pagina, queremos que el backend nos
         devuelva el siguiente que ahora ocupa su sitio (si lo hay). */
      recargarUsers();
    } catch (err) {
      setError("Error al eliminar usuario: " + err.message);
    }
    setDeleteUser(null);
  }

  async function handleToggleTipo(user) {
    try {
      await usuarioAPI.cambiarTipo(user.id, user.tipo);
      /* Igual que con delete: recargamos para mantener la pagina coherente
         con el servidor. El cambio de tipo no afecta al orden, asi que el
         usuario seguira en la misma posicion. */
      recargarUsers();
    } catch (err) {
      setError("Error al cambiar tipo: " + err.message);
    }
  }

  /* ── Carga de pedidos normales ─────────────────────────────────────────
     Se dispara cuando el tab "orders" esta activo (gracias al flag enabled
     de usePagination). El hook gestiona page/limit/loading/error y vuelve
     a pedir al backend cuando el admin cambia de pagina o de "items por
     pagina". Tras un cambio de estado o un delete, llamamos a recargar()
     para que la pagina actual se mantenga coherente con el servidor (en
     lugar de filtrar optimistamente, que rompe el conteo si era el ultimo
     item de la pagina). */
  const fetcherOrders = useCallback(function (params) {
    return pedidosAPI.getAll({ page: params.page, limit: params.limit });
  }, []);

  const {
    items: orders,
    page: ordersPage,
    limit: ordersLimit,
    loading: ordersLoading,
    error: ordersError,
    hasMore: ordersHasMore,
    setPage: setOrdersPage,
    setLimit: setOrdersLimit,
    recargar: recargarOrders,
  } = usePagination({
    fetcher: fetcherOrders,
    initialLimit: 15,
    /* sort vacio para que el helper buildPaginationQuery no lo añada al
       querystring — el endpoint /api/pedidos no lo soporta. */
    initialSort: "",
    enabled: activeTab === "orders",
  });

  /* Abrir el modal de detalle de un pedido. Pedimos GET /api/pedidos/:id
     para traer las lineas del carrito (el listado solo tiene cabecera). */
  async function handleOpenOrderDetail(pedido) {
    setDetailOrder(pedido);
    setDetailOrderData(null);
    setDetailOrderLoading(true);
    try {
      var data = await pedidosAPI.getById(pedido.id);
      setDetailOrderData(data);
    } catch (err) {
      setDetailOrderData({ _error: err.message });
    } finally {
      setDetailOrderLoading(false);
    }
  }

  function handleCloseOrderDetail() {
    setDetailOrder(null);
    setDetailOrderData(null);
  }

  /* PATCH /api/pedidos/:id/estado.
     Antes haciamos un update optimista local, pero con paginacion server-side
     puede romper el orden si el cambio afecta a la posicion. Lo simple y
     correcto es: optimista en pantalla mientras dure el PATCH, y al volver
     llamamos a recargarOrders() para resincronizar con el backend. */
  async function handleChangeOrderEstado(pedido, nuevoEstado) {
    if (!nuevoEstado || nuevoEstado === pedido.estado) return;
    setUpdatingOrderId(pedido.id);
    try {
      await pedidosAPI.actualizarEstado(pedido.id, nuevoEstado);
      recargarOrders();
    } catch (err) {
      setError("Error al cambiar estado del pedido: " + err.message);
      recargarOrders();
    } finally {
      setUpdatingOrderId(null);
    }
  }

  /* ── Carga de pedidos personalizados ───────────────────────────────────
     Mismo patron que orders: usePagination con enabled ligado al tab. */
  const fetcherPP = useCallback(function (params) {
    return pedidosPersonalizadosAPI.getAll({
      page: params.page,
      limit: params.limit,
    });
  }, []);

  const {
    items: ppedidos,
    page: ppedidosPage,
    limit: ppedidosLimit,
    loading: ppedidosLoading,
    error: ppedidosError,
    hasMore: ppedidosHasMore,
    setPage: setPpedidosPage,
    setLimit: setPpedidosLimit,
    recargar: recargarPP,
  } = usePagination({
    fetcher: fetcherPP,
    initialLimit: 15,
    initialSort: "",
    enabled: activeTab === "personalizados",
  });

  /* Abrir el modal de detalle de una solicitud personalizada. Disparamos
     DOS peticiones en paralelo:

     1) GET /api/pedidoper/:id — trae el objeto completo con descripcion,
        nombre, telefono... el listado solo trae una version compacta.

     2) GET /api/usuario/:id — solo si la solicitud esta vinculada a un
        usuario registrado (id_usuario no es null). Sirve para que Sergio
        tenga la direccion completa de la cuenta si necesita contactarle.
        Si es un invitado, los datos de contacto ya estan en el propio
        pedido.

     Ambas cargas son independientes: si una falla, la otra sigue su curso. */
  async function handleOpenPPDetail(pp) {
    setDetailPP(pp);
    setDetailPPFull(null);
    setDetailPPUser(null);

    // Detalle completo del pedido personalizado
    setDetailPPFullLoading(true);
    pedidosPersonalizadosAPI
      .getById(pp.id)
      .then(function (data) {
        setDetailPPFull(data);
      })
      .catch(function (err) {
        setDetailPPFull({ _error: err.message });
      })
      .finally(function () {
        setDetailPPFullLoading(false);
      });

    // Perfil del usuario vinculado (si aplica)
    if (pp.id_usuario) {
      setDetailPPUserLoading(true);
      usuarioAPI.admin
        .getById(pp.id_usuario)
        .then(function (datosUsuario) {
          setDetailPPUser(datosUsuario);
        })
        .catch(function (err) {
          setDetailPPUser({ _error: err.message });
        })
        .finally(function () {
          setDetailPPUserLoading(false);
        });
    }
  }

  function handleClosePPDetail() {
    setDetailPP(null);
    setDetailPPFull(null);
    setDetailPPUser(null);
  }

  async function handleChangePPEstado(pp, nuevoEstado) {
    if (!nuevoEstado || nuevoEstado === pp.estado) return;
    setUpdatingPPId(pp.id);
    try {
      var actualizado = await pedidosPersonalizadosAPI.actualizarEstado(
        pp.id,
        nuevoEstado,
      );
      /* Si tenemos el modal abierto con este mismo pedido, actualizamos
         el detalle (ambos: la fila compacta y la version full) para que
         el cambio se refleje sin cerrar y reabrir. La lista en si la
         resincroniza recargarPP() abajo. */
      if (detailPP && detailPP.id === pp.id) {
        setDetailPP(function (prev) {
          return prev ? { ...prev, estado: actualizado.estado } : prev;
        });
        setDetailPPFull(function (prev) {
          if (!prev) return prev;
          if (prev._error) return prev;
          return { ...prev, estado: actualizado.estado };
        });
      }
      recargarPP();
    } catch (err) {
      setError("Error al cambiar estado de la solicitud: " + err.message);
      recargarPP();
    } finally {
      setUpdatingPPId(null);
    }
  }

  /* Al montar el panel cargamos solo los catalogos auxiliares (categorias,
     aromas, colores). La lista de productos la dispara usePagination cuando
     activeTab === "products" — no la incluimos aqui para no hacer una
     peticion redundante. */
  useEffect(function initialLoad() {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError("");
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
      setError("Error al cargar datos: " + err.message);
    } finally {
      setLoading(false);
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

  /* ── Stock: actualiza con FormData (sin tocar imagenes) ──
     Mantenemos UX optimista — el numero cambia en pantalla al instante
     sin esperar al backend. Pero como `products` lo gestiona usePagination
     y no tenemos setProducts, el truco es: dejamos que el optimista visual
     se haga "implicitamente" al llamar a recargarProducts en cada cambio.
     A precio de un round trip extra por click, ganamos consistencia con
     el servidor. Si en el futuro quisieramos optimismo real, el hook
     necesitaria exponer un updater de items. */
  async function handleStockChange(product, newStock) {
    /* Math.max + parseInt + Number garantizan que aunque newStock llegue
       como string ("5") o como float (5.7) por error, al backend siempre
       le mandamos un entero >= 0. Defensivo: el call site ya hace Number(),
       pero esto cubre futuros usos del handler. */
    var val = Math.max(0, parseInt(Number(newStock), 10) || 0);
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
      recargarProducts();
    } catch (err) {
      setError("Error al actualizar stock: " + err.message);
      recargarProducts();
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
      recargarProducts();
    } catch (err) {
      setError("Error al modificar: " + err.message);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteProduct) return;
    try {
      await productosAPI.delete(deleteProduct.id);
      /* Recargamos en lugar de filtrar optimistamente: con paginacion
         server-side, eliminar localmente deja un hueco en la pagina actual
         hasta que el backend nos sirva el siguiente que ocupa su lugar. */
      recargarProducts();
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
      /* Tras crear: cambiamos al tab "products" para que el admin vea su
         producto en la lista. El cambio de tab activa el hook (que estaba
         dormido) y carga la pagina 1 — ahi esta el producto recien creado
         porque el sort por defecto es "nuevos" (id DESC). Si ya estabamos
         en "products" (caso raro), recargarProducts garantiza el refresh. */
      setActiveTab("products");
      recargarProducts();
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
      /* Añadir nueva imagen */
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

  /* Opciones permitidas para los selectores de estado. Coinciden con la
     lista blanca del backend (ver controllers/pedidos* + CHECK en BD). */
  var ESTADOS_PEDIDO = [
    { valor: "pendiente", etiqueta: "Pendiente" },
    { valor: "en_elaboracion", etiqueta: "En elaboracion" },
    { valor: "enviado", etiqueta: "Enviado" },
    { valor: "entregado", etiqueta: "Entregado" },
    { valor: "cancelado", etiqueta: "Cancelado" },
  ];

  var ESTADOS_PP = [
    { valor: "pendiente", etiqueta: "Pendiente" },
    { valor: "aceptado", etiqueta: "Aceptado" },
    { valor: "denegado", etiqueta: "Denegado" },
    { valor: "completado", etiqueta: "Completado" },
  ];

  /* Helpers de formateo para listados y detalles. Fuera de JSX por
     legibilidad y para esquivar el parser OXC con interpolaciones raras. */
  function etiquetaEstadoPedido(valor) {
    var match = ESTADOS_PEDIDO.find(function (e) {
      return e.valor === valor;
    });
    return match ? match.etiqueta : valor || "Pendiente";
  }
  function etiquetaEstadoPP(valor) {
    var match = ESTADOS_PP.find(function (e) {
      return e.valor === valor;
    });
    return match ? match.etiqueta : valor || "Pendiente";
  }
  function claseEstado(valor) {
    /* Pasamos en_elaboracion → status-en-elaboracion para que el CSS que
       ya usa esa convencion (guiones) aplique sin cambios. */
    return (
      "status-badge status-" + String(valor || "pendiente").replace(/_/g, "-")
    );
  }
  function formatearFecha(iso) {
    if (!iso) return "";
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      return "";
    }
  }
  function formatearDireccion(dir) {
    if (!dir || typeof dir !== "object") return "";
    var trozos = [];
    if (dir.calle) {
      var calleYNum = [dir.calle, dir.numero].filter(Boolean).join(" ").trim();
      if (calleYNum) trozos.push(calleYNum);
    }
    if (dir.piso) trozos.push(String(dir.piso));
    if (dir.cp) trozos.push(String(dir.cp));
    if (dir.ciudad) trozos.push(dir.ciudad);
    if (dir.provincia) trozos.push(dir.provincia);
    return trozos.join(", ");
  }

  var tabs = [
    { key: "products", label: "Productos", icon: <IconPackage /> },
    { key: "add", label: "Añadir Producto", icon: <IconPlus /> },
    { key: "catalog", label: "Caracteristicas", icon: <IconSettings /> },
    { key: "orders", label: "Pedidos", icon: <IconClipboard /> },
    { key: "personalizados", label: "Personalizados", icon: <IconFlame /> },
    { key: "users", label: "Usuarios", icon: <IconUsers /> },
  ];

  /* ── Render de los 3 slots de imagen para el tab "Añadir" ── */
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
          <span>{isPreviewSlot ? "Subir preview" : "Añadir imagen"}</span>
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
        <button
          className="admin-back"
          onClick={function () {
            navigate("/");
          }}
        >
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
            {productsLoading && <p>Cargando productos...</p>}
            {!productsLoading && productsError && (
              <p className="auth-error" style={{ margin: "0 0 1rem" }}>
                {productsError}
              </p>
            )}

            {!productsLoading && !productsError && products.length === 0 && (
              <p>
                No hay productos todavia. Anadelos desde la pestana "Anadir".
              </p>
            )}

            {!productsLoading && !productsError && products.length > 0 && (
              <div className="admin-products-grid">
                {products.map(function (p) {
                  return (
                    <div className="admin-product-card" key={p.id}>
                      <div className="admin-product-img">
                        {p.imagen_id ? (
                          <img
                            src={API_URL + "/imagen/" + p.imagen_id}
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
                              /* Number(p.stock) es CRITICO: el driver pg
                                 puede devolver enteros como string ("5"),
                                 y entonces "5" + 1 = "51" (concatenacion)
                                 en vez de 6. Coercionar antes de sumar/restar
                                 mata el bug en ambos botones. */
                              handleStockChange(p, Number(p.stock) - 1);
                            }}
                          >
                            &minus;
                          </button>
                          <span>{p.stock}</span>
                          <button
                            onClick={function () {
                              handleStockChange(p, Number(p.stock) + 1);
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

            {/* Paginator de productos. Sigue el mismo patron que las otras
                tres listas del panel: se oculta solo si no hay nada que
                paginar (1 sola pagina llena). */}
            {!productsLoading &&
              !productsError &&
              (products.length > 0 || productsPage > 1) && (
                <Paginator
                  page={productsPage}
                  limit={productsLimit}
                  hasMore={productsHasMore}
                  onPageChange={setProductsPage}
                  onLimitChange={setProductsLimit}
                  limitOptions={[15, 30, 50]}
                />
              )}
          </div>
        )}
        {/* ════════════════════════════════════════════════════════════════
           TAB: Añadir PRODUCTO
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "add" && (
          <div className="admin-section">
            <h3>Añadir nuevo producto</h3>
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
                  Añadir producto
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

            {/* Modal de recorte para el tab Añadir */}
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
           TAB: PEDIDOS — datos reales desde /api/pedidos
           ════════════════════════════════════════════════════════════════ */}
        {activeTab === "orders" && (
          <div className="admin-section">
            <h3>Revision de pedidos</h3>
            <p className="admin-section-desc">
              Gestiona los pedidos recibidos. Cambia el estado segun avance la
              preparacion y el envio.
            </p>

            {ordersLoading && <p>Cargando pedidos...</p>}
            {!ordersLoading && ordersError && (
              <p className="auth-error" style={{ margin: "0 0 1rem" }}>
                {ordersError}
              </p>
            )}

            {!ordersLoading && !ordersError && orders.length === 0 && (
              <p>No hay pedidos todavia.</p>
            )}

            {!ordersLoading && !ordersError && orders.length > 0 && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Correo</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(function (o) {
                      var disabled = updatingOrderId === o.id;
                      return (
                        <tr key={o.id}>
                          <td data-label="ID">#{o.id}</td>

                          <td data-label="Fecha">
                            {formatearFecha(o.fecha_creacion)}
                          </td>

                          <td data-label="Cliente">{o.nombre}</td>

                          <td data-label="Correo">
                            {o.correo ? (
                              <a href={"mailto:" + o.correo}>{o.correo}</a>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td data-label="Total">
                            {Number(o.total).toFixed(2)} €
                          </td>

                          <td data-label="Estado">
                            <span className={claseEstado(o.estado)}>
                              {etiquetaEstadoPedido(o.estado)}
                            </span>
                          </td>

                          <td data-label="Acciones">
                            <div
                              style={{
                                display: "flex",
                                gap: "0.5rem",
                                flexWrap: "wrap",
                                alignItems: "center",
                              }}
                            >
                              <select
                                className="admin-estado-select"
                                value={o.estado || "pendiente"}
                                disabled={disabled}
                                onChange={function (e) {
                                  handleChangeOrderEstado(o, e.target.value);
                                }}
                              >
                                {ESTADOS_PEDIDO.map(function (s) {
                                  return (
                                    <option key={s.valor} value={s.valor}>
                                      {s.etiqueta}
                                    </option>
                                  );
                                })}
                              </select>

                              <button
                                className="btn-table-action"
                                onClick={function () {
                                  handleOpenOrderDetail(o);
                                }}
                              >
                                Ver detalle
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

            {/* Paginator de pedidos. Se oculta solo si no hay nada que paginar
                (1 sola pagina llena) gracias a la logica interna del componente. */}
            {!ordersLoading &&
              !ordersError &&
              (orders.length > 0 || ordersPage > 1) && (
                <Paginator
                  page={ordersPage}
                  limit={ordersLimit}
                  hasMore={ordersHasMore}
                  onPageChange={setOrdersPage}
                  onLimitChange={setOrdersLimit}
                  limitOptions={[15, 30, 50]}
                />
              )}
          </div>
        )}
        {/* -------------------------- Listado de solicitudes de velas a medida.
        Cada fila permite: - Ver el detalle completo en un modal (con los datos
        del usuario si la solicitud esta vinculada a una cuenta) - Cambiar el
        estado (pendiente / aceptado / denegado / completado) - Contactar por
        correo o telefono (mailto: y tel:)
        ════════════════════════════════════════════════════════════════  */}
        {activeTab === "personalizados" && (
          <div className="admin-section">
            <h3>Solicitudes personalizadas</h3>
            <p className="admin-section-desc">
              Solicitudes de velas a medida enviadas desde la pagina
              "Personaliza tu vela". Acepta, deniega o marca como completado.
            </p>

            {ppedidosLoading && <p>Cargando solicitudes...</p>}
            {!ppedidosLoading && ppedidosError && (
              <p className="auth-error" style={{ margin: "0 0 1rem" }}>
                {ppedidosError}
              </p>
            )}

            {!ppedidosLoading && !ppedidosError && ppedidos.length === 0 && (
              <p>No hay solicitudes personalizadas todavia.</p>
            )}

            {!ppedidosLoading && !ppedidosError && ppedidos.length > 0 && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Correo</th>
                      <th>Telefono</th>
                      <th>Cantidad</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ppedidos.map(function (p) {
                      return (
                        <tr key={p.id}>
                          <td data-label="ID">#{p.id}</td>

                          <td data-label="Fecha">
                            {formatearFecha(p.fecha_creacion)}
                          </td>

                          <td data-label="Cliente">
                            {p.nombre || p.persona?.nombre || "—"}
                          </td>

                          <td data-label="Correo">
                            {p.correo ? (
                              <a href={"mailto:" + p.correo}>{p.correo}</a>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td data-label="Telefono">
                            {p.telefono || p.telefono_contacto || p.phone ? (
                              <a
                                href={
                                  "tel:" +
                                  (p.telefono || p.telefono_contacto || p.phone)
                                }
                              >
                                {p.telefono || p.telefono_contacto || p.phone}
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td data-label="Cantidad">{p.cantidad || "—"}</td>

                          <td data-label="Estado">
                            <span className={claseEstado(p.estado)}>
                              {etiquetaEstadoPP(p.estado)}
                            </span>
                          </td>

                          <td data-label="Acciones">
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <select
                                className="admin-estado-select"
                                value={p.estado || "pendiente"}
                                onChange={(e) =>
                                  handleChangePPEstado(p, e.target.value)
                                }
                              >
                                {ESTADOS_PP.map((s) => (
                                  <option key={s.valor} value={s.valor}>
                                    {s.etiqueta}
                                  </option>
                                ))}
                              </select>

                              <button
                                className="btn-table-action"
                                onClick={() => handleOpenPPDetail(p)}
                                style={{
                                  flexShrink: 0, // 🔥 clave
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Ver detalle
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

            {/* Paginator de pedidos personalizados */}
            {!ppedidosLoading &&
              !ppedidosError &&
              (ppedidos.length > 0 || ppedidosPage > 1) && (
                <Paginator
                  page={ppedidosPage}
                  limit={ppedidosLimit}
                  hasMore={ppedidosHasMore}
                  onPageChange={setPpedidosPage}
                  onLimitChange={setPpedidosLimit}
                  limitOptions={[15, 30, 50]}
                />
              )}
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
                          <td data-label="ID">#{u.id}</td>

                          <td data-label="Nombre">{u.nombre}</td>

                          <td>
                            {u.correo ? (
                              <a href={"mailto:" + u.correo}>{u.correo}</a>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td data-label="Tipo">
                            <span
                              className={
                                "type-badge type-" +
                                (isAdmin ? "admin" : "cliente")
                              }
                            >
                              {isAdmin ? "Administrador" : "Cliente"}
                            </span>
                          </td>

                          <td data-label="Acciones">
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

            {/* Paginator de usuarios */}
            {!usersLoading && (users.length > 0 || usersPage > 1) && (
              <Paginator
                page={usersPage}
                limit={usersLimit}
                hasMore={usersHasMore}
                onPageChange={setUsersPage}
                onLimitChange={setUsersLimit}
                limitOptions={[15, 30, 50]}
              />
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

      {/* ── Modal de detalle de un pedido normal ─────────────────────────
          Igual que con los personalizados, preferimos los datos de
          GET /api/pedidos/:id sobre la fila del listado, por si el
          backend devuelve version compacta en el listado.
         ──────────────────────────────────────────────────────────────── */}
      {detailOrder &&
        (function () {
          var fullOk = detailOrderData && !detailOrderData._error;
          var base = fullOk ? detailOrderData : detailOrder;
          var nombre = base.nombre || detailOrder.nombre;
          var correo = base.correo || detailOrder.correo;
          var telefono = base.telefono || detailOrder.telefono;
          var direccion = base.direccion || detailOrder.direccion;
          var total = base.total != null ? base.total : detailOrder.total;

          return (
            <div className="modal-overlay" onClick={handleCloseOrderDetail}>
              <div
                className="modal-container admin-detail-modal"
                onClick={function (e) {
                  e.stopPropagation();
                }}
              >
                <button
                  className="modal-close"
                  onClick={handleCloseOrderDetail}
                >
                  <IconClose />
                </button>
                <h3 className="admin-detail-title">Pedido #{detailOrder.id}</h3>
                <div className="admin-detail-meta">
                  <span className={claseEstado(detailOrder.estado)}>
                    {etiquetaEstadoPedido(detailOrder.estado)}
                  </span>
                  {detailOrder.fecha_creacion && (
                    <span className="admin-detail-date">
                      {formatearFecha(detailOrder.fecha_creacion)}
                    </span>
                  )}
                </div>

                <h4 className="admin-detail-section">Cliente</h4>
                <p className="admin-detail-row">
                  <strong>Nombre:</strong>{" "}
                  {nombre || (detailOrderLoading ? "Cargando..." : "—")}
                </p>
                <p className="admin-detail-row">
                  <strong>Correo:</strong>{" "}
                  {correo ? (
                    <a href={"mailto:" + correo}>{correo}</a>
                  ) : detailOrderLoading ? (
                    "Cargando..."
                  ) : (
                    "—"
                  )}
                </p>
                <p className="admin-detail-row">
                  <strong>Telefono:</strong>{" "}
                  {telefono ? (
                    <a href={"tel:" + telefono}>{telefono}</a>
                  ) : detailOrderLoading ? (
                    "Cargando..."
                  ) : (
                    "—"
                  )}
                </p>

                <h4 className="admin-detail-section">Direccion de envio</h4>
                <p className="admin-detail-row">
                  {formatearDireccion(direccion) ||
                    (detailOrderLoading ? "Cargando..." : "—")}
                </p>

                <h4 className="admin-detail-section">Productos</h4>
                {detailOrderLoading && <p>Cargando detalle...</p>}
                {!detailOrderLoading &&
                  detailOrderData &&
                  detailOrderData._error && (
                    <p className="auth-error">
                      No se han podido cargar las lineas del pedido:{" "}
                      {detailOrderData._error}
                    </p>
                  )}
                {!detailOrderLoading &&
                  detailOrderData &&
                  !detailOrderData._error && (
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(detailOrderData.productos || []).map(
                            function (ln, i) {
                              return (
                                <tr key={i}>
                                  <td>{ln.nombre}</td>
                                  <td>{ln.cantidad}</td>
                                  <td>{Number(ln.precio).toFixed(2)} &euro;</td>
                                  <td>
                                    {Number(ln.subtotal).toFixed(2)} &euro;
                                  </td>
                                </tr>
                              );
                            },
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                <p className="admin-detail-total">
                  <strong>Total: {Number(total).toFixed(2)} &euro;</strong>
                </p>
              </div>
            </div>
          );
        })()}

      {/* ── Modal de detalle de un pedido personalizado ─────────────────
          La fila del listado (detailPP) solo trae id/correo/cantidad/
          fecha/producto_referencia, asi que para ver descripcion, nombre
          y telefono pedimos el detalle completo con GET /api/pedidoper/:id
          al abrir el modal. Mientras llega, mostramos "Cargando..." para
          los campos que no tenemos aun.

          Si ademas id_usuario no es null, cargamos tambien el perfil
          completo del usuario registrado para ensenar su direccion y
          datos de contacto de la cuenta.
         ──────────────────────────────────────────────────────────────── */}
      {detailPP &&
        (function () {
          /* Fuente de verdad: preferimos el detalle completo si ya llego,
           caemos al listado mientras carga. Declaradas fuera del JSX por
           claridad y para esquivar interpolaciones raras con OXC. */
          var fullOk = detailPPFull && !detailPPFull._error;
          var base = fullOk ? detailPPFull : detailPP;
          var nombre = base.nombre || detailPP.nombre;
          var correo = base.correo || detailPP.correo;
          var telefono = base.telefono || detailPP.telefono;
          var descripcion = base.descripcion || detailPP.descripcion;
          var cantidad = base.cantidad || detailPP.cantidad;
          var referencia =
            base.producto_referencia || detailPP.producto_referencia;
          var idUsuario = base.id_usuario || detailPP.id_usuario;

          return (
            <div className="modal-overlay" onClick={handleClosePPDetail}>
              <div
                className="modal-container admin-detail-modal"
                onClick={function (e) {
                  e.stopPropagation();
                }}
              >
                <button className="modal-close" onClick={handleClosePPDetail}>
                  <IconClose />
                </button>
                <h3 className="admin-detail-title">
                  Solicitud personalizada #{detailPP.id}
                </h3>
                <div className="admin-detail-meta">
                  <span className={claseEstado(detailPP.estado)}>
                    {etiquetaEstadoPP(detailPP.estado)}
                  </span>
                  {detailPP.fecha_creacion && (
                    <span className="admin-detail-date">
                      {formatearFecha(detailPP.fecha_creacion)}
                    </span>
                  )}
                </div>

                <h4 className="admin-detail-section">Descripcion</h4>
                {detailPPFullLoading && !fullOk && (
                  <p className="admin-detail-row">Cargando descripcion...</p>
                )}
                {detailPPFull && detailPPFull._error && (
                  <p className="auth-error">
                    No se ha podido cargar el detalle completo:{" "}
                    {detailPPFull._error}
                  </p>
                )}
                {(fullOk || !detailPPFullLoading) && (
                  <pre className="admin-detail-description">
                    {descripcion || "—"}
                  </pre>
                )}

                <p className="admin-detail-row">
                  <strong>Cantidad:</strong> {cantidad || "—"}
                </p>
                <p className="admin-detail-row">
                  <strong>Producto de referencia:</strong>{" "}
                  {referencia || "(ninguno)"}
                </p>

                <h4 className="admin-detail-section">Contacto</h4>
                <p className="admin-detail-row">
                  <strong>Nombre:</strong>{" "}
                  {nombre || (detailPPFullLoading ? "Cargando..." : "—")}
                </p>
                <p className="admin-detail-row">
                  <strong>Correo:</strong>{" "}
                  {correo ? <a href={"mailto:" + correo}>{correo}</a> : "—"}
                </p>
                <p className="admin-detail-row">
                  <strong>Telefono:</strong>{" "}
                  {telefono ? (
                    <a href={"tel:" + telefono}>{telefono}</a>
                  ) : detailPPFullLoading ? (
                    "Cargando..."
                  ) : (
                    "—"
                  )}
                </p>

                {/* Datos del usuario registrado (si aplica) */}
                {idUsuario && (
                  <>
                    <h4 className="admin-detail-section">
                      Cuenta de usuario vinculada
                    </h4>
                    {detailPPUserLoading && (
                      <p>Cargando datos del usuario...</p>
                    )}
                    {!detailPPUserLoading &&
                      detailPPUser &&
                      detailPPUser._error && (
                        <p className="auth-error">
                          No se ha podido cargar el usuario:{" "}
                          {detailPPUser._error}
                        </p>
                      )}
                    {!detailPPUserLoading &&
                      detailPPUser &&
                      !detailPPUser._error && (
                        <>
                          <p className="admin-detail-row">
                            <strong>Direccion:</strong>{" "}
                            {formatearDireccion(detailPPUser) || "—"}
                          </p>
                          {detailPPUser.correo &&
                            detailPPUser.correo !== correo && (
                              <p className="admin-detail-row">
                                <strong>Correo de la cuenta:</strong>{" "}
                                <a href={"mailto:" + detailPPUser.correo}>
                                  {detailPPUser.correo}
                                </a>
                              </p>
                            )}
                          {detailPPUser.telefono &&
                            detailPPUser.telefono !== telefono && (
                              <p className="admin-detail-row">
                                <strong>Telefono de la cuenta:</strong>{" "}
                                <a href={"tel:" + detailPPUser.telefono}>
                                  {detailPPUser.telefono}
                                </a>
                              </p>
                            )}
                        </>
                      )}
                  </>
                )}

                {/* Acciones rapidas sobre el estado */}
                <div className="admin-detail-actions">
                  {detailPP.estado === "pendiente" && (
                    <>
                      <button
                        className="admin-detail-btn"
                        disabled={updatingPPId === detailPP.id}
                        onClick={function () {
                          handleChangePPEstado(detailPP, "aceptado");
                        }}
                      >
                        Aceptar solicitud
                      </button>
                      <button
                        className="admin-detail-btn admin-detail-btn-danger"
                        disabled={updatingPPId === detailPP.id}
                        onClick={function () {
                          handleChangePPEstado(detailPP, "denegado");
                        }}
                      >
                        Denegar
                      </button>
                    </>
                  )}
                  {detailPP.estado === "aceptado" && (
                    <button
                      className="admin-detail-btn"
                      disabled={updatingPPId === detailPP.id}
                      onClick={function () {
                        handleChangePPEstado(detailPP, "completado");
                      }}
                    >
                      Marcar como completado
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
