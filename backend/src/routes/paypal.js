const express = require('express');
const { createOrder, captureOrder } = require('../controllers/paypalController');

const router = express.Router();

// POST /api/paypal/orders
// El frontend llama aquí cuando el usuario pulsa el botón de PayPal.
// Devuelve el ID de la orden para que el frontend abra el popup.
router.post('/orders', createOrder);

// POST /api/paypal/orders/:orderID/capture
// El frontend llama aquí después de que el usuario aprueba el pago en el popup.
// Aquí es donde se cobra realmente el dinero.
router.post('/orders/:orderID/capture', captureOrder);

module.exports = router;