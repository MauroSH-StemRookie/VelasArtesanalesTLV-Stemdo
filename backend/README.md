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
│       └── adminMiddleware.js              ← Verifica que el usuario sea de tipo Admin
├── .env                                    ← Variables de entorno (NO sube a GitHub)
├── .env.example                            ← Plantilla de variables (SÍ sube a GitHub)
└── package.json                            ← Dependencias y scripts
```

### ¿Qué hace cada carpeta?

**`routes/`** — Define qué URLs existen y qué función se ejecuta cuando alguien las llama. Es como el índice de la API. 

**`controllers/`** — Contiene la lógica real de cada acción (obtener productos, crear un pedido, etc.). Los routes llaman a los controllers.

**`models/`** — Las consultas SQL a la base de datos. Aquí es donde se escribe `SELECT`, `INSERT`, `UPDATE`, etc.

**`middleware/`** — Funciones que se ejecutan antes de llegar a la ruta. Por ejemplo, comprobar si el usuario está logueado antes de dejarle ver sus pedidos.

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

  // Al cargar la app, recuperar sesión guardada
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

```jsx
// src/main.jsx — envolver la app con el provider
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
```

#### ¿Cómo incluir el token en las peticiones?

Crea un helper `api.js` que añada el token automáticamente en todas las peticiones:

```js
// src/helpers/api.js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  // Si el token ha expirado, el backend devuelve 401
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // redirigir al login
  }

  return res;
};
```

Uso en cualquier componente:

```jsx
import { apiFetch } from '../helpers/api';

// GET sin token (catálogo público)
const res  = await apiFetch('/productos');
const data = await res.json();

// POST con token (solo admin)
const res = await apiFetch('/productos', {
  method: 'POST',
  body: JSON.stringify({ nombre: 'Vela de rosa', precio: 15.00, ... }),
});

// DELETE con token (solo admin)
const res = await apiFetch(`/productos/${id}`, { method: 'DELETE' });
```

#### ¿Cómo saber si el usuario es admin en React?

Usa el campo `tipo` del objeto `user` guardado en el contexto:

```jsx
import { useAuth } from '../context/AuthContext';

function PanelAdmin() {
  const { user } = useAuth();

  if (!user || user.tipo !== 1) {
    return <p>No tienes permisos para ver esta sección.</p>;
  }

  return <div>Panel de administración...</div>;
}
```

#### Mantener la sesión iniciada tras recargar la página

El `useEffect` del `AuthProvider` recupera el token de `localStorage` cada vez que se monta la app, por lo que la sesión persiste entre recargas. El token dura 7 días — si el usuario cierra el navegador y lo vuelve a abrir antes de que expire, seguirá logueado automáticamente.

***

### Autenticación con JWT — resumen de cabeceras

```js
// Rutas públicas — sin token
fetch('/api/productos')

