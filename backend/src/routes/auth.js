//Imports
const router  = require('express').Router();
const authController = require('../controllers/authController');

//POST /api/auth/registro
router.post('/registro', authController.registro);

//POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;
