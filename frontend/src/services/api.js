/* ==========================================================================
   SERVICIO API — central de llamadas al backend
   --------------------------------------------
   Todas las llamadas a la API pasan por este archivo. Si maniana cambia el
   contrato del backend, aqui es donde hay que tocar, no en los componentes.

   Dos helpers internos:
     - request(endpoint, options)         → peticiones JSON normales
     - requestFormData(endpoint, fd, ...) → peticiones con FormData (imagenes)

   En ambos se encarga automaticamente de:
     - Anadir el header Authorization: Bearer <token> si hay sesion
     - Limpiar localStorage si el backend responde 401 o 403 (token caducado)
     - Parsear el JSON y lanzar un Error si la respuesta no es ok
   ========================================================================== */
var API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function getToken() {
  return localStorage.getItem("token");
}

/* Peticion JSON estandar (para rutas que NO envian archivos) */
async function request(endpoint, options) {
  if (!options) options = {};
  var token = getToken();
  var headers = { "Content-Type": "application/json" };
  if (options.headers) {
    Object.keys(options.headers).forEach(function (k) {
      headers[k] = options.headers[k];
    });
  }
  if (token) headers["Authorization"] = "Bearer " + token;

  var res = await fetch(API_URL + endpoint, {
    method: options.method || "GET",
    headers: headers,
    body: options.body || undefined,
  });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  var data = await res.json();
  if (!res.ok)
    throw new Error(data.error || data.mensaje || "Error en la peticion");
  return data;
}

/* Peticion FormData (para rutas que envian archivos de imagen).
   No se pone Content-Type manualmente: el navegador anade
   el boundary de multipart/form-data automaticamente. */
async function requestFormData(endpoint, formData, method) {
  var token = getToken();
  var headers = {};
  if (token) headers["Authorization"] = "Bearer " + token;

  var res = await fetch(API_URL + endpoint, {
    method: method || "POST",
    headers: headers,
    body: formData,
  });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  var data = await res.json();
  if (!res.ok)
    throw new Error(data.error || data.mensaje || "Error en la peticion");
  return data;
}

/* Construye la querystring "?page=1&limit=15&sort=nuevos" a partir de un
   objeto de opciones. Se ignoran los valores undefined o null para que el
   backend aplique los defaults (page=1, limit=15, sort=nuevos). */
function buildPaginationQuery(opts) {
  if (!opts) return "";
  var parts = [];
  if (opts.page !== undefined && opts.page !== null) {
    parts.push("page=" + encodeURIComponent(opts.page));
  }
  if (opts.limit !== undefined && opts.limit !== null) {
    parts.push("limit=" + encodeURIComponent(opts.limit));
  }
  if (opts.sort !== undefined && opts.sort !== null && opts.sort !== "") {
    parts.push("sort=" + encodeURIComponent(opts.sort));
  }
  return parts.length > 0 ? "?" + parts.join("&") : "";
}

/* --- AUTH --- */
export var authAPI = {
  login: function (correo, password) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ correo: correo, password: password }),
    });
  },
  registro: function (datos) {
    return request("/auth/registro", {
      method: "POST",
      body: JSON.stringify(datos),
    });
  },
};

/* --- PRODUCTOS ---
   Las rutas de listado (getAll, getByCategoria, getByAroma, getByColor)
   aceptan un objeto de paginacion opcional:
     { page: 1, limit: 15, sort: "nuevos" | "oferta" | "precio_asc" | "precio_desc" }

   Si no se pasa nada, el backend aplica los defaults (page=1, limit=15, sort=nuevos).
   La respuesta sigue siendo un array plano de productos; el frontend detecta
   "hay mas paginas" comparando si el array tiene length === limit (ver hooks/usePagination). */
