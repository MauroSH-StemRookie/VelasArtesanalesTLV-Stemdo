# 🕯️ Velas Artesanales — E-commerce

Tienda online de velas aromáticas decorativas, cilios y velas litúrgicas.  
Proyecto desarrollado por el equipo de Stemdo.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL (Neon en desarrollo → Railway en producción) |
| Control de versiones | GitHub |

---

## Índice

1. [Primera vez — clonar el proyecto](#1-primera-vez--clonar-el-proyecto)
2. [Configurar las variables de entorno](#2-configurar-las-variables-de-entorno)
3. [Instalar dependencias y arrancar](#3-instalar-dependencias-y-arrancar)
4. [Flujo de trabajo diario](#4-flujo-de-trabajo-diario)
5. [Cómo hacer todo desde VS Code (sin terminal)](#5-cómo-hacer-todo-desde-vs-code-sin-terminal)
6. [Base de datos](#6-base-de-datos)
7. [Despliegue en producción](#7-despliegue-en-producción)

---

## 1. Primera vez — clonar el proyecto

Esto solo se hace una vez, cuando os incorporáis al proyecto.

### Con terminal

Abrid una terminal (PowerShell en Windows, Terminal en Mac) y ejecutad:

```bash
git clone https://github.com/MauroSH-StemRookie/VelasArtesanalesTLV-Stemdo.git
cd VelasArtesanalesTLV-Stemdo
```

Esto descarga todo el proyecto en vuestra carpeta local.

---

## 2. Configurar las variables de entorno

Las variables de entorno son datos sensibles (contraseñas, URLs de la base de datos) que **nunca se suben a GitHub**. Cada miembro del equipo las tiene en su ordenador de forma local.

### Backend

1. Entrad en la carpeta `backend`
2. Copiad el archivo `.env.example` y renombradlo a `.env`
3. Abridlo y rellenad los valores reales (pedídselos al responsable del proyecto)

```bash
# En Windows (PowerShell)
cd backend
copy .env.example .env

# En Mac/Linux
cd backend
cp .env.example .env
```

El archivo `.env` del backend tiene esta estructura:

```
DATABASE_URL=postgresql://usuario:contraseña@host/velasartesanalesDB?sslmode=require
PORT=3000
NODE_ENV=development
JWT_SECRET=un_secreto_seguro
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend

```bash
cd frontend
copy .env.example .env   # Windows
cp .env.example .env     # Mac/Linux
```

> ⚠️ **Importante:** Nunca compartáis el `.env` por chat ni lo subáis a GitHub. Tiene las credenciales de la base de datos.

---

## 3. Instalar dependencias y arrancar

Las dependencias son las librerías que usa el proyecto. Hay que instalarlas la primera vez y cada vez que alguien añada una nueva.

### Instalar

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Inicializar el proyecto React (solo la primera vez)

Si la carpeta `frontend` está vacía por dentro:

```bash
cd frontend
npm create vite@latest . -- --template react
npm install
```

### Arrancar el proyecto

Necesitáis **dos terminales abiertas a la vez**:

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# Disponible en http://localhost:3000

# Terminal 2 — Frontend
cd frontend
npm run dev
# Disponible en http://localhost:5173
```

---

## 4. Flujo de trabajo diario

### Estructura de ramas

El repositorio tiene tres tipos de ramas:

```
main          ← Código listo para entregar al cliente. NUNCA se toca directamente.
dev           ← Rama de trabajo del equipo. Aquí se integran los cambios.
feature/*     ← Una rama por cada funcionalidad nueva.
fix/*         ← Una rama por cada corrección de error.
```

### Paso a paso para trabajar cada día

**1. Antes de empezar, actualizaos siempre:**

```bash
git checkout dev
git pull origin dev
```

Esto descarga los cambios que hayan subido vuestros compañeros.

**2. Cread vuestra rama para la tarea del día:**

```bash
git checkout -b feature/nombre-de-lo-que-vais-a-hacer
```

Por ejemplo: `feature/carrito-compra`, `feature/login`, `fix/error-pedidos`

**3. Trabajad con normalidad.** Guardad los archivos en VS Code como siempre.

**4. Cuando terminéis, subid los cambios:**

```bash
git add .
git commit -m "feat: descripción corta de lo que hicisteis"
git push origin feature/nombre-de-vuestra-rama
```

**5. Abrid un Pull Request en GitHub:**

- Id a https://github.com/MauroSH-StemRookie/VelasArtesanalesTLV-Stemdo
- Os aparecerá un botón verde "Compare & pull request"
- Aseguraos de que el destino es `dev`, no `main`
- Añadid una descripción y pedid revisión a un compañero
- Cuando lo apruebe, haced merge

### Ejemplos de mensajes de commit

```
feat: añadir carrito de compra
feat: crear formulario de checkout
fix: corregir error en la ruta de productos
fix: arreglar responsive en móvil
chore: actualizar dependencias
```

---

## 5. Cómo hacer todo desde VS Code (sin terminal)

VS Code tiene una interfaz gráfica para Git que permite hacer todo lo anterior sin escribir comandos.

### Clonar el repositorio desde VS Code

1. Abrid VS Code
2. Pulsad `Ctrl + Shift + P` (o `Cmd + Shift + P` en Mac)
3. Escribid `Git: Clone` y seleccionadlo
4. Pegad la URL: `https://github.com/MauroSH-StemRookie/VelasArtesanalesTLV-Stemdo.git`
5. Elegid la carpeta donde queréis guardarlo
6. VS Code os preguntará si queréis abrir el repositorio — decid que sí

### Cambiar de rama en VS Code

En la barra inferior izquierda de VS Code veréis el nombre de la rama actual (por ejemplo `main`). Haced click ahí y os aparecerá un menú para:
- Cambiar a una rama existente
- Crear una rama nueva

Para empezar a trabajar, cambiad a `dev` y luego cread vuestra rama `feature/...`

### Subir cambios desde VS Code

1. En la barra lateral izquierda, haced click en el **icono de Source Control** (parece un árbol con ramas, es el tercer icono del panel)
2. Veréis todos los archivos que habéis modificado en color verde (nuevos) o naranja (modificados)
3. Haced click en el **+** que aparece junto a cada archivo para añadirlos al commit (equivale a `git add`)
4. Escribid el mensaje del commit en el cuadro de texto de arriba (ej: `feat: añadir carrito`)
5. Haced click en el botón azul **Commit**
6. Luego haced click en **Sync Changes** o en los tres puntos `···` → **Push** para subirlo a GitHub

### Hacer Pull (actualizar) desde VS Code

En el mismo panel de Source Control, haced click en los tres puntos `···` y seleccionad **Pull**. Esto descarga los últimos cambios de vuestros compañeros. Hacedlo siempre antes de empezar a trabajar.

### Extensión recomendada: GitLens

Instalad la extensión **GitLens** desde el panel de extensiones de VS Code (`Ctrl + Shift + X`). Os añade información visual muy útil: quién modificó cada línea, historial de cambios, comparación entre ramas, etc.

---

## 6. Base de datos

La base de datos está en **Neon** (PostgreSQL en la nube). Todos los miembros del equipo están conectados a la misma instancia, por lo que cualquier cambio que haga uno lo verán los demás al instante.

Para conectaros desde **pgAdmin 4**:

| Campo | Valor |
|-------|-------|
| Host | Pedírselo al responsable del proyecto |
| Port | 5432 |
| Database | velasartesanalesDB |
| Username | vuestro usuario (db_manuel / db_mauro / db_zineb) |
| SSL mode | Require |

> ⚠️ El string de conexión completo nunca se comparte por chat. Pedídselo al responsable en persona o por canal privado seguro.

---

## 7. Despliegue en producción

Al finalizar el desarrollo, todo el stack se desplegará en **Railway**:

- Frontend (React)
- Backend (Node.js)
- Base de datos (PostgreSQL)

Un solo proveedor, una sola factura. ~$5–15/mes.

Este paso se realizará en el momento de la entrega al cliente para no generar costes durante el desarrollo.
