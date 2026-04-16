# 🎨 Frontend — Velas Artesanales

Interfaz de usuario del e-commerce de Velas Artesanales.
Construida con **React 19** y **Vite 8**, conectada al backend Node + PostgreSQL.

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
10. [Paginación del catálogo](#10-paginación-del-catálogo)
11. [Autocompletado con el perfil del usuario](#11-autocompletado-con-el-perfil-del-usuario)
12. [Funcionalidades pendientes (TODO BACKEND)](#12-funcionalidades-pendientes-todo-backend)
13. [Diseño y estilos](#13-diseño-y-estilos)
14. [Convenciones de código](#14-convenciones-de-código)
15. [Flujo de trabajo con ramas](#15-flujo-de-trabajo-con-ramas)
16. [Scripts disponibles](#16-scripts-disponibles)

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

Esta variable le dice al frontend dónde está el backend. En producción (Railway) se cambiará por la URL real del backend desplegado.

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

El servidor de Vite tiene HMR (Hot Module Reload), así que no hace falta refrescar el navegador al guardar archivos.

---

## 4. Estructura de carpetas

```
frontend/src/
├── App.jsx                        ← Componente raíz, orquesta las "páginas"
├── App.css                        ← Estilos globales de componentes
├── index.css                      ← Variables CSS, reset, fuentes
├── main.jsx                       ← Punto de entrada (monta BrowserRouter + App)
│
├── assets/                        ← Imágenes y recursos del branding
│   ├── logo.png
│   ├── hero.png
│   └── ...
│
├── context/                       ← Estado global compartido
│   ├── AuthContext.jsx            ← Autenticación con JWT
│   └── CartContext.jsx            ← Carrito de compra
│
├── services/
│   └── api.js                     ← TODAS las llamadas al backend centralizadas
│
├── hooks/                         ← Custom hooks reutilizables
│   ├── useFadeUp.jsx              ← Animación de aparición al scroll
│   ├── useClickOutside.jsx        ← Detectar clic fuera de un elemento
│   └── usePagination.jsx          ← Estado de paginación server-side
│
├── utils/
│   └── passwordValidation.js      ← Reglas de contraseña (12+ chars, mayús., nº, signo)
│
├── data/
│   └── staticData.jsx             ← NAV_LINKS, HERO_PRODUCTS, CATEGORIES, VALUES, FAQ_DATA
│
└── components/
    ├── icons/
    │   └── Icons.jsx              ← Todos los iconos SVG como componentes React
    │
    ├── shared/                    ← Componentes reutilizables entre páginas
    │   ├── paginator/
    │   │   ├── Paginator.jsx      ← Paginador numerado + selector de items por página
    │   │   └── Paginator.css
    │   ├── ImageCarousel.jsx      ← Carrusel de imágenes de producto
    │   ├── ImageCarousel.css
    │   ├── ImageCropModal.jsx     ← Recorte de imágenes antes de subirlas
    │   └── ImageCropModal.css
    │
    ├── navbar/
    │   ├── Navbar.jsx             ← Barra superior con búsqueda, usuario, carrito
    │   ├── UserDropdown.jsx       ← Desplegable del perfil
    │   ├── CartDropdown.jsx       ← Desplegable del carrito
    │   └── CartContext.jsx        ← (alias local que re-exporta context/CartContext)
    │
    ├── auth/
    │   └── AuthModal.jsx          ← Modal de login + registro con validación
    │
    ├── home/
    │   └── HomePage.jsx           ← Página de inicio
    │
    ├── catalog/
    │   ├── CatalogPage.jsx        ← Catálogo con filtros, búsqueda, ordenación y paginación
    │   ├── CatalogPage.css
    │   └── ProductDetailModal.jsx ← Modal de detalle con aromas y colores
    │
    ├── custom/
    │   ├── CustomCandlePage.jsx   ← Personaliza tu vela (autocompleta con /me)
    │   └── CustomCandlePage.css
    │
    ├── cart/
    │   ├── CheckoutPage.jsx       ← Pasarela de pago en 3 pasos (autocompleta con /me)
    │   └── CheckoutPage.css
    │
    ├── admin/                     ← Panel de administración (solo tipo=1)
    │   ├── AdminPanel.jsx         ← Panel con 5 pestañas
    │   ├── AdminPanel.css
    │   ├── ProductEditModal.jsx   ← Modal de edición de producto
    │   ├── ConfirmModal.jsx       ← Modal genérico de confirmación
    │   └── EditorDeModalBoceto.jsx
    │
    ├── profile/                   ← Configuración de la cuenta del usuario
    │   ├── ProfilePage.jsx        ← Orquestador que carga GET /me
    │   ├── ProfilePage.css
    │   ├── PersonalDataForm.jsx   ← Nombre y teléfono
    │   ├── AddressForm.jsx        ← Dirección completa
    │   ├── PasswordForm.jsx       ← Cambio de contraseña
    │   └── DeleteAccountForm.jsx  ← Eliminar cuenta con doble confirmación
    │
    ├── orders/
    │   └── OrdersPage.jsx         ← Historial de pedidos del usuario
    │
    ├── help/
    │   └── HelpPage.jsx           ← FAQ + contacto
    │
    ├── contact/
    │   └── Contact.jsx            ← Formulario de contacto
    │
    ├── about/
    │   └── SobreNosotros.jsx      ← Página "Sobre nosotros"
    │
    ├── legal/
    │   ├── AvisoLegal.jsx
    │   └── PoliticaPrivacidad.jsx
    │
    └── footer/
        └── Footer.jsx
```

### Filosofía de organización

Cada componente tiene su propia carpeta cuando crece lo suficiente como para tener varios sub-componentes o CSS propio. Dentro, el archivo principal lleva el nombre del componente y los archivos relacionados quedan al lado (estilos, modales asociados, subformularios…).

La carpeta `shared/` es donde viven los componentes que se usan en varias páginas distintas. Si creas algo pensado para reutilizarse, ponlo ahí.

---

## 5. Arquitectura y flujo de la app

La app usa un sistema de "páginas" sencillo con `useState` en `App.jsx`. El paquete `react-router-dom` ya está instalado y `main.jsx` monta la app dentro de un `BrowserRouter`, pero actualmente no se usan rutas — la navegación se hace cambiando el valor de `currentPage`. La migración a rutas reales es directa cuando se decida hacerla.

```
main.jsx
  └── BrowserRouter
        └── App.jsx (AuthProvider + CartProvider)
              └── AppContent
                    ├── Navbar (siempre visible)
                    │
                    ├── [currentPage === 'home']       → HomePage
                    ├── [currentPage === 'catalog']    → CatalogPage
                    ├── [currentPage === 'custom']     → CustomCandlePage
                    ├── [currentPage === 'admin']      → AdminPanel (solo si isAdmin)
                    ├── [currentPage === 'profile']    → ProfilePage (solo si user)
                    ├── [currentPage === 'help']       → HelpPage
                    ├── [currentPage === 'orders']     → OrdersPage (solo si user)
                    ├── [currentPage === 'checkout']   → CheckoutPage
                    ├── [currentPage === 'contact']    → Contact
                    ├── [currentPage === 'about']      → SobreNosotros
                    ├── [currentPage === 'legal']      → AvisoLegal
                    ├── [currentPage === 'privacidad'] → PoliticaPrivacidad
                    │
                    ├── Footer (siempre visible)
                    ├── AuthModal (flotante, se abre/cierra)
                    └── WhatsAppButton (botón flotante)
```

### Por qué cada context envuelve al siguiente

- `AuthProvider` va por fuera porque muchos componentes (incluido el carrito al limpiarse) necesitan saber si hay usuario logueado.
- `CartProvider` va por dentro para poder reaccionar a los cambios de sesión (por ejemplo, vaciar el carrito al cambiar de cuenta).

---

## 6. Páginas y componentes

### 🏠 HomePage

Página de bienvenida con hero, categorías destacadas, CTA de personalización y valores de la marca. "Ver Colección" y "Explorar" navegan al catálogo. "Diseñar mi vela" lleva a la página de personalización.

### 🛍️ CatalogPage

Catálogo de productos con paginación del servidor, filtros, búsqueda y ordenación.

**Filtros server-side** (llaman a un endpoint distinto del backend):

- Categoría → `GET /api/productos/categoria/:id`
- Aroma → `GET /api/productos/aroma/:id`
- Color → `GET /api/productos/color/:id`

Los tres son excluyentes entre sí: elegir uno limpia los otros dos. Al cambiar cualquiera de ellos, la paginación vuelve automáticamente a la página 1.

**Filtros client-side** (se aplican sobre la página cargada):

- Búsqueda por nombre
- Rango de precio

**Ordenación** (se manda como query param al backend):

- Más nuevos (`sort=nuevos`, por defecto)
- En oferta (`sort=oferta`)
- Precio ascendente (`sort=precio_asc`)
- Precio descendente (`sort=precio_desc`)

**Paginación**: el Paginator aparece al final del grid. Ver la sección [10. Paginación del catálogo](#10-paginación-del-catálogo) para detalles.

### 🔍 ProductDetailModal

Se abre al pulsar una card del catálogo. Carga el detalle completo del producto (`GET /api/productos/:id`) con sus aromas, colores e imágenes. El usuario elige opciones antes de añadir al carrito.

### 🕯️ CustomCandlePage

Formulario de personalización de velas. El usuario elige tipo, aroma, color, categoría, cantidad y escribe un mensaje opcional.

- **Si hay usuario logueado**, los datos de contacto (nombre, email, teléfono) se precargan haciendo `GET /api/usuario/me` al montar. Si el usuario edita algún campo antes de que llegue la respuesta, lo respetamos y no lo pisamos.
- Incluye un botón "Más información" cuya URL proporcionará el cliente (Sergio) más adelante.
- Al enviar la solicitud, se muestra una pantalla de confirmación.

**TODO BACKEND**: cuando la API de pedidos esté lista, el botón "Solicitar presupuesto" creará un pedido personalizado con `pedidosAPI.create({ tipo: 'personalizado', ... })`.

### 🛒 CheckoutPage (pasarela de pago)

Proceso de compra en 3 pasos:

1. **Datos del cliente** — nombre, dirección, teléfono, email.
2. **Envío + método de pago** — resumen del pedido, aviso si la dirección no parece de Talavera, selección de PayPal / Bizum.
3. **Confirmación** — éxito o error con detalles del pedido.

- **Si hay usuario logueado**, todos los campos se precargan desde `GET /api/usuario/me`. La dirección se construye concatenando `calle + numero + piso + CP + ciudad + provincia` en un único campo de texto editable.
- Actualmente usa **simulación** de pago (el backend de pedidos es placeholder). Cuando esté listo, se descomenta el `pedidosAPI.create()` y se quita el bloque de simulación. Los puntos donde insertar el fetch están marcados con `TODO BACKEND`.

### 👤 AuthModal

Modal con dos pestañas (Login / Registro).

- Login llama a `POST /api/auth/login`.
- Registro llama a `POST /api/auth/registro` y luego hace login automático.
- La contraseña se valida en tiempo real con indicadores visuales (12 caracteres mínimo, mayúscula, número, signo de puntuación).

### ⚙️ AdminPanel (solo admin, `tipo === 1`)

Panel con 5 pestañas:

| Pestaña             | Qué hace                                                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Productos**       | Lista desde `GET /api/productos`, con edición (`PUT`), eliminación (`DELETE`) y control de stock en tiempo real                    |
| **Añadir Producto** | Formulario `POST /api/productos` con selector de categoría, aromas, colores e imágenes                                             |
| **Características** | CRUD de categorías, aromas y colores                                                                                               |
| **Pedidos**         | _Datos de ejemplo (pendiente de API)_                                                                                              |
| **Usuarios**        | Lista desde `GET /api/usuario`, con botón para cambiar tipo (`PUT /api/usuario/:id` toggle) y eliminar (`DELETE /api/usuario/:id`) |

### 👤 ProfilePage (reescrita)

Página de configuración de la cuenta del usuario logueado. Al abrir, hace `GET /api/usuario/me` para cargar todos los datos del perfil y los reparte entre cuatro subformularios independientes:

| Subformulario       | Qué hace                                                | Endpoint                       |
| ------------------- | ------------------------------------------------------- | ------------------------------ |
| `PersonalDataForm`  | Cambiar nombre y teléfono                               | `PUT /api/usuario/me`          |
| `AddressForm`       | Cambiar calle, número, piso, CP, ciudad, provincia      | `PUT /api/usuario/me`          |
| `PasswordForm`      | Cambiar contraseña (pide la actual)                     | `PUT /api/usuario/me/password` |
| `DeleteAccountForm` | Eliminar cuenta (pide contraseña + escribir "ELIMINAR") | `DELETE /api/usuario/me`       |

**Importante**: el **correo es solo lectura** (se muestra en la cabecera pero no se puede cambiar). El backend no admite cambio de correo vía `PUT /me` para evitar suplantaciones silenciosas. Si en algún momento se quiere habilitar, haría falta un endpoint aparte con verificación por email.

El backend protege al último administrador: si el usuario logueado es el único admin, `DELETE /me` responde `400` y no borra la cuenta.

### ❓ HelpPage

Preguntas frecuentes en formato acordeón + datos de contacto (email, teléfono, dirección, Instagram).

### 📦 OrdersPage

Historial de pedidos del usuario. **TODO BACKEND**: datos de ejemplo hasta que `GET /api/pedidos` esté listo.

### 📞 Contact, ℹ️ SobreNosotros, 📜 AvisoLegal, 🔒 PoliticaPrivacidad

Páginas estáticas de contenido. Contact tiene un formulario de contacto (aún no conectado a backend). Las dos legales son texto legal del comercio.

---

## 7. Conexión con el backend (APIs)

Todas las llamadas están centralizadas en `services/api.js`. Las funciones internas `request()` y `requestFormData()` se encargan de:

- Añadir el header `Authorization: Bearer <token>` si hay sesión
- Limpiar `localStorage` si el backend responde `401` o `403` (token caducado)
- Parsear el JSON y lanzar `Error` con el mensaje del backend si la respuesta no es `ok`

### Autenticación

| Servicio                          | Método | Endpoint             | Dónde se usa |
| --------------------------------- | ------ | -------------------- | ------------ |
| `authAPI.login(correo, password)` | POST   | `/api/auth/login`    | AuthModal    |
| `authAPI.registro(datos)`         | POST   | `/api/auth/registro` | AuthModal    |

### Productos (listados con paginación)

Los cuatro endpoints de listado aceptan un objeto opcional de paginación `{ page, limit, sort }`:

| Servicio                                      | Método | Endpoint                            | Dónde se usa       |
| --------------------------------------------- | ------ | ----------------------------------- | ------------------ |
| `productosAPI.getAll(pagination)`             | GET    | `/api/productos?page=&limit=&sort=` | CatalogPage        |
| `productosAPI.getByCategoria(id, pagination)` | GET    | `/api/productos/categoria/:id?...`  | CatalogPage        |
| `productosAPI.getByAroma(id, pagination)`     | GET    | `/api/productos/aroma/:id?...`      | CatalogPage        |
| `productosAPI.getByColor(id, pagination)`     | GET    | `/api/productos/color/:id?...`      | CatalogPage        |
| `productosAPI.getById(id)`                    | GET    | `/api/productos/:id`                | ProductDetailModal |
| `productosAPI.create(producto)`               | POST   | `/api/productos` _(FormData)_       | AdminPanel         |
| `productosAPI.update(id, producto)`           | PUT    | `/api/productos/:id` _(FormData)_   | AdminPanel         |
| `productosAPI.delete(id)`                     | DELETE | `/api/productos/:id`                | AdminPanel         |

### Características

| Servicio         | Método | Endpoint         | Dónde se usa |
| ---------------- | ------ | ---------------- | ------------ |
| `categoriaAPI.*` | CRUD   | `/api/categoria` | AdminPanel   |
| `aromaAPI.*`     | CRUD   | `/api/aroma`     | AdminPanel   |
| `colorAPI.*`     | CRUD   | `/api/color`     | AdminPanel   |

### Usuario — zona personal (`/me`)

Todas requieren token válido (cualquier usuario logueado):

| Servicio                                       | Método | Endpoint                   | Dónde se usa                                |
| ---------------------------------------------- | ------ | -------------------------- | ------------------------------------------- |
| `usuarioAPI.me.obtener()`                      | GET    | `/api/usuario/me`          | ProfilePage, CustomCandlePage, CheckoutPage |
| `usuarioAPI.me.actualizar(datos)`              | PUT    | `/api/usuario/me`          | PersonalDataForm, AddressForm               |
| `usuarioAPI.me.cambiarPassword(actual, nueva)` | PUT    | `/api/usuario/me/password` | PasswordForm                                |
| `usuarioAPI.me.eliminarCuenta(password)`       | DELETE | `/api/usuario/me`          | DeleteAccountForm                           |

### Usuario — zona admin

Todas requieren token de admin (`tipo === 1`):

| Servicio                                       | Método | Endpoint                    | Dónde se usa |
| ---------------------------------------------- | ------ | --------------------------- | ------------ |
| `usuarioAPI.admin.getAll()`                    | GET    | `/api/usuario`              | AdminPanel   |
| `usuarioAPI.admin.cambiarTipo(id, tipoActual)` | PUT    | `/api/usuario/:id` (toggle) | AdminPanel   |
| `usuarioAPI.admin.delete(id, tipo)`            | DELETE | `/api/usuario/:id`          | AdminPanel   |

> Por compatibilidad con código antiguo, `usuarioAPI.getAll`, `usuarioAPI.cambiarTipo` y `usuarioAPI.delete` siguen existiendo como alias directos de `usuarioAPI.admin.*`.

### APIs preparadas pero pendientes de backend

| Servicio             | Endpoint               | Dónde se usará                   |
| -------------------- | ---------------------- | -------------------------------- |
| `pedidosAPI.create`  | POST `/api/pedidos`    | CheckoutPage, CustomCandlePage   |
| `pedidosAPI.getAll`  | GET `/api/pedidos`     | AdminPanel (pedidos), OrdersPage |
| `pedidosAPI.getById` | GET `/api/pedidos/:id` | OrdersPage (detalle)             |

---

## 8. Autenticación y sesiones

El frontend usa **JWT** (JSON Web Tokens):

1. El usuario hace login → el backend devuelve `{ token, user: { id, nombre, correo, tipo } }`.
2. El token se guarda en `localStorage['token']` y los datos del usuario en `localStorage['user']`.
3. En cada petición protegida, `api.js` añade la cabecera `Authorization: Bearer <token>` automáticamente.
4. Si el token expira (`401` o `403`), `api.js` limpia `localStorage` y el `AuthContext` detecta que no hay usuario. El AuthModal vuelve a aparecer.

El campo `tipo` del usuario determina el rol:

- **tipo 1** = Administrador (ve el Panel de Administración)
- **tipo 2** = Cliente normal (ve Mis Pedidos)

La sesión persiste al recargar la página gracias a `localStorage`.

> ⚠️ El token contiene los datos básicos del usuario (`id`, `nombre`, `correo`, `tipo`). Para obtener la información completa (teléfono, dirección) hay que hacer `GET /api/usuario/me`. No intentes meter toda la dirección en el token.

---

## 9. Carrito de compra

El carrito se gestiona con `CartContext.jsx`:

- Se vacía automáticamente al cerrar sesión o cambiar de cuenta.
- Los productos se añaden desde el catálogo (rápido) o desde el modal de detalle (con opciones de aroma/color).
- El `CartDropdown` en la navbar muestra un resumen con badge de cantidad.
- El `CheckoutPage` consume los items del carrito para el proceso de pago.

**Nota**: el carrito vive en memoria (estado de React). No se sincroniza con el backend — si el usuario cierra el navegador sin completar la compra, se pierde.

---

## 10. Paginación del catálogo

La paginación es **server-side**: cada llamada al backend pide una página concreta con `?page=&limit=&sort=`. El cliente no carga todo el catálogo en memoria.

### El hook `usePagination`

Encapsula toda la lógica. Vive en `src/hooks/usePagination.jsx` y gestiona el estado de `page`, `limit`, `sort`, los items de la página actual, loading y error.

**Ejemplo de uso** (extracto de `CatalogPage`):

```jsx
import usePagination from "../../hooks/usePagination";
import { productosAPI } from "../../services/api";

const fetcher = useCallback(
  (params) => {
    if (selectedCategory !== null)
      return productosAPI.getByCategoria(selectedCategory, params);
    if (selectedAroma !== null)
      return productosAPI.getByAroma(selectedAroma, params);
    if (selectedColor !== null)
      return productosAPI.getByColor(selectedColor, params);
    return productosAPI.getAll(params);
  },
  [selectedCategory, selectedAroma, selectedColor],
);

const {
  items,
  page,
  limit,
  sort,
  loading,
  error,
  hasMore,
  setPage,
  setLimit,
  setSort,
} = usePagination({
  fetcher,
  initialLimit: 15,
  initialSort: "nuevos",
  deps: [selectedCategory, selectedAroma, selectedColor], // al cambiar → reset a page=1
});
```

### El componente `Paginator`

Vive en `src/components/shared/paginator/`. Es puramente presentacional — recibe el estado y dispara callbacks. No conoce al backend.

```jsx
<Paginator
  page={page}
  limit={limit}
  hasMore={hasMore}
  onPageChange={setPage}
  onLimitChange={setLimit}
  limitOptions={[15, 30, 50]}
/>
```

Muestra:

- Botón **Anterior** / **Siguiente**
- Ventana de 5 números centrada en la página actual (`maxVisible` configurable)
- "..." decorativos cuando la ventana no llega al inicio o al final
- Selector de items por página

### Limitación actual

El backend **no devuelve el total de items** (solo el array paginado). Por eso el Paginator no puede mostrar "página 3 de 17" ni saltar al final. La heurística actual es: si la página viene con `items.length === limit`, asumimos que hay siguiente; si viene con menos, es la última.

Si en el futuro el backend devuelve `{ data, total, page, limit }`, sustituir la heurística de `hasMore` por un cálculo exacto dentro del hook. El componente `Paginator` acepta un prop opcional `totalPages` para ese caso.

---

## 11. Autocompletado con el perfil del usuario

Tres páginas autocompletan datos del usuario logueado haciendo `GET /api/usuario/me`:

| Página             | Campos que autocompleta                                           |
| ------------------ | ----------------------------------------------------------------- |
| `ProfilePage`      | Todos los campos editables (nombre, teléfono, dirección completa) |
| `CustomCandlePage` | Nombre, email, teléfono del bloque "Datos de contacto"            |
| `CheckoutPage`     | Nombre, email, teléfono y dirección completa concatenada          |

**Regla compartida**: si el usuario ya ha empezado a escribir en un campo antes de que llegue la respuesta de `/me`, NO se pisa su texto. Solo se rellenan los campos que sigan vacíos.

En CheckoutPage, los 6 campos de la dirección (calle, numero, piso, cp, ciudad, provincia) se concatenan en una única string legible usando el helper `construirDireccion(perfil)`. El usuario puede editarla a mano si quiere enviar a otra dirección.

---

## 12. Funcionalidades pendientes (TODO BACKEND)

Todos los puntos marcados con `TODO BACKEND` en el código indican dónde conectar cuando las APIs estén listas:

| Funcionalidad          | Archivo                | Qué falta                                                                  |
| ---------------------- | ---------------------- | -------------------------------------------------------------------------- |
| Proceso de pago real   | `CheckoutPage.jsx`     | Descomentar `pedidosAPI.create()` y quitar la simulación                   |
| Vela personalizada     | `CustomCandlePage.jsx` | Crear endpoint de pedido personalizado y conectar el `pedidosAPI.create()` |
| Historial de pedidos   | `OrdersPage.jsx`       | Reemplazar datos de ejemplo con `pedidosAPI.getAll()` filtrado por usuario |
| Pedidos en admin       | `AdminPanel.jsx`       | Reemplazar datos de ejemplo con `pedidosAPI.getAll()`                      |
| URL "Más info"         | `CustomCandlePage.jsx` | Sergio proporcionará la URL de destino                                     |
| Formulario de contacto | `Contact.jsx`          | Crear endpoint de envío de mensajes (o Mailgun / SMTP)                     |

### Mejoras opcionales del backend (no bloquean)

| Mejora                                                    | Por qué                                                       | Impacto                                              |
| --------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------- |
| Devolver `{ data, total }` en listados paginados          | Permitiría saltar al final y mostrar "página N de M"          | Sustituir heurística de `hasMore` en `usePagination` |
| Búsqueda por texto en `/api/productos?q=`                 | Actualmente la búsqueda es client-side sobre la página actual | Simplificaría `CatalogPage`                          |
| Rango de precio en `/api/productos?minPrecio=&maxPrecio=` | Igual que la búsqueda                                         | Filtro de precio server-side                         |

---

## 13. Diseño y estilos

### Paleta de colores (extraída del logo)

| Variable CSS    | Color     | Uso                                   |
| --------------- | --------- | ------------------------------------- |
| `--cream`       | `#dacab5` | Fondo principal                       |
| `--cream-dark`  | `#f5ebdd` | Fondos alternativos, hover suave      |
| `--beige`       | `#ede0d0` | Bordes, separadores                   |
| `--brown-dark`  | `#3E2723` | Texto principal, botones primarios    |
| `--brown-mid`   | `#5d4037` | Texto secundario                      |
| `--brown-light` | `#8d6e63` | Texto terciario, placeholders         |
| `--rose`        | `#D4919B` | Acentos, badges, hover                |
| `--lavender`    | `#9B8BB4` | Eyebrows de sección                   |
| `--gold`        | `#C9A84C` | Precios, links activos, focus outline |
| `--white`       | `#fffcf8` | Fondos de card                        |

### Tipografía

- **Títulos:** Cormorant Garamond (serif, elegante)
- **Cuerpo:** Jost (sans-serif, moderna)
- **Tamaño base:** 17px

### Convenciones CSS

- Variables globales en `index.css`.
- Estilos globales compartidos en `App.css` (por ejemplo: `.admin-header`, `.auth-form`, `.form-group`, `.btn-auth`, `.password-rules`).
- Estilos específicos en un archivo `.css` junto al componente (ej: `CatalogPage.css`, `Paginator.css`).
- Transiciones con `var(--transition)` para consistencia.
- Responsive: breakpoint principal en `640px` (móvil vs escritorio).

---

## 14. Convenciones de código

### Comentarios

- Bloque en prosa human-readable al principio de cada archivo explicando qué hace, accesible a cualquier desarrollador del equipo.
- `TODO BACKEND` para cualquier punto donde el frontend está esperando a que el backend esté listo.
- Comentarios en los puntos delicados (por qué se hace así, no qué se hace).

### Parser OXC de Vite

Vite usa el parser OXC que es más estricto que Babel con caracteres Unicode invisibles que a veces aparecen al copiar y pegar desde chats (zero-width joiners, etc.). Dos reglas:

- Evitar caracteres invisibles en el código. Si algo falla con un error raro tipo "Unexpected token", es probable que sea eso.
- Preferir **ternarios normales** en `className` antes que template literals con interpolación cuando sea posible, porque algunas combinaciones de template literals han dado problemas:

  ```jsx
  // ✅ Bien
  className={activo ? "btn active" : "btn"}

  // ⚠️ A veces problemático (depende del contenido)
  className={`btn ${activo ? "active" : ""}`}
  ```

### Componentes

- Estructura tipo Angular: cada componente en su propia carpeta cuando crece, con su `.jsx` y su `.css`.
- Named functions fuera del JSX cuando se reutilizan o cuando la legibilidad lo pide.
- Helpers locales (como `construirDireccion` en `CheckoutPage`) arriba del componente, no dentro.

### Contextos y estado

- Estado local con `useState` siempre que sirva.
- Context solo para estado compartido entre páginas distintas (`AuthContext`, `CartContext`).
- Custom hooks cuando la lógica se repite en varios sitios (`usePagination`, `useClickOutside`, `useFadeUp`).

---

## 15. Flujo de trabajo con ramas

```
main          ← Producción. NUNCA se toca directamente.
dev           ← Rama de integración del equipo.
feature/*     ← Una rama por funcionalidad nueva.
fix/*         ← Una rama por corrección de error.
dev_mauro     ← Rama personal de Mauro (similar para db_manuel, db_zineb).
```

### Día a día

```bash
# 1. Actualizar
git checkout dev && git pull origin dev

# 2. Crear rama de trabajo
git checkout -b feature/nombre-funcionalidad

# 3. Trabajar con normalidad...

# 4. Guardar y subir
git add . && git commit -m "feat: descripción breve"
git push origin feature/nombre-funcionalidad

# 5. Abrir Pull Request en GitHub → destino: dev (NUNCA main)
```

### Incorporar cambios de `dev` en tu rama personal

```bash
git checkout dev_mauro
git fetch origin
git merge origin/dev
# Resolver conflictos si los hay, commit, push
```

> ⚠️ Nunca merge en sentido contrario (`dev_mauro` → `dev`). Para llevar cosas a `dev` siempre por Pull Request desde ramas `feature/*` o `fix/*`.

---

## 16. Scripts disponibles

| Comando           | Qué hace                                           |
| ----------------- | -------------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo en `localhost:5173` con HMR |
| `npm run build`   | Versión optimizada para producción en `dist/`      |
| `npm run preview` | Previsualizar la versión de producción             |
| `npm run lint`    | Ejecutar ESLint sobre todo el código               |

---

## Dependencias principales

| Librería               | Versión | Para qué sirve                                                            |
| ---------------------- | ------- | ------------------------------------------------------------------------- |
| `react`                | 19.x    | Framework base                                                            |
| `react-dom`            | 19.x    | Render en el navegador                                                    |
| `react-router-dom`     | 7.x     | Instalado; `BrowserRouter` ya montado en `main.jsx`, rutas aún no activas |
| `vite`                 | 8.x     | Bundler y dev server                                                      |
| `@vitejs/plugin-react` | 6.x     | Plugin de React para Vite                                                 |
| `eslint`               | 9.x     | Linter                                                                    |
