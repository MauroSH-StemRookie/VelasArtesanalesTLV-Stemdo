//Imports
const db = require('../db');
const PedidosModel = require('../models/pedidosModel');
const { enviarEmailPedidoCliente, enviarEmailPedidoAdmin } = require('../services/emailService');
const { ordersController } = require('../services/paypalService');

// ─────────────────────────────────────────────
// FUNCIÓN 1: Crear la orden de pago
// ─────────────────────────────────────────────
// El frontend llama a esto cuando el usuario pulsa el botón de PayPal.
// En este momento NO se cobra nada — solo se "registra" la intención de pago.
// PayPal devuelve un ID único de orden que el frontend usa para abrir su popup.
const createOrder = async (req, res) => {
    try {
        // El frontend nos manda el importe a cobrar, ej: { amount: "25.00" }
        const { amount } = req.body;
        // Le pedimos a PayPal que cree una orden con ese importe
        const { body: order } = await ordersController.createOrder({
            body: {
                intent: 'CAPTURE',
                purchaseUnits: [{ amount: { currencyCode: 'EUR', value: amount } }],
                applicationContext: {
                    returnUrl: 'https://example.com/success',
                    cancelUrl: 'https://example.com/cancel',
                },
            },
        });
        res.json(order);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// ─────────────────────────────────────────────
// FUNCIÓN 2: Capturar el pago (cobrar de verdad)
// ─────────────────────────────────────────────
// El frontend llama a esto DESPUÉS de que el usuario aprueba el pago en el popup.
// Aquí es donde el dinero se mueve realmente de la cuenta del usuario a la tuya.
const captureOrder = async (req, res) => {
    const client = await db.connect();

    try {
        const { orderID } = req.params;
        const { nombre, correo, telefono, productos, calle, numero, cp, ciudad, provincia, piso, total } = req.body;
        const idUsuario = req.user ? req.user.id : null;
        const direccion = { calle, numero, cp, ciudad, provincia, piso };
        
        await client.query('BEGIN');

        // PASO 1: Crear pedido con el total del frontend
        const pedido = await PedidosModel.crearPedidoBase(
            client, direccion, idUsuario, nombre, correo, telefono, 'paypal', total
        );

        // PASO 2: Insertar líneas de detalle_pedido
        await PedidosModel.insertarDetalle(client, pedido.id, productos);

        // PASO 3: Cobrar a PayPal
        const { body: captureData } = await ordersController.captureOrder({ id: orderID });
        const capture = typeof captureData === 'string' ? JSON.parse(captureData) : captureData;
        //console.log('CAPTURE STATUS:', capture.status); 

        if (capture.status !== 'COMPLETED') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Pago no completado', status: capture.status });
        }

        // PASO 4: Verificar que lo que cobró PayPal coincide con el total del frontend
        // Esto evita que alguien manipule el importe desde el navegador
        const totalPayPal = parseFloat(
            capture.purchase_units[0].payments.captures[0].amount.value
        );
        if (Math.abs(totalPayPal - parseFloat(total)) > 0.01) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'El total cobrado no coincide con el pedido' });
        }

        // PASO 5: Guardar el id de transacción de PayPal
        await PedidosModel.actualizarTransaccion(client, pedido.id, orderID);

        await client.query('COMMIT');

        // Emails fuera de la transacción
        const pedidoCompleto = await PedidosModel.obtenerPorId(pedido.id);
        await Promise.all([
            enviarEmailPedidoCliente(correo, nombre, pedidoCompleto),
            enviarEmailPedidoAdmin(pedidoCompleto)
        ]);

        res.status(201).json({ success: true, pedido: pedidoCompleto });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en captureOrder:', error);
        res.status(500).json({ error: error.message });

    } finally {
        client.release();
    }
}

module.exports = { createOrder, captureOrder };