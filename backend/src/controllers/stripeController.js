//Imports
const db = require('../db');
const PedidosModel = require('../models/pedidosModel');
const { enviarEmailPedidoCliente, enviarEmailPedidoAdmin } = require('../services/emailService');
const { stripe } = require('../services/stripeService');


// ─────────────────────────────────────────────
// FUNCIÓN 1: Crear PaymentIntent
// ─────────────────────────────────────────────
// El frontend llama a esto cuando el usuario pulsa "Pagar con tarjeta".
// Stripe devuelve un client_secret que el frontend usa para mostrar el formulario de tarjeta (Stripe Elements / Payment Element).
const createPaymentIntent = async (req, res) => {
    try {
        const { amount } = req.body; //Precio a pagar

        //Stripe trabaja en centimos, por lo que parseamos el precio
        const amountInCents = Math.round(amount * 100);

        //Creamos el PaymentIntent en Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'eur',
            automatic_payment_methods: { enabled: true } //Esto habilita tarjeta, bizum y otros metodos de pago.
        });

        //Solo mandamos el client_secret al frontend
        res.json({ clientSecret: paymentIntent.client_secret });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// ─────────────────────────────────────────────
// FUNCIÓN 2: Confirmar pago y crear el pedido
// ─────────────────────────────────────────────
// El frontend llama a esto DESPUÉS de que Stripe confirma el pago.
// Recibe el paymentIntentId y verifica con Stripe que el pago es real.
const confirmPayment = async (req, res) => {
    const client = await db.connect();

    try {
        const { paymentIntentId, nombre, correo, telefono, productos, calle, numero, cp, ciudad, provincia, piso, total } = req.body;
        const idUsuario = req.user ? req.user.id : null;
        const direccion = { calle, numero, cp, ciudad, provincia, piso };

        // Verificacion del pago: consulta a Stripe el estado real del pago
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ error: 'Pago no confirmado', status: paymentIntent.status });
        }

        //Veridicar que el importe cobrado councide con el total del pedido
        const totalStripe = paymentIntent.amount /100;
        if (Math.abs(totalStripe - total) > 0.01) {
            return res.status(400).json({ error: 'El importe del pago no coincide con el total del pedido' });
        }

        await client.query('BEGIN');

        // PASO 1: Crear pedido base
        const pedido = await PedidosModel.crearPedidoBase(
            client, direccion, idUsuario, nombre, correo, telefono, 'stripe', total
        );

        // PASO 2: Insertar líneas de detalle
        await PedidosModel.insertarDetalle(client, pedido.id, productos);

        // PASO 3: Guardar el ID de transacción de Stripe
        await PedidosModel.actualizarTransaccion(client, pedido.id, paymentIntentId);

        // PASO 4: Cambiar estado a pendiente (de envío)
        await PedidosModel.actualizarEstadoInterno(client, pedido.id, 'pendiente');

        await client.query('COMMIT');

        // Emails fuera de la transacción
        const pedidoCompleto = await PedidosModel.obtenerPorId(pedido.id);
        await Promise.all([
            enviarEmailPedidoCliente(correo, nombre, pedidoCompleto),
            enviarEmailPedidoAdmin(pedidoCompleto)
        ]);

        res.status(201).json({ success: true, pedido: pedidoCompleto });

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });

    } finally {
        client.release();
    }   
};


// ─────────────────────────────────────────────
// FUNCIÓN 3: Webhook de Stripe 
// ─────────────────────────────────────────────
// Stripe llama a esta ruta para notificarte eventos asíncronos.
// Imprescindible para pagos 3D Secure donde el usuario puede tardar.
// IMPORTANTE: Esta ruta necesita el body RAW (sin parsear como JSON).
const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        // Verificamos que el webhook viene realmente de Stripe
        event = stripe.webhooks.constructEvent(
            req.rawBody, // Ver nota abajo sobre cómo obtener rawBody
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature inválida:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Manejar el evento
    switch (event.type) {
        case 'payment_intent.succeeded':
            console.log('Pago confirmado por webhook:', event.data.object.id);
            break;
        case 'payment_intent.payment_failed':
            console.log('Pago fallido:', event.data.object.id);
            break;
        default:
            console.log(`Evento no manejado: ${event.type}`);
    }

    res.json({ received: true });
};

module.exports = { createPaymentIntent, confirmPayment, stripeWebhook };