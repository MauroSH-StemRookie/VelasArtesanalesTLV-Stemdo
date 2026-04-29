# ⚙️ Backend — Velas Artesanales

API REST del e-commerce de Velas Artesanales.  
Construida con **Node.js** y **Express**, conectada a **PostgreSQL en Neon**.

Además de la gestión habitual de usuarios, productos, categorías, aromas, colores y pedidos personalizados, el backend incorpora dos flujos de pagos online: **PayPal** _(popup nativo)_ y **Redsys/TPV** _(redirección al banco)_, para que los pedidos normales solo se creen después de que el pago haya sido aprobado.

---

## Índice

1. [Primera vez — configuración inicial](#1-primera-vez--configuración-inicial)
2. [Variables de entorno](#2-variables-de-entorno)
3. [Arrancar en local](#3-arrancar-en-local)
4. [Estructura de carpetas](#4-estructura-de-carpetas)
5. [Guía para el Frontend (React)](#5-guía-para-el-frontend-react)
6. [Pagos online con PayPal](#6-pagos-online-con-paypal)
7. [Pagos online con Redsys (TPV)](#7-pagos-online-con-redsys-tpv)
8. [Rutas de la API — referencia completa](#7-rutas-de-la-api--referencia-completa)
9. [Flujo de trabajo con ramas](#8-flujo-de-trabajo-con-ramas)
10. [Cómo trabajar desde VS Code (sin terminal)](#9-cómo-trabajar-desde-vs-code-sin-terminal)
11. [Scripts disponibles](#10-scripts-disponibles)

---

## 1. Primera vez — configuración inicial

### Paso 1 — Clonar el repositorio

```bash
git clone https://github.com/MauroSH-StemRookie/VelasArtesanalesTLV-Stemdo.git
cd VelasArtesanalesTLV-Stemdo
```

### Paso 2 — Entrar en la carpeta del backend

```bash
cd backend
```

### Paso 3 — Instalar las dependencias

```bash
npm install
```

Esto descarga todas las librerías necesarias. Solo hace falta hacerlo la primera vez y cada vez que un compañero añada una librería nueva.

> ℹ️ Si al hacer `git pull` veis que alguien modificó `package.json`, volved a ejecutar `npm install`.

---

## 2. Variables de entorno

Las variables de entorno son configuraciones sensibles (contraseñas, tokens, claves de APIs) que **no se suben a GitHub**. Cada miembro del equipo las tiene en su ordenador.

### Crear el archivo `.env`

```bash
# Windows (PowerShell)
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

### Rellenar el `.env`

Abrid el archivo `.env` que acabáis de crear y rellenad los valores. Pedídselos al responsable del proyecto:

```env
DATABASE_URL=postgresql://usuario:contraseña@host/velasartesanalesDB?sslmode=require
PORT=3000
NODE_ENV=development
JWT_SECRET=un_secreto_seguro
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
CORREO_REMITENTE=onboarding@resend.dev
CORREO_ADMIN=tu_correo@stemdo.io

PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret

REDSYS_MERCHANT_CODE=999008881
REDSYS_MERCHANT_KEY=sq7HjrUOBfKmC576ILgskD5srU870gJ7
REDSYS_TERMINAL=001
REDSYS_ENVIRONMENT=test
REDSYS_NOTIFICATION_URL=https://TU-NGROK.ngrok.io/api/redsys/notificacion
REDSYS_SUCCESS_URL=http://localhost:5173/pago/exito
REDSYS_ERROR_URL=http://localhost:5173/pago/error
```

| Variable                  | Para qué sirve                                                         |
| ------------------------- | ---------------------------------------------------------------------- |
| `DATABASE_URL`            | Dirección de la base de datos en Neon                                  |
| `PORT`                    | Puerto donde corre el servidor (3000 por defecto)                      |
| `NODE_ENV`                | Entorno de ejecución (`development` / `production`)                    |
| `JWT_SECRET`              | Secreto para firmar los tokens JWT                                     |
| `JWT_EXPIRES_IN`          | Tiempo de expiración del token                                         |
| `CLIENT_URL`              | URL del frontend para CORS                                             |
| `RESEND_API_KEY`          | API key de Resend                                                      |
| `CORREO_REMITENTE`        | Correo remitente usado por Resend                                      |
| `CORREO_ADMIN`            | Correo del administrador para avisos internos                          |
| `PAYPAL_CLIENT_ID`        | Client ID de la app de PayPal                                          |
| `PAYPAL_CLIENT_SECRET`    | Client Secret de la app de PayPal                                      |
| `REDSYS_MERCHANT_CODE`    | Número de comercio (FUC) del TPV Virtual                               |
| `REDSYS_MERCHANT_KEY`     | Clave secreta Base64 para firmar con HMAC-SHA256                       |
| `REDSYS_TERMINAL`         | Número de terminal del TPV (normalmente 001)                           |
| `REDSYS_ENVIRONMENT`      | test para pruebas, production para real                                |
| `REDSYS_NOTIFICATION_URL` | URL donde Redsys envía el resultado del pago (necesita ngrok en local) |
| `REDSYS_SUCCESS_URL`      | URL de redirección tras pago correcto                                  |
| `REDSYS_ERROR_URL`        | URL de redirección tras pago fallido                                   |

> ⚠️ El archivo `.env` está en el `.gitignore` — nunca se sube a GitHub.

### `.env.example` recomendado

```env
DATABASE_URL=
PORT=3000
NODE_ENV=development
JWT_SECRET=
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

RESEND_API_KEY=
CORREO_REMITENTE=
CORREO_ADMIN=

PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=

REDSYS_MERCHANT_CODE=
REDSYS_MERCHANT_KEY=
REDSYS_TERMINAL=001
REDSYS_ENVIRONMENT=test
REDSYS_NOTIFICATION_URL=
REDSYS_SUCCESS_URL=
REDSYS_ERROR_URL=
```

---

## 3. Arrancar en local

```bash
npm run dev
```

El servidor estará disponible en:

```text
http://localhost:3000
```

Para comprobar que funciona, abrid el navegador y visitad:

```text
http://localhost:3000/
```

Deberíais ver algo parecido a:

```json
{ "status": "OK", "mensaje": "API Velas Artesanales funcionando" }
```

Cada vez que guardéis un archivo, el servidor se reinicia automáticamente gracias a **nodemon**.

---

## 4. Estructura de carpetas

```text
backend/
├── src/
│   ├── index.js                                    ← Punto de entrada. Configura Express y arranca el servidor
│   ├── db.js                                       ← Conexión a la base de datos Neon
│   ├── services/                                   ← Define la integración con APIs de terceros
│   │   ├── emailService.js                         ← Métodos de envío de correos
│   │   ├── redsysService.js                        ← Firma y verificación de pagos con Redsys (HMAC-SHA256 + 3DES)
│   │   └── paypalService.js                        ← Configuración del cliente oficial de PayPal
│   ├── routes/                                     ← Define las URLs de la API
│   │   ├── auth.js                                 ← /api/auth
│   │   ├── pedidos.js                              ← /api/pedidos
│   │   ├── paypal.js                               ← /api/paypal
│   │   ├── pedidoPersonalizado.js                  ← /api/pedidoper
│   │   ├── productos.js                            ← /api/productos
│   │   ├── categoria.js                            ← /api/categoria
│   │   ├── aroma.js                                ← /api/aroma
│   │   ├── color.js                                ← /api/color
│   │   ├── usuario.js                              ← /api/usuario
│   │   └── redsys.js                               ← /api/redsys
│   ├── controllers/                                ← Define la lógica de cada API
│   │   ├── authController.js                       ← Controlador de auth
│   │   ├── pedidosController.js                    ← Controlador de pedidos
│   │   ├── paypalController.js                     ← Controlador del flujo de pago PayPal
│   │   ├── pedidoPersonalizadoController.js        ← Controlador de pedidos personalizados
│   │   ├── productosController.js                  ← Controlador de productos
│   │   ├── categoriaController.js                  ← Controlador de categoría
│   │   ├── aromaController.js                      ← Controlador de aroma
│   │   ├── colorController.js                      ← Controlador de color
│   │   ├── usuarioController.js                    ← Controlador de usuario
│   │   └── redsysController.js                     ← Controlador del flujo de pago Redsys
│   ├── models/                                     ← Consultas SQL a la base de datos
│   │   ├── authModel.js                            ← Modelo de auth
│   │   ├── pedidosModel.js                         ← Modelo de pedidos
│   │   ├── pedidoPersonalizadoModel.js             ← Modelo de pedidos personalizados
│   │   ├── productosModel.js                       ← Modelo de productos
│   │   ├── categoriaModel.js                       ← Modelo de categoría
│   │   ├── aromaModel.js                           ← Modelo de aroma
│   │   ├── colorModel.js                           ← Modelo de color
│   │   └── usuarioModel.js                         ← Modelo de usuario
│   └── middleware/                                 ← Funciones intermedias
│       ├── authMiddleware.js                       ← Verifica usuario logueado
│       ├── optionalAuth.js                         ← Token opcional (permite invitados)
│       ├── adminMiddleware.js                      ← Verifica que el usuario sea admin
│       └── upload.js                               ← Procesa imágenes con multer
├── .env                                            ← Variables de entorno (NO se sube)
├── .env.example                                    ← Plantilla de variables
└── package.json                                    ← Dependencias y scripts
```

### ¿Qué hace cada carpeta?

**`routes/`** — Define qué URLs existen y qué función se ejecuta cuando alguien las llama.

**`controllers/`** — Contiene la lógica de negocio de cada acción.

**`models/`** — Contiene las consultas SQL (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).

**`middleware/`** — Funciones que se ejecutan antes de llegar a la ruta, por ejemplo autenticación, permisos o tratamiento de archivos.

**`services/`** — Encapsula integraciones con servicios externos como Resend y PayPal.

---

## 5. Guía para el Frontend (React)

> 🎯 Esta sección está pensada para el desarrollador del frontend en React. Aquí encontrarás la URL base, cómo autenticarte, cómo trabajar con imágenes, cómo consumir las rutas normales y cómo integrar el checkout de PayPal.

### URL base

```text
http://localhost:3000/api
```

> En producción, la URL base cambiará. Úsala como variable de entorno en React:  
> `VITE_API_URL=https://tu-dominio/api`

---

### 🔑 Cómo funciona el token JWT

El **JWT (JSON Web Token)** es el mecanismo que usa la API para saber quién eres y qué puedes hacer. Funciona así:

1. El usuario hace **login** y el backend genera un token firmado con una clave secreta.
2. El frontend **guarda el token** y lo envía en cada petición que lo requiera.
3. El backend **verifica el token** en cada petición protegida.
4. El token **expira en 7 días** y, cuando expira, el usuario debe volver a iniciar sesión.

#### ¿Dónde guardar el token en React?

Guárdalo en memoria mediante un **Context de React** combinado con `localStorage` para persistir la sesión entre recargas.

```jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (tokenRecibido, userRecibido) => {
    setToken(tokenRecibido);
    setUser(userRecibido);
    localStorage.setItem("token", tokenRecibido);
    localStorage.setItem("user", JSON.stringify(userRecibido));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

#### ¿Cómo incluir el token en las peticiones?

Para peticiones JSON normales puedes usar un helper `apiFetch`. Pero para productos con imágenes **no uses un helper que fuerce `Content-Type: application/json`**.

```js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  return res;
};
```

> ⚠️ Para `POST /api/productos` y `PUT /api/productos/:id`, haz `fetch` manual con `FormData` y **sin** poner `Content-Type` a mano.

---

### 🛍️ Rutas de Productos

#### Cómo funcionan las imágenes

Los productos pueden tener **múltiples imágenes** almacenadas en base de datos como binario (`BYTEA`). El sistema funciona así:

- En los **listados** (`GET /api/productos`, por categoría, color o aroma), cada producto devuelve un campo `imagen_id` con el ID de su **primera imagen** (orden `0`). Si no tiene imágenes, devuelve `null`.
- En el **detalle** (`GET /api/productos/:id`), se devuelve un array `imagenes` con el ID y el orden de **todas las imágenes** del producto.
- Las imágenes **no viajan dentro del JSON del producto**. Se sirven desde un endpoint específico usando su ID.
- El frontend debe renderizarlas con una URL como `http://localhost:3000/api/productos/imagen/:imagenId`.

**Ejemplo en React — listado:**

```jsx
<img
  src={
    producto.imagen_id
      ? `http://localhost:3000/api/productos/imagen/${producto.imagen_id}`
      : "/placeholder.jpg"
  }
  alt={producto.nombre}
/>
```

**Ejemplo en React — detalle:**

```jsx
{
  producto.imagenes.map((img) => (
    <img
      key={img.id}
      src={`http://localhost:3000/api/productos/imagen/${img.id}`}
      alt={producto.nombre}
    />
  ));
}
```

### Catálogo de productos — paginación y ordenación

Los listados de productos ya **no deben asumirse como cargas completas**. El frontend debe trabajar con paginación mediante query params, de forma que cada petición pueda pedir una página concreta y un número máximo de elementos por página.

#### Query params disponibles en listados

Las rutas de listado aceptan estos parámetros opcionales:

- `page`: número de página, empezando en `1`.
- `limit`: cantidad máxima de productos a devolver. El valor recomendado por defecto es `15`.
- `sort`: criterio de ordenación del catálogo.

En caso de no introducir ningún parámetro los valores por defecto serán:

| Parámetro | Valor    |
| --------- | -------- |
| `page`    | `1`      |
| `limit`   | `15`     |
| `sort`    | `nuevos` |

#### Valores admitidos en `sort`

- `nuevos` → ordena por productos más recientes primero (`id DESC`).
- `oferta` → ordena por mayor descuento primero (`oferta DESC`) y, en empate, por `precio_oferta ASC`.
- `precio_asc` → ordena por `precio_oferta` de menor a mayor.
- `precio_desc` → ordena por `precio_oferta` de mayor a menor.

> Importante: el campo usado para comparar precios en el catálogo es siempre `precio_oferta`. Cuando un producto no tiene descuento, `precio_oferta` coincide con el precio normal.

#### Ejemplos de uso

```http
GET /api/productos?page=1&limit=15&sort=nuevos
GET /api/productos?page=2&limit=15&sort=oferta
GET /api/productos/categoria/3?page=1&limit=15&sort=precio_asc
GET /api/productos/color/4?page=1&limit=15&sort=precio_desc
GET /api/productos/aroma/2?page=3&limit=15&sort=nuevos
```

#### Qué debe hacer el frontend

- Mantener el estado de `page`, `limit` y `sort` en la vista de catálogo.
- Rehacer la petición cuando cambie la página, el filtro o el orden.
- No asumir que `GET /api/productos` devuelve todos los productos existentes.
- Usar `imagen_id` para pintar la imagen preview de cada tarjeta.

#### Ejemplo en React

```js
const cargarProductos = async ({
  page = 1,
  limit = 15,
  sort = "nuevos",
} = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort,
  });

  const res = await fetch(`${BASE_URL}/productos?${params.toString()}`);
  if (!res.ok) throw new Error("Error al cargar productos");
  return res.json();
};
```

### Campo `oferta` y precio mostrado

El campo `oferta` **no es un booleano**. Representa el porcentaje de descuento del producto.

#### Cómo interpretarlo en frontend

- `oferta = 0` → producto sin descuento.
- `oferta > 0` → producto con descuento.
- El precio que debe mostrarse como principal en listados ordenables es `precio_oferta`.
- El precio original (`precio`) puede mostrarse tachado si `oferta > 0`.

#### Ejemplo de renderizado

```jsx
<div className="product-price-block">
  {Number(producto.oferta) > 0 ? (
    <>
      <span className="price-original">{producto.precio} €</span>
      <span className="price-final">{producto.precio_oferta} €</span>
      <span className="discount-badge">-{producto.oferta}%</span>
    </>
  ) : (
    <span className="price-final">{producto.precio_oferta} €</span>
  )}
</div>
```

### Crear producto con imágenes

La ruta de creación espera `multipart/form-data`.

```http
POST /api/productos
```

**Campos que puede enviar el frontend:**

- `nombre`
- `descripcion`
- `precio`
- `stock`
- `categoria`
- `aromas` (uno o varios)
- `colores` (uno o varios)
- `imagenes` (uno o varios archivos)

**Ejemplo de `FormData`:**

```jsx
const formData = new FormData();
formData.append("nombre", nombre);
formData.append("descripcion", descripcion);
formData.append("precio", precio);
formData.append("stock", stock);
formData.append("categoria", categoria);

aromas.forEach((idAroma) => formData.append("aromas", idAroma));
colores.forEach((idColor) => formData.append("colores", idColor));
imagenes.forEach((archivo) => formData.append("imagenes", archivo));

await fetch("http://localhost:3000/api/productos", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

**Orden al crear:**

- La primera imagen enviada se guarda con `orden = 0`.
- La segunda con `orden = 1`.
- La tercera con `orden = 2`.
- Y así sucesivamente.

Esto significa que **el orden de los archivos en el `FormData` importa**.

### Actualizar producto con imágenes — lógica actual

La actualización de productos funciona enviando el **estado final completo del carrusel** en un campo llamado `imagenesConfig`.

```http
PUT /api/productos/:id
```

#### Qué hace el backend

Al recibir el `PUT`, el backend hace esto:

- Actualiza los datos normales del producto.
- Si recibe `aromas`, borra los anteriores y deja exactamente los enviados.
- Si recibe `colores`, borra los anteriores y deja exactamente los enviados.
- Si recibe `imagenesConfig`, interpreta que ese array representa el **estado final exacto del carrusel**.
- Borra las imágenes antiguas que ya no estén en `imagenesConfig`.
- Reordena las imágenes existentes que sigan presentes.
- Inserta las imágenes nuevas en el orden indicado.

#### Qué es `imagenesConfig`

`imagenesConfig` es un JSON enviado como texto dentro del `FormData`.

Cada elemento del array puede ser de dos tipos:

**Imagen ya existente en base de datos:**

```json
{ "tipo": "existente", "id": 12, "orden": 0 }
```

**Imagen nueva que todavía no existe en base de datos:**

```json
{ "tipo": "nueva", "orden": 1 }
```

#### Regla clave para frontend

El array `imagenesConfig` debe incluir **todas las posiciones finales** del carrusel:

- las imágenes existentes que se conservan,
- las nuevas que se añaden,
- y el `orden` final de cada una.

Si una imagen existente **no aparece** en `imagenesConfig`, el backend la interpreta como eliminada y la borra.

#### Relación entre `imagenesConfig` y `req.files`

Las entradas con `tipo: "nueva"` se emparejan con los archivos enviados en `imagenes` **por orden**.

Ejemplo:

```json
[
  { "tipo": "existente", "id": 11, "orden": 0 },
  { "tipo": "nueva", "orden": 1 },
  { "tipo": "existente", "id": 12, "orden": 2 },
  { "tipo": "nueva", "orden": 3 }
]
```

Entonces en `FormData` debes enviar exactamente **dos** archivos en `imagenes`:

- el primer archivo ocupará la posición de la primera entrada `tipo: "nueva"` → orden `1`
- el segundo archivo ocupará la posición de la segunda entrada `tipo: "nueva"` → orden `3`

Si mandas más o menos archivos que entradas `tipo: "nueva"`, el `PUT` fallará o dejará el resultado mal montado.

### Ejemplo 1 — conservar 2 imágenes y sustituir la tercera

Supón que el producto tiene actualmente:

- imagen `11`, orden `0`
- imagen `12`, orden `1`
- imagen `13`, orden `2`

Y el usuario quiere dejar:

- imagen `11`, orden `0`
- imagen `12`, orden `1`
- una nueva imagen en orden `2`

**Entonces el frontend debe enviar:**

```jsx
const formData = new FormData();

formData.append("nombre", nombre);
formData.append("descripcion", descripcion);
formData.append("precio", precio);
formData.append("stock", stock);
formData.append("oferta", oferta);
formData.append("precio_oferta", precioOferta);
formData.append("categoria", categoria);

aromas.forEach((id) => formData.append("aromas", id));
colores.forEach((id) => formData.append("colores", id));

formData.append(
  "imagenesConfig",
  JSON.stringify([
    { tipo: "existente", id: 11, orden: 0 },
    { tipo: "existente", id: 12, orden: 1 },
    { tipo: "nueva", orden: 2 },
  ]),
);

formData.append("imagenes", archivoNuevaImagen);

await fetch(`http://localhost:3000/api/productos/${idProducto}`, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

**Resultado esperado:**

- se conservan `11` y `12`
- se elimina `13`
- se inserta la nueva imagen en orden `2`

### Ejemplo 2 — cambiar la imagen del medio

Estado actual:

- `11` → orden `0`
- `12` → orden `1`
- `13` → orden `2`

Estado final deseado:

- `11` → orden `0`
- nueva imagen → orden `1`
- `13` → orden `2`

**`imagenesConfig`:**

```json
[
  { "tipo": "existente", "id": 11, "orden": 0 },
  { "tipo": "nueva", "orden": 1 },
  { "tipo": "existente", "id": 13, "orden": 2 }
]
```

Y en `imagenes` se manda **solo un archivo**, que será la nueva imagen de la posición 1.

### Ejemplo 3 — reordenar imágenes sin subir ninguna nueva

Si el usuario solo cambia el orden del carrusel y no sube ninguna imagen nueva, el frontend debe enviar `imagenesConfig` pero **ningún archivo** en `imagenes`.

```json
[
  { "tipo": "existente", "id": 15, "orden": 0 },
  { "tipo": "existente", "id": 11, "orden": 1 },
  { "tipo": "existente", "id": 12, "orden": 2 }
]
```

### Ejemplo 4 — añadir una imagen nueva sin borrar las anteriores

Si el producto tiene dos imágenes actuales y el usuario añade una tercera nueva al final:

```json
[
  { "tipo": "existente", "id": 21, "orden": 0 },
  { "tipo": "existente", "id": 22, "orden": 1 },
  { "tipo": "nueva", "orden": 2 }
]
```

Y en `imagenes` se manda un único archivo.

### Errores típicos que debe evitar frontend

- **No mandar `imagenesConfig` completo**: si falta una imagen existente que el usuario quería conservar, el backend la borrará.
- **Mandar IDs existentes como si fueran nuevas**: las nuevas no llevan `id`.
- **Mandar menos o más archivos que entradas `tipo: 'nueva'`**.
- **Mandar `Content-Type: application/json`** en vez de usar `FormData`.
- **No respetar el orden del array** o construirlo mal después de drag & drop.

### Recomendación de implementación en React

Lo más cómodo en frontend es mantener un estado del carrusel con una estructura similar a esta:

```js
const [imagenesCarrusel, setImagenesCarrusel] = useState([
  { tipo: "existente", id: 11, orden: 0, preview: "..." },
  { tipo: "existente", id: 12, orden: 1, preview: "..." },
  { tipo: "nueva", file: archivo, orden: 2, preview: "blob:..." },
]);
```

Antes de hacer submit:

1. recalculas el `orden` según la posición actual,
2. construyes `imagenesConfig` sin `preview` ni `file`,
3. extraes los `file` de las imágenes nuevas en el mismo orden.

**Ejemplo:**

```js
const imagenesOrdenadas = imagenesCarrusel.map((img, index) => ({
  ...img,
  orden: index,
}));

const imagenesConfig = imagenesOrdenadas.map((img) => {
  if (img.tipo === "existente") {
    return { tipo: "existente", id: img.id, orden: img.orden };
  }
  return { tipo: "nueva", orden: img.orden };
});

const imagenesNuevas = imagenesOrdenadas
  .filter((img) => img.tipo === "nueva")
  .map((img) => img.file);
```

Luego:

```js
const formData = new FormData();

formData.append("nombre", nombre);
formData.append("descripcion", descripcion);
formData.append("precio", precio);
formData.append("stock", stock);
formData.append("oferta", oferta);
formData.append("precio_oferta", precioOferta);
formData.append("categoria", categoria);

aromas.forEach((id) => formData.append("aromas", id));
colores.forEach((id) => formData.append("colores", id));

formData.append("imagenesConfig", JSON.stringify(imagenesConfig));
imagenesNuevas.forEach((file) => formData.append("imagenes", file));
```

### Qué devolverá el backend después del PUT

El backend devuelve el objeto del producto actualizado. Después del `PUT`, el frontend debería hacer una de estas dos cosas:

- volver a pedir `GET /api/productos/:id` para refrescar aromas, colores e imágenes reales,
- o reconstruir el estado local si ya tiene todos los datos.

La opción más segura es volver a pedir el detalle del producto.

---

#### `GET /api/productos` — Listado del catálogo

No requiere token. Devuelve una **página del catálogo** con `imagen_id` de la primera imagen.

**Query params opcionales:**

| Parámetro | Tipo   | Default  | Descripción                           |
| --------- | ------ | -------- | ------------------------------------- |
| `page`    | number | `1`      | Página solicitada                     |
| `limit`   | number | `15`     | Número máximo de productos por página |
| `sort`    | string | `nuevos` | Orden del catálogo                    |

**Valores permitidos en `sort`:** `nuevos`, `oferta`, `precio_asc`, `precio_desc`

**Ejemplo:**

```http
GET /api/productos?page=1&limit=15&sort=oferta
```

**Respuesta `200`:**

```json
[
  {
    "id": 1,
    "nombre": "Vela de lavanda",
    "descripcion": "Vela artesanal con aroma a lavanda",
    "precio": "12.50",
    "stock": 30,
    "oferta": 20,
    "precio_oferta": "10.00",
    "categoria_id": 2,
    "categoria_nombre": "Aromaterapia",
    "imagen_id": 3
  }
]
```

#### `GET /api/productos/:id` — Detalle de un producto

No requiere token. Devuelve todos los datos del producto, incluyendo aromas, colores y todas sus imágenes.

```json
{
  "id": 1,
  "nombre": "Vela de lavanda",
  "descripcion": "Vela artesanal con aroma a lavanda",
  "precio": "12.50",
  "stock": 30,
  "oferta": 20,
  "precio_oferta": "10.00",
  "categoria_id": 2,
  "categoria_nombre": "Aromaterapia",
  "aromas": [
    { "id": 1, "nombre": "Lavanda" },
    { "id": 3, "nombre": "Vainilla" }
  ],
  "colores": [
    { "id": 1, "nombre": "Morado" },
    { "id": 2, "nombre": "Blanco" }
  ],
  "imagenes": [
    { "id": 3, "orden": 0 },
    { "id": 4, "orden": 1 },
    { "id": 5, "orden": 2 }
  ]
}
```

#### `GET /api/productos/categoria/:id`

No requiere token. Filtra productos por categoría con `imagen_id`.

**Query params opcionales:** `page`, `limit`, `sort`

#### `GET /api/productos/color/:id`

No requiere token. Filtra productos por color con `imagen_id`.

**Query params opcionales:** `page`, `limit`, `sort`

#### `GET /api/productos/aroma/:id`

No requiere token. Filtra productos por aroma con `imagen_id`.

**Query params opcionales:** `page`, `limit`, `sort`

#### `GET /api/productos/imagen/:imagenId`

No requiere token. Devuelve directamente el binario de una imagen. Se usa en el `src` del `<img>`.

#### `POST /api/productos` — Crear producto _(solo admin)_

🔒 Requiere token de administrador.

**Body:** `multipart/form-data`

| Campo         | Tipo     | Obligatorio |
| ------------- | -------- | :---------: |
| `nombre`      | string   |     ✅      |
| `descripcion` | string   |     ✅      |
| `precio`      | number   |     ✅      |
| `stock`       | number   |     ✅      |
| `categoria`   | number   |     ✅      |
| `aromas`      | number[] |     ❌      |
| `colores`     | number[] |     ❌      |
| `imagenes`    | File[]   |     ❌      |

#### `PUT /api/productos/:id` — Actualizar producto _(solo admin)_

🔒 Requiere token de administrador.

**Body:** `multipart/form-data`

| Campo            | Tipo          | Obligatorio |
| ---------------- | ------------- | :---------: |
| `nombre`         | string        |     ✅      |
| `descripcion`    | string        |     ✅      |
| `precio`         | number        |     ✅      |
| `stock`          | number        |     ✅      |
| `oferta`         | number        |     ✅      |
| `precio_oferta`  | number        |     ✅      |
| `categoria`      | number        |     ✅      |
| `aromas`         | number[]      |     ❌      |
| `colores`        | number[]      |     ❌      |
| `imagenesConfig` | string (JSON) |     ❌      |
| `imagenes`       | File[]        |     ❌      |

> `oferta` representa el porcentaje de descuento del producto. Ejemplos: `0` = sin descuento, `20` = 20% de descuento.

#### `DELETE /api/productos/:id` — Eliminar producto _(solo admin)_

🔒 Requiere token de administrador.

**Respuesta:**

```json
{ "mensaje": "Producto eliminado correctamente" }
```

---

### 🎨 Rutas de Categorías

#### `GET /api/categoria` — Listar todas las categorías

No requiere token. Devuelve todas las categorías disponibles.

**Respuesta `200`:**

```json
[
  { "id": 1, "nombre_categoria": "Velas" },
  { "id": 2, "nombre_categoria": "Aromaterapia" },
  { "id": 3, "nombre_categoria": "Accesorios" }
]
```

#### `POST /api/categoria` — Crear categoría _(solo admin)_

🔒 **Requiere token de administrador** (`tipo: 1`).

| Campo              | Tipo     | ¿Obligatorio? |
| ------------------ | -------- | :-----------: |
| `nombre_categoria` | `string` |      ✅       |

**Respuesta exitosa `201`:** el objeto de la categoría recién creada.

#### `PUT /api/categoria/:id` — Modificar categoría _(solo admin)_

🔒 **Requiere token de administrador** (`tipo: 1`).

| Campo              | Tipo     | ¿Obligatorio? |
| ------------------ | -------- | :-----------: |
| `nombre_categoria` | `string` |      ✅       |

**Respuesta exitosa `200`:** el objeto de la categoría actualizada.

#### `DELETE /api/categoria/:id` — Eliminar categoría _(solo admin)_

🔒 **Requiere token de administrador** (`tipo: 1`).

```json
{ "mensaje": "Categoría eliminada correctamente" }
```

> ⚠️ Si hay productos asignados a esta categoría, la eliminación puede fallar por restricción de clave foránea.

---

### 🌸 Rutas de Aromas

#### `GET /api/aroma` — Listar todos los aromas

No requiere token.

```json
[
  { "id": 1, "nombre_aroma": "Lavanda" },
  { "id": 2, "nombre_aroma": "Vainilla" }
]
```

#### `POST /api/aroma` — Crear aroma _(solo admin)_

🔒 **Requiere token de administrador** (`tipo: 1`).

| Campo          | Tipo     | ¿Obligatorio? |
| -------------- | -------- | :-----------: |
| `nombre_aroma` | `string` |      ✅       |

**Respuesta exitosa `201`:** el objeto del aroma recién creado.

#### `PUT /api/aroma/:id` — Modificar aroma _(solo admin)_

🔒 **Requiere token de administrador** (`tipo: 1`).

| Campo          | Tipo     | ¿Obligatorio? |
| -------------- | -------- | :-----------: |
| `nombre_aroma` | `string` |      ✅       |

#### `DELETE /api/aroma/:id` — Eliminar aroma _(solo admin)_

🔒 **Requiere token de administrador** (`tipo: 1`).

> Al eliminar un aroma, sus registros en `producto_aroma` se borran automáticamente (CASCADE). Los productos que lo tenían asignado simplemente dejan de tener ese aroma — el producto no se elimina.

```json
{ "mensaje": "Aroma eliminado correctamente" }
```

---

### 🎨 Rutas de Colores

#### `GET /api/color` — Listar todos los colores

No requiere token.

```json
[
  { "id": 1, "color": "Blanco" },
  { "id": 2, "color": "Rosa" }
]
```

#### `POST /api/color` — Crear color _(solo admin)_

🔒 **Requiere token de administrador** (`tipo: 1`).

| Campo   | Tipo     | ¿Obligatorio? |
| ------- | -------- | :-----------: |
| `color` | `string` |      ✅       |

**Respuesta exitosa `201`:** el objeto del color recién creado.

#### `PUT /api/color/:id` — Modificar color _(solo admin)_

🔒 **Requiere token de administrador** (`tipo: 1`).

| Campo   | Tipo     | ¿Obligatorio? |
| ------- | -------- | :-----------: |
| `color` | `string` |      ✅       |

#### `DELETE /api/color/:id` — Eliminar color _(solo admin)_

🔒 **Requiere token de administrador** (`tipo: 1`).

> Al eliminar un color, sus registros en `producto_color` se borran automáticamente (CASCADE).

```json
{ "mensaje": "Color eliminado correctamente" }
```

---

### 👤 Rutas de Usuarios

### Perfil propio del usuario autenticado _(requiere login)_

#### `GET /api/usuario/me` — Obtener perfil

Devuelve todos los datos del usuario autenticado excepto la contraseña y el tipo.

```json
{
  "id": 22,
  "nombre": "Manuel",
  "correo": "manuel@email.com",
  "telefono": "612345678",
  "calle": "Calle Mayor",
  "numero": 12,
  "cp": 28000,
  "ciudad": "Madrid",
  "provincia": "Madrid",
  "piso": "2A"
}
```

#### `PUT /api/usuario/me` — Modificar perfil

Actualiza los datos del usuario autenticado. No permite cambiar correo, contraseña, id ni tipo.

```json
{
  "nombre": "Manuel",
  "telefono": "612345678",
  "calle": "Calle Mayor",
  "numero": 12,
  "cp": 28000,
  "ciudad": "Madrid",
  "provincia": "Madrid",
  "piso": "2A"
}
```

> ⚠️ `numero` y `cp` deben enviarse como **número**, no como string.

#### `PUT /api/usuario/me/password` — Cambiar contraseña

```json
{
  "passwordActual": "contraseña_actual",
  "passwordNueva": "contraseña_nueva"
}
```

**Errores posibles:**

| Código | Descripción                         |
| ------ | ----------------------------------- |
| `400`  | Faltan campos obligatorios          |
| `401`  | La contraseña actual no es correcta |
| `404`  | Usuario no encontrado               |

#### `DELETE /api/usuario/me` — Eliminar cuenta propia

Requiere confirmar la contraseña. Si el usuario es el único administrador, la operación es rechazada.

```json
{ "password": "tu_contraseña" }
```

### Gestión de usuario para el administrador _(solo admin)_

#### `GET /api/usuario` — Listar todos los usuarios

🔒 **Requiere token de administrador** (`tipo: 1`).

#### `GET /api/usuario/:id` — Obtener perfil completo de un usuario _(solo admin)_

🔒 **Requiere token de administrador** (`tipo: 1`).

Devuelve el perfil completo del usuario (incluyendo dirección, teléfono y tipo). Útil desde el panel de administración para consultar los datos de un cliente a partir del `id_usuario` de un pedido personalizado.

**Respuesta `200`:**

```json
{
  "id": 5,
  "tipo": 2,
  "nombre": "Laura",
  "correo": "laura@email.com",
  "telefono": "611222333",
  "calle": "Gran Vía",
  "numero": 10,
  "cp": 28013,
  "ciudad": "Madrid",
  "provincia": "Madrid",
  "piso": "3B"
}
```

**Errores posibles:**

| Código | Descripción           |
| ------ | --------------------- |
| `404`  | Usuario no encontrado |

#### `PUT /api/usuario/:id` — Cambiar tipo de usuario _(toggle)_

🔒 **Requiere token de administrador** (`tipo: 1`).

| Campo  | Tipo     | ¿Obligatorio? | Descripción                                                 |
| ------ | -------- | :-----------: | ----------------------------------------------------------- |
| `tipo` | `number` |      ✅       | Tipo actual del usuario (`1` = admin, `2` = usuario normal) |

> ℹ️ Esta API funciona como un **toggle**: si mandas el tipo actual, el backend lo invierte automáticamente.

#### `DELETE /api/usuario/:id` — Eliminar usuario

🔒 **Requiere token de administrador** (`tipo: 1`).

> ⚠️ **Protección de último administrador:** si el usuario a eliminar es el único admin, la eliminación es rechazada con `400`.

---

### 🛒 Rutas de Pedidos

#### Funcionamiento general

Un pedido se compone de dos partes que se crean en la misma petición:

- **`pedido`** — datos del comprador (nombre, correo, teléfono, dirección) y el total calculado automáticamente.
- **`detalle_pedido`** — una fila por cada producto del carrito, con su cantidad y precio en el momento de la compra.

El usuario **no necesita estar logueado** para hacer un pedido. Si tiene sesión iniciada, el pedido se asocia a su cuenta (`id_usuario`); si no, se guarda con `id_usuario = null`.

#### `POST /api/pedidos` — Crear pedido _(ELIMINADO)_

#### `PATCH /api/pedidos/:id/estado` — Cambiar estado _(solo admin)_

🔒 Requiere token de administrador.

| Campo    | Tipo   | ¿Obligatorio? | Descripción             |
| -------- | ------ | :-----------: | ----------------------- |
| `estado` | string |      ✅       | Nuevo estado del pedido |

**Valores válidos:** `pendiente`, `en_elaboracion`, `enviado`, `entregado`, `cancelado`

**Errores posibles:**

| Código | Motivo                            |
| ------ | --------------------------------- |
| `400`  | Falta el campo `estado`           |
| `400`  | El valor de `estado` no es válido |
| `404`  | Pedido no encontrado              |

#### `GET /api/pedidos/me` — Mis pedidos _(usuario logueado)_

🔒 Requiere token de usuario logueado.

Devuelve todos los pedidos del usuario autenticado, ordenados del más reciente al más antiguo.

**Respuesta `200`:**

```json
[
  {
    "id": 14,
    "total": "84.98",
    "direccion": {
      "calle": "Calle Mayor",
      "numero": 5,
      "cp": 28001,
      "ciudad": "Madrid",
      "provincia": "Madrid",
      "piso": "2A"
    },
    "nombre": "Manuel",
    "correo": "manuel@email.com",
    "telefono": "600000000",
    "fecha_creacion": "2026-04-20T10:00:00.000Z"
  }
]
```

**Ejemplo en React:**

```js
const obtenerMisPedidos = async () => {
  const res = await apiFetch("/pedidos/me");
  if (!res.ok) throw new Error("Error al obtener pedidos");
  return res.json();
};
```

#### `GET /api/pedidos/:id` — Detalle de un pedido _(usuario logueado)_

🔒 Requiere token de usuario logueado.

Devuelve el pedido completo con el detalle de todos sus productos.

**Respuesta `200`:**

```json
{
  "id": 14,
  "total": "84.98",
  "direccion": {
    "calle": "Calle Mayor",
    "numero": 5,
    "cp": 28001,
    "ciudad": "Madrid",
    "provincia": "Madrid",
    "piso": "2A"
  },
  "nombre": "Manuel",
  "correo": "manuel@email.com",
  "telefono": "600000000",
  "fecha_creacion": "2026-04-20T10:00:00.000Z",
  "productos": [
    {
      "id_producto": 1,
      "nombre": "Vela de lavanda",
      "cantidad": 2,
      "precio": "19.99",
      "subtotal": "39.98"
    },
    {
      "id_producto": 3,
      "nombre": "Vela de vainilla",
      "cantidad": 1,
      "precio": "45.00",
      "subtotal": "45.00"
    }
  ]
}
```

#### `GET /api/pedidos` — Todos los pedidos _(solo admin)_

🔒 Requiere token de administrador.

Devuelve todos los pedidos del sistema ordenados del más reciente al más antiguo.

#### `DELETE /api/pedidos/:id` — Eliminar pedido _(solo admin)_

🔒 Requiere token de administrador.

Al eliminar un pedido, sus `detalle_pedido` se borran automáticamente (CASCADE).

```json
{ "mensaje": "Pedido eliminado correctamente" }
```

---

### ✏️ Rutas de Pedidos Personalizados

#### Funcionamiento general

Un pedido personalizado es una **solicitud** del cliente para un producto a medida. El cliente puede elegir un producto existente como referencia y añadir una descripción con los cambios o detalles que quiera. Al igual que los pedidos normales, **no requiere estar logueado**.

#### `POST /api/pedidoper` — Crear pedido personalizado _(público)_

No requiere token. Si se envía token, el pedido se vincula al usuario.

**Body (raw JSON):**

| Campo         | Tipo   | Obligatorio | Descripción                                 |
| ------------- | ------ | :---------: | ------------------------------------------- |
| `descripcion` | string |     ✅      | Descripción detallada de la personalización |
| `nombre`      | string |     ✅      | Nombre del solicitante                      |
| `correo`      | string |     ✅      | Correo del solicitante                      |
| `telefono`    | string |     ❌      | Teléfono del solicitante                    |
| `id_producto` | number |     ❌      | ID del producto que se usa como referencia  |
| `cantidad`    | number |     ❌      | Cantidad deseada                            |

**Ejemplo de body:**

```json
{
  "descripcion": "Quiero una vela igual que la de lavanda pero en color verde y con aroma a menta",
  "nombre": "Laura",
  "correo": "laura@email.com",
  "telefono": "611222333",
  "id_producto": 1,
  "cantidad": 2
}
```

**Respuesta exitosa `201`:** el objeto del pedido personalizado creado.

**Errores posibles:**

| Código | Motivo                                    |
| ------ | ----------------------------------------- |
| `400`  | Faltan `descripcion`, `nombre` o `correo` |
| `500`  | Error interno del servidor                |

**Ejemplo en React:**

```js
const enviarPedidoPersonalizado = async (datos) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/pedidoper`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(datos),
  });

  if (!res.ok) throw new Error("Error al enviar el pedido personalizado");
  return res.json();
};
```

#### Estados posibles de un pedido personalizado

| Estado       | Descripción                                |
| ------------ | ------------------------------------------ |
| `pendiente`  | Solicitud recibida, pendiente de revisión  |
| `aceptado`   | El administrador ha aceptado la solicitud  |
| `denegado`   | El administrador ha denegado la solicitud  |
| `completado` | El pedido personalizado ha sido completado |

#### `PATCH /api/pedidoper/:id/estado` — Cambiar estado _(solo admin)_

🔒 Requiere token de administrador.

| Campo    | Tipo   | ¿Obligatorio? | Descripción                           |
| -------- | ------ | :-----------: | ------------------------------------- |
| `estado` | string |      ✅       | Nuevo estado del pedido personalizado |

**Valores válidos:** `pendiente`, `aceptado`, `denegado`, `completado`

**Errores posibles:**

| Código | Motivo                             |
| ------ | ---------------------------------- |
| `400`  | Falta el campo `estado`            |
| `400`  | El valor de `estado` no es válido  |
| `404`  | Pedido personalizado no encontrado |

#### `GET /api/pedidoper/me` — Mis pedidos personalizados _(usuario logueado)_

🔒 Requiere token de usuario logueado.

Devuelve todos los pedidos personalizados del usuario autenticado.

#### `GET /api/pedidoper/:id` — Detalle _(usuario logueado)_

🔒 Requiere token de usuario logueado.

Devuelve un pedido personalizado concreto con el nombre del producto de referencia.

#### `GET /api/pedidoper` — Todos los pedidos personalizados _(solo admin)_

🔒 Requiere token de administrador.

#### `DELETE /api/pedidoper/:id` — Eliminar pedido personalizado _(solo admin)_

🔒 Requiere token de administrador.

```json
{ "mensaje": "Pedido personalizado eliminado correctamente" }
```

---

### ⚠️ Notas importantes para el frontend

1. **CORS**: el backend solo acepta peticiones del dominio configurado en `CLIENT_URL`.
2. **Productos con imágenes**: `POST /api/productos` y `PUT /api/productos/:id` usan `FormData`, no JSON.
3. **No pongas `Content-Type` manualmente** al usar `FormData`.
4. **Token expirado**: si recibes `401` o `403`, redirige al login y limpia sesión local.
5. **Aromas y colores en PUT**: si mandas el campo, reemplazas todo ese grupo; si no lo mandas, no cambia.
6. **Imágenes en PUT**: si mandas `imagenesConfig`, debes mandar el estado final completo del carrusel.
7. **Si falta una imagen existente dentro de `imagenesConfig`**, el backend la borra.
8. **Las imágenes nuevas se emparejan con `imagenes` por orden de aparición**.
9. **Tras guardar un producto**, es recomendable volver a pedir `GET /api/productos/:id` para refrescar los datos reales.
10. **`oferta` es un porcentaje**, no un booleano.
11. **Para ordenar por precio**, usa siempre `precio_oferta` como referencia visual y lógica.
12. **Los listados usan paginación**: el frontend no debe asumir que el catálogo completo está cargado en memoria.
13. **Pedidos sin login**: `POST /api/pedidos` y `POST /api/pedidoper` funcionan sin token. Si el usuario está logueado, envía el token igualmente para vincular el pedido a su cuenta.
14. **El precio en los pedidos es un snapshot**: usa siempre `precio_oferta` del producto en el momento de añadirlo al carrito.
15. **La dirección de envío** se envía como campos sueltos en el body (no como objeto anidado). El backend la convierte al tipo compuesto de PostgreSQL.
16. **Emails automáticos**: el backend envía emails al crear un pedido normal, un pedido personalizado y al solicitar recuperación de contraseña. En desarrollo solo se puede enviar al correo registrado en Resend.
17. **Recuperación de contraseña**: el código caduca en **15 minutos** y solo puede usarse una vez. Si el usuario solicita otro código, el anterior queda invalidado automáticamente.

---

### 📧 Emails automáticos con Resend

El backend envía emails automáticamente en tres situaciones:

| Evento                     | Destinatario    | Descripción                                              |
| -------------------------- | --------------- | -------------------------------------------------------- |
| Recuperación de contraseña | Cliente         | Email con código de 6 dígitos válido 15 minutos          |
| Pedido nuevo               | Cliente + Admin | Confirmación con resumen de productos, total y dirección |
| Pedido personalizado nuevo | Admin           | Aviso con los datos del cliente y la descripción         |

> ⚠️ **En desarrollo**, Resend solo permite enviar emails al correo con el que os registrasteis en su panel (`CORREO_ADMIN`). Para enviar a cualquier destinatario necesitáis verificar un dominio en [resend.com/domains](https://resend.com/domains).

### 🔑 Recuperación de contraseña

El flujo tiene dos pasos:

**Paso 1 — Solicitar código:**

```http
POST /api/auth/recuperar
Content-Type: application/json

{
  "correo": "usuario@email.com"
}
```

Respuesta `200`:

```json
{ "mensaje": "Si el correo existe, recibirás las instrucciones" }
```

> La respuesta es siempre la misma exista o no el correo, para no revelar qué usuarios están registrados.

**Paso 2 — Verificar código y cambiar contraseña:**

```http
POST /api/auth/recuperar/verificar
Content-Type: application/json

{
  "correo": "usuario@email.com",
  "codigo": "483921",
  "passwordNueva": "nuevaPassword123"
}
```

Respuesta `200`:

```json
{ "mensaje": "Contraseña actualizada correctamente" }
```

**Errores posibles:**

| Código | Motivo                                            |
| ------ | ------------------------------------------------- |
| `400`  | Faltan campos obligatorios                        |
| `400`  | Código inválido o expirado (caduca en 15 minutos) |
| `500`  | Error interno del servidor                        |

**Flujo en React:**

```jsx
// Pantalla 1 — formulario de correo
const solicitarCodigo = async (correo) => {
  await fetch(`${BASE_URL}/auth/recuperar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo }),
  });
  // Navegar a pantalla 2 independientemente de la respuesta
};

// Pantalla 2 — formulario de código + nueva contraseña
const verificarCodigo = async (correo, codigo, passwordNueva) => {
  const res = await fetch(`${BASE_URL}/auth/recuperar/verificar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correo, codigo, passwordNueva }),
  });
  if (!res.ok) throw new Error("Código inválido o expirado");
  // Redirigir al login
};
```

## 6. Pagos online con PayPal

> ℹ️ Para pagos con tarjeta bancaria, ver la sección [Pagos online con Redsys](#7-pagos-online-con-redsys-tpv).

### Arquitectura del flujo

El flujo correcto es este:

```text
Frontend calcula total
        ↓
POST /api/paypal/orders
        ↓
PayPal devuelve orderID
        ↓
El usuario aprueba el popup
        ↓
POST /api/paypal/orders/:orderID/capture
        ↓
El backend captura el pago
        ↓
El backend crea pedido + detalle_pedido
        ↓
El backend guarda id_transaccion y metodo_pago
        ↓
Se envían emails
```

### Rutas nuevas de PayPal

#### `POST /api/paypal/orders`

Crea una orden en PayPal y devuelve el `orderID`.

**Auth:** opcional (`optionalAuth`)  
**Body:**

```json
{
  "amount": "25.00"
}
```

**Respuesta típica:**

```json
{
  "id": "5O190127TN364715T",
  "status": "CREATED"
}
```

> Esta ruta **no crea pedido** en la base de datos. Solo prepara la orden de PayPal.

#### `POST /api/paypal/orders/:orderID/capture`

Captura el pago aprobado y, si PayPal responde correctamente, crea el pedido en la base de datos.

**Auth:** opcional (`optionalAuth`)

**Body:**

```json
{
  "nombre": "Manuel",
  "correo": "manuel@email.com",
  "telefono": "600000000",
  "calle": "Calle Mayor",
  "numero": 5,
  "cp": 28001,
  "ciudad": "Madrid",
  "provincia": "Madrid",
  "piso": "2A",
  "total": "84.98",
  "productos": [
    { "id_producto": 1, "cantidad": 2, "precio": 19.99 },
    { "id_producto": 3, "cantidad": 1, "precio": 45.0 }
  ]
}
```

### Qué hace el backend en `capture`

1. Abre una transacción SQL.
2. Inserta el pedido base.
3. Inserta las líneas en `detalle_pedido`.
4. Captura el pago en PayPal.
5. Verifica que el pago está completado.
6. Verifica que el total cobrado coincide con el total recibido.
7. Actualiza `id_transaccion`.
8. Hace `COMMIT`.
9. Envía emails al cliente y al admin.

Si algo falla, hace `ROLLBACK`.

---

### Implementación en el frontend con PayPal JS SDK

### Paso 1 — Cargar el SDK de PayPal

En React, una forma sencilla es añadir el script desde el HTML o cargarlo dinámicamente.

Ejemplo de script:

```html
<script src="https://www.paypal.com/sdk/js?client-id=TU_CLIENT_ID&currency=EUR"></script>
```

En Vite o React, lo normal es pasar el `client-id` desde una variable de entorno del frontend.

Ejemplo:

```env
VITE_PAYPAL_CLIENT_ID=tu_client_id
VITE_API_URL=http://localhost:3000/api
```

### Paso 2 — Crear el pedido desde el frontend

El frontend calcula el total del carrito y llama a `/api/paypal/orders`.

```js
const crearOrdenPayPal = async (total, token = null) => {
  const res = await fetch(`${BASE_URL}/paypal/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      amount: total.toFixed(2),
    }),
  });

  if (!res.ok) {
    throw new Error("No se pudo crear la orden de PayPal");
  }

  return res.json();
};
```

### Paso 3 — Capturar el pago y crear el pedido

Cuando PayPal llama a `onApprove`, el frontend debe enviar **todos los datos del pedido** al backend.

```js
const capturarOrdenPayPal = async ({
  orderID,
  datosComprador,
  carrito,
  total,
  token = null,
}) => {
  const body = {
    nombre: datosComprador.nombre,
    correo: datosComprador.correo,
    telefono: datosComprador.telefono,
    calle: datosComprador.calle,
    numero: datosComprador.numero,
    cp: datosComprador.cp,
    ciudad: datosComprador.ciudad,
    provincia: datosComprador.provincia,
    piso: datosComprador.piso,
    total: total.toFixed(2),
    productos: carrito.map((item) => ({
      id_producto: item.id,
      cantidad: item.cantidad,
      precio: item.precio_oferta,
    })),
  };

  const res = await fetch(`${BASE_URL}/paypal/orders/${orderID}/capture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("No se pudo capturar el pago");
  }

  return res.json();
};
```

### Ejemplo completo con `paypal.Buttons`

```jsx
import { useEffect, useRef } from "react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function PayPalCheckout({ carrito, datosComprador, total }) {
  const paypalRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!window.paypal || !paypalRef.current) return;

    window.paypal
      .Buttons({
        createOrder: async () => {
          const res = await fetch(`${BASE_URL}/paypal/orders`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              amount: total.toFixed(2),
            }),
          });

          if (!res.ok) {
            throw new Error("Error al crear la orden");
          }

          const order = await res.json();
          return order.id;
        },

        onApprove: async (data) => {
          const res = await fetch(
            `${BASE_URL}/paypal/orders/${data.orderID}/capture`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                nombre: datosComprador.nombre,
                correo: datosComprador.correo,
                telefono: datosComprador.telefono,
                calle: datosComprador.calle,
                numero: datosComprador.numero,
                cp: datosComprador.cp,
                ciudad: datosComprador.ciudad,
                provincia: datosComprador.provincia,
                piso: datosComprador.piso,
                total: total.toFixed(2),
                productos: carrito.map((item) => ({
                  id_producto: item.id,
                  cantidad: item.cantidad,
                  precio: item.precio_oferta,
                })),
              }),
            },
          );

          if (!res.ok) {
            throw new Error("Error al capturar la orden");
          }

          const dataCapture = await res.json();

          console.log("Pedido creado:", dataCapture);
          alert("Pago realizado y pedido creado correctamente");
        },

        onError: (err) => {
          console.error("Error en PayPal:", err);
          alert("Hubo un error con el pago");
        },
      })
      .render(paypalRef.current);
  }, [carrito, datosComprador, total]);

  return <div ref={paypalRef}></div>;
}
```

### Qué debe hacer el frontend antes de renderizar el botón

Antes de mostrar el botón de PayPal, el frontend debe:

- validar que el usuario ha rellenado nombre, correo y dirección,
- validar que el carrito no está vacío,
- calcular el total final,
- decidir si envía token o no, según el usuario esté logueado.

### Qué hacer después de pagar bien

Después de una captura correcta, el frontend debería:

- vaciar el carrito,
- redirigir a una pantalla de confirmación,
- mostrar el `id` del pedido si lo necesita,
- refrescar la lista de pedidos del usuario si está logueado.

---

### Sandbox de PayPal

Para probar sin dinero real:

1. Entrar en [developer.paypal.com](https://developer.paypal.com)
2. Ir a **My Apps & Credentials**
3. Crear o usar una app en **Sandbox**
4. Copiar `PAYPAL_CLIENT_ID` y `PAYPAL_CLIENT_SECRET`
5. Usar cuentas sandbox de comprador y vendedor
6. Mantener `Environment.Sandbox` en `paypalService.js`

Cuando paséis a producción:

- se cambian las credenciales,
- se usa `Environment.Production`,
- y el frontend debe cargar el client ID real.

---

### Comisiones de PayPal

PayPal cobra comisión al **vendedor**, no al cliente.  
No hay que añadir un suplemento al pedido por usar PayPal desde el backend.

El total que el frontend manda y el backend guarda es el total del carrito. La comisión de la pasarela forma parte del coste operativo del negocio.

---

## 7. Pagos online con Redsys (TPV)

### Arquitectura del flujo

```text
Frontend recoge datos del comprador + carrito
        ↓
