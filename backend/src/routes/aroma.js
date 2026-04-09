//Imports
const express = require('express');
const router  = express.Router();
const aromaController = require('../controllers/aromaController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');


// GET /api/aroma - Obtener todas las aromas
router.get('/', aromaController.obtenerTodo);

// POST /api/aroma - Crear nuevo aroma
router.post('/', auth, admin, aromaController.crearAroma);

// PUT /api/aroma/:id - Modificar aroma existente
router.put('/:id', auth, admin, aromaController.modificarAroma);

// DELETE /api/aroma/:id - Eliminar aroma existente
router.delete('/:id', auth, admin, aromaController.eliminarAroma);

module.exports = router;