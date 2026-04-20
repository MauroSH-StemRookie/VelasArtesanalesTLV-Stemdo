const express = require('express');
const router  = express.Router();
const pedidosPersonalizadosController = require('../controllers/pedidoPersonalizadoController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// GET /api/pedidoper - Obtener todas los pedidos
router.get('/', auth, admin, pedidosPersonalizadosController.obtenerTodo);
// GET /api/pedidoper/:id - Obtener pedido por id
router.get('/:id', auth, pedidosPersonalizadosController.obtenerTodo);
// GET /api/pedidoper/me - Obtener pedidos por usuario
router.get('/me', auth,  pedidosPersonalizadosController.obtenerTodo);

// POST /api/pedidoper - Crear nuevo color
router.post('/', pedidosPersonalizadosController.crearPP);

// DELETE /api/pedidoper/:id - Eliminar color existente
router.delete('/:id', auth, admin, pedidosPersonalizadosController.eliminarPP);


module.exports = router;
