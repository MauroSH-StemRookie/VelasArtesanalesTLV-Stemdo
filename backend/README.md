# ⚙️ Backend — Velas Artesanales

API REST del e-commerce de Velas Artesanales.  
Construida con **Node.js** y **Express**, conectada a **PostgreSQL en Neon**.

***

## Índice

1. [Primera vez — configuración inicial](#1-primera-vez--configuración-inicial)
2. [Variables de entorno](#2-variables-de-entorno)
3. [Arrancar en local](#3-arrancar-en-local)
4. [Estructura de carpetas](#4-estructura-de-carpetas)
5. [Guía para el Frontend (React)](#5-guía-para-el-frontend-react)
6. [Rutas de la API — referencia completa](#6-rutas-de-la-api--referencia-completa)
7. [Flujo de trabajo con ramas](#7-flujo-de-trabajo-con-ramas)
8. [Cómo trabajar desde VS Code (sin terminal)](#8-cómo-trabajar-desde-vs-code-sin-terminal)
9. [Scripts disponibles](#9-scripts-disponibles)

***

## 1. Primera vez — configuración inicial

### Paso 1 — Clonar el repositorio (si no lo tenéis ya)

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

***

## 2. Variables de entorno

Las variables de entorno son configuraciones sensibles (contraseñas, tokens) que **no se suben a GitHub**. Cada miembro del equipo las tiene en su ordenador.

### Crear el archivo `.env`

```bash
# Windows (PowerShell)
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

### Rellenar el `.env`

Abrid el archivo `.env` que acabáis de crear y rellenad los valores. Pedídselos al responsable del proyecto:

```
DATABASE_URL=postgresql://usuario:contraseña@host/velasartesanalesDB?sslmode=require
PORT=3000
NODE_ENV=development
JWT_SECRET=un_secreto_seguro
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

| Variable | Para qué sirve |
|----------|---------------|
| `DATABASE_URL` | Dirección de la base de datos en Neon |
| `PORT` | Puerto donde corre el servidor (3000 por defecto) |
| `NODE_ENV` | Entorno de ejecución (development / production) |
| `JWT_SECRET` | Secreto para cifrar los tokens de autenticación |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token (7 días) |
| `CLIENT_URL` | URL del frontend para permitir las peticiones CORS (**debe coincidir exactamente con la URL donde corre React**) |

> ⚠️ El archivo `.env` está en el `.gitignore` — nunca se sube a GitHub.

***

## 3. Arrancar en local

```bash
npm run dev
```

El servidor estará disponible en **http://localhost:3000**

Para comprobar que funciona, abrid el navegador y visitad:
```
http://localhost:3000/
```

Deberíais ver:
```json
{ "status": "OK", "mensaje": "API Velas Artesanales funcionando" }
```

Cada vez que guardéis un archivo, el servidor se reinicia automáticamente gracias a **nodemon**.

***

## 4. Estructura de carpetas

```
backend/
├── src/
│   ├── index.js                            ← Punto de entrada. Configura Express y arranca el servidor
│   ├── db.js                               ← Conexión a la base de datos Neon
│   ├── routes/                             ← Define las URLs de la API
│   │   ├── productos.js                    ← /api/productos
│   │   ├── pedidos.js                      ← /api/pedidos
│   │   ├── auth.js                         ← /api/auth
│   │   ├── color.js                        ← /api/color
│   │   ├── usuario.js                      ← /api/usuario
│   │   ├── aroma.js                        ← /api/aroma
│   │   └── categoria.js                    ← /api/categoria
│   ├── controllers/                        ← Define la funcion que lleva a cabo la API
│   │   ├── productosController.js          ← Controlador de productos
│   │   ├── pedidosController.js            ← Controlador de pedidos
│   │   ├── authController.js               ← Controlador de auth
│   │   ├── colorController.js              ← Controlador de color
│   │   ├── usuarioController.js            ← Controlador de usuario
│   │   ├── aromaController.js              ← Controlador de aroma
│   │   └── categoriaController.js          ← Controlador de categoria
│   ├── models/                             ← Contiene las consultas SQL que se le piden a la base de datos
│   │   ├── productosModel.js               ← Modelo de productos
│   │   ├── pedidosModel.js                 ← Modelo de pedidos
│   │   ├── authModel.js                    ← Modelo de auth
│   │   ├── colorModel.js                   ← Modelo de color
│   │   ├── usuarioModel.js                 ← Modelo de usuario
│   │   ├── aromaModel.js                   ← Modelo de aroma
│   │   └── categoriaModel.js               ← Modelo de categoria
│   └── middleware/                         ← Funciones intermedias (autenticación, validaciones)
│       ├── authMiddleware.js               ← Verificar usuario logueado
│       ├── optionalAuth.js                 ← Usuario sin loguear (invitado)
│       ├── adminMiddleware.js              ← Verifica que el usuario sea de tipo Admin
│       └── upload.js                       ← Procesa archivos de imagen enviados desde el front (multer)
├── .env                                    ← Variables de entorno (NO sube a GitHub)
├── .env.example                            ← Plantilla de variables (SÍ sube a GitHub)
└── package.json                            ← Dependencias y scripts
```

### ¿Qué hace cada carpeta?

**`routes/`** — Define qué URLs existen y qué función se ejecuta cuando alguien las llama. Es como el índice de la API.

**`controllers/`** — Contiene la lógica real de cada acción (obtener productos, crear un pedido, etc.). Los routes llaman a los controllers.

**`models/`** — Las consultas SQL a la base de datos. Aquí es donde se escribe `SELECT`, `INSERT`, `UPDATE`, etc.

**`middleware/`** — Funciones que se ejecutan antes de llegar a la ruta. Por ejemplo, comprobar si el usuario está logueado antes de dejarle ver sus pedidos. El middleware `upload.js` usa **multer** para procesar las imágenes en memoria antes de guardarlas en la base de datos.

***

## 5. Guía para el Frontend (React)

> 🎯 Esta sección está pensada para el desarrollador del frontend en React. Aquí encontrarás todo lo que necesitas saber para conectar con el backend: la URL base, cómo autenticarte, qué campos enviar en cada petición y qué respuesta esperar.

### URL base

```
http://localhost:3000/api
```

> En producción (Railway), la URL base cambiará. Úsala como variable de entorno en React: `VITE_API_URL=https://tu-dominio-railway.app/api`

***

### 🔑 Cómo funciona el token JWT

El **JWT (JSON Web Token)** es el mecanismo que usa la API para saber quién eres y qué puedes hacer. Funciona así:

1. El usuario hace **login** → el backend genera un token firmado con una clave secreta y lo devuelve
2. El frontend **guarda el token** y lo envía en cada petición que lo requiera
3. El backend **verifica el token** en cada petición — si es válido, deja pasar; si no, devuelve `401`
4. El token **expira en 7 días** — cuando expira, el usuario debe volver a hacer login

El token contiene información del usuario (id, nombre, correo, tipo) **dentro de él mismo**, por eso el backend no necesita consultar la base de datos para saber quién eres — simplemente lee el token.

#### ¿Dónde guardar el token en React?

Guárdalo en memoria mediante un **Context de React** combinado con `localStorage` para persistir la sesión entre recargas de página:

```jsx
// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser  = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (tokenRecibido, userRecibido) => {
    setToken(tokenRecibido);
    setUser(userRecibido);
    localStorage.setItem('token', tokenRecibido);
    localStorage.setItem('user', JSON.stringify(userRecibido));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return res;
};
```

> ⚠️ Para `POST /api/productos` y `PUT /api/productos/:id`, haz `fetch` manual con `FormData` y **sin** poner `Content-Type` a mano.

***

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
  src={producto.imagen_id
    ? `http://localhost:3000/api/productos/imagen/${producto.imagen_id}`
    : '/placeholder.jpg'}
  alt={producto.nombre}
/>
```

**Ejemplo en React — detalle:**

```jsx
{producto.imagenes.map((img) => (
  <img
    key={img.id}
    src={`http://localhost:3000/api/productos/imagen/${img.id}`}
    alt={producto.nombre}
  />
))}
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
formData.append('nombre', nombre);
formData.append('descripcion', descripcion);
formData.append('precio', precio);
formData.append('stock', stock);
formData.append('categoria', categoria);

aromas.forEach((idAroma) => formData.append('aromas', idAroma));
colores.forEach((idColor) => formData.append('colores', idColor));
imagenes.forEach((archivo) => formData.append('imagenes', archivo));

await fetch('http://localhost:3000/api/productos', {
  method: 'POST',
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

### Actualizar producto con imágenes — nueva lógica

La actualización de productos ya no funciona con `imagenesConservar`. Ahora el frontend manda el **estado final completo del carrusel** en un campo llamado `imagenesConfig`. Esa es la parte más importante que debe entender frontend.

```http
PUT /api/productos/:id
```

#### Qué hace ahora el backend

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

Representa **cómo debe quedar el carrusel al final**, no solo qué imágenes conservar.

Cada elemento del array puede ser de dos tipos:

- Imagen ya existente en base de datos:

```json
{ "tipo": "existente", "id": 12, "orden": 0 }
```

- Imagen nueva que todavía no existe en base de datos:

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

formData.append('nombre', nombre);
formData.append('descripcion', descripcion);
formData.append('precio', precio);
formData.append('stock', stock);
formData.append('oferta', oferta);
formData.append('precio_oferta', precioOferta);
formData.append('categoria', categoria);

aromas.forEach((id) => formData.append('aromas', id));
colores.forEach((id) => formData.append('colores', id));

formData.append(
  'imagenesConfig',
  JSON.stringify([
    { tipo: 'existente', id: 11, orden: 0 },
    { tipo: 'existente', id: 12, orden: 1 },
    { tipo: 'nueva', orden: 2 }
  ])
);

formData.append('imagenes', archivoNuevaImagen);

await fetch(`http://localhost:3000/api/productos/${idProducto}`, {
  method: 'PUT',
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
  { tipo: 'existente', id: 11, orden: 0, preview: '...' },
  { tipo: 'existente', id: 12, orden: 1, preview: '...' },
  { tipo: 'nueva', file: archivo, orden: 2, preview: 'blob:...' }
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
  if (img.tipo === 'existente') {
    return { tipo: 'existente', id: img.id, orden: img.orden };
  }

  return { tipo: 'nueva', orden: img.orden };
});

const imagenesNuevas = imagenesOrdenadas
  .filter((img) => img.tipo === 'nueva')
  .map((img) => img.file);
```

Luego:

```js
const formData = new FormData();

formData.append('nombre', nombre);
formData.append('descripcion', descripcion);
formData.append('precio', precio);
formData.append('stock', stock);
formData.append('oferta', oferta);
formData.append('precio_oferta', precioOferta);
formData.append('categoria', categoria);

aromas.forEach((id) => formData.append('aromas', id));
colores.forEach((id) => formData.append('colores', id));

formData.append('imagenesConfig', JSON.stringify(imagenesConfig));
imagenesNuevas.forEach((file) => formData.append('imagenes', file));
```

### Qué devolverá el backend después del PUT

El backend devuelve el objeto del producto actualizado. Después del `PUT`, el frontend debería hacer una de estas dos cosas:

- o volver a pedir `GET /api/productos/:id` para refrescar aromas, colores e imágenes reales,
- o reconstruir el estado local si ya tiene todos los datos.

La opción más segura es volver a pedir el detalle del producto.

***

#### `GET /api/productos` — Listado del catálogo

No requiere token. Devuelve todos los productos con la primera imagen de cada uno.

**Respuesta `200`:**

```json
[
  {
    "id": 1,
    "nombre": "Vela de lavanda",
    "descripcion": "Vela artesanal con aroma a lavanda",
    "precio": "12.50",
    "stock": 30,
    "oferta": false,
    "precio_oferta": "12.50",
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
  "oferta": false,
  "precio_oferta": "12.50",
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

#### `GET /api/productos/color/:id`

No requiere token. Filtra productos por color con `imagen_id`.

#### `GET /api/productos/aroma/:id`

No requiere token. Filtra productos por aroma con `imagen_id`.

#### `GET /api/productos/imagen/:imagenId`

No requiere token. Devuelve directamente el binario de una imagen. Se usa en el `src` del `<img>`.

#### `POST /api/productos` — Crear producto *(solo admin)*

🔒 Requiere token de administrador.

**Body:** `multipart/form-data`

| Campo | Tipo | Obligatorio |
|------|------|:--:|
| `nombre` | string | ✅ |
| `descripcion` | string | ✅ |
| `precio` | number | ✅ |
| `stock` | number | ✅ |
| `categoria` | number | ✅ |
| `aromas` | number[] | ❌ |
| `colores` | number[] | ❌ |
| `imagenes` | File[] | ❌ |

#### `PUT /api/productos/:id` — Actualizar producto *(solo admin)*

🔒 Requiere token de administrador.

**Body:** `multipart/form-data`

| Campo | Tipo | Obligatorio |
|------|------|:--:|
| `nombre` | string | ✅ |
| `descripcion` | string | ✅ |
| `precio` | number | ✅ |
| `stock` | number | ✅ |
| `oferta` | boolean | ✅ |
| `precio_oferta` | number | ✅ |
| `categoria` | number | ✅ |
| `aromas` | number[] | ❌ |
| `colores` | number[] | ❌ |
| `imagenesConfig` | string (JSON) | ❌ |
| `imagenes` | File[] | ❌ |

> Si se envía `imagenesConfig`, el backend interpreta que ese JSON describe el estado final exacto de las imágenes del producto.

#### `DELETE /api/productos/:id` — Eliminar producto *(solo admin)*

🔒 Requiere token de administrador.

Respuesta:

```json
{ "mensaje": "Producto eliminado correctamente" }
```

***


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

***

#### `POST /api/categoria` — Crear categoría *(solo admin)*

🔒 **Requiere token de administrador** (`tipo: 1`).

**Body (JSON):**

| Campo | Tipo | ¿Obligatorio? | Descripción |
|-------|------|:---:|-------------|
| `nombre_categoria` | `string` | ✅ | Nombre de la nueva categoría |

**Ejemplo de body:**
```json
{ "nombre_categoria": "Regalos" }
```

**Respuesta exitosa `201`:** el objeto de la categoría recién creada.

***

#### `PUT /api/categoria/:id` — Modificar categoría *(solo admin)*

🔒 **Requiere token de administrador** (`tipo: 1`).

**Parámetro de URL:** `:id` → ID de la categoría a modificar

**Body (JSON):**

| Campo | Tipo | ¿Obligatorio? | Descripción |
|-------|------|:---:|-------------|
| `nombre_categoria` | `string` | ✅ | Nuevo nombre de la categoría |

**Respuesta exitosa `200`:** el objeto de la categoría actualizada.

**Errores posibles:**
| Código | Motivo |
|--------|--------|
| `404` | Categoría no encontrada |
| `500` | Error interno del servidor |

***

#### `DELETE /api/categoria/:id` — Eliminar categoría *(solo admin)*

🔒 **Requiere token de administrador** (`tipo: 1`).

**Parámetro de URL:** `:id` → ID de la categoría a eliminar

**Respuesta exitosa `200`:**
```json
{ "mensaje": "Categoría eliminada correctamente" }
```

> ⚠️ Si hay productos asignados a esta categoría, la eliminación puede fallar por restricción de clave foránea.

***

### 🌸 Rutas de Aromas

#### `GET /api/aroma` — Listar todos los aromas

No requiere token. Devuelve todos los aromas disponibles.

**Respuesta `200`:**
```json
[
  { "id": 1, "nombre_aroma": "Lavanda" },
  { "id": 2, "nombre_aroma": "Vainilla" },
  { "id": 3, "nombre_aroma": "Rosa" }
]
```

***

#### `POST /api/aroma` — Crear aroma *(solo admin)*

🔒 **Requiere token de administrador** (`tipo: 1`).

**Body (JSON):**

| Campo | Tipo | ¿Obligatorio? | Descripción |
|-------|------|:---:|-------------|
| `nombre_aroma` | `string` | ✅ | Nombre del nuevo aroma |

**Ejemplo de body:**
```json
{ "nombre_aroma": "Canela" }
```

**Respuesta exitosa `201`:** el objeto del aroma recién creado.

***

#### `PUT /api/aroma/:id` — Modificar aroma *(solo admin)*

🔒 **Requiere token de administrador** (`tipo: 1`).

**Parámetro de URL:** `:id` → ID del aroma a modificar

**Body (JSON):**

| Campo | Tipo | ¿Obligatorio? | Descripción |
|-------|------|:---:|-------------|
| `nombre_aroma` | `string` | ✅ | Nuevo nombre del aroma |

**Respuesta exitosa `200`:** el objeto del aroma actualizado.

**Errores posibles:**
| Código | Motivo |
|--------|--------|
| `404` | Aroma no encontrado |
| `500` | Error interno del servidor |

***

#### `DELETE /api/aroma/:id` — Eliminar aroma *(solo admin)*

🔒 **Requiere token de administrador** (`tipo: 1`).

**Parámetro de URL:** `:id` → ID del aroma a eliminar

> Al eliminar un aroma, sus registros en `producto_aroma` se borran automáticamente (CASCADE). Los productos que lo tenían asignado simplemente dejan de tener ese aroma — el producto no se elimina.

**Respuesta exitosa `200`:**
```json
{ "mensaje": "Aroma eliminado correctamente" }
```

***

### 🎨 Rutas de Colores

#### `GET /api/color` — Listar todos los colores

No requiere token. Devuelve todos los colores disponibles.

**Respuesta `200`:**
```json
[
  { "id": 1, "color": "Blanco" },
  { "id": 2, "color": "Rosa" },
  { "id": 3, "color": "Azul" }
]
```

***

#### `POST /api/color` — Crear color *(solo admin)*

🔒 **Requiere token de administrador** (`tipo: 1`).

**Body (JSON):**

| Campo | Tipo | ¿Obligatorio? | Descripción |
|-------|------|:---:|-------------|
| `color` | `string` | ✅ | Nombre del nuevo color |

**Ejemplo de body:**
```json
{ "color": "Verde" }
```

**Respuesta exitosa `201`:** el objeto del color recién creado.

***

#### `PUT /api/color/:id` — Modificar color *(solo admin)*

🔒 **Requiere token de administrador** (`tipo: 1`).

**Parámetro de URL:** `:id` → ID del color a modificar

**Body (JSON):**

| Campo | Tipo | ¿Obligatorio? | Descripción |
|-------|------|:---:|-------------|
| `color` | `string` | ✅ | Nuevo nombre del color |

**Respuesta exitosa `200`:** el objeto del color actualizado.

**Errores posibles:**
| Código | Motivo |
|--------|--------|
| `404` | Color no encontrado |
| `500` | Error interno del servidor |

***

#### `DELETE /api/color/:id` — Eliminar color *(solo admin)*

🔒 **Requiere token de administrador** (`tipo: 1`).

**Parámetro de URL:** `:id` → ID del color a eliminar

> Al eliminar un color, sus registros en `producto_color` se borran automáticamente (CASCADE). Los productos que lo tenían asignado simplemente dejan de tener ese color — el producto no se elimina.

**Respuesta exitosa `200`:**
```json
{ "mensaje": "Color eliminado correctamente" }
```

***

### 👤 Rutas de Usuarios *(solo admin)*

Todas las rutas de usuario requieren token de administrador (`tipo: 1`).

#### `GET /api/usuario` — Listar todos los usuarios

🔒 **Requiere token de administrador** (`tipo: 1`).

No requiere body. Devuelve todos los usuarios registrados en el sistema.

**Respuesta `200`:**
```json
[
  {
    "id": 1,
    "nombre": "Ana García",
    "correo": "ana@ejemplo.com",
    "telefono": "600123456",
    "tipo": 2
  },
  {
    "id": 2,
    "nombre": "Carlos Admin",
    "correo": "carlos@ejemplo.com",
    "telefono": "600654321",
    "tipo": 1
  }
]
```

***

#### `PUT /api/usuario/:id` — Cambiar tipo de usuario *(toggle)*

🔒 **Requiere token de administrador** (`tipo: 1`).

**Parámetro de URL:** `:id` → ID del usuario a modificar

**Body (JSON):**

| Campo | Tipo | ¿Obligatorio? | Descripción |
|-------|------|:---:|-------------|
| `tipo` | `number` | ✅ | Tipo **actual** del usuario (`1` = admin, `2` = usuario normal) |

> ℹ️ Esta API funciona como un **toggle**: si mandas el tipo actual del usuario, el backend lo invierte automáticamente. Si el usuario es admin (`1`), pasa a ser usuario normal (`2`), y viceversa.

**Ejemplo — pasar usuario normal a admin:**
```json
{ "tipo": 2 }
```

**Ejemplo — pasar admin a usuario normal:**
```json
{ "tipo": 1 }
```

**Respuesta exitosa `200`:** el objeto del usuario con el tipo ya actualizado.

**Errores posibles:**
| Código | Motivo |
|--------|--------|
| `404` | Usuario no encontrado |
| `500` | Error interno del servidor |

***

#### `DELETE /api/usuario/:id` — Eliminar usuario

🔒 **Requiere token de administrador** (`tipo: 1`).

**Parámetro de URL:** `:id` → ID del usuario a eliminar

**Body (JSON):**

| Campo | Tipo | ¿Obligatorio? | Descripción |
|-------|------|:---:|-------------|
| `tipo` | `number` | ✅ | Tipo del usuario a eliminar (`1` = admin, `2` = usuario normal) |

> ⚠️ **Protección de último administrador:** si el usuario a eliminar es admin (`tipo: 1`) y es el único administrador que queda en el sistema, la eliminación será rechazada con un error `400`. Siempre debe existir al menos un administrador.

**Respuesta exitosa `200`:**
```json
{ "mensaje": "Usuario eliminado correctamente" }
```

**Errores posibles:**
| Código | Motivo |
|--------|--------|
| `400` | Intento de eliminar el único administrador restante |
| `404` | Usuario no encontrado |
| `500` | Error interno del servidor |

***

### ⚠️ Notas importantes para el frontend

1. **CORS**: El backend solo acepta peticiones del dominio configurado en `CLIENT_URL` (`.env`). Asegúrate de que tu URL de React coincida exactamente.
2. **Content-Type en productos**: Las rutas `POST /api/productos` y `PUT /api/productos/:id` esperan `multipart/form-data` (FormData), **no JSON**. No añadas `Content-Type` manualmente — el navegador lo gestiona solo al usar FormData.
3. **Token expirado**: El token dura 7 días. Si recibes un `401` en una ruta protegida, el token ha expirado — redirige al login.
4. **Campos de solo lectura**: Los campos `id`, `oferta` (al crear), y `precio_oferta` (al crear) los gestiona el backend; no los envíes en el POST de creación.
5. **Aromas y colores en PUT**: Si mandas `aromas: []`, borrarás todos los aromas. Si no mandas el campo `aromas`, los aromas se quedan igual. Mismo comportamiento con `colores`.
6. **Imágenes en PUT**: Si no mandas `imagenesConservar` ni `imagenes`, las fotos actuales no se tocan. Si mandas `imagenesConservar` con algunos IDs, solo se borran las que no estén en ese array. Las nuevas imágenes en `imagenes` se añaden a las que se conserven.

***

### ⚠️ Notas importantes para el frontend

1. **CORS**: El backend solo acepta peticiones del dominio configurado en `CLIENT_URL`.
2. **Productos con imágenes**: `POST /api/productos` y `PUT /api/productos/:id` usan `FormData`, no JSON.
3. **No pongas `Content-Type` manualmente** al usar `FormData`.
4. **Token expirado**: si recibes `401`, redirige al login.
5. **Aromas y colores en PUT**: si mandas el campo, reemplazas todo ese grupo; si no lo mandas, no cambia.
6. **Imágenes en PUT**: si mandas `imagenesConfig`, debes mandar el estado final completo del carrusel.
7. **Si falta una imagen existente dentro de `imagenesConfig`**, el backend la borra.
8. **Las imágenes nuevas se emparejan con `imagenes` por orden de aparición**.
9. **Tras guardar un producto**, es recomendable volver a pedir `GET /api/productos/:id` para refrescar los datos reales.

***

## 6. Rutas de la API — referencia completa

### Productos

| Método | URL | Auth | Qué hace |
|--------|-----|:----:|---------|
| GET | `/api/productos` | No | Devuelve todos los productos con `imagen_id` de la primera foto |
| GET | `/api/productos/:id` | No | Devuelve un producto completo con aromas, colores e `imagenes[]` |
| GET | `/api/productos/categoria/:id` | No | Filtra productos por categoría con `imagen_id` |
| GET | `/api/productos/color/:id` | No | Filtra productos por color con `imagen_id` |
| GET | `/api/productos/aroma/:id` | No | Filtra productos por aroma con `imagen_id` |
| GET | `/api/productos/imagen/:imagenId` | No | Devuelve el binario de una imagen |
| POST | `/api/productos` | 🔒 Admin | Crea un producto nuevo (FormData con imágenes) |
| PUT | `/api/productos/:id` | 🔒 Admin | Actualiza un producto (FormData con `imagenesConfig`) |
| DELETE | `/api/productos/:id` | 🔒 Admin | Elimina un producto y todas sus imágenes |

### Categorías

| Método | URL | Auth | Qué hace |
|--------|-----|:----:|---------|
| GET | `/api/categoria` | No | Devuelve todas las categorías |
| POST | `/api/categoria` | 🔒 Admin | Crea una categoría nueva |
| PUT | `/api/categoria/:id` | 🔒 Admin | Modifica una categoría |
| DELETE | `/api/categoria/:id` | 🔒 Admin | Elimina una categoría |

### Aromas

| Método | URL | Auth | Qué hace |
|--------|-----|:----:|---------|
| GET | `/api/aroma` | No | Devuelve todos los aromas |
| POST | `/api/aroma` | 🔒 Admin | Crea un aroma nuevo |
| PUT | `/api/aroma/:id` | 🔒 Admin | Modifica un aroma |
| DELETE | `/api/aroma/:id` | 🔒 Admin | Elimina un aroma (CASCADE en producto_aroma) |

### Colores

| Método | URL | Auth | Qué hace |
|--------|-----|:----:|---------|
| GET | `/api/color` | No | Devuelve todos los colores |
| POST | `/api/color` | 🔒 Admin | Crea un color nuevo |
| PUT | `/api/color/:id` | 🔒 Admin | Modifica un color |
| DELETE | `/api/color/:id` | 🔒 Admin | Elimina un color (CASCADE en producto_color) |

### Usuarios

| Método | URL | Auth | Qué hace |
|--------|-----|:----:|---------|
| GET | `/api/usuario` | 🔒 Admin | Devuelve todos los usuarios |
| PUT | `/api/usuario/:id` | 🔒 Admin | Cambia el tipo del usuario |
| DELETE | `/api/usuario/:id` | 🔒 Admin | Elimina un usuario |

### Pedidos

| Método | URL | Auth | Qué hace |
|--------|-----|:----:|---------|
| GET | `/api/pedidos` | 🔒 | Devuelve todos los pedidos |
| GET | `/api/pedidos/:id` | 🔒 | Devuelve un pedido por su ID |
| POST | `/api/pedidos` | 🔒 | Crea un pedido nuevo |
| PUT | `/api/pedidos/:id` | 🔒 Admin | Actualiza el estado de un pedido |

### Autenticación

| Método | URL | Auth | Qué hace |
|--------|-----|:----:|---------|
| POST | `/api/auth/register` | No | Registra un usuario nuevo |
| POST | `/api/auth/login` | No | Inicia sesión y devuelve token JWT |

***


## 7. Flujo de trabajo con ramas

### Estructura de ramas del proyecto

```
main          ← Código listo para entregar al cliente. NUNCA se toca directamente.
dev           ← Rama de trabajo del equipo. Aquí se integran todos los cambios.
feature/*     ← Una rama por cada funcionalidad nueva del backend.
fix/*         ← Una rama por cada corrección de error.
```

### Paso a paso — cómo trabajar cada día

**1. Situaros en `dev` y actualizaros antes de empezar**

```bash
git checkout dev
git pull origin dev
```

**2. Crear vuestra rama para la tarea**

```bash
git checkout -b feature/nombre-de-la-funcionalidad
```

**3. Trabajad con normalidad** en VS Code.

**4. Guardar y subir los cambios**

```bash
git add .
git commit -m "feat: descripción de lo que hicisteis"
git push origin feature/nombre-de-vuestra-rama
```

**5. Abrir un Pull Request en GitHub**

- Id a https://github.com/MauroSH-StemRookie/VelasArtesanalesTLV-Stemdo
- Haced click en el botón verde **"Compare & pull request"**
- Comprobad que el destino es **`dev`**, no `main`
- Escribid una descripción breve de lo que habéis hecho
- Pedid revisión a un compañero
- Cuando lo apruebe, haced **Merge**

***

## 8. Cómo trabajar desde VS Code (sin terminal)

### Clonar el repositorio desde VS Code

1. Abrid VS Code
2. Pulsad `Ctrl + Shift + P` → `Git: Clone`
3. Pegad la URL del repositorio
4. Elegid la carpeta local
5. Abrid el proyecto

### Cambiar de rama

En la barra inferior izquierda de VS Code veréis la rama actual. Desde ahí podéis cambiar a `dev` o crear una rama nueva.

### Actualizar (Pull) desde VS Code

1. Aseguraos de estar en `dev`
2. Source Control
3. `···`
4. **Pull**

### Subir cambios (commit + push) desde VS Code

1. Source Control
2. Añadir archivos con `+`
3. Escribir mensaje de commit
4. **Commit**
5. **Push** o **Sync Changes**

### Extensiones recomendadas

| Extensión | Para qué sirve |
|-----------|---------------|
| **GitLens** | Historial visual de cambios |
| **REST Client** | Probar rutas desde VS Code |
| **Prettier** | Formatear código |
| **ESLint** | Detectar errores |
| **Thunder Client** | Probar la API dentro de VS Code |

***

## 9. Scripts disponibles

Desde la carpeta `backend`:

| Comando | Qué hace |
|---------|---------|
| `npm run dev` | Arranca el servidor con nodemon |
| `npm start` | Arranca el servidor para producción |

***

## Dependencias principales

| Librería | Para qué sirve |
|----------|---------------|
| `express` | Framework para crear la API REST |
| `pg` | Conectar Node.js con PostgreSQL |
| `dotenv` | Cargar variables de entorno |
| `cors` | Permitir peticiones del frontend |
| `bcryptjs` | Cifrar contraseñas |
| `jsonwebtoken` | Crear y verificar JWT |
| `multer` | Procesar archivos de imagen |
| `nodemon` | Reiniciar servidor automáticamente |
