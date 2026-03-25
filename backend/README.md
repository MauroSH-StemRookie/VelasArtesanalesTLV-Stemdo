# ⚙️ Backend — Velas Artesanales

API REST del e-commerce de Velas Artesanales.  
Construida con **Node.js** y **Express**, conectada a **PostgreSQL en Neon**.

---

## Índice

1. [Primera vez — configuración inicial](#1-primera-vez--configuración-inicial)
2. [Variables de entorno](#2-variables-de-entorno)
3. [Arrancar en local](#3-arrancar-en-local)
4. [Estructura de carpetas](#4-estructura-de-carpetas)
5. [Rutas de la API](#5-rutas-de-la-api)
6. [Flujo de trabajo con ramas](#6-flujo-de-trabajo-con-ramas)
7. [Cómo trabajar desde VS Code (sin terminal)](#7-cómo-trabajar-desde-vs-code-sin-terminal)
8. [Scripts disponibles](#8-scripts-disponibles)

---

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

---

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
| `CLIENT_URL` | URL del frontend para permitir las peticiones CORS |

> ⚠️ El archivo `.env` está en el `.gitignore` — nunca se sube a GitHub.

---

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

---

## 4. Estructura de carpetas

```
backend/
├── src/
│   ├── index.js          ← Punto de entrada. Configura Express y arranca el servidor
│   ├── db.js             ← Conexión a la base de datos Neon
│   ├── routes/           ← Define las URLs de la API
│   │   ├── productos.js  ← /api/productos
│   │   ├── pedidos.js    ← /api/pedidos
│   │   └── auth.js       ← /api/auth
│   ├── controllers/      ← Lógica de cada ruta (se crea según avance el proyecto)
│   ├── models/           ← Consultas SQL a la base de datos
│   └── middleware/       ← Funciones intermedias (autenticación, validaciones)
├── .env                  ← Variables de entorno (NO sube a GitHub)
├── .env.example          ← Plantilla de variables (SÍ sube a GitHub)
└── package.json          ← Dependencias y scripts
```

### ¿Qué hace cada carpeta?

**`routes/`** — Define qué URLs existen y qué función se ejecuta cuando alguien las llama. Es como el índice de la API.

**`controllers/`** — Contiene la lógica real de cada acción (obtener productos, crear un pedido, etc.). Los routes llaman a los controllers.

**`models/`** — Las consultas SQL a la base de datos. Aquí es donde se escribe `SELECT`, `INSERT`, `UPDATE`, etc.

**`middleware/`** — Funciones que se ejecutan antes de llegar a la ruta. Por ejemplo, comprobar si el usuario está logueado antes de dejarle ver sus pedidos.

---

## 5. Rutas de la API ( En caso de usarlas, recordamos que tenemos railway así que al principio y al final no las usaremos pero por si acaso )

### Productos

| Método | URL | Qué hace |
|--------|-----|---------|
| GET | `/api/productos` | Devuelve todos los productos |
| GET | `/api/productos/:id` | Devuelve un producto por su ID |
| POST | `/api/productos` | Crea un producto nuevo |
| PUT | `/api/productos/:id` | Actualiza un producto |
| DELETE | `/api/productos/:id` | Elimina un producto |

### Pedidos

| Método | URL | Qué hace |
|--------|-----|---------|
| GET | `/api/pedidos` | Devuelve todos los pedidos |
| GET | `/api/pedidos/:id` | Devuelve un pedido por su ID |
| POST | `/api/pedidos` | Crea un pedido nuevo |
| PUT | `/api/pedidos/:id` | Actualiza el estado de un pedido |

### Autenticación

| Método | URL | Qué hace |
|--------|-----|---------|
| POST | `/api/auth/registro` | Registra un usuario nuevo |
| POST | `/api/auth/login` | Inicia sesión y devuelve un token |

> ℹ️ Las rutas marcadas como "en desarrollo" devuelven un mensaje provisional hasta que se implementen.

---

## 6. Flujo de trabajo con ramas

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

Ejemplos de nombres de rama para el backend:

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

---

## 7. Cómo trabajar desde VS Code (sin terminal)

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

No hace falta abrir una terminal externa. VS Code tiene una terminal integrada:

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

### Extensiones recomendadas para el backend

Instaladlas desde `Ctrl + Shift + X`:

| Extensión | Para qué sirve |
|-----------|---------------|
| **GitLens** | Ver quién cambió cada línea, historial visual |
| **REST Client** | Probar las rutas de la API directamente desde VS Code |
| **Prettier** | Formatear el código automáticamente al guardar |
| **ESLint** | Detectar errores en el código mientras escribís |
| **Thunder Client** | Alternativa a Postman para probar la API, dentro de VS Code |

---

## 8. Scripts disponibles

Desde la carpeta `backend`:

| Comando | Qué hace |
|---------|---------|
| `npm run dev` | Arranca el servidor con nodemon (se reinicia al guardar) |
| `npm start` | Arranca el servidor sin nodemon (para producción) |

---

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
