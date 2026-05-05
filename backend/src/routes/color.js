//Imports
const express = require('express');
const router  = express.Router();
const colorController = require('../controllers/colorController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');


// GET /api/color - Obtener todas las colores
router.get('/', colorController.obtenerTodo);

// POST /api/color - Crear nuevo color
router.post('/', auth, admin, colorController.crearColor);

// PUT /api/color/:id - Modificar color existente
router.put('/:id', auth, admin, colorController.modificarColor);

// DELETE /api/color/:id - Eliminar color existente
router.delete('/:id', auth, admin, colorController.eliminarColor);

module.exports = router;