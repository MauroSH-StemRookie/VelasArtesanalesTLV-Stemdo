//Imports
const router  = require('express').Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

//POST /api/auth/registro
router.post('/registro', authController.registro);

//POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/logout — cerrar sesión (requiere token)
router.post('/logout', auth, authController.logout);

// POST /api/auth/recuperar — solicitar código de recuperación
router.post('/recuperar', authController.solicitarRecuperacion);

// POST /api/auth/recuperar/verificar — verificar código y cambiar contraseña
router.post('/recuperar/verificar', authController.verificarRecuperacion);

module.exports = router;
