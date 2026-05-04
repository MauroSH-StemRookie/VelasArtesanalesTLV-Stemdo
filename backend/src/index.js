const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares ───────────────────────────────────────
app.use(cors({ origin: [
    process.env.CLIENT_URL,       // http://localhost:5173
    //'http://127.0.0.1:5500',      // ← Live Server
    //'http://localhost:5500'        // ← Live Server alternativo
  ], }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rutas ─────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));                   // Registro y login, siempre publicos
app.use('/api/pedidos',    require('./routes/pedidos'));                // POST publico (usuarios no logueados pueden hacer pedidos), GET protegido (para usuarios logueados),  DELETE protegidos (solo admin)
app.use('/api/pedidoper',  require('./routes/pedidoPersonalizado'));    // POST publico (usuarios no logueados pueden hacer pedidos), GET protegido (para usuarios logueados),  DELETE protegidos (solo admin)
app.use('/api/productos',  require('./routes/productos'));              // GET publico, POST, PUT, DELETE protegidos (solo admin)
app.use('/api/categoria',  require('./routes/categoria'));              // GET publico, POST, PUT, DELETE protegidos (solo admin)
app.use('/api/aroma',      require('./routes/aroma'));                  // GET publico, POST, PUT, DELETE protegidos (solo admin)
app.use('/api/color',      require('./routes/color'));                  // GET publico, POST, PUT, DELETE protegidos (solo admin)
app.use('/api/usuario',    require('./routes/usuario'));                // GET, PUT, DELETE protegidos (solo admin)
app.use('/api/paypal',     require('./routes/paypal'));                 // Lanzar orden y capturar orden de compra
app.use('/api/redsys',     require('./routes/redsys'));                 // Lanzar orden y capturar orden de compra

// ── Ruta no encontrada (404) ──────────────────────────
app.use((req, res) => {
  res.status(404).json({error: `Ruta ${req.method} ${req.path} no encontrada`});
});

// ── Health check ──────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'OK', mensaje: 'API Velas Artesanales funcionando' });
});

// ── Arranque ──────────────────────────────────────────
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Manejo de cierre limpio
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});
