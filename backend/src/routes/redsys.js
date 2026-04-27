const express = require('express');
const { iniciarPago, notificacion } = require('../controllers/redsysController');

const router = express.Router();

// Crea el pedido en BD y devuelve parámetros firmados para el TPV
router.post('/iniciar', iniciarPago);

// Webhook — Redsys notifica el resultado (sin auth, viene de sus servidores)
router.post('/notificacion', notificacion);

module.exports = router;