// Rutas protegidas — con token en Authorization
fetch('/api/productos', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

> ℹ️ Las rutas de solo lectura (GET productos, categorías, aromas, colores) **no requieren token**. Las rutas de escritura (POST, PUT, DELETE) sí lo necesitan.

#### ¿Qué contiene el token?

Cuando decodifiques el JWT (o uses la respuesta del login), el payload contiene:

```json
{
  "id": 1,
  "nombre": "Nombre del usuario",
  "correo": "usuario@email.com",
  "tipo": 2
}
```

> El campo `tipo` indica el rol: **`2` = cliente normal**, **`1` = administrador**. Úsalo para mostrar u ocultar opciones de admin en el frontend.

***

### 🔐 Rutas de Autenticación

#### `POST /api/auth/register` — Registro de usuario

**Body (JSON) — campos obligatorios marcados con ✅, opcionales con ⚪:**

| Campo | Tipo | ¿Obligatorio? | Descripción |
|-------|------|:---:|-------------|
| `nombre` | `string` | ✅ | Nombre completo del usuario |
| `correo` | `string` | ✅ | Email (debe ser único en el sistema) |
| `password` | `string` | ✅ | Contraseña en texto plano (el backend la encripta) |
| `telefono` | `string` | ✅ | Número de teléfono de contacto |
| `calle` | `string` | ⚪ | Nombre de la calle de la dirección |
| `numero` | `string` | ⚪ | Número de portal/edificio |
| `cp` | `string` | ⚪ | Código postal |
| `ciudad` | `string` | ⚪ | Ciudad |
| `provincia` | `string` | ⚪ | Provincia |
| `piso` | `string` | ⚪ | Piso / puerta (ej: "3B") |

**Ejemplo de body:**
```json
{
  "nombre": "Ana García",
  "correo": "ana@ejemplo.com",
  "password": "miContraseña123",
  "telefono": "600123456",
  "calle": "Calle Mayor",
  "numero": "10",
  "cp": "28001",
  "ciudad": "Madrid",
  "provincia": "Madrid",
  "piso": "2A"
}
```

**Respuesta exitosa `201`:**
```json
{
  "id": 5,
  "nombre": "Ana García",
  "correo": "ana@ejemplo.com"
}
```

**Errores posibles:**
| Código | Motivo |
|--------|--------|
| `400` | Falta algún campo obligatorio, o el correo ya está registrado |
| `500` | Error interno del servidor |

***

#### `POST /api/auth/login` — Inicio de sesión

**Body (JSON):**

| Campo | Tipo | ¿Obligatorio? | Descripción |
|-------|------|:---:|-------------|
| `correo` | `string` | ✅ | Email del usuario |
| `password` | `string` | ✅ | Contraseña en texto plano |

**Ejemplo de body:**
```json
{
  "correo": "ana@ejemplo.com",
  "password": "miContraseña123"
}
```

**Respuesta exitosa `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 5,
    "nombre": "Ana García",
    "correo": "ana@ejemplo.com",
    "tipo": 2
  }
}
```

> 💡 Guarda el `token` para usarlo en peticiones posteriores. La password **nunca** viene en la respuesta.

**Errores posibles:**
| Código | Motivo |
|--------|--------|
| `401` | Correo o contraseña incorrectos |
| `500` | Error interno del servidor |

***

### 🛍️ Rutas de Productos

#### `GET /api/productos` — Listado del catálogo

No requiere token. Devuelve todos los productos **sin** desglose de aromas ni colores (para listados/catálogo).

**Respuesta `200` — array de productos:**
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
    "imagen": "https://url-de-la-imagen.jpg",
    "categoria_id": 2,
    "categoria_nombre": "Aromaterapia"
  }
]
```

***

#### `GET /api/productos/:id` — Detalle de un producto

No requiere token. Devuelve **todos los datos** del producto, incluyendo sus aromas y colores disponibles.

**Parámetro de URL:** `:id` → ID numérico del producto

**Respuesta `200`:**
```json
{
  "id": 1,
  "nombre": "Vela de lavanda",
  "descripcion": "Vela artesanal con aroma a lavanda",
  "precio": "12.50",
  "stock": 30,
  "oferta": false,
  "precio_oferta": "12.50",
  "imagen": "https://url-de-la-imagen.jpg",
  "categoria_id": 2,
  "categoria_nombre": "Aromaterapia",
  "aromas": [
    { "id": 1, "nombre": "Lavanda" },
    { "id": 3, "nombre": "Vainilla" }
  ],
  "colores": [
    { "id": 1, "nombre": "Morado" },
    { "id": 2, "nombre": "Blanco" }
  ]
}
```

> Si el producto no tiene aromas o colores asignados, esos campos devuelven `[]` (array vacío), nunca `null`.

**Errores posibles:**
| Código | Motivo |
|--------|--------|
| `404` | Producto no encontrado |
| `500` | Error interno del servidor |

***

#### `GET /api/productos/categoria/:id` — Productos por categoría

No requiere token. Devuelve productos filtrados por categoría (sin aromas ni colores).

**Parámetro de URL:** `:id` → ID numérico de la categoría

***

#### `GET /api/productos/color/:id` — Productos por color

No requiere token. Filtra productos que tengan ese color disponible.

**Parámetro de URL:** `:id` → ID numérico del color

***

#### `GET /api/productos/aroma/:id` — Productos por aroma

No requiere token. Filtra productos que tengan ese aroma disponible.

**Parámetro de URL:** `:id` → ID numérico del aroma

***

#### `POST /api/productos` — Crear producto *(solo admin)*

🔒 **Requiere token de administrador** (`tipo: 1`) en la cabecera `Authorization`.

**Body (JSON):**

| Campo | Tipo | ¿Obligatorio? | Descripción |
|-------|------|:---:|-------------|
| `nombre` | `string` | ✅ | Nombre del producto |
| `descripcion` | `string` | ✅ | Descripción del producto |
| `precio` | `number` | ✅ | Precio base (también se usa como precio_oferta inicial) |
| `stock` | `number` | ✅ | Cantidad disponible en stock |
| `categoria` | `number` | ✅ | ID de la categoría a la que pertenece |
| `imagen` | `string` | ⚪ | URL de la imagen del producto (puede ser `null`) |
| `aromas` | `number[]` | ⚪ | Array de IDs de aromas disponibles. Ej: `[1, 3]` |
| `colores` | `number[]` | ⚪ | Array de IDs de colores disponibles. Ej: `[1, 2]` |

> ⚠️ `oferta` y `precio_oferta` **no se envían al crear** — el backend los establece automáticamente (`oferta = false`, `precio_oferta = precio`).

**Ejemplo de body:**
```json
{
  "nombre": "Vela de rosa",
  "descripcion": "Vela artesanal con aroma a rosa",
  "precio": 15.00,
  "stock": 20,
  "categoria": 2,
  "imagen": "https://url-imagen.jpg",
  "aromas": [1,3,4],
  "colores": [1,2,5,6,7]
}
```

**Respuesta exitosa `201`:** el objeto del producto recién creado.

***

#### `PUT /api/productos/:id` — Actualizar producto *(solo admin)*

🔒 **Requiere token de administrador** (`tipo: 1`).

**Parámetro de URL:** `:id` → ID del producto a actualizar

**Body (JSON):**

| Campo | Tipo | ¿Obligatorio? | Descripción |
|-------|------|:---:|-------------|
| `nombre` | `string` | ✅ | Nombre del producto |
| `descripcion` | `string` | ✅ | Descripción del producto |
| `precio` | `number` | ✅ | Precio base |
| `stock` | `number` | ✅ | Stock disponible |
| `oferta` | `boolean` | ✅ | `true` si está en oferta, `false` si no |
| `precio_oferta` | `number` | ✅ | Precio con descuento (puede ser igual al precio si no hay oferta) |
| `categoria` | `number` | ✅ | ID de la categoría |
| `imagen` | `string` | ⚪ | URL de la imagen (puede ser `null`) |
| `aromas` | `number[]` | ⚪ | Si se envía, **reemplaza todos** los aromas anteriores. Si no se envía, los aromas no cambian. |
| `colores` | `number[]` | ⚪ | Si se envía, **reemplaza todos** los colores anteriores. Si no se envía, los colores no cambian. |

**Respuesta exitosa `200`:** el objeto del producto actualizado.

***

#### `DELETE /api/productos/:id` — Eliminar producto *(solo admin)*

🔒 **Requiere token de administrador** (`tipo: 1`).

**Parámetro de URL:** `:id` → ID del producto a eliminar

> Las conexiones de los aromas y colores (Tablas `producto_aroma`, `producto_color`) asociados se eliminan automáticamente (CASCADE en base de datos).

**Respuesta exitosa `200`:**
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

**Ejemplo — pasar a usuario normal a admin:**
```json
{ "tipo": 2 }
```

**Ejemplo — pasar a admin a usuario normal:**
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
2. **Content-Type**: En peticiones POST/PUT, incluye siempre `'Content-Type': 'application/json'` en las cabeceras.
3. **Token expirado**: El token dura 7 días. Si recibes un `401` en una ruta protegida, el token ha expirado — redirige al login.
4. **Campos de solo lectura**: Los campos `id`, `oferta` (al crear), y `precio_oferta` (al crear) los gestiona el backend; no los envíes en el POST de creación.
5. **Aromas y colores en PUT**: Si mandas `aromas: []`, borrarás todos los aromas. Si no mandas el campo `aromas`, los aromas se quedan igual. Mismo comportamiento con `colores`.

***

## 6. Rutas de la API — referencia completa

### Productos

| Método | URL | Auth | Qué hace |
|--------|-----|:----:|---------|
| GET | `/api/productos` | No | Devuelve todos los productos (sin aromas/colores) |
| GET | `/api/productos/:id` | No | Devuelve un producto completo con aromas y colores |
| GET | `/api/productos/categoria/:id` | No | Filtra productos por categoría |
| GET | `/api/productos/color/:id` | No | Filtra productos por color |
| GET | `/api/productos/aroma/:id` | No | Filtra productos por aroma |
| POST | `/api/productos` | 🔒 Admin | Crea un producto nuevo |
| PUT | `/api/productos/:id` | 🔒 Admin | Actualiza un producto |
| DELETE | `/api/productos/:id` | 🔒 Admin | Elimina un producto |

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
| PUT | `/api/usuario/:id` | 🔒 Admin | Cambia el tipo del usuario (toggle admin ↔ usuario) |
| DELETE | `/api/usuario/:id` | 🔒 Admin | Elimina un usuario (protege al último admin) |

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

Hacedlo siempre al inicio del día para tener los cambios de vuestros compañeros.

**2. Crear vuestra rama para la tarea**

```bash
git checkout -b feature/nombre-de-la-funcionalidad
```

Ejemplos de nombres de rama:

```
feature/api-productos
feature/api-pedidos
feature/autenticacion-jwt
feature/middleware-auth
feature/modelo-carrito
fix/error-conexion-db
fix/validacion-productos
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

