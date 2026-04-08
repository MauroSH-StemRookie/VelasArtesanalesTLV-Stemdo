const express = require('express');
const router  = express.Router();
const productosController = require('../controllers/productosController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

//RUTAS GET
// GET /api/productos - Obtener todos los productos 
router.get('/', productosController.obtenerTodo);
//  GET /api/productos/:id - Obtener producto por id
router.get('/:id', productosController.obtenerPorId);
// GET /api/productos/categoria/:id - Obtener producto por categoria
router.get('/categoria/:id', productosController.obtenerPorCategoria);
// GET /api/productos/aroma/:id - Obtener producto por aroma
router.get('/aroma/:id', productosController.obtenerPorAroma);
// GET /api/productos/color/:id - Obtener producto por color
router.get('/color/:id', productosController.obtenerPorColor);

//RUTA POST, PUT, DELETE (solo para admin)
// POST /api/productos - Crear nuevo producto
router.post('/', auth, admin, productosController.crearProducto);
// PUT /api/productos/:id - Moddificar producto existente
router.put('/:id', auth, admin, productosController.modificarProducto);
// DELETE /api/productos/:id - Eliminar producto existente
router.delete('/:id', auth, admin, productosController.eliminarProducto);


module.exports = router;
