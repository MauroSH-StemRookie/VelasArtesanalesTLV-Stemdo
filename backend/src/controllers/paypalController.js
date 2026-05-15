//Imports
const db = require("../db");
const PedidosModel = require("../models/pedidosModel");
const {
  enviarEmailPedidoCliente,
  enviarEmailPedidoAdmin,
} = require("../services/emailService");
const { ordersController } = require("../services/paypalService");

const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const { body: order } = await ordersController.createOrder({
      body: {
        intent: "CAPTURE",
        purchaseUnits: [{ amount: { currencyCode: "EUR", value: amount } }],
        applicationContext: {
          returnUrl: "https://example.com/success",
          cancelUrl: "https://example.com/cancel",
        },
      },
    });
    const parsedOrder = typeof order === "string" ? JSON.parse(order) : order;
    res.json({ id: parsedOrder.id, status: parsedOrder.status });
  } catch (err) {
    console.error('>>> ERROR PayPal createOrder:', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
};

const captureOrder = async (req, res) => {
  const client = await db.connect();
  try {
    const { orderID } = req.params;
    const { nombre, correo, telefono, productos, calle, numero, cp, ciudad, provincia, piso, total } = req.body;
    const idUsuario = req.user ? req.user.id : null;
    const direccion = { calle, numero, cp, ciudad, provincia, piso };
    await client.query("BEGIN");
    const pedido = await PedidosModel.crearPedidoBase(client, direccion, idUsuario, nombre, correo, telefono, "paypal", total);
    await PedidosModel.insertarDetalle(client, pedido.id, productos);
    const { body: captureData } = await ordersController.captureOrder({ id: orderID });
    const capture = typeof captureData === "string" ? JSON.parse(captureData) : captureData;
    if (capture.status !== "COMPLETED") {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Pago no completado", status: capture.status });
    }
    const totalPayPal = parseFloat(capture.purchase_units[0].payments.captures[0].amount.value);
    if (Math.abs(totalPayPal - parseFloat(total)) > 0.01) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "El total cobrado no coincide con el pedido" });
    }
    await PedidosModel.actualizarTransaccion(client, pedido.id, orderID);
    await PedidosModel.actualizarEstadoInterno(client, pedido.id, "pendiente");
    await client.query("COMMIT");
    const pedidoCompleto = await PedidosModel.obtenerPorId(pedido.id);
    await Promise.all([
      enviarEmailPedidoCliente(correo, nombre, pedidoCompleto),
      enviarEmailPedidoAdmin(pedidoCompleto),
    ]);
    res.status(201).json({ success: true, pedido: pedidoCompleto });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error en captureOrder:", error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

module.exports = { createOrder, captureOrder };
