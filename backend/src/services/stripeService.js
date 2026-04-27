//Imports
const Stripe = require('stripe');

// Inicializamos Stripe con la clave secreta de la API, que se encuentra en las variables de entorno.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = { stripe };