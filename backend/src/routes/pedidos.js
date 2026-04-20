const express = require('express');
const router  = express.Router();
const pedidosController = require('../controllers/pedidosController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// GET /api/pedidos - Obtener todas los pedidos
router.get('/', auth, admin, pedidosController.obtenerTodo);
// GET /api/pedidos/:id - Obtener pedido por id
router.get('/:id', auth, pedidosController.obtenerTodo);
// GET /api/pedidos/me - Obtener pedidos por usuario
router.get('/me', auth,  pedidosController.obtenerTodo);

// POST /api/pedidos - Crear nuevo color
router.post('/', pedidosController.crearPedido);

// DELETE /api/pedidos/:id - Eliminar color existente
router.delete('/:id', auth, admin, pedidosController.eliminarPedido);


module.exports = router;
