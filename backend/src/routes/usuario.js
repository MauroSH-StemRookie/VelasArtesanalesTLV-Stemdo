//Imports 
const express = require('express');
const router  = express.Router();
const usuarioController = require('../controllers/usuarioController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// GET /api/usuario - Obtener todos los usuarios (id, nombre, correo, tipo)
router.get('/', auth, admin, usuarioController.listarUsuarios);

// PUT /api/usuario/:id - Modificar tipo de usuario
router.put('/:id', auth, admin, usuarioController.cambiarTipoUsuario)

//DELETE /api/usuario/:id - Eliminar usuario
router.delete('/:id', auth, admin, usuarioController.eliminarUsuario)

module.exports = router;

