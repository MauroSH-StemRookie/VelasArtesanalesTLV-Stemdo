# 🎨 Frontend — Velas Artesanales

Interfaz de usuario del e-commerce de Velas Artesanales.  
Construida con **React** y **Vite**.

---

## Índice

1. [Primera vez — configuración inicial](#1-primera-vez--configuración-inicial)
2. [Variables de entorno](#2-variables-de-entorno)
3. [Arrancar en local](#3-arrancar-en-local)
4. [Estructura de carpetas](#4-estructura-de-carpetas)
5. [Flujo de trabajo con ramas](#5-flujo-de-trabajo-con-ramas)
6. [Cómo trabajar desde VS Code (sin terminal)](#6-cómo-trabajar-desde-vs-code-sin-terminal)
7. [Scripts disponibles](#7-scripts-disponibles)

---

## 1. Primera vez — configuración inicial

### Paso 1 — Clonar el repositorio (si no lo tenéis ya)

```bash
git clone https://github.com/MauroSH-StemRookie/VelasArtesanalesTLV-Stemdo.git
cd VelasArtesanalesTLV-Stemdo
```

### Paso 2 — Entrar en la carpeta del frontend

```bash
cd frontend
```

### Paso 3 — Inicializar React con Vite (solo si la carpeta está vacía)

Si dentro de `frontend` no hay archivos de React todavía:

```bash
npm create vite@latest . -- --template react
```

Cuando os pregunte si queréis sobreescribir la carpeta, escribid `y` y pulsad Enter.

### Paso 4 — Instalar las dependencias

```bash
npm install
```

Esto descarga todas las librerías necesarias. Solo hace falta hacerlo la primera vez y cada vez que un compañero añada una librería nueva.

> ℹ️ Si al hacer `git pull` veis que alguien modificó `package.json`, volved a ejecutar `npm install`.

---

## 2. Variables de entorno

Las variables de entorno son configuraciones que **no se suben a GitHub** porque pueden contener datos sensibles.

### Crear el archivo `.env`

```bash
# Windows (PowerShell)
copy .env.example .env

# Mac / Linux
cp .env.example .env
```

### Contenido del `.env`

```
VITE_API_URL=http://localhost:3000/api
```

Esta variable le dice al frontend dónde está el backend cuando trabajáis en local.

> ⚠️ El archivo `.env` está en el `.gitignore` — nunca se sube a GitHub y no os preocupéis si no lo veis en el repositorio.

---

## 3. Arrancar en local

Con el backend ya corriendo en otra terminal, arrancad el frontend:

```bash
npm run dev
```

La aplicación estará disponible en **http://localhost:5173**

Cada vez que guardéis un archivo en VS Code, la página se actualiza automáticamente en el navegador.

---

## 4. Estructura de carpetas

```
frontend/
├── src/
│   ├── components/       ← Componentes reutilizables (botones, cards, navbar...)
│   ├── pages/            ← Páginas completas (Inicio, Producto, Carrito, Checkout...)
│   ├── services/         ← Llamadas a la API del backend
│   ├── context/          ← Estado global (carrito, usuario logueado...)
│   ├── assets/           ← Imágenes, iconos, fuentes
│   ├── App.jsx           ← Componente raíz con las rutas
│   └── main.jsx          ← Punto de entrada de la aplicación
├── public/               ← Archivos estáticos (favicon, imágenes públicas)
├── .env                  ← Variables de entorno (NO sube a GitHub)
├── .env.example          ← Plantilla de variables (SÍ sube a GitHub)
├── package.json          ← Dependencias y scripts
└── vite.config.js        ← Configuración de Vite
```

---

## 5. Flujo de trabajo con ramas

### Estructura de ramas del proyecto

```
main          ← Código listo para entregar al cliente. NUNCA se toca directamente.
dev           ← Rama de trabajo del equipo. Aquí se integran todos los cambios.
feature/*     ← Una rama por cada funcionalidad nueva del frontend.
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

Ejemplos de nombres de rama para el frontend:

```
feature/pagina-inicio
feature/carrito-compra
feature/formulario-checkout
feature/pagina-producto
feature/navbar
feature/filtros-productos
fix/responsive-movil
fix/error-carrito
```

**3. Trabajad con normalidad** en VS Code. Guardad los archivos como siempre.

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
feat: crear componente Navbar con logo y menú
feat: añadir página de detalle de producto
feat: implementar carrito con Context API
fix: corregir alineación en móvil del carrito
fix: arreglar link roto en el footer
chore: instalar react-router-dom
```

---

## 6. Cómo trabajar desde VS Code (sin terminal)

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

### Resolver conflictos desde VS Code

Si al hacer Pull os avisa de conflictos, VS Code os mostrará los archivos en conflicto marcados en rojo. Al abrirlos veréis dos versiones destacadas con botones para elegir:
- **Accept Current Change** — quedarse con vuestra versión
- **Accept Incoming Change** — quedarse con la del compañero
- **Accept Both Changes** — mezclar las dos

Después de resolver, haced commit normalmente.

### Extensiones recomendadas para el frontend

Instaladlas desde `Ctrl + Shift + X`:

| Extensión | Para qué sirve |
|-----------|---------------|
| **GitLens** | Ver quién cambió cada línea, historial visual |
| **ES7+ React Snippets** | Atajos para crear componentes React rápido |
| **Prettier** | Formatear el código automáticamente al guardar |
| **ESLint** | Detectar errores en el código mientras escribís |
| **Auto Rename Tag** | Renombra la etiqueta de cierre al cambiar la de apertura |

---

## 7. Scripts disponibles

Desde la carpeta `frontend`:

| Comando | Qué hace |
|---------|---------|
| `npm run dev` | Arranca el servidor de desarrollo en localhost:5173 |
| `npm run build` | Genera la versión optimizada para producción |
| `npm run preview` | Previsualiza la versión de producción en local |
