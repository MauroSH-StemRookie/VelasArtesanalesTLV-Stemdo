const express = require('express');
const router  = express.Router();
const pedidosController = require('../controllers/pedidosController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const optionalAuth = require('../middleware/optionalAuth');


// GET /api/pedidos — Listar todos los pedidos (solo admin)
router.get('/', auth, admin, pedidosController.obtenerTodo);

// GET /api/pedidos/me — Pedidos del usuario logueado
router.get('/me', auth, pedidosController.obtenerPedidoUsuario);

// GET /api/pedidos/:id — Detalle de un pedido (usuario logueado)
router.get('/:id', auth, pedidosController.obtenerPorId);

/* POST /api/pedidos — Crear un pedido nuevo (publico).
   optionalAuth deja pasar a los invitados sin token y, si hay token valido,
   rellena req.user. Asi el controller puede vincular el pedido al usuario
   cuando corresponde sin bloquear a los invitados. */
//router.post('/', optionalAuth, pedidosController.crearPedido);

// PATCH /api/pedidos/:id/estado — Cambiar estado (solo admin)
router.patch('/:id/estado', auth, admin, pedidosController.actualizarEstado);

// DELETE /api/pedidos/:id — Eliminar pedido (solo admin)
router.delete('/:id', auth, admin, pedidosController.eliminarPedido);

module.exports = router;
