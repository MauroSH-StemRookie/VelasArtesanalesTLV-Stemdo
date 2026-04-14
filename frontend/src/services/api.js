/* ==========================================================================
   SERVICIO API — central de llamadas al backend
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

/* --- PRODUCTOS --- */
export var productosAPI = {
  getAll: function () {
    return request("/productos");
  },

  getById: function (id) {
    return request("/productos/" + id);
  },

  getByCategoria: function (id) {
    return request("/productos/categoria/" + id);
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

  /* Actualizar producto CON imagenes — usa FormData.
     Parametros adicionales:
       imagenesConservar (array de ids de imagenes existentes a mantener)
       imagenesNuevas (array de File nuevos) */
  update: function (id, producto) {
    var fd = new FormData();
    fd.append("nombre", producto.nombre);
    fd.append("descripcion", producto.descripcion);
    fd.append("precio", producto.precio);
    fd.append("stock", producto.stock);
    fd.append("oferta", producto.oferta ? "true" : "false");
    fd.append(
      "precio_oferta",
      producto.precio_oferta || producto.precio
    );
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
    /* imagenesConservar: IDs de imagenes existentes que NO se borran */
    if (producto.imagenesConservar) {
      producto.imagenesConservar.forEach(function (imgId) {
        fd.append("imagenesConservar", imgId);
      });
    }
    /* imagenes nuevas (File[]) */
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

/* --- USUARIOS (solo admin) --- */
export var usuarioAPI = {
  getAll: function () {
    return request("/usuario");
  },
  /* Cambiar el tipo de un usuario (admin <-> cliente)
     El backend recibe el tipo ACTUAL y lo invierte automaticamente */
  cambiarTipo: function (id, tipoActual) {
    return request("/usuario/" + id, {
      method: "PUT",
      body: JSON.stringify({ tipo: Number(tipoActual) }),
    });
  },
  /* Eliminar un usuario (el backend impide borrar el ultimo admin) */
  delete: function (id, tipo) {
    return request("/usuario/" + id, {
      method: "DELETE",
      body: JSON.stringify({ tipo: tipo }),
    });
  },
};