POST /api/redsys/iniciar
        ↓
Backend crea el pedido en BD (estado 'pendiente')
        ↓
Backend devuelve parámetros firmados (url, Ds_SignatureVersion, Ds_MerchantParameters, Ds_Signature)
        ↓
Frontend construye un formulario POST y redirige al TPV de Redsys
        ↓
El usuario introduce los datos de tarjeta en la página del banco
        ↓
Redsys llama automáticamente a POST /api/redsys/notificacion
        ↓
Backend verifica la firma, actualiza estado en BD y envía emails
        ↓
Redsys redirige al usuario a SUCCESS_URL o ERROR_URL
```

> ⚠️ **La `REDSYS_NOTIFICATION_URL` debe ser accesible desde internet**. En desarrollo usa ngrok (`ngrok http 3000`) y actualiza el `.env` con la URL que genere. La URL cambia cada vez que reinicias ngrok (plan gratuito).

### Rutas de Redsys

#### `POST /api/redsys/iniciar`

Crea el pedido en BD con estado `pendiente` y devuelve los parámetros firmados para el TPV.

**Auth:** opcional (`optionalAuth`)

**Body:**

```json
{
  "nombre": "Manuel",
  "correo": "manuel@email.com",
  "telefono": "600000000",
  "calle": "Calle Mayor",
  "numero": 5,
  "cp": 28001,
  "ciudad": "Madrid",
  "provincia": "Madrid",
  "piso": "2A",
  "total": "84.98",
  "productos": [
    { "id_producto": 1, "cantidad": 2, "precio": 19.99 },
    { "id_producto": 3, "cantidad": 1, "precio": 45.0 }
  ]
}
```

**Respuesta `201`:**

```json
{
  "pedidoId": 14,
  "url": "https://sis-t.redsys.es:25443/sis/realizarPago",
  "Ds_SignatureVersion": "HMAC_SHA256_V1",
  "Ds_MerchantParameters": "eyJEU19...",
  "Ds_Signature": "PqV2+SF6..."
}
```

> El frontend debe construir un formulario HTML con estos 3 campos (`Ds_SignatureVersion`, `Ds_MerchantParameters`, `Ds_Signature`) y hacer submit hacia `url`.

#### `POST /api/redsys/notificacion`

Webhook que Redsys llama automáticamente tras el pago. **El frontend nunca llama a este endpoint.**

| Ruta React    | Descripción                                                                         |
| ------------- | ----------------------------------------------------------------------------------- |
| `/pago/exito` | Redsys redirige aquí si el pago fue correcto. Mostrar confirmación y vaciar carrito |
| `/pago/error` | Redsys redirige aquí si el pago fue denegado o cancelado. Mostrar mensaje de error  |

- Si la firma es válida y el pago está aprobado → estado `en_elaboracion` + emails
- Si el pago es denegado → estado `cancelado`
- Siempre responde `OK` (texto plano) para que Redsys no reintente

### Implementación en el frontend

```js
const iniciarPagoRedsys = async (
  datosComprador,
  carrito,
  total,
  token = null,
) => {
  const body = {
    nombre: datosComprador.nombre,
    correo: datosComprador.correo,
    telefono: datosComprador.telefono,
    calle: datosComprador.calle,
    numero: datosComprador.numero,
    cp: datosComprador.cp,
    ciudad: datosComprador.ciudad,
    provincia: datosComprador.provincia,
    piso: datosComprador.piso,
    total: total.toFixed(2),
    productos: carrito.map((item) => ({
      id_producto: item.id,
      cantidad: item.cantidad,
      precio: item.precio_oferta,
    })),
  };

  const res = await fetch(`${BASE_URL}/redsys/iniciar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error("Error al iniciar el pago con Redsys");

  const { url, Ds_SignatureVersion, Ds_MerchantParameters, Ds_Signature } =
    await res.json();

  // Crear y hacer submit del formulario hacia el TPV de Redsys
  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;

  [
    { name: "Ds_SignatureVersion", value: Ds_SignatureVersion },
    { name: "Ds_MerchantParameters", value: Ds_MerchantParameters },
    { name: "Ds_Signature", value: Ds_Signature },
  ].forEach(({ name, value }) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
};
```

El frontend **nunca construye el formulario en HTML estático**. Debe crearlo dinámicamente
en JavaScript y enviarlo al banco con los valores recibidos del backend.

**Componente React completo:**

```jsx
// RedsysCheckout.jsx
export default function RedsysCheckout({ carrito, datosComprador, total }) {
  const token = localStorage.getItem("token"); // o useAuth()

  const handlePagar = async () => {
    try {
      const res = await fetch(`${BASE_URL}/redsys/iniciar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nombre: datosComprador.nombre,
          correo: datosComprador.correo,
          telefono: datosComprador.telefono,
          calle: datosComprador.calle,
          numero: datosComprador.numero,
          cp: datosComprador.cp,
          ciudad: datosComprador.ciudad,
          provincia: datosComprador.provincia,
          piso: datosComprador.piso,
          total: total.toFixed(2),
          productos: carrito.map((item) => ({
            id_producto: item.id,
            cantidad: item.cantidad,
            precio: item.precio_oferta,
          })),
        }),
      });

      if (!res.ok) throw new Error("Error al iniciar el pago con Redsys");

      const { url, Ds_SignatureVersion, Ds_MerchantParameters, Ds_Signature } =
        await res.json();

      // Crear formulario dinámico y redirigir al TPV del banco
      const form = document.createElement("form");
      form.method = "POST";
      form.action = url;

      [
        ["Ds_SignatureVersion", Ds_SignatureVersion],
        ["Ds_MerchantParameters", Ds_MerchantParameters],
        ["Ds_Signature", Ds_Signature],
      ].forEach(([name, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit(); // ← redirige al banco automáticamente
    } catch (err) {
      console.error("Error Redsys:", err);
      alert("No se pudo iniciar el pago con tarjeta");
    }
  };

  return <button onClick={handlePagar}>Pagar con tarjeta (TPV)</button>;
}
```

### Tarjetas de prueba (entorno test)

| Número de tarjeta  | Tipo de prueba          |
| ------------------ | ----------------------- |
| `4548812049400004` | Autenticación 3DS v1    |
| `4548814479727229` | EMV3DS 2.1 Frictionless |
| `4548817212493017` | EMV3DS 2.1 Challenge    |

- **Caducidad:** cualquier fecha válida
- **CVV2:** cualquier número **excepto `999`** (ese provoca denegación)
- **Operación denegada:** CVV2 = `999` o importe terminado en `96`

---

## 8. Rutas de la API — referencia completa

### Autenticación

| Método | URL                             | Auth | Qué hace                                  |
| ------ | ------------------------------- | :--: | ----------------------------------------- |
| POST   | `/api/auth/register`            |  No  | Registra un usuario nuevo                 |
| POST   | `/api/auth/login`               |  No  | Inicia sesión y devuelve token JWT        |
| POST   | `/api/auth/logout`              |  🔒  | Cierra sesión e invalida el token         |
| POST   | `/api/auth/recuperar`           |  No  | Envía un código de recuperación al correo |
| POST   | `/api/auth/recuperar/verificar` |  No  | Verifica el código y cambia la contraseña |

### PayPal

| Método | URL                                   |   Auth   | Qué hace                                      |
| ------ | ------------------------------------- | :------: | --------------------------------------------- |
| POST   | `/api/paypal/orders`                  | Opcional | Crea una orden en PayPal y devuelve `orderID` |
| POST   | `/api/paypal/orders/:orderID/capture` | Opcional | Captura el pago y crea el pedido en BD        |

### Redsys

| Método | URL                        |   Auth   | Qué hace                                                        |
| ------ | -------------------------- | :------: | --------------------------------------------------------------- |
| POST   | `/api/redsys/iniciar`      | Opcional | Crea el pedido en BD y devuelve parámetros firmados para el TPV |
| POST   | `/api/redsys/notificacion` |    No    | Webhook — Redsys notifica el resultado del pago                 |

### Pedidos normales

| Método | URL                       |   Auth   | Qué hace                                  |
| ------ | ------------------------- | :------: | ----------------------------------------- |
| PATCH  | `/api/pedidos/:id/estado` | 🔒 Admin | Cambiar estado de un pedido               |
| GET    | `/api/pedidos/me`         |    🔒    | Devuelve los pedidos del usuario logueado |
| GET    | `/api/pedidos/:id`        |    🔒    | Devuelve un pedido con su detalle         |
| GET    | `/api/pedidos`            | 🔒 Admin | Devuelve todos los pedidos                |
| DELETE | `/api/pedidos/:id`        | 🔒 Admin | Elimina un pedido                         |

> ⚠️ Ya no existe `POST /api/pedidos` como ruta pública para compras normales.  
> El pedido normal se crea desde el flujo de pago.

### Pedidos personalizados

| Método | URL                         |   Auth   | Qué hace                                                 |
| ------ | --------------------------- | :------: | -------------------------------------------------------- |
| POST   | `/api/pedidoper`            | Opcional | Crea un pedido personalizado                             |
| PATCH  | `/api/pedidoper/:id/estado` | 🔒 Admin | Cambiar estado de un pedido personalizado                |
| GET    | `/api/pedidoper/me`         |    🔒    | Devuelve los pedidos personalizados del usuario logueado |
| GET    | `/api/pedidoper/:id`        |    🔒    | Devuelve un pedido personalizado concreto                |
| GET    | `/api/pedidoper`            | 🔒 Admin | Devuelve todos los pedidos personalizados                |
| DELETE | `/api/pedidoper/:id`        | 🔒 Admin | Elimina un pedido personalizado                          |

### Productos

| Método | URL                                                        |   Auth   | Qué hace                         |
| ------ | ---------------------------------------------------------- | :------: | -------------------------------- |
| GET    | `/api/productos?page=1&limit=15&sort=nuevos`               |    No    | Devuelve una página del catálogo |
| GET    | `/api/productos/:id`                                       |    No    | Devuelve un producto completo    |
| GET    | `/api/productos/categoria/:id?page=1&limit=15&sort=nuevos` |    No    | Filtra por categoría             |
| GET    | `/api/productos/color/:id?page=1&limit=15&sort=nuevos`     |    No    | Filtra por color                 |
| GET    | `/api/productos/aroma/:id?page=1&limit=15&sort=nuevos`     |    No    | Filtra por aroma                 |
| GET    | `/api/productos/imagen/:imagenId`                          |    No    | Devuelve una imagen              |
| POST   | `/api/productos`                                           | 🔒 Admin | Crea un producto                 |
| PUT    | `/api/productos/:id`                                       | 🔒 Admin | Actualiza un producto            |
| DELETE | `/api/productos/:id`                                       | 🔒 Admin | Elimina un producto              |

### Categorías

| Método | URL                  |   Auth   | Qué hace                      |
| ------ | -------------------- | :------: | ----------------------------- |
| GET    | `/api/categoria`     |    No    | Devuelve todas las categorías |
| POST   | `/api/categoria`     | 🔒 Admin | Crea una categoría            |
| PUT    | `/api/categoria/:id` | 🔒 Admin | Modifica una categoría        |
| DELETE | `/api/categoria/:id` | 🔒 Admin | Elimina una categoría         |

### Aromas

| Método | URL              |   Auth   | Qué hace                  |
| ------ | ---------------- | :------: | ------------------------- |
| GET    | `/api/aroma`     |    No    | Devuelve todos los aromas |
| POST   | `/api/aroma`     | 🔒 Admin | Crea un aroma             |
| PUT    | `/api/aroma/:id` | 🔒 Admin | Modifica un aroma         |
| DELETE | `/api/aroma/:id` | 🔒 Admin | Elimina un aroma          |

### Colores

| Método | URL              |   Auth   | Qué hace                   |
| ------ | ---------------- | :------: | -------------------------- |
| GET    | `/api/color`     |    No    | Devuelve todos los colores |
| POST   | `/api/color`     | 🔒 Admin | Crea un color              |
| PUT    | `/api/color/:id` | 🔒 Admin | Modifica un color          |
| DELETE | `/api/color/:id` | 🔒 Admin | Elimina un color           |

### Usuarios

| Método | URL                        |   Auth   | Qué hace                     |
| ------ | -------------------------- | :------: | ---------------------------- |
| GET    | `/api/usuario/me`          |    🔒    | Devuelve el perfil propio    |
| PUT    | `/api/usuario/me`          |    🔒    | Modifica el perfil propio    |
| PUT    | `/api/usuario/me/password` |    🔒    | Cambia la contraseña propia  |
| DELETE | `/api/usuario/me`          |    🔒    | Elimina la cuenta propia     |
| GET    | `/api/usuario`             | 🔒 Admin | Devuelve todos los usuarios  |
| GET    | `/api/usuario/:id`         | 🔒 Admin | Devuelve un usuario concreto |
| PUT    | `/api/usuario/:id`         | 🔒 Admin | Cambia el tipo del usuario   |
| DELETE | `/api/usuario/:id`         | 🔒 Admin | Elimina un usuario           |

---

### 🛒 Pedidos normales — estados posibles

| Estado           | Descripción                       |
| ---------------- | --------------------------------- |
| `pendiente`      | Pedido recibido, aún sin procesar |
| `en_elaboracion` | El pedido está siendo preparado   |
| `enviado`        | El pedido ha sido enviado         |
| `entregado`      | El pedido ha sido entregado       |
| `cancelado`      | El pedido ha sido cancelado       |

### ✏️ Pedidos personalizados — estados posibles

| Estado       | Descripción                                |
| ------------ | ------------------------------------------ |
| `pendiente`  | Solicitud recibida                         |
| `aceptado`   | El administrador la ha aceptado            |
| `denegado`   | El administrador la ha rechazado           |
| `completado` | El pedido personalizado ha sido completado |

---

### ⚠️ Notas importantes para el frontend

1. **CORS**: el backend solo acepta peticiones del dominio configurado en `CLIENT_URL`.
2. **Productos con imágenes**: `POST /api/productos` y `PUT /api/productos/:id` usan `FormData`, no JSON.
3. **No pongas `Content-Type` manualmente** al usar `FormData`.
4. **Token expirado**: si recibes `401` o `403`, limpia sesión y redirige al login.
5. **Aromas y colores en PUT**: si mandas el campo, reemplazas todo ese grupo.
6. **Imágenes en PUT**: si mandas `imagenesConfig`, debe representar el estado final completo.
7. **Las imágenes nuevas se emparejan con `imagenes` por orden**.
8. **`oferta` es un porcentaje**, no un booleano.
9. **Los listados usan paginación**.
10. **Los pedidos personalizados siguen siendo públicos** y aceptan invitados.
11. **Los pedidos normales ya no se crean con `/api/pedidos`**.
12. **Para comprar**, el frontend debe usar el flujo de PayPal o el de Redsys según el método elegido. Ya no existe `POST /api/pedidos`.
13. **Si el usuario está logueado**, envía el token también en las rutas de PayPal para vincular el pedido a su cuenta.
14. **El body de `capture` debe incluir todos los datos del comprador y del carrito**.
15. **El backend envía emails automáticos después de crear correctamente el pedido**.
16. **En desarrollo, Resend solo permite ciertos destinos si no hay dominio verificado**.
17. **El campo `id_transaccion` sirve para guardar el identificador devuelto por la pasarela**.
18. **El campo `metodo_pago` prepara la tabla para convivir con PayPal y Redsys**.
19. **Para pagar con tarjeta (Redsys)**, el frontend llama a `/api/redsys/iniciar`, recibe los parámetros firmados y hace submit de un formulario POST hacia la URL del TPV.
20. **La notificación de Redsys es servidor a servidor** — el frontend nunca la llama directamente.
21. **En desarrollo con Redsys**, ngrok debe estar corriendo antes de arrancar el backend.
22. **El pedido Redsys se crea antes del pago** (estado `pendiente`) y se actualiza a `en_elaboracion` cuando Redsys confirma.

---

### 📧 Emails automáticos con Resend

El backend envía emails automáticamente en estos casos:

| Evento                     | Destinatario    | Descripción                   |
| -------------------------- | --------------- | ----------------------------- |
| Recuperación de contraseña | Cliente         | Email con código de 6 dígitos |
| Pedido nuevo pagado        | Cliente + Admin | Confirmación del pedido       |
| Pedido personalizado nuevo | Admin           | Aviso interno                 |

> ⚠️ En desarrollo, Resend solo permite enviar fácilmente al correo de prueba o al dominio verificado.

---

### 🔑 Recuperación de contraseña

**Paso 1 — Solicitar código**

```http
POST /api/auth/recuperar
Content-Type: application/json

