const express = require('express');
const router  = express.Router();
const productosController = require('../controllers/productosController');
const auth = require('../middleware/optionalAuth');
const admin = require('../middleware/adminOnly');

//RUTAS GET
//Obtener todos los productos
router.get('/', productosController.obtenerTodo);
//Obtener producto por id
router.get('/:id', productosController.obtenerPorId);
//Obtener producto por categoria
router.get('/categoria/:id', productosController.obtenerPorCategoria);
//Obtener producto por aroma
router.get('/aroma/:id', productosController.obtenerPorAroma);
//Obtener producto por color
router.get('/color/:id', productosController.obtenerPorColor);

//RUTA POST, PUT, DELETE (solo para admin)
//Crear nuevo producto
router.post('/', auth, admin, productosController.crearProducto);
//Moddificar producto existente
router.put('/:id', auth, admin, productosController.modificarProducto);
//Eliminar producto existente
router.delete('/:id', auth, admin, productosController.eliminarProducto);


module.exports = router;