export var productosAPI = {
  getAll: function (pagination) {
    return request("/productos" + buildPaginationQuery(pagination));
  },

  getById: function (id) {
    return request("/productos/" + id);
  },

  getByCategoria: function (id, pagination) {
    return request("/productos/categoria/" + id + buildPaginationQuery(pagination));
  },

  getByAroma: function (id, pagination) {
    return request("/productos/aroma/" + id + buildPaginationQuery(pagination));
  },

  getByColor: function (id, pagination) {
    return request("/productos/color/" + id + buildPaginationQuery(pagination));
  },

  /* Crear producto CON imagenes — usa FormData (multipart/form-data).
     Parametros del objeto producto:
       nombre, descripcion, precio, stock, categoria,
       aromas (array de ids), colores (array de ids),
       imagenes (array de File) */
  create: function (producto) {
    var fd = new FormData();
    fd.append("nombre", producto.nombre);
    fd.append("descripcion", producto.descripcion);
    fd.append("precio", producto.precio);
    fd.append("stock", producto.stock);
    if (producto.categoria) fd.append("categoria", producto.categoria);
    if (producto.aromas) {
      producto.aromas.forEach(function (id) {
        fd.append("aromas", id);
      });
    }
    if (producto.colores) {
      producto.colores.forEach(function (id) {
        fd.append("colores", id);
      });
    }
    if (producto.imagenes) {
      producto.imagenes.forEach(function (file) {
        fd.append("imagenes", file);
      });
    }
    return requestFormData("/productos", fd, "POST");
  },

  /* Actualizar producto — FormData con imagenesConfig.
     imagenesConfig es un JSON string con el estado final del carrusel:
       { tipo: "existente", id: N, orden: N } — imagen ya guardada
       { tipo: "nueva", orden: N }            — imagen nueva (File)
     Los File de imagenesNuevas emparejan 1:1 con entradas tipo "nueva".
     Si no se envia imagenesConfig, las imagenes no se tocan. */
  update: function (id, producto) {
    /* Convertir a numero seguro: si el valor es NaN, null, undefined
       o string vacio, devuelve el fallback (0 por defecto).
       Esto evita que FormData envie "undefined" o "NaN" al backend. */
    function safeNum(val, fallback) {
      var n = parseFloat(val);
      if (isNaN(n)) return fallback !== undefined ? fallback : 0;
      return n;
    }

    var precio = safeNum(producto.precio, 0);
    var precioOferta = safeNum(producto.precio_oferta, precio);

    var fd = new FormData();
    fd.append("nombre", producto.nombre || "");
    fd.append("descripcion", producto.descripcion || "");
    fd.append("precio", precio);
    fd.append("stock", safeNum(producto.stock, 0));
    /* oferta es un porcentaje numerico (ej: 20 = 20% de descuento).
       Si el checkbox esta activo y hay diferencia de precio, calculamos
       el porcentaje. Si no hay oferta, enviamos 0. */
    var ofertaPct = 0;
    if (producto.oferta && precio > 0 && precioOferta < precio) {
      ofertaPct = Math.round((1 - precioOferta / precio) * 100);
    }
    fd.append("oferta", ofertaPct);
    fd.append("precio_oferta", precioOferta);
    if (producto.categoria) fd.append("categoria", producto.categoria);
    if (producto.aromas) {
      producto.aromas.forEach(function (aid) {
        fd.append("aromas", aid);
      });
    }
    if (producto.colores) {
      producto.colores.forEach(function (cid) {
        fd.append("colores", cid);
      });
    }
    /* imagenesConfig: JSON con el estado final del carrusel */
    if (producto.imagenesConfig) {
      fd.append("imagenesConfig", JSON.stringify(producto.imagenesConfig));
    }
    /* imagenes nuevas (File[]) emparejan con entradas tipo "nueva" */
    if (producto.imagenesNuevas) {
      producto.imagenesNuevas.forEach(function (file) {
        fd.append("imagenes", file);
      });
    }
    return requestFormData("/productos/" + id, fd, "PUT");
  },

  delete: function (id) {
    return request("/productos/" + id, { method: "DELETE" });
  },
};

/* --- CATEGORIAS --- */
export var categoriaAPI = {
  getAll: function () {
    return request("/categoria");
  },
  create: function (datos) {
    return request("/categoria", {
      method: "POST",
      body: JSON.stringify(datos),
    });
  },
  update: function (id, datos) {
    return request("/categoria/" + id, {
      method: "PUT",
      body: JSON.stringify(datos),
    });
  },
  delete: function (id) {
    return request("/categoria/" + id, { method: "DELETE" });
  },
};

/* --- AROMAS --- */
export var aromaAPI = {
  getAll: function () {
    return request("/aroma");
  },
  create: function (datos) {
    return request("/aroma", {
      method: "POST",
      body: JSON.stringify(datos),
    });
  },
  update: function (id, datos) {
    return request("/aroma/" + id, {
      method: "PUT",
      body: JSON.stringify(datos),
    });
  },
  delete: function (id) {
    return request("/aroma/" + id, { method: "DELETE" });
  },
};

/* --- COLORES --- */
export var colorAPI = {
  getAll: function () {
    return request("/color");
  },
  create: function (datos) {
    return request("/color", {
      method: "POST",
      body: JSON.stringify(datos),
    });
  },
  update: function (id, datos) {
    return request("/color/" + id, {
      method: "PUT",
      body: JSON.stringify(datos),
    });
  },
  delete: function (id) {
    return request("/color/" + id, { method: "DELETE" });
  },
};

