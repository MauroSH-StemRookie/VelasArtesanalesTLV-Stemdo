/* ==========================================================================
   SERVICIO API — central de llamadas al backend
   ========================================================================== */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error || data.mensaje || "Error en la peticion");
  return data;
}

/* --- AUTH --- */
export const authAPI = {
  login: (correo, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ correo, password }),
    }),
  registro: (datos) =>
    request("/auth/registro", { method: "POST", body: JSON.stringify(datos) }),
};

/* --- PRODUCTOS --- */
export const productosAPI = {
  getAll: () => request("/productos"),
  getById: (id) => request(`/productos/${id}`),
  getByCategoria: (id) => request(`/productos/categoria/${id}`),
  create: (producto) =>
    request("/productos", { method: "POST", body: JSON.stringify(producto) }),
  update: (id, producto) =>
    request(`/productos/${id}`, {
      method: "PUT",
      body: JSON.stringify(producto),
    }),
  delete: (id) => request(`/productos/${id}`, { method: "DELETE" }),
};

/* --- CATEGORIAS --- */
export const categoriaAPI = {
  getAll: () => request("/categoria"),
  create: (datos) =>
    request("/categoria", { method: "POST", body: JSON.stringify(datos) }),
  update: (id, datos) =>
    request(`/categoria/${id}`, { method: "PUT", body: JSON.stringify(datos) }),
  delete: (id) => request(`/categoria/${id}`, { method: "DELETE" }),
};

/* --- AROMAS --- */
export const aromaAPI = {
  getAll: () => request("/aroma"),
  create: (datos) =>
    request("/aroma", { method: "POST", body: JSON.stringify(datos) }),
  update: (id, datos) =>
    request(`/aroma/${id}`, { method: "PUT", body: JSON.stringify(datos) }),
  delete: (id) => request(`/aroma/${id}`, { method: "DELETE" }),
};

/* --- COLORES --- */
export const colorAPI = {
  getAll: () => request("/color"),
  create: (datos) =>
    request("/color", { method: "POST", body: JSON.stringify(datos) }),
  update: (id, datos) =>
    request(`/color/${id}`, { method: "PUT", body: JSON.stringify(datos) }),
  delete: (id) => request(`/color/${id}`, { method: "DELETE" }),
};

/* --- PEDIDOS --- */
// TODO BACKEND: la API de pedidos es placeholder. Cuando este lista,
// estas funciones ya estan preparadas para funcionar sin cambios.
export const pedidosAPI = {
  getAll: () => request("/pedidos"),
  getById: (id) => request(`/pedidos/${id}`),
  create: (pedido) =>
    request("/pedidos", { method: "POST", body: JSON.stringify(pedido) }),
};

/* --- USUARIOS (solo admin) --- */
export const usuarioAPI = {
  // Listar todos los usuarios registrados
  getAll: () => request("/usuario"),

  // Cambiar el tipo de un usuario (admin <-> cliente)
  // El backend recibe el tipo ACTUAL y lo invierte automaticamente
  // tipo 1 (admin) -> pasa a 2 (cliente)
  // tipo 2 (cliente) -> pasa a 1 (admin)
  cambiarTipo: (id, tipoActual) =>
    request(`/usuario/${id}`, {
      method: "PUT", // <-- correcto
      body: JSON.stringify({ tipo: Number(tipoActual) }),
    }),
  // Eliminar un usuario (el backend impide borrar el ultimo admin)
  delete: (id, tipo) =>
    request(`/usuario/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ tipo }),
    }),
};
