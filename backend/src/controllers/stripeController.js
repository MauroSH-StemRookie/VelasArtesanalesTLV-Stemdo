//Imports
const db = require('../db');
const PedidosModel = require('../models/pedidosModel');
const { enviarEmailPedidoCliente, enviarEmailPedidoAdmin } = require('../services/emailService');
const { stripe } = require('../services/stripeService');


// ─────────────────────────────────────────────
// FUNCIÓN 1: Crear PaymentIntent
// ─────────────────────────────────────────────
// El frontend llama a esto cuando el usuario pulsa "Pagar con tarjeta".
// Stripe devuelve un client_secret que el frontend usa para mostrar
// el formulario de tarjeta (Stripe Elements / Payment Element).
// En este momento NO se cobra nada.