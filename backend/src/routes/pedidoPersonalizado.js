const express = require('express');
const router  = express.Router();
const pedidosPersonalizadosController = require('../controllers/pedidoPersonalizadoController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const optionalAuth = require('../middleware/optionalAuth');


// GET /api/pedidoper — Listar todos (solo admin)
router.get('/', auth, admin, pedidosPersonalizadosController.obtenerTodo);

// GET /api/pedidoper/me — Mis pedidos personalizados
router.get('/me', auth, pedidosPersonalizadosController.obtenerPedidoUsuario);

// GET /api/pedidoper/:id — Detalle (usuario logueado)
router.get('/:id', auth, pedidosPersonalizadosController.obtenerPorId);

// POST /api/pedidoper — Crear solicitud personalizada (publico)
router.post('/', optionalAuth, pedidosPersonalizadosController.crearPP);

// PATCH /api/pedidoper/:id/estado — Cambiar estado (solo admin)
router.patch('/:id/estado', auth, admin, pedidosPersonalizadosController.actualizarEstado);

// DELETE /api/pedidoper/:id — Eliminar (solo admin)
router.delete('/:id', auth, admin, pedidosPersonalizadosController.eliminarPP);

module.exports = router;
