# 🎨 Frontend — Velas Artesanales

Interfaz de usuario del e-commerce de Velas Artesanales.  
Construida con **React 19** y **Vite 8**.

---

## Índice

1. [Configuración inicial](#1-configuración-inicial)
2. [Variables de entorno](#2-variables-de-entorno)
3. [Arrancar en local](#3-arrancar-en-local)
4. [Estructura de carpetas](#4-estructura-de-carpetas)
5. [Arquitectura y flujo de la app](#5-arquitectura-y-flujo-de-la-app)
6. [Páginas y componentes](#6-páginas-y-componentes)
7. [Sistema de imágenes](#7-sistema-de-imágenes)
8. [Conexión con el backend (APIs)](#8-conexión-con-el-backend-apis)
9. [Autenticación y sesiones](#9-autenticación-y-sesiones)
10. [Carrito de compra](#10-carrito-de-compra)
11. [Funcionalidades pendientes (TODO BACKEND)](#11-funcionalidades-pendientes-todo-backend)
12. [Diseño y estilos](#12-diseño-y-estilos)
13. [Flujo de trabajo con ramas](#13-flujo-de-trabajo-con-ramas)
14. [Scripts disponibles](#14-scripts-disponibles)

---

## 1. Configuración inicial

```bash
git clone https://github.com/MauroSH-StemRookie/VelasArtesanalesTLV-Stemdo.git
cd VelasArtesanalesTLV-Stemdo/frontend
npm install
```

Solo hace falta hacerlo la primera vez y cada vez que alguien modifique `package.json`.

---

## 2. Variables de entorno

Cread un archivo `.env` en la carpeta `frontend/`:

```
VITE_API_URL=http://localhost:3000/api
```

Esta variable le dice al frontend dónde está el backend. En producción (Railway) se cambiará por la URL real.

> ⚠️ El `.env` no se sube a GitHub — está en el `.gitignore`.

---

## 3. Arrancar en local

Necesitáis **el backend corriendo** en otra terminal antes de arrancar el frontend:

```bash
# Terminal 1 — Backend
cd backend && npm run dev
# Disponible en http://localhost:3000

# Terminal 2 — Frontend
cd frontend && npm run dev
# Disponible en http://localhost:5173
```

---

## 4. Estructura de carpetas

```
frontend/src/
├── App.jsx                        ← Componente raíz, orquesta las "páginas"
├── App.css                        ← Estilos globales de componentes
├── index.css                      ← Variables CSS, reset, fuentes
├── main.jsx                       ← Punto de entrada (no se toca)
│
├── assets/
│   └── logo.png                   ← Logo de Artesanas de Velas
│
├── context/
│   ├── AuthContext.jsx             ← Estado global de autenticación (JWT)
│   └── CartContext.jsx             ← Estado global del carrito de compra
│
├── services/
│   └── api.js                     ← Llamadas fetch al backend (JSON + FormData)
│
├── hooks/
│   ├── useFadeUp.jsx              ← Animación de aparición al scroll
│   └── useClickOutside.jsx        ← Detectar clic fuera de un elemento
│
├── utils/
│   └── passwordValidation.js      ← Reglas de contraseña (12 chars, mayúscula, número, signo)
│
├── data/
│   └── staticData.jsx             ← Datos estáticos: NAV_LINKS, HERO_PRODUCTS, CATEGORIES, VALUES, FAQ_DATA
│
└── components/
    ├── icons/Icons.jsx             ← Todos los iconos SVG como componentes React
    ├── shared/                     ← Componentes reutilizables del sistema de imágenes
    │   ├── ImageCarousel.jsx       ← Carrusel de imágenes (flechas + dots)
    │   ├── ImageCarousel.css
    │   ├── ImageCropModal.jsx      ← Modal de recorte y ajuste al subir imagen
    │   └── ImageCropModal.css
    ├── navbar/
    │   ├── Navbar.jsx              ← Barra de navegación con búsqueda, usuario, carrito
    │   ├── UserDropdown.jsx        ← Desplegable del perfil (login/register o menú usuario)
    │   ├── CartDropdown.jsx        ← Desplegable del carrito
    │   └── CartDropdown.css
    ├── auth/
    │   └── AuthModal.jsx           ← Modal de login + registro con validación
    ├── home/
    │   └── HomePage.jsx            ← Página de inicio (Hero, Categorías, CTA, Valores)
    ├── catalog/
    │   ├── CatalogPage.jsx         ← Catálogo con filtros, búsqueda y grid de productos
    │   ├── CatalogPage.css
    │   └── ProductDetailModal.jsx  ← Modal de detalle con carrusel, aromas, colores y carrito
    ├── custom/
    │   ├── CustomCandlePage.jsx    ← Personaliza tu vela (formulario de encargo)
    │   └── CustomCandlePage.css
    ├── cart/
    │   ├── CheckoutPage.jsx        ← Pasarela de pago en 3 pasos
    │   └── CheckoutPage.css
    ├── admin/
    │   ├── AdminPanel.jsx          ← Panel de admin con 5 pestañas (incluye subida de imágenes)
    │   ├── AdminPanel.css
    │   ├── ProductEditModal.jsx    ← Modal para editar producto con carrusel + gestión de imágenes
    │   ├── ProductEditModal.css    ← Estilos del layout de imágenes (slots, visor, botones)
    │   ├── ConfirmModal.jsx        ← Modal de confirmación para eliminar
    │   └── EditorDeModalBoceto.jsx ← Boceto del editor (en desarrollo)
    ├── profile/
    │   └── ProfilePage.jsx         ← Cambiar correo y contraseña
    ├── help/
    │   └── HelpPage.jsx            ← FAQ + datos de contacto
    ├── orders/
    │   └── OrdersPage.jsx          ← Historial de pedidos del usuario
    └── footer/
        └── Footer.jsx              ← Pie de página
```

---

## 5. Arquitectura y flujo de la app

La app usa un sistema de "páginas" sencillo con `useState` en `App.jsx` — no usa React Router. Cuando se necesite, la migración es directa.

```
App.jsx (AuthProvider + CartProvider)
  └── AppContent
        ├── Navbar (siempre visible)
        ├── [currentPage === 'home']     → HomePage
        ├── [currentPage === 'catalog']  → CatalogPage
        ├── [currentPage === 'custom']   → CustomCandlePage
        ├── [currentPage === 'admin']    → AdminPanel (solo si isAdmin)
        ├── [currentPage === 'profile']  → ProfilePage (solo si user)
        ├── [currentPage === 'help']     → HelpPage
        ├── [currentPage === 'orders']   → OrdersPage (solo si user)
        ├── [currentPage === 'checkout'] → CheckoutPage
        ├── Footer (siempre visible)
        └── AuthModal (flotante, se abre/cierra)
```

---

## 6. Páginas y componentes

### 🏠 HomePage

Página de bienvenida con hero, categorías destacadas, CTA de personalización y valores de la marca. "Ver Colección" y "Explorar" navegan al catálogo. "Diseñar mi vela" navega a la página de personalización.

### 🛍️ CatalogPage

Catálogo de productos conectado al backend (`GET /api/productos`). Incluye panel de filtros lateral (categoría, precio, aroma, color), barra de búsqueda por nombre, y grid de cards. Cada card muestra la primera imagen del producto (`imagen_id`) con selector de cantidad y botón "Añadir al carrito". Al pulsar sobre la card se abre el `ProductDetailModal`.

### 🔍 ProductDetailModal

Se abre al pulsar en una card del catálogo. Carga el detalle completo del producto (`GET /api/productos/:id`) con sus aromas, colores e imágenes. Si el producto tiene **varias imágenes**, las muestra en un **carrusel** con flechas de navegación y puntos indicadores. El usuario elige opciones antes de añadir al carrito.

### 🕯️ CustomCandlePage

Formulario de personalización de velas. El usuario elige tipo, aroma, color, tamaño, cantidad y escribe un mensaje opcional. Incluye un botón "Más información" cuya URL proporcionará el cliente (Sergio) más adelante. Al enviar la solicitud, se muestra pantalla de confirmación. **TODO BACKEND: creará un pedido personalizado cuando la API de pedidos esté lista.**

### 🛒 CheckoutPage (pasarela de pago)

Proceso de compra en 3 pasos: datos del cliente, envío + método de pago (PayPal/Bizum), y confirmación. Actualmente usa **simulación** — cuando el backend de pedidos esté listo, se conectará con `POST /api/pedidos`. Los puntos donde insertar el fetch están marcados con `TODO BACKEND` en el código.

### 👤 AuthModal

Modal con dos pestañas (Login / Registro). Login llama a `POST /api/auth/login`, registro llama a `POST /api/auth/registro` + login automático. La contraseña se valida en tiempo real con indicadores visuales (12 chars, mayúscula, número, signo de puntuación).

### ⚙️ AdminPanel (solo admin, tipo === 1)

Panel con 5 pestañas:

1. **Productos** — Lista desde `GET /api/productos`, con edición (`PUT`), eliminación (`DELETE`) y control de stock en tiempo real. Cada card muestra la primera imagen del producto.
2. **Añadir Producto** — Layout a dos columnas: formulario (izquierda) y zona de imágenes (derecha). Permite subir hasta 3 imágenes con previsualización y herramienta de recorte/ajuste. La primera imagen es la vista previa del catálogo (orden 0).
3. **Características** — CRUD de categorías, aromas y colores
4. **Pedidos** — _Datos de ejemplo (pendiente de API)_
5. **Usuarios** — Lista desde `GET /api/usuario`, con botón para cambiar tipo admin/cliente y eliminar

### 🖼️ ProductEditModal (admin)

Modal de edición de producto con layout a dos columnas. La columna izquierda contiene el formulario de datos. La columna derecha muestra un **carrusel** con las imágenes existentes del producto y permite: eliminar imágenes individuales, y añadir nuevas hasta completar el máximo de 3. Al guardar, envía `imagenesConservar` (IDs de existentes que se mantienen) e `imagenesNuevas` (archivos nuevos) como `FormData`.

### 🖼️ ImageCarousel (compartido)

Componente reutilizable en `components/shared/`. Recibe un array de `{ id, orden }` y las muestra con flechas de navegación, puntos indicadores y contador. Si solo hay una imagen, la muestra sin controles. Si no hay imágenes, muestra el placeholder con el icono de llama.

### ✂️ ImageCropModal (compartido)

Modal de recorte y ajuste que se abre al subir cualquier imagen. Permite hacer zoom (slider), rotar en pasos de 90°, y arrastrar la imagen para reposicionar. Al confirmar, genera un archivo WebP recortado de 800×800 px usando Canvas. Se usa tanto en el formulario de creación como en el de edición.

### 👤 ProfilePage

Permite cambiar correo electrónico y contraseña. Ambos cambios requieren la contraseña actual como confirmación. **TODO BACKEND: necesita endpoints `PUT /api/auth/cambiar-correo` y `PUT /api/auth/cambiar-password`.**

### ❓ HelpPage

Preguntas frecuentes en formato acordeón + datos de contacto (email, teléfono, dirección, Instagram).

### 📦 OrdersPage

Historial de pedidos del usuario. **TODO BACKEND: datos de ejemplo hasta que `GET /api/pedidos` esté listo.**

---

## 7. Sistema de imágenes

Los productos pueden tener **hasta 3 imágenes** almacenadas en la base de datos como binario (`BYTEA`). El sistema funciona así:

### Cómo se muestran

- En los **listados** (`CatalogPage`, `AdminPanel` tab Productos), cada producto tiene un campo `imagen_id` con el ID de su primera imagen (orden 0). Si no tiene imágenes, devuelve `null` y se muestra un placeholder.
- En los **modales de detalle** (`ProductDetailModal` del catálogo y `ProductEditModal` del admin), se carga el array completo `imagenes: [{ id, orden }]` del endpoint `GET /api/productos/:id` y se muestra en un **carrusel**.

### Cómo construir la URL de una imagen

Las imágenes se sirven como binario desde un endpoint propio. El navegador las renderiza automáticamente al usarlas en un `<img>`:

```jsx
// En listados — primera imagen con imagen_id
<img
  src={`http://localhost:3000/api/productos/imagen/${producto.imagen_id}`}
  alt={producto.nombre}
/>;

// En detalle — todas las imágenes con el array imagenes
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

### Cómo se suben

Las rutas `POST /api/productos` y `PUT /api/productos/:id` esperan **`multipart/form-data`** (FormData), no JSON. El servicio `api.js` se encarga de montar el FormData automáticamente:

```js
// api.js — productosAPI.create() construye el FormData internamente
await productosAPI.create({
  nombre: "Vela de lavanda",
  precio: 12.5,
  stock: 10,
  categoria: 2,
  aromas: [1, 3],
  colores: [1, 2],
  imagenes: [file1, file2], // Array de objetos File
});
```

> ⚠️ **Importante**: `productosAPI.create()` y `productosAPI.update()` usan `FormData` internamente. No hay que montar el FormData manualmente — el servicio lo hace solo. Pero tampoco se debe usar la función `request()` genérica (que añade `Content-Type: application/json`) para estas rutas.

### Flujo de subida con recorte

1. El usuario hace clic en un slot de imagen vacío (o en "Añadir imagen")
2. Se abre el selector de archivos del navegador
3. Al elegir un archivo, se abre el **ImageCropModal** con herramienta de zoom, rotación y arrastre
4. Al confirmar, el modal genera un **archivo WebP de 800×800 px** usando Canvas
5. El archivo recortado se guarda en el estado del componente como un objeto `File`
6. Al enviar el formulario, todos los `File` se añaden al FormData con la clave `imagenes`

### Flujo de edición de imágenes

1. Al abrir el `ProductEditModal`, se cargan las imágenes existentes del producto desde `GET /api/productos/:id`
2. Se muestran en un carrusel con un botón para eliminar cada una
3. Si el producto tiene menos de 3 imágenes, aparece un botón para añadir más
4. Al guardar, se envía:
   - `imagenesConservar`: IDs de las imágenes existentes que el usuario **no eliminó**
   - `imagenes`: archivos nuevos que el usuario subió
5. El backend borra las imágenes que no están en `imagenesConservar` e inserta las nuevas

---

## 8. Conexión con el backend (APIs)

Todas las llamadas están centralizadas en `services/api.js`. El servicio expone dos funciones internas:

- **`request()`** — Para peticiones JSON estándar (auth, categorías, aromas, colores, usuarios, pedidos)
- **`requestFormData()`** — Para peticiones con archivos (crear/actualizar productos con imágenes). No añade `Content-Type` — el navegador lo gestiona solo con FormData.

### APIs conectadas y funcionando

| Servicio                 | Método | Endpoint             | Formato  | Dónde se usa                          |
| ------------------------ | ------ | -------------------- | -------- | ------------------------------------- |
| `authAPI.login`          | POST   | `/api/auth/login`    | JSON     | AuthModal                             |
| `authAPI.registro`       | POST   | `/api/auth/registro` | JSON     | AuthModal                             |
| `productosAPI.getAll`    | GET    | `/api/productos`     | JSON     | CatalogPage, AdminPanel               |
| `productosAPI.getById`   | GET    | `/api/productos/:id` | JSON     | ProductDetailModal, ProductEditModal  |
| `productosAPI.create`    | POST   | `/api/productos`     | FormData | AdminPanel (añadir)                   |
| `productosAPI.update`    | PUT    | `/api/productos/:id` | FormData | AdminPanel (editar, stock)            |
| `productosAPI.delete`    | DELETE | `/api/productos/:id` | JSON     | AdminPanel (eliminar)                 |
| `categoriaAPI.*`         | CRUD   | `/api/categoria`     | JSON     | AdminPanel (características)          |
| `aromaAPI.*`             | CRUD   | `/api/aroma`         | JSON     | AdminPanel (características)          |
| `colorAPI.*`             | CRUD   | `/api/color`         | JSON     | AdminPanel (características)          |
| `usuarioAPI.getAll`      | GET    | `/api/usuario`       | JSON     | AdminPanel (usuarios)                 |
| `usuarioAPI.cambiarTipo` | PUT    | `/api/usuario/:id`   | JSON     | AdminPanel (hacer admin/quitar admin) |
| `usuarioAPI.delete`      | DELETE | `/api/usuario/:id`   | JSON     | AdminPanel (eliminar usuario)         |

### APIs preparadas pero pendientes de backend

| Servicio            | Endpoint            | Dónde se usará                   |
| ------------------- | ------------------- | -------------------------------- |
| `pedidosAPI.create` | POST `/api/pedidos` | CheckoutPage, CustomCandlePage   |
| `pedidosAPI.getAll` | GET `/api/pedidos`  | AdminPanel (pedidos), OrdersPage |

---

## 9. Autenticación y sesiones

El frontend usa **JWT** (JSON Web Tokens) para la autenticación:

1. El usuario hace login → el backend devuelve `{ token, user: { id, nombre, correo, tipo } }`
2. El token y los datos del usuario se guardan en `localStorage`
3. En cada petición protegida, `api.js` añade la cabecera `Authorization: Bearer <token>`
4. Si el token expira (401/403), se limpia automáticamente y el usuario vuelve a ver la opción de login

El campo `tipo` del usuario determina el rol:

- **tipo 1** = Administrador (ve el Panel de Administración)
- **tipo 2** = Cliente normal (ve Mis Pedidos)

La sesión persiste al recargar la página gracias a `localStorage`.

---

## 10. Carrito de compra

El carrito se gestiona con `CartContext.jsx`:

- Se vacía automáticamente al cerrar sesión o cambiar de cuenta
- Los productos se añaden desde el catálogo (rápido) o desde el modal de detalle (con opciones)
- El `CartDropdown` en la navbar muestra un resumen con badge de cantidad
- El `CheckoutPage` consume los items del carrito para el proceso de pago

**Nota:** El carrito vive en memoria (estado de React). No se sincroniza con el backend actualmente.

---

## 11. Funcionalidades pendientes (TODO BACKEND)

Todos los puntos marcados con `TODO BACKEND` en el código indican dónde conectar cuando las APIs estén listas:

| Funcionalidad        | Archivo                | Qué falta                                                                  |
| -------------------- | ---------------------- | -------------------------------------------------------------------------- |
| Proceso de pago real | `CheckoutPage.jsx`     | Descomentar el `pedidosAPI.create()` y quitar la simulación                |
| Vela personalizada   | `CustomCandlePage.jsx` | Crear endpoint de pedido personalizado y conectar el `pedidosAPI.create()` |
| Historial de pedidos | `OrdersPage.jsx`       | Reemplazar datos de ejemplo con `pedidosAPI.getAll()` filtrado por usuario |
| Pedidos en admin     | `AdminPanel.jsx`       | Reemplazar datos de ejemplo con `pedidosAPI.getAll()`                      |
| Cambiar correo       | `ProfilePage.jsx`      | Crear endpoint `PUT /api/auth/cambiar-correo`                              |
| Cambiar contraseña   | `ProfilePage.jsx`      | Crear endpoint `PUT /api/auth/cambiar-password`                            |
| URL "Más info"       | `CustomCandlePage.jsx` | Sergio proporcionará la URL de destino                                     |

---

## 12. Diseño y estilos

### Paleta de colores (extraída del logo)

| Variable CSS   | Color     | Uso                                      |
| -------------- | --------- | ---------------------------------------- |
| `--cream`      | `#dacab5` | Fondo principal                          |
| `--brown-dark` | `#3E2723` | Texto principal, botones                 |
| `--rose`       | `#D4919B` | Acentos, badges, hover                   |
| `--lavender`   | `#9B8BB4` | Eyebrows de sección                      |
| `--gold`       | `#C9A84C` | Precios, links activos, detalles premium |

### Tipografía

- **Títulos:** Cormorant Garamond (serif, elegante)
- **Cuerpo:** Jost (sans-serif, moderna)
- **Tamaño base:** 17px

### Convenciones CSS

- Variables globales en `index.css`
- Estilos de componentes globales en `App.css`
- Estilos específicos en archivos `.css` junto al componente (ej: `CatalogPage.css`)
- Transiciones con `var(--transition)` para consistencia
- Los componentes compartidos (`shared/`) tienen sus propios `.css` importados desde el `.jsx`

---

## 13. Flujo de trabajo con ramas

```
main          ← Producción. NUNCA se toca directamente.
dev           ← Rama de integración del equipo.
feature/*     ← Una rama por funcionalidad nueva.
fix/*         ← Una rama por corrección de error.
```

### Día a día

```bash
git checkout dev && git pull origin dev          # Actualizar
git checkout -b feature/nombre-funcionalidad     # Crear rama
# ... trabajar ...
git add . && git commit -m "feat: descripción"   # Guardar
git push origin feature/nombre-funcionalidad     # Subir
# → Abrir Pull Request en GitHub hacia dev
```

---

## 14. Scripts disponibles

| Comando           | Qué hace                                 |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Servidor de desarrollo en localhost:5173 |
| `npm run build`   | Versión optimizada para producción       |
| `npm run preview` | Previsualizar la versión de producción   |
