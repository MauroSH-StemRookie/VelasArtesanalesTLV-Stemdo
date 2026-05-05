//Imports
const db           = require('../db');
const PedidosModel = require('../models/pedidosModel');
const { crearPago, verificarNotificacion } = require('../services/redsysService');
const { enviarEmailPedidoCliente, enviarEmailPedidoAdmin } = require('../services/emailService');


// ─────────────────────────────────────────────
// POST /api/pagos/redsys/iniciar
// Igual que captureOrder de PayPal:
//   1) Crea el pedido en BD (estado 'pendiente')
//   2) Devuelve parámetros firmados para que el frontend construya el formulario hacia Redsys
// ─────────────────────────────────────────────
const iniciarPago = async (req, res) => {
    const client = await db.connect();

    try {
        const { nombre, correo, telefono, productos, calle, numero, cp, ciudad, provincia, piso, total } = req.body;
        const idUsuario = req.user ? req.user.id : null;
        const direccion = { calle, numero, cp, ciudad, provincia, piso };

        if (!nombre || !correo || !productos || productos.length === 0 || !total) {
            return res.status(400).json({ error: 'Nombre, correo, productos y total son obligatorios' });
        }

        for (const item of productos) {
            if (!item.id_producto || !item.cantidad || !item.precio) {
                return res.status(400).json({
                    error: 'Cada producto debe tener id_producto, cantidad y precio'
                });
            }
        }

        await client.query('BEGIN');

        // PASO 1: Crear pedido en BD con estado 'pendiente'
        const pedido = await PedidosModel.crearPedidoBase(client, direccion, idUsuario, nombre, correo, telefono, 'redsys', total);

        // PASO 2: Insertar líneas de detalle_pedido
        await PedidosModel.insertarDetalle(client, pedido.id, productos);

        await client.query('COMMIT');

        // PASO 3: Generar parámetros firmados para el TPV de Redsys
        const pago = crearPago({
            orderId:         pedido.id,
            amount:          total,
            urlOk:           process.env.REDSYS_SUCCESS_URL,
            urlKo:           process.env.REDSYS_ERROR_URL,
            urlNotificacion: process.env.REDSYS_NOTIFICATION_URL
        });

        // Devolver al frontend todo lo necesario para el formulario POST a Redsys
        //console.log('URL notificacion enviada a Redsys:', process.env.REDSYS_NOTIFICATION_URL);
        //console.log('URL OK:', process.env.REDSYS_SUCCESS_URL);
        //console.log('URL KO:', process.env.REDSYS_ERROR_URL);
        res.status(201).json({
            pedidoId: pedido.id,
            ...pago   // url, Ds_SignatureVersion, Ds_MerchantParameters, Ds_Signature
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error en iniciarPago Redsys:', err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};


// ─────────────────────────────────────────────
// POST /api/pagos/redsys/notificacion
// Redsys llama aquí automáticamente — el frontend NUNCA llama a este endpoint
// ─────────────────────────────────────────────
const notificacion = async (req, res) => {
    try {
        //console.log('Redsys llamó al webhook');
        //console.log('Body recibido:', req.body);
        const { Ds_MerchantParameters, Ds_Signature } = req.body;

        if (!Ds_MerchantParameters || !Ds_Signature) {
            return res.status(400).send('KO');
        }

        //console.log('Parámetros recibidos correctamente');

         // Decodifica y muestra TODO
        const decoded = JSON.parse(Buffer.from(Ds_MerchantParameters, 'base64').toString('utf8'));
        //console.log('Parámetros decodificados:', decoded);
        //console.log('Orden:', decoded.Ds_Order);
        //console.log('Respuesta:', decoded.Ds_Response);

        const { firmaValida, params, pagoAprobado } = verificarNotificacion({
            Ds_MerchantParameters,
            Ds_Signature
        });

        //console.log('Firma válida:', firmaValida);
        //console.log('Pago aprobado:', pagoAprobado);
        //console.log('Params decodificados:', params);


        if (!firmaValida) {
            console.error('Redsys: firma inválida');
            return res.status(400).send('KO');
        }

        const idPedido      = parseInt(params.Ds_Order);
        const idTransaccion = params.Ds_AuthorisationCode || params.Ds_Order;

        //console.log('ID Pedido:', idPedido);
        //console.log('ID Transacción:', idTransaccion);

        if (pagoAprobado) {
            // Pago correcto → actualizar estado y guardar id de transacción
            //console.log('Pago aprobado — actualizando BD...');
            await db.query(
                `UPDATE pedido
                 SET estado = 'pendiente', id_transaccion = $1
                 WHERE id = $2`,
                [idTransaccion, idPedido]
            );

            //console.log('BD actualizada');

            // Enviar emails de confirmación
            const pedidoCompleto = await PedidosModel.obtenerPorId(idPedido);
            if (pedidoCompleto) {
                await Promise.all([
                    enviarEmailPedidoCliente(pedidoCompleto.correo, pedidoCompleto.nombre, pedidoCompleto),
                    enviarEmailPedidoAdmin(pedidoCompleto)
                ]);
            }

        } else {
            // Pago fallido o denegado → cancelar pedido
            //console.warn(`Redsys: pago denegado para pedido ${idPedido}. Código: ${params.Ds_Response}`);
            await db.query(
                `UPDATE pedido SET estado = 'cancelado' WHERE id = $1`,
                [idPedido]
            );
        }

        // Redsys espera exactamente 'OK' como respuesta — cualquier otra cosa lo reintenta
        res.status(200).send('OK');

    } catch (err) {
        console.error('Error en notificación Redsys:', err.message);
        res.status(500).send('KO');
    }
};


module.exports = { iniciarPago, notificacion };