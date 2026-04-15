//Imports
const express = require('express');
const router  = express.Router();
const categoriaController = require('../controllers/categoriaController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');


// GET /api/categoria - Obtener todas las categorias
router.get('/', categoriaController.obtenerTodo);

// POST /api/categoria - Crear nueva categoria
router.post('/', auth, admin, categoriaController.crearCategoria);

// PUT /api/categoria/:id - Modificar categoria existente
router.put('/:id', auth, admin, categoriaController.modificarCategoria);

// DELETE /api/categoria/:id - Eliminar categoria existente
router.delete('/:id', auth, admin, categoriaController.eliminarCategoria);

module.exports = router;