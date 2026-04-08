/* ==========================================================================
   SERVICIO API — central de llamadas al backend
   -----------------------------------------------
   Todas las peticiones al backend pasan por aqui. Asi si cambia la URL
   base (por ejemplo al desplegar en Railway) solo se toca en un sitio.

   La URL base viene del archivo .env del frontend:
   VITE_API_URL=http://localhost:3000/api
   ========================================================================== */

// Leemos la URL base desde las variables de entorno de Vite
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Recupera el token JWT que guardamos al hacer login
function getToken() {
  return localStorage.getItem('token')
}

// Funcion generica para hacer peticiones al backend
// Se encarga de anadir las cabeceras necesarias (Content-Type y Authorization)
async function request(endpoint, options = {}) {
  const token = getToken()

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Si hay token guardado, lo anadimos a la cabecera Authorization
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Si el servidor devuelve 401/403, el token ha expirado o es invalido
  if (res.status === 401 || res.status === 403) {
    // Eliminamos el token caducado para que el usuario vuelva a loguearse
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const data = await res.json()

  // Si la respuesta no es exitosa, lanzamos un error con el mensaje del backend
  if (!res.ok) {
    throw new Error(data.error || data.mensaje || 'Error en la peticion')
  }

  return data
}

/* ─── AUTH ─── */
export const authAPI = {
  // Login: envia correo + password, recibe token + user
  login: (correo, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo, password }),
    }),

  // Registro: envia todos los datos del formulario, recibe el usuario creado
  // NOTA: La ruta en el backend es /registro (no /register)
  registro: (datos) =>
    request('/auth/registro', {
      method: 'POST',
      body: JSON.stringify(datos),
    }),
}

/* ─── PRODUCTOS ─── */
export const productosAPI = {
  // Obtener todos los productos (publico, no necesita token)
  getAll: () => request('/productos'),

  // Obtener un producto por su ID con aromas y colores (publico)
  getById: (id) => request(`/productos/${id}`),

  // Obtener productos filtrados por categoria (publico)
  getByCategoria: (id) => request(`/productos/categoria/${id}`),

  // Crear producto nuevo (solo admin)
  create: (producto) =>
    request('/productos', {
      method: 'POST',
      body: JSON.stringify(producto),
    }),

  // Modificar producto existente (solo admin)
  update: (id, producto) =>
    request(`/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(producto),
    }),

  // Eliminar producto (solo admin)
  delete: (id) =>
    request(`/productos/${id}`, { method: 'DELETE' }),
}

/* ─── PEDIDOS ─── */
// TODO BACKEND: Estas funciones estan preparadas para cuando la API de pedidos
// deje de ser placeholder y tenga la logica real implementada
export const pedidosAPI = {
  getAll: () => request('/pedidos'),
  getById: (id) => request(`/pedidos/${id}`),
  create: (pedido) =>
    request('/pedidos', {
      method: 'POST',
      body: JSON.stringify(pedido),
    }),
}
