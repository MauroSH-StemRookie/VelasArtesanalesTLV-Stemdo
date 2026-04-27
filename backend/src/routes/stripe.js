const express = require('express');
const { createPaymentIntent, confirmPayment, stripeWebhook } = require('../controllers/stripeController');

const router = express.Router();

router.post('/webhook', stripeWebhook);

router.post('/create-payment-intent', createPaymentIntent);
router.post('/confirm-payment', confirmPayment); 

module.exports = router;