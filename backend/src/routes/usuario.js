//Imports 
const express = require('express');
const router  = express.Router();
const usuarioController = require('../controllers/usuarioController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');


// ----- OPCIONES DE USUARIO (PERSONAL) -----------------------------------

//GET /api/usuario/me - Obtienes todos los datos del usuario logueado (excepto password y tipo)
router.get('/me', auth, usuarioController.obtenerInformacionUsuario);

//PUT /api/usuario/me - Modifica los datos del usuario logueado (excepto correo, id, tipo y password)
router.put('/me', auth, usuarioController.modificarMiPerfil);

//PUT /api/usuario/me/password - Modifica la password del usuario logueado (requiere password)
router.put('/me/password', auth, usuarioController.modificarPasswordUsuario);

//DELETE /api/usuario/me - Elimina la cuenta del usuario logueado (requiere password)
router.delete('/me', auth, usuarioController.eliminarMiCuenta);



// ----- OPCIONES DE ADMINISTRADOR ----------------------------------------

// GET /api/usuario - Obtener todos los usuarios (id, nombre, correo, tipo)
router.get('/', auth, admin, usuarioController.listarUsuarios);

// GET /api/usuario/:id - Obtener perfil completo de un usuario por id (admin)
// Util para el panel cuando se consulta a un cliente por id_usuario de un pedido.
router.get('/:id', auth, admin, usuarioController.obtenerUsuarioPorIdAdmin);

// PUT /api/usuario/:id - Modificar tipo de usuario
router.put('/:id', auth, admin, usuarioController.cambiarTipoUsuario);

//DELETE /api/usuario/:id - Eliminar usuario
router.delete('/:id', auth, admin, usuarioController.eliminarUsuario);

module.exports = router;

