const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares ───────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// ── Rutas ─────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));       // Registro y login, siempre publicos
app.use('/api/pedidos',    require('./routes/pedidos'));    // POST publico (usuarios no logueados pueden hacer pedidos), GET protegido (para usuarios logueados), PUT y DELETE protegidos (solo admin)
app.use('/api/productos',  require('./routes/productos'));  // GET publico, POST, PUT, DELETE protegidos (solo admin)

// ── Ruta no encontrada (404) ──────────────────────────
app.use((req, res) => {
  res.status(404).json({error: `Ruta ${req.method} ${req.path} no encontrada`});
});

// ── Health check ──────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'OK', mensaje: 'API Velas Artesanales funcionando' });
});

// ── Arranque ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
