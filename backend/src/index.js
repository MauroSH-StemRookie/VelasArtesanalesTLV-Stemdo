const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares ───────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// ── Rutas ─────────────────────────────────────────────
app.use('/api/productos',  require('./routes/productos'));
app.use('/api/pedidos',    require('./routes/pedidos'));
app.use('/api/auth',       require('./routes/auth'));

// ── Health check ──────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'OK', mensaje: 'API Velas Artesanales funcionando' });
});

// ── Arranque ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
