//Imports
const { Client, Environment, OrdersController } = require('@paypal/paypal-server-sdk');

// Creamos el "cliente" de PayPal, que es básicamente la conexión autenticada con su API.
const client = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: process.env.PAYPAL_CLIENT_ID,
        oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET,
    },
    // Environment.Sandbox  → entorno de pruebas (usa cuentas ficticias, sin dinero real)
    // Environment.Production → entorno real (dinero real, para cuando salgas a producción)
    environment: Environment.Sandbox //Cambiar a Environment.Production, cuando se pase a la fase de produccion.
});

const ordersController = new OrdersController(client);

// OrdersController es el objeto que nos da los métodos para crear y capturar órdenes de pago.
module.exports = { ordersController };