### Ejemplos de mensajes de commit

```
feat: crear ruta GET /api/productos con paginación
feat: añadir middleware de autenticación JWT
feat: implementar modelo de pedidos
fix: corregir error 500 en ruta de login
fix: arreglar conexión a Neon con SSL
chore: instalar librería bcryptjs para contraseñas
```

***

## 8. Cómo trabajar desde VS Code (sin terminal)

### Clonar el repositorio desde VS Code

1. Abrid VS Code (sin ningún proyecto abierto)
2. Pulsad `Ctrl + Shift + P` → escribid `Git: Clone`
3. Pegad la URL: `https://github.com/MauroSH-StemRookie/VelasArtesanalesTLV-Stemdo.git`
4. Elegid dónde guardarlo en vuestro ordenador
5. Cuando os pregunte si abrirlo, decid que sí

### Cambiar de rama

En la **barra inferior izquierda** de VS Code veréis el nombre de la rama actual.  
Haced click ahí y se abre un menú donde podéis:
- Seleccionar una rama existente para cambiar a ella
- Escribir un nombre nuevo para crear una rama nueva

Antes de empezar a trabajar: cambiad a `dev`, haced Pull, y luego cread vuestra rama `feature/...`

### Actualizar (Pull) desde VS Code

1. Aseguraos de estar en `dev` (barra inferior izquierda)
2. Haced click en el icono de **Source Control** en la barra lateral (el tercero, parece un árbol)
3. Haced click en los tres puntos `···`
4. Seleccionad **Pull**

