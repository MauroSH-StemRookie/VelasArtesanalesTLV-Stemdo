# 🎨 Frontend — Velas Artesanales

Interfaz de usuario del e-commerce de Velas Artesanales.
Construida con **React 19** y **Vite 8**, conectada al backend Node + PostgreSQL y a **PayPal** para los pagos online.

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
10. [Pago online con PayPal](#10-pago-online-con-paypal)
11. [Paginación del catálogo](#11-paginación-del-catálogo)
12. [Autocompletado con el perfil del usuario](#12-autocompletado-con-el-perfil-del-usuario)
13. [Funcionalidades pendientes (TODO BACKEND)](#13-funcionalidades-pendientes-todo-backend)
14. [Diseño y estilos](#14-diseño-y-estilos)
15. [Convenciones de código](#15-convenciones-de-código)
16. [Flujo de trabajo con ramas](#16-flujo-de-trabajo-con-ramas)
17. [Scripts disponibles](#17-scripts-disponibles)

---

## 1. Configuración inicial

```bash
git clone https://github.com/MauroSH-StemRookie/VelasArtesanalesTLV-Stemdo.git
cd VelasArtesanalesTLV-Stemdo/frontend
npm install
```

Solo hace falta hacerlo la primera vez y cada vez que alguien modifique `package.json`.

> ℹ️ A partir de esta versión hay una dependencia nueva, **`@paypal/react-paypal-js`**, para el pago online. Si veníais de una versión anterior, ejecutad `npm install` otra vez para que la descarga quede hecha.

---

## 2. Variables de entorno

Cread un archivo `.env` en la carpeta `frontend/` a partir de la plantilla `.env.example`:

```bash
# Mac / Linux
cp .env.example .env

# Windows (PowerShell)
copy .env.example .env
```

Contenido mínimo:

```
VITE_API_URL=http://localhost:3000/api
VITE_PAYPAL_CLIENT_ID=tu_paypal_client_id_de_sandbox
```

| Variable | Para qué sirve |
|----------|----------------|
| `VITE_API_URL` | URL base del backend. En producción (Railway) se cambiará por la URL real. |
| `VITE_PAYPAL_CLIENT_ID` | Client ID de la app de PayPal. En desarrollo, uno de Sandbox; en producción, uno de Live. Debe ser **el mismo par de credenciales** que tiene el backend en su propio `.env` (el frontend usa el client-id para abrir el popup; el backend usa client-id + client-secret para crear y capturar la orden). |

> ⚠️ El `.env` no se sube a GitHub — está en el `.gitignore`. Si cambia `.env.example`, sí se sube.

### Obtener credenciales de PayPal (Sandbox)

1. Entrar en [developer.paypal.com](https://developer.paypal.com) con cuenta PayPal.
2. **Apps & Credentials** → pestaña **Sandbox** → **Create App**.
3. Copiar `Client ID` (va al frontend) y `Secret` (va al backend).
4. Para probar la compra, usar las cuentas sandbox de comprador y vendedor que PayPal genera en **Testing Tools → Sandbox Accounts**.

Cuando pasemos a producción se cambian las credenciales por las de **Live** y se usa `Environment.Production` en el backend — pero eso no pasa hasta el día de la entrega.

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
├── App.jsx                        ← Componente raíz, define las rutas con react-router
├── App.css                        ← Estilos globales de componentes
├── index.css                      ← Variables CSS, reset, fuentes
├── main.jsx                       ← Punto de entrada (BrowserRouter + PayPalScriptProvider)
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
    │   ├── SEO.jsx                ← Cabeceras meta (title, description, OG, Twitter) por ruta
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
    ├── recuperarPassword/
    │   └── RecuperarPasswordPage.jsx ← 3 pasos: email → código + nueva password → OK
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
    │   ├── CheckoutPage.jsx       ← Pasarela de pago en 3 pasos
    │   ├── CheckoutPage.css
    │   ├── PayPalCheckout.jsx     ← Botón oficial de PayPal integrado con el backend
    │   └── PayPalCheckout.css
    │
    ├── admin/                     ← Panel de administración (solo tipo=1)
    │   ├── AdminPanel.jsx         ← Panel con 6 pestañas
    │   ├── AdminPanel.css
    │   ├── AdminPanelEstados.css  ← Estilos de los selects de estado y badges
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

La app usa **react-router-dom 7** con rutas reales. Cada página tiene su URL canónica y su propio `<SEO>` dentro de la ruta, lo que permite títulos y metas específicos por pantalla y URLs compartibles con historial del navegador.

```
main.jsx
  └── HelmetProvider
        └── BrowserRouter
              └── PayPalScriptProvider   (SDK de PayPal cargado una sola vez)
                    └── App.jsx
                          └── AuthProvider
                                └── CartProvider
                                      └── AppContent
                                            ├── Navbar (siempre visible)
                                            ├── Routes
                                            │     ├── /                 HomePage
                                            │     ├── /catalogo         CatalogPage
                                            │     ├── /personalizar     CustomCandlePage
                                            │     ├── /checkout         CheckoutPage
                                            │     ├── /recuperar-password RecuperarPassword
                                            │     ├── /ayuda            HelpPage
                                            │     ├── /contacto         Contact
                                            │     ├── /sobre-nosotros   SobreNosotros
                                            │     ├── /aviso-legal      AvisoLegal
                                            │     ├── /privacidad       PoliticaPrivacidad
                                            │     ├── /admin            AdminPanel   (RequireAdmin)
                                            │     ├── /perfil           ProfilePage  (RequireAuth)
                                            │     ├── /pedidos          OrdersPage   (RequireAuth)
                                            │     └── *                 → redirige a /
                                            ├── Footer (siempre visible)
                                            ├── AuthModal (flotante)
                                            └── WhatsAppButton (botón flotante)
```

### Por qué cada context envuelve al siguiente

- `HelmetProvider` va por fuera para que cualquier `<SEO>` pueda inyectar metas.
- `BrowserRouter` va antes que el resto de contexts para que los hooks de router (`useNavigate`, `useLocation`) funcionen dentro de ellos.
- `PayPalScriptProvider` carga el SDK oficial una sola vez a nivel global, así el botón del checkout no tiene que esperar a descargar el script cada vez que el usuario entra en el paso 2.
- `AuthProvider` va antes que `CartProvider` porque muchos componentes (incluido el carrito al limpiarse) necesitan saber si hay usuario logueado.
- `CartProvider` va por dentro para poder reaccionar a los cambios de sesión (por ejemplo, vaciar el carrito al cambiar de cuenta).

### Guards de acceso

- `RequireAuth` — redirige a `/` si no hay usuario logueado. Protege `/perfil` y `/pedidos`.
- `RequireAdmin` — redirige a `/` si el usuario no tiene `tipo === 1`. Protege `/admin`.

No muestran pantalla de error: la navbar tampoco enseña los enlaces a quien no tiene permiso, los guards son la red de seguridad para accesos directos por URL.

---

## 6. Páginas y componentes

### 🏠 HomePage

Página de bienvenida con hero, categorías destacadas, CTA de personalización y valores de la marca. "Ver Colección" y "Explorar" navegan al catálogo. "Diseñar mi vela" lleva a la página de personalización.

### 🛍️ CatalogPage

Catálogo de productos con paginación del servidor, filtros, búsqueda y ordenación. Usa el hook `usePagination` para mantener `page`, `limit` y `sort` y volver a pedir al backend cuando alguno cambia.

### ✏️ CustomCandlePage

Formulario de solicitud de vela personalizada. El usuario elige tipo, aroma, color, cantidad y escribe su mensaje. Si está logueado, nombre/email/teléfono se precargan desde `GET /me`.

Al enviar se llama a `pedidosPersonalizadosAPI.create()` → `POST /api/pedidoper`. La descripción se compone concatenando tipo + aroma + color + categoría + cantidad + mensaje en texto plano para que Sergio lo vea todo junto en el panel.

### 🛒 CheckoutPage (pasarela de pago)

Proceso de compra en 3 pasos:

1. **Datos del cliente** — nombre, dirección completa estructurada, teléfono, email.
2. **Envío + método de pago** — resumen del pedido, aviso si la dirección no parece de Talavera, selección de PayPal / Bizum.
3. **Confirmación** — éxito con detalles del pedido creado o error con opción de reintentar.

- **Si hay usuario logueado**, los 9 campos del formulario se precargan desde `GET /api/usuario/me` (nombre, teléfono, email, calle, número, CP, ciudad, provincia, piso).
- **El pago es real**: al seleccionar PayPal en el paso 2 aparece el botón oficial de PayPal, que dispara el flujo real contra el backend (ver sección 10).
- **Bizum** queda reservado con un aviso de "próximamente". El campo `metodo_pago` del modelo del backend está preparado para convivir con PayPal y Redsys/Bizum en el futuro, pero la ruta aún no existe.
- **El pedido solo se crea si el pago se captura correctamente**. Si algo falla en cualquier paso, el backend hace ROLLBACK y no queda registro en BD. El usuario puede reintentar desde el paso 3.

### 👤 AuthModal

Modal con dos pestañas (Login / Registro).

- Login llama a `POST /api/auth/login`.
- Registro llama a `POST /api/auth/registro` y luego hace login automático.
- La contraseña se valida en tiempo real con indicadores visuales (12 caracteres mínimo, mayúscula, número, signo de puntuación).
- Enlace "¿Olvidaste tu contraseña?" → lleva a `/recuperar-password`.

### 🔐 RecuperarPasswordPage

Página dedicada con flujo en 3 pasos:

1. **Solicitar código** — formulario con el correo → `POST /api/auth/recuperar`. El backend envía un código de 6 dígitos válido 15 minutos al email del usuario (si existe).
2. **Verificar y cambiar contraseña** — formulario con correo (precargado) + código + nueva contraseña → `POST /api/auth/recuperar/verificar`. El usuario puede volver al paso 1 si el código expira.
3. **Confirmación** — card verde con botón a la home.

### ⚙️ AdminPanel (solo admin, `tipo === 1`)

Panel con 6 pestañas:

| Pestaña             | Qué hace                                                                                                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Productos**       | Lista desde `GET /api/productos`, con edición (`PUT`), eliminación (`DELETE`) y control de stock en tiempo real                                                                                            |
| **Añadir Producto** | Formulario `POST /api/productos` con selector de categoría, aromas, colores e imágenes                                                                                                                     |
| **Características** | CRUD de categorías, aromas y colores                                                                                                                                                                       |
| **Pedidos**         | Lista desde `GET /api/pedidos`. Cambio de estado con `PATCH /api/pedidos/:id/estado` y modal de detalle con `GET /api/pedidos/:id`                                                                         |
| **Personalizados**  | Lista desde `GET /api/pedidoper`. Aceptar/denegar/completar con `PATCH /api/pedidoper/:id/estado`. Modal de detalle con datos del cliente registrado vía `GET /api/usuario/:id` cuando `id_usuario` existe |
| **Usuarios**        | Lista desde `GET /api/usuario`, con botón para cambiar tipo (`PUT /api/usuario/:id` toggle) y eliminar (`DELETE /api/usuario/:id`)                                                                         |

#### Flujo de estados

**Pedidos normales:**

```
pendiente → en_elaboracion → enviado → entregado
                                     ↘ cancelado (desde cualquier estado)
```

**Pedidos personalizados:**

```
pendiente → aceptado → completado
         ↘ denegado
```

Los valores están fijados por un `CHECK constraint` en la base de datos y una lista blanca en el controller, así que intentar enviar cualquier otro valor devuelve `400`.

### 👤 ProfilePage

Página de configuración de la cuenta del usuario logueado. Al abrir, hace `GET /api/usuario/me` y reparte los datos entre cuatro subformularios:

| Subformulario       | Qué hace                                                | Endpoint                       |
| ------------------- | ------------------------------------------------------- | ------------------------------ |
| `PersonalDataForm`  | Cambiar nombre y teléfono                               | `PUT /api/usuario/me`          |
| `AddressForm`       | Cambiar calle, número, piso, CP, ciudad, provincia      | `PUT /api/usuario/me`          |
| `PasswordForm`      | Cambiar contraseña (pide la actual)                     | `PUT /api/usuario/me/password` |
| `DeleteAccountForm` | Eliminar cuenta (pide contraseña + escribir "ELIMINAR") | `DELETE /api/usuario/me`       |

El correo es **solo lectura**. El backend no admite cambio de correo vía `PUT /me` para evitar suplantaciones silenciosas. El backend también protege al último administrador: si el usuario logueado es el único admin, `DELETE /me` responde `400`.

### ❓ HelpPage, 📦 OrdersPage, 📞 Contact, ℹ️ SobreNosotros, 📜 Legal

Páginas de soporte, historial y contenido estático. `OrdersPage` tira de `GET /api/pedidos/me` y pinta cada pedido con un badge de color según el estado.

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

Todas requieren token válido:

| Servicio                                       | Método | Endpoint                   | Dónde se usa                                |
| ---------------------------------------------- | ------ | -------------------------- | ------------------------------------------- |
| `usuarioAPI.me.obtener()`                      | GET    | `/api/usuario/me`          | ProfilePage, CustomCandlePage, CheckoutPage |
| `usuarioAPI.me.actualizar(datos)`              | PUT    | `/api/usuario/me`          | PersonalDataForm, AddressForm               |
| `usuarioAPI.me.cambiarPassword(actual, nueva)` | PUT    | `/api/usuario/me/password` | PasswordForm                                |
| `usuarioAPI.me.eliminarCuenta(password)`       | DELETE | `/api/usuario/me`          | DeleteAccountForm                           |

### Usuario — zona admin

Todas requieren token de admin (`tipo === 1`):

| Servicio                                       | Método | Endpoint                    | Dónde se usa                               |
| ---------------------------------------------- | ------ | --------------------------- | ------------------------------------------ |
| `usuarioAPI.admin.getAll()`                    | GET    | `/api/usuario`              | AdminPanel                                 |
| `usuarioAPI.admin.getById(id)`                 | GET    | `/api/usuario/:id`          | AdminPanel (modal de pedido personalizado) |
| `usuarioAPI.admin.cambiarTipo(id, tipoActual)` | PUT    | `/api/usuario/:id` (toggle) | AdminPanel                                 |
| `usuarioAPI.admin.delete(id, tipo)`            | DELETE | `/api/usuario/:id`          | AdminPanel                                 |

### Pedidos

| Servicio                               | Método | Endpoint                  | Dónde se usa         |
| -------------------------------------- | ------ | ------------------------- | -------------------- |
| `pedidosAPI.getAll()`                  | GET    | `/api/pedidos`            | AdminPanel (Pedidos) |
| `pedidosAPI.getMine()`                 | GET    | `/api/pedidos/me`         | OrdersPage           |
| `pedidosAPI.getById(id)`               | GET    | `/api/pedidos/:id`        | AdminPanel (detalle) |
| `pedidosAPI.actualizarEstado(id, est)` | PATCH  | `/api/pedidos/:id/estado` | AdminPanel (Pedidos) |
| `pedidosAPI.delete(id)`                | DELETE | `/api/pedidos/:id`        | AdminPanel           |

> ⚠️ **`POST /api/pedidos` ya no existe** como ruta pública para compras normales. Los pedidos ahora se crean exclusivamente desde el flujo de PayPal tras capturar el pago — ver sección 10.

**Valores válidos de `estado`:** `pendiente`, `en_elaboracion`, `enviado`, `entregado`, `cancelado`.

### PayPal

| Servicio                                   | Método | Endpoint                               | Dónde se usa    |
| ------------------------------------------ | ------ | -------------------------------------- | --------------- |
| `paypalAPI.createOrder(amount)`            | POST   | `/api/paypal/orders`                   | PayPalCheckout  |
| `paypalAPI.captureOrder(orderID, datos)`   | POST   | `/api/paypal/orders/:orderID/capture`  | PayPalCheckout  |

Ver sección 10 para el flujo completo.

### Pedidos personalizados

| Servicio                                           | Método | Endpoint                    | Dónde se usa                  |
| -------------------------------------------------- | ------ | --------------------------- | ----------------------------- |
| `pedidosPersonalizadosAPI.getAll()`                | GET    | `/api/pedidoper`            | AdminPanel (Personalizados)   |
| `pedidosPersonalizadosAPI.getMine()`               | GET    | `/api/pedidoper/me`         | (reservado para vista futura) |
| `pedidosPersonalizadosAPI.getById(id)`             | GET    | `/api/pedidoper/:id`        | (reservado para vista futura) |
| `pedidosPersonalizadosAPI.create(datos)`           | POST   | `/api/pedidoper`            | CustomCandlePage              |
| `pedidosPersonalizadosAPI.actualizarEstado(id, e)` | PATCH  | `/api/pedidoper/:id/estado` | AdminPanel (Personalizados)   |
| `pedidosPersonalizadosAPI.delete(id)`              | DELETE | `/api/pedidoper/:id`        | AdminPanel                    |

**Valores válidos de `estado`:** `pendiente`, `aceptado`, `denegado`, `completado`.

---

## 8. Autenticación y sesiones

El frontend usa **JWT** (JSON Web Tokens):

1. El usuario hace login → el backend devuelve `{ token, user: { id, nombre, correo, tipo } }`.
2. El token se guarda en `localStorage['token']` y los datos del usuario en `localStorage['user']`.
3. En cada petición protegida, `api.js` añade la cabecera `Authorization: Bearer <token>` automáticamente.
4. Si el token expira (`401` o `403`), `api.js` limpia `localStorage` y el `AuthContext` detecta que no hay usuario.

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

## 10. Pago online con PayPal

El frontend integra el **SDK oficial de PayPal** usando la librería `@paypal/react-paypal-js`. El flujo completo lo documenta el backend en su README, sección "Pagos online con PayPal".

### Resumen del flujo

```
Usuario en checkout paso 2
          │
          │  (elige "PayPal")
          ▼
<PayPalButtons> se renderiza
          │
          │  (usuario pulsa el botón)
          ▼
createOrder
  → POST /api/paypal/orders     body: { amount: "25.00" }
  ← { id: orderID, status: "CREATED" }    (PayPal todavía NO cobra)
          │
          ▼
PayPal abre popup con botones "Pagar" / "Cancelar"
          │
          │  (usuario aprueba el pago)
          ▼
onApprove(data)
  → POST /api/paypal/orders/:orderID/capture
    body: { nombre, correo, telefono,
            calle, numero, cp, ciudad, provincia, piso,
            total,
            productos: [{ id_producto, cantidad, precio }, ...] }
          │
          ▼
Backend captura el pago contra PayPal
  - Abre transacción SQL
  - Inserta pedido + detalle_pedido
  - Verifica que el total cobrado coincide con el recibido
  - Guarda id_transaccion y metodo_pago = 'paypal'
  - Envía emails al cliente y al admin
  - COMMIT (o ROLLBACK si algo falla)
          │
          ▼
Frontend recibe el pedido creado
  - Vaciamos el carrito
  - Avanzamos al paso 3 con el id del pedido
```

### Dónde vive cada cosa

| Archivo | Qué hace |
|---------|----------|
| `main.jsx` | Monta `<PayPalScriptProvider>` con el `client-id` de `VITE_PAYPAL_CLIENT_ID` en `EUR` e `intent: "capture"`. Carga el SDK una sola vez para toda la app. |
| `services/api.js` | Expone `paypalAPI.createOrder(amount)` y `paypalAPI.captureOrder(orderID, datos)`. |
| `components/cart/PayPalCheckout.jsx` | Componente que renderiza `<PayPalButtons>` con los callbacks `createOrder`, `onApprove`, `onError`, `onCancel`. |
| `components/cart/CheckoutPage.jsx` | Monta `<PayPalCheckout>` en el paso 2 cuando `metodoPago === "paypal"`. Recibe `onSuccess(pedido)` / `onError(msg)` y avanza al paso 3 según el resultado. |

### Lo que el frontend valida antes de mostrar el botón

Antes de llegar al paso 2, el paso 1 valida:

- nombre, teléfono, email (formato válido),
- calle, número, CP, ciudad, provincia (piso es opcional),
- carrito no vacío.

Si algún dato falta, el botón "Continuar" está deshabilitado y no se avanza al paso 2.

### `forceReRender`: por qué es importante

El componente `<PayPalButtons>` cachea sus callbacks la primera vez que se monta. Si después cambian el total del carrito o los datos del comprador sin volver a renderizar, el botón seguiría usando los valores antiguos. Por eso pasamos a `forceReRender={[total, carrito.length, datosComprador.email]}` — cualquier cambio en esos valores fuerza un re-render limpio del botón.

### Qué pasa en cada escenario

| Escenario                              | Qué ocurre                                                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Usuario aprueba el pago correctamente  | Backend crea pedido, envía emails, `onSuccess(pedido)` → paso 3 con éxito + id real del pedido + botón "Ver mis pedidos". |
| Usuario cancela en el popup de PayPal  | `onCancel` — no avanzamos de paso, el usuario sigue en el paso 2 con el botón listo para reintentar.                      |
| Error de red al crear la orden         | `createOrder` falla, `onError("No se pudo crear la orden de pago")` → paso 3 con mensaje de error y botón "Reintentar".   |
| Error de red al capturar               | `onApprove` falla tras aprobar, backend hace ROLLBACK → paso 3 con error. **No queda pedido en BD**.                      |
| Total no coincide (anti-fraude)        | Backend responde 400, frontend muestra el mensaje del backend → paso 3 con error.                                         |
| Token de cliente PayPal inválido       | El SDK lanza error antes de abrir el popup, `onError` lo captura.                                                         |

### Seguridad: qué hacer y qué no

- ✅ El frontend **nunca** toca el `client-secret` de PayPal. Solo usa el `client-id`, que es público.
- ✅ El backend **verifica** que el total cobrado por PayPal coincide con el total del body antes de hacer COMMIT.
- ✅ El precio que el frontend envía por línea de pedido es `item.precio` del carrito (snapshot del precio que vio el cliente cuando añadió el producto).
- ❌ **No** generar el pedido en el frontend y solo "avisar" al backend: el pedido solo existe tras captura exitosa verificada en el servidor.
- ❌ **No** confiar en el `amount` que manda el cliente: el backend recalcula con los `detalle_pedido` y lo contrasta con lo que PayPal realmente cobró.

### Comisiones

PayPal cobra comisión al **vendedor**, no al cliente. El frontend manda el total del carrito tal cual; la comisión es coste operativo del negocio y no se añade al pedido.

### Sandbox vs Producción

Durante todo el desarrollo se usa **Sandbox**:

1. Entrar en [developer.paypal.com](https://developer.paypal.com)
2. My Apps & Credentials → pestaña Sandbox → Create App
3. Copiar `Client ID` al `.env` del frontend, `Client Secret` al `.env` del backend
4. Probar con las cuentas sandbox de comprador y vendedor que PayPal genera en Testing Tools → Sandbox Accounts

Al pasar a producción:

- Cambiar `VITE_PAYPAL_CLIENT_ID` en el frontend por el client-id de la app "Live".
- Cambiar `PAYPAL_CLIENT_ID` y `PAYPAL_CLIENT_SECRET` en el backend por los de "Live".
- El backend cambia `Environment.Sandbox` por `Environment.Production` en `paypalService.js`.

---

## 11. Paginación del catálogo

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
  items, page, limit, sort, loading, error, hasMore,
  setPage, setLimit, setSort,
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

### Limitación actual

El backend **no devuelve el total de items** (solo el array paginado). Por eso el Paginator no puede mostrar "página 3 de 17" ni saltar al final. La heurística actual es: si la página viene con `items.length === limit`, asumimos que hay siguiente; si viene con menos, es la última.

---

## 12. Autocompletado con el perfil del usuario

Tres páginas autocompletan datos del usuario logueado haciendo `GET /api/usuario/me`:

| Página             | Campos que autocompleta                                           |
| ------------------ | ----------------------------------------------------------------- |
| `ProfilePage`      | Todos los campos editables (nombre, teléfono, dirección completa) |
| `CustomCandlePage` | Nombre, email, teléfono del bloque "Datos de contacto"            |
| `CheckoutPage`     | Los 9 campos del paso 1 (nombre, teléfono, email + dirección estructurada) |

**Regla compartida**: si el usuario ya ha empezado a escribir en un campo antes de que llegue la respuesta de `/me`, NO se pisa su texto. Solo se rellenan los campos que sigan vacíos.

En CheckoutPage, la dirección se guarda como 6 campos estructurados (calle, número, piso, CP, ciudad, provincia) desde el principio — así el body que se envía al backend coincide 1:1 con lo que espera `POST /api/paypal/orders/:orderID/capture`.

---

## 13. Funcionalidades pendientes (TODO BACKEND)

Lo que queda por conectar o decidir con Sergio:

| Funcionalidad          | Archivo                | Qué falta                                                                                                                                               |
| ---------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| URL "Más info"         | `CustomCandlePage.jsx` | Sergio proporcionará la URL de destino del botón "Más información"                                                                                      |
| Formulario de contacto | `Contact.jsx`          | Crear endpoint de envío de mensajes (o enviar por Resend a CORREO_ADMIN)                                                                                |
| Pago con Bizum         | `CheckoutPage.jsx`     | Actualmente botón "Bizum (próximamente)". Cuando se integre Redsys/Bizum en el backend, sustituir el aviso por un componente análogo a `PayPalCheckout` |
| Credenciales de Live   | `.env` backend+front   | Cuando sepamos fecha exacta de salida a producción, pedir a Sergio que cree la app "Live" de PayPal                                                     |

### Piezas completadas

Lo que sí está conectado y funcionando:

- **Catálogo** → listados paginados con filtros server-side, búsqueda client-side sobre la página actual, ordenación.
- **Checkout con PayPal** → flujo completo de pago real. El pedido solo se crea tras captura exitosa. Vincula al usuario si está logueado.
- **Mis Pedidos** → tira de `GET /api/pedidos/me` con loading/error/empty states y badges de estado.
- **Solicitud personalizada** → crea solicitudes reales con `POST /api/pedidoper`.
- **Admin — Pedidos** → listado real, cambio de estado con `PATCH`, modal de detalle con líneas del carrito.
- **Admin — Personalizados** → listado real, aceptar/denegar/completar desde la tabla o desde el modal, resolución de usuario vinculado con `GET /api/usuario/:id`, enlaces `mailto:` y `tel:` directos.
- **Recuperación de contraseña** → flujo en 3 pasos con código de 6 dígitos por email (Resend).

### Mejoras opcionales del backend (no bloquean)

| Mejora                                                    | Por qué                                                       | Impacto                                                      |
| --------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------ |
| Devolver `{ data, total }` en listados paginados          | Permitiría saltar al final y mostrar "página N de M"          | Sustituir heurística de `hasMore` en `usePagination`         |
| Búsqueda por texto en `/api/productos?q=`                 | Actualmente la búsqueda es client-side sobre la página actual | Simplificaría `CatalogPage`                                  |
| Rango de precio en `/api/productos?minPrecio=&maxPrecio=` | Igual que la búsqueda                                         | Filtro de precio server-side                                 |
| Decremento de stock al capturar pago                      | El stock se actualiza solo desde el admin                     | Evitaría overselling cuando varios clientes compran a la vez |

---

## 14. Diseño y estilos

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
- Estilos globales compartidos en `App.css`.
- Estilos específicos en un archivo `.css` junto al componente (ej: `CatalogPage.css`, `PayPalCheckout.css`).
- Transiciones con `var(--transition)` para consistencia.
- Responsive: breakpoint principal en `640px` (móvil vs escritorio).

---

## 15. Convenciones de código

### Comentarios

- Bloque en prosa human-readable al principio de cada archivo explicando qué hace.
- `TODO BACKEND` para cualquier punto donde el frontend está esperando a que el backend esté listo.
- Comentarios en los puntos delicados (por qué se hace así, no qué se hace).

### Parser OXC de Vite

Vite usa el parser OXC que es más estricto que Babel con caracteres Unicode invisibles que a veces aparecen al copiar y pegar desde chats. Dos reglas:

- Evitar caracteres invisibles en el código. Si algo falla con un error raro tipo "Unexpected token", es probable que sea eso.
- Preferir **ternarios normales** en `className` antes que template literals con interpolación:

  ```jsx
  // ✅ Bien
  className={activo ? "btn active" : "btn"}

  // ⚠️ A veces problemático (depende del contenido)
  className={`btn ${activo ? "active" : ""}`}
  ```

### Componentes

- Estructura tipo Angular: cada componente en su propia carpeta cuando crece, con su `.jsx` y su `.css`.
- Named functions fuera del JSX cuando se reutilizan o cuando la legibilidad lo pide.
- Helpers locales arriba del componente, no dentro.

### Contextos y estado

- Estado local con `useState` siempre que sirva.
- Context solo para estado compartido entre páginas distintas (`AuthContext`, `CartContext`).
- Custom hooks cuando la lógica se repite en varios sitios (`usePagination`, `useClickOutside`, `useFadeUp`).

---

## 16. Flujo de trabajo con ramas

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

## 17. Scripts disponibles

| Comando           | Qué hace                                           |
| ----------------- | -------------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo en `localhost:5173` con HMR |
| `npm run build`   | Versión optimizada para producción en `dist/`      |
| `npm run preview` | Previsualizar la versión de producción             |
| `npm run lint`    | Ejecutar ESLint sobre todo el código               |

---

## Dependencias principales

| Librería                    | Versión | Para qué sirve                                                          |
| --------------------------- | ------- | ----------------------------------------------------------------------- |
| `react`                     | 19.x    | Framework base                                                          |
| `react-dom`                 | 19.x    | Render en el navegador                                                  |
| `react-router-dom`          | 7.x     | Rutas reales (Routes/Route/BrowserRouter, guards, `useNavigate`)        |
| `react-helmet-async`        | 3.x     | Cabeceras meta por ruta (título, description, Open Graph)               |
| `@paypal/react-paypal-js`   | 8.x     | SDK oficial de PayPal para React. Provee `<PayPalScriptProvider>` y `<PayPalButtons>` |
| `vite`                      | 8.x     | Bundler y dev server                                                    |
| `@vitejs/plugin-react`      | 6.x     | Plugin de React para Vite                                               |
| `eslint`                    | 9.x     | Linter                                                                  |
