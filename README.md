# 🕯️ Velas Artesanales — E-commerce

Tienda online de velas aromáticas decorativas, cilios y velas litúrgicas.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL (Neon en dev → Railway en producción) |
| Control de versiones | GitHub |

---

## Arranque rápido

### 1. Clonar el repositorio
```bash
git clone https://github.com/vuestro-usuario/velasartesanales.git
cd velasartesanales
```

### 2. Configurar variables de entorno

**Backend:**
```bash
cp backend/.env.example backend/.env
# Editar backend/.env con las credenciales de Neon (pedírselas al equipo)
```

**Frontend:**
```bash
cp frontend/.env.example frontend/.env
```

### 3. Instalar dependencias

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### 4. Arrancar en local

Abrir dos terminales:

```bash
# Terminal 1 — Backend (http://localhost:3000)
cd backend && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend && npm run dev
```

---

## Flujo de trabajo en equipo

```
main        ← Solo código estable. Nunca se toca directamente.
dev         ← Rama de integración del equipo.
feature/*   ← Una rama por funcionalidad.
fix/*       ← Una rama por corrección de bug.
```

### Crear una rama nueva
```bash
git checkout dev
git pull
git checkout -b feature/nombre-funcionalidad
```

### Subir cambios
```bash
git add .
git commit -m "feat: descripción del cambio"
git push origin feature/nombre-funcionalidad
```

### Fusionar a dev
Abrir un Pull Request en GitHub de vuestra rama → `dev`.
Nunca hacer merge directo a `main` sin revisión.

---

## Base de datos

La base de datos compartida está en **Neon**. Todos los miembros del equipo
se conectan a la misma instancia. Cualquier cambio en el esquema lo verán
el resto al instante.

Credenciales: solicitarlas al responsable del proyecto. **Nunca compartirlas
por chat ni subirlas al repositorio.**

---

## Despliegue (producción)

Todo el stack se desplegará en **Railway** al finalizar el desarrollo:
- Frontend (React)
- Backend (Node.js)
- Base de datos (PostgreSQL)

Un solo proveedor, una sola factura. ~$5–15/mes.