### Subir cambios (commit + push) desde VS Code

1. Haced click en el icono de **Source Control** en la barra lateral izquierda
2. Veréis los archivos modificados listados:
   - En verde los archivos nuevos
   - En naranja/amarillo los modificados
3. Haced click en el **+** junto a cada archivo (o en el **+** general de arriba para añadir todos)
4. Escribid el mensaje del commit en el cuadro de texto
5. Haced click en el botón azul **Commit**
6. Luego **Sync Changes** o `···` → **Push**

### Arrancar el servidor desde la terminal integrada de VS Code

```
Menú superior → Terminal → New Terminal
```

O con el atajo `Ctrl + ñ` (en teclado español).

Desde ahí:

```bash
cd backend
npm run dev
```

### Resolver conflictos desde VS Code

Si al hacer Pull os avisa de conflictos, VS Code os mostrará los archivos en conflicto marcados en rojo. Al abrirlos veréis dos versiones destacadas con botones para elegir:
- **Accept Current Change** — quedarse con vuestra versión
- **Accept Incoming Change** — quedarse con la del compañero
- **Accept Both Changes** — mezclar las dos

Después de resolver, haced commit normalmente.

### Extensiones recomendadas

Instaladlas desde `Ctrl + Shift + X`:

| Extensión | Para qué sirve |
|-----------|---------------|
| **GitLens** | Ver quién cambió cada línea, historial visual |
| **REST Client** | Probar las rutas de la API directamente desde VS Code |
| **Prettier** | Formatear el código automáticamente al guardar |
| **ESLint** | Detectar errores en el código mientras escribís |
| **Thunder Client** | Alternativa a Postman para probar la API, dentro de VS Code |

***

## 9. Scripts disponibles

Desde la carpeta `backend`:

| Comando | Qué hace |
|---------|---------| 
| `npm run dev` | Arranca el servidor con nodemon (se reinicia al guardar) |
| `npm start` | Arranca el servidor sin nodemon (para producción) |

***

## Dependencias principales

| Librería | Para qué sirve |
|----------|---------------|
| `express` | Framework para crear la API REST |
| `pg` | Conectar Node.js con PostgreSQL (Neon) |
| `dotenv` | Cargar las variables de entorno del `.env` |
| `cors` | Permitir peticiones del frontend React |
| `bcryptjs` | Cifrar las contraseñas antes de guardarlas |
| `jsonwebtoken` | Crear y verificar tokens de autenticación |
| `nodemon` | Reiniciar el servidor automáticamente al guardar |