{
  "correo": "usuario@email.com"
}
```

**Paso 2 — Verificar código**

```http
POST /api/auth/recuperar/verificar
Content-Type: application/json

{
  "correo": "usuario@email.com",
  "codigo": "483921",
  "passwordNueva": "nuevaPassword123"
}
```

---

## 9. Flujo de trabajo con ramas

### Estructura de ramas

```text
main          ← Código listo para entregar
dev           ← Rama de integración del equipo
feature/*     ← Una rama por funcionalidad nueva
fix/*         ← Una rama por corrección
```

### Trabajo diario

**1. Situarse en `dev` y actualizar**

```bash
git checkout dev
git pull origin dev
```

**2. Crear rama**

```bash
git checkout -b feature/nombre-de-la-funcionalidad
```

**3. Trabajar con normalidad**

**4. Guardar cambios**

```bash
git add .
git commit -m "feat: descripción de los cambios"
git push origin feature/nombre-de-la-funcionalidad
```

**5. Abrir Pull Request**

- Revisar que el destino sea `dev`
- Añadir descripción
- Pedir revisión
- Hacer merge cuando esté aprobado

---

## 10. Cómo trabajar desde VS Code (sin terminal)

Desde **Source Control** podéis:

- hacer `Pull`,
- crear ramas,
- cambiar de rama,
- hacer `Commit`,
- hacer `Push`,
- sincronizar cambios.

> Aunque se puede trabajar sin terminal, conviene entender los comandos básicos de Git.

---

## 11. Scripts disponibles

| Comando       | Qué hace                                           |
| ------------- | -------------------------------------------------- |
| `npm run dev` | Arranca el servidor en modo desarrollo con nodemon |
| `npm start`   | Arranca el servidor en modo normal                 |

---

## Dependencias principales

| Librería                    | Para qué sirve                                                                   |
| --------------------------- | -------------------------------------------------------------------------------- |
| `express`                   | Framework para la API REST                                                       |
| `pg`                        | Conectar con PostgreSQL                                                          |
| `dotenv`                    | Cargar variables del `.env`                                                      |
| `cors`                      | Permitir peticiones del frontend                                                 |
| `bcryptjs`                  | Cifrar contraseñas                                                               |
| `jsonwebtoken`              | Crear y verificar JWT                                                            |
| `multer`                    | Procesar imágenes                                                                |
| `resend`                    | Envío de correos                                                                 |
| `@paypal/paypal-server-sdk` | Integración backend con PayPal                                                   |
| `nodemon`                   | Reinicio automático en desarrollo                                                |
| `crypto`                    | Cifrado 3DES y firma HMAC-SHA256 para Redsys (incluido en Node.js, sin instalar) |
