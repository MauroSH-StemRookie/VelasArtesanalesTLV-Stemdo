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
7. [Conexión con el backend (APIs)](#7-conexión-con-el-backend-apis)
8. [Autenticación y sesiones](#8-autenticación-y-sesiones)
9. [Carrito de compra](#9-carrito-de-compra)
10. [Funcionalidades pendientes (TODO BACKEND)](#10-funcionalidades-pendientes-todo-backend)
11. [Diseño y estilos](#11-diseño-y-estilos)
12. [Flujo de trabajo con ramas](#12-flujo-de-trabajo-con-ramas)
13. [Scripts disponibles](#13-scripts-disponibles)

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
│   └── api.js                     ← Todas las llamadas fetch al backend centralizadas
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
    │   └── ProductDetailModal.jsx  ← Modal de detalle con aromas, colores y "añadir al carrito"
    ├── custom/
    │   ├── CustomCandlePage.jsx    ← Personaliza tu vela (formulario de encargo)
    │   └── CustomCandlePage.css
    ├── cart/
    │   ├── CheckoutPage.jsx        ← Pasarela de pago en 3 pasos
    │   └── CheckoutPage.css
    ├── admin/
    │   ├── AdminPanel.jsx          ← Panel de admin con 5 pestañas
    │   ├── AdminPanel.css
    │   ├── ProductEditModal.jsx    ← Modal para editar un producto
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

Catálogo de productos conectado al backend (`GET /api/productos`). Incluye panel de filtros lateral (categoría, precio), barra de búsqueda por nombre, y grid de cards. Cada card tiene selector de cantidad y botón "Añadir al carrito". Al pulsar sobre la card se abre el `ProductDetailModal`.

### 🔍 ProductDetailModal

Se abre al pulsar en una card del catálogo. Carga el detalle completo del producto (`GET /api/productos/:id`) con sus aromas y colores disponibles. El usuario elige opciones antes de añadir al carrito.

### 🕯️ CustomCandlePage

Formulario de personalización de velas. El usuario elige tipo, aroma, color, tamaño, cantidad y escribe un mensaje opcional. Incluye un botón "Más información" cuya URL proporcionará el cliente (Sergio) más adelante. Al enviar la solicitud, se muestra pantalla de confirmación. **TODO BACKEND: creará un pedido personalizado cuando la API de pedidos esté lista.**

### 🛒 CheckoutPage (pasarela de pago)

Proceso de compra en 3 pasos: datos del cliente, envío + método de pago (PayPal/Bizum), y confirmación. Actualmente usa **simulación** — cuando el backend de pedidos esté listo, se conectará con `POST /api/pedidos`. Los puntos donde insertar el fetch están marcados con `TODO BACKEND` en el código.

### 👤 AuthModal

Modal con dos pestañas (Login / Registro). Login llama a `POST /api/auth/login`, registro llama a `POST /api/auth/registro` + login automático. La contraseña se valida en tiempo real con indicadores visuales (12 chars, mayúscula, número, signo de puntuación).

### ⚙️ AdminPanel (solo admin, tipo === 1)

Panel con 5 pestañas:

1. **Productos** — Lista desde `GET /api/productos`, con edición (`PUT`), eliminación (`DELETE`) y control de stock en tiempo real
2. **Añadir Producto** — Formulario conectado a `POST /api/productos` con selector de categoría, aromas y colores
3. **Características** — CRUD de categorías, aromas y colores
4. **Pedidos** — _Datos de ejemplo (pendiente de API)_
5. **Usuarios** — Lista desde `GET /api/usuario`, con botón para cambiar tipo admin/cliente (`POST /api/usuario/:id`) y eliminar (`DELETE /api/usuario/:id`)

### 👤 ProfilePage

Permite cambiar correo electrónico y contraseña. Ambos cambios requieren la contraseña actual como confirmación. **TODO BACKEND: necesita endpoints `PUT /api/auth/cambiar-correo` y `PUT /api/auth/cambiar-password`.**

### ❓ HelpPage

Preguntas frecuentes en formato acordeón + datos de contacto (email, teléfono, dirección, Instagram).

### 📦 OrdersPage

Historial de pedidos del usuario. **TODO BACKEND: datos de ejemplo hasta que `GET /api/pedidos` esté listo.**

---

## 7. Conexión con el backend (APIs)

Todas las llamadas están centralizadas en `services/api.js`. La función `request()` se encarga de añadir el token JWT y manejar errores.

### APIs conectadas y funcionando

| Servicio                 | Método | Endpoint             | Dónde se usa                          |
| ------------------------ | ------ | -------------------- | ------------------------------------- |
| `authAPI.login`          | POST   | `/api/auth/login`    | AuthModal                             |
| `authAPI.registro`       | POST   | `/api/auth/registro` | AuthModal                             |
| `productosAPI.getAll`    | GET    | `/api/productos`     | CatalogPage, AdminPanel               |
| `productosAPI.getById`   | GET    | `/api/productos/:id` | ProductDetailModal                    |
| `productosAPI.create`    | POST   | `/api/productos`     | AdminPanel (añadir)                   |
| `productosAPI.update`    | PUT    | `/api/productos/:id` | AdminPanel (editar, stock)            |
| `productosAPI.delete`    | DELETE | `/api/productos/:id` | AdminPanel (eliminar)                 |
| `categoriaAPI.*`         | CRUD   | `/api/categoria`     | AdminPanel (características)          |
| `aromaAPI.*`             | CRUD   | `/api/aroma`         | AdminPanel (características)          |
| `colorAPI.*`             | CRUD   | `/api/color`         | AdminPanel (características)          |
| `usuarioAPI.getAll`      | GET    | `/api/usuario`       | AdminPanel (usuarios)                 |
| `usuarioAPI.cambiarTipo` | POST   | `/api/usuario/:id`   | AdminPanel (hacer admin/quitar admin) |
| `usuarioAPI.delete`      | DELETE | `/api/usuario/:id`   | AdminPanel (eliminar usuario)         |

### APIs preparadas pero pendientes de backend

| Servicio            | Endpoint            | Dónde se usará                   |
| ------------------- | ------------------- | -------------------------------- |
| `pedidosAPI.create` | POST `/api/pedidos` | CheckoutPage, CustomCandlePage   |
| `pedidosAPI.getAll` | GET `/api/pedidos`  | AdminPanel (pedidos), OrdersPage |

---

## 8. Autenticación y sesiones

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

## 9. Carrito de compra

El carrito se gestiona con `CartContext.jsx`:

- Se vacía automáticamente al cerrar sesión o cambiar de cuenta
- Los productos se añaden desde el catálogo (rápido) o desde el modal de detalle (con opciones)
- El `CartDropdown` en la navbar muestra un resumen con badge de cantidad
- El `CheckoutPage` consume los items del carrito para el proceso de pago

**Nota:** El carrito vive en memoria (estado de React). No se sincroniza con el backend actualmente.

---

## 10. Funcionalidades pendientes (TODO BACKEND)

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

## 11. Diseño y estilos

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

---

## 12. Flujo de trabajo con ramas

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

## 13. Scripts disponibles

| Comando           | Qué hace                                 |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Servidor de desarrollo en localhost:5173 |
| `npm run build`   | Versión optimizada para producción       |
| `npm run preview` | Previsualizar la versión de producción   |