/* --- PEDIDOS --- */
/* TODO BACKEND: la API de pedidos es placeholder. Cuando este lista,
   estas funciones ya estan preparadas para funcionar sin cambios. */
export var pedidosAPI = {
  getAll: function () {
    return request("/pedidos");
  },
  getById: function (id) {
    return request("/pedidos/" + id);
  },
  create: function (pedido) {
    return request("/pedidos", {
      method: "POST",
      body: JSON.stringify(pedido),
    });
  },
};

/* --- USUARIOS ---
   El objeto tiene dos ramas bien separadas para que quede claro que permisos
   necesita cada llamada:

   usuarioAPI.me.*       → Todo lo que el propio usuario puede hacer con su
                           cuenta (ver, editar, cambiar password, eliminar).
                           Requiere token valido (cualquier usuario logueado).

   usuarioAPI.admin.*    → Gestion de usuarios por parte del administrador.
                           Requiere token de admin (tipo === 1).
   ========================================================================== */
export var usuarioAPI = {
  me: {
    /* GET /api/usuario/me
       Devuelve los datos del usuario logueado (sin password, sin tipo, sin id):
         { id, nombre, correo, telefono, calle, numero, cp, ciudad, provincia, piso }
       El id si lo devuelve para poder usarlo en refrescos, pero el backend no
       deja cambiarlo. El correo lo devuelve tambien pero es solo lectura. */
    obtener: function () {
      return request("/usuario/me");
    },

    /* PUT /api/usuario/me
       Modifica los datos personales y de direccion. NO permite cambiar correo,
       password ni tipo (esos tienen endpoints propios o no son editables).
       Body esperado:
         { nombre, telefono, calle, numero, cp, ciudad, provincia, piso } */
    actualizar: function (datos) {
      return request("/usuario/me", {
        method: "PUT",
        body: JSON.stringify(datos),
      });
    },

    /* PUT /api/usuario/me/password
       Cambia la password. El backend hace bcrypt.compare con la actual
       y responde 401 si no coincide.
       Body esperado: { passwordActual, passwordNueva } */
    cambiarPassword: function (passwordActual, passwordNueva) {
      return request("/usuario/me/password", {
        method: "PUT",
        body: JSON.stringify({
          passwordActual: passwordActual,
          passwordNueva: passwordNueva,
        }),
      });
    },

    /* DELETE /api/usuario/me
       Elimina la cuenta del usuario logueado. Requiere password en el body
       para confirmar. El backend protege al ultimo administrador (si eres
       el unico admin, responde 400 y no borra).
       Body esperado: { password } */
    eliminarCuenta: function (password) {
      return request("/usuario/me", {
        method: "DELETE",
        body: JSON.stringify({ password: password }),
      });
    },
  },

  admin: {
    /* GET /api/usuario — Listar todos los usuarios (solo admin) */
    getAll: function () {
      return request("/usuario");
    },

    /* PUT /api/usuario/:id — Cambiar tipo (toggle).
       El backend recibe el tipo ACTUAL del usuario y lo invierte
       automaticamente (1 ↔ 2). */
    cambiarTipo: function (id, tipoActual) {
      return request("/usuario/" + id, {
        method: "PUT",
        body: JSON.stringify({ tipo: Number(tipoActual) }),
      });
    },

    /* DELETE /api/usuario/:id — Eliminar usuario (solo admin).
       El backend impide borrar al ultimo administrador. */
    delete: function (id, tipo) {
      return request("/usuario/" + id, {
        method: "DELETE",
        body: JSON.stringify({ tipo: tipo }),
      });
    },
  },

  /* ── Atajos de compatibilidad con el codigo anterior ─────────────────
     AdminPanel y otros componentes usaban usuarioAPI.getAll / .cambiarTipo
     / .delete directamente. Se mantienen como proxies a usuarioAPI.admin.*
     para no romper nada en esos sitios. */
  getAll: function () {
    return request("/usuario");
  },
  cambiarTipo: function (id, tipoActual) {
    return request("/usuario/" + id, {
      method: "PUT",
      body: JSON.stringify({ tipo: Number(tipoActual) }),
    });
  },
  delete: function (id, tipo) {
    return request("/usuario/" + id, {
      method: "DELETE",
      body: JSON.stringify({ tipo: tipo }),
    });
  },
};
