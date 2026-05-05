//Imports
const PedidoPersonalizadoModel = require("../models/pedidoPersonalizadoModel");
const {
  enviarEmailPedidoPersonalizadoAdmin,
} = require("../services/emailService");

const ESTADOS_VALIDOS = ["pendiente", "aceptado", "denegado", "completado"];

const PedidoPersonalizadoController = {
  //Obtener todo (solo admin)
  //Acepta paginacion via query params: ?page=1&limit=15
  obtenerTodo: async (req, res) => {
    try {
      //Defaults: page=1, limit=15. Si llegan negativos o invalidos los normalizamos.
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, parseInt(req.query.limit) || 15);
      const offset = (page - 1) * limit;

      const pedidos = await PedidoPersonalizadoModel.obtenerTodo(limit, offset);
      res.json(pedidos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  //Obtener pedido por id (usuario logueado)
  obtenerPorId: async (req, res) => {
    try {
      const { id } = req.params;

      const pedido = await PedidoPersonalizadoModel.obtenerPorId(id);

      if (!pedido) {
        return res.status(404).json({ error: "Pedido no encontrado" });
      }
      res.json(pedido);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  //Obtener los pedidos personalizados del usuario logueado
  obtenerPedidoUsuario: async (req, res) => {
    try {
      const idUsuario = req.user.id;

      const pedidos =
        await PedidoPersonalizadoModel.obtenerPorUsuario(idUsuario);

      res.json(pedidos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  //Crear pedido personalizado (publico, acepta invitados)
  crearPP: async (req, res) => {
    try {
      const idUsuario = req.user ? req.user.id : null;
      const {
        nombre,
        correo,
        telefono,
        id_producto,
        cantidad,
        tipo,
        aroma,
        color,
        categoria,
        descripcion,
      } = req.body;

      if (!descripcion || !nombre || !correo) {
        return res
          .status(400)
          .json({ error: "Descripcion, nombre y correo son obligatorios" });
      }

      const descripcionFinal = `Tipo: ${tipo || "—"}
Aroma: ${aroma || "—"}
Color: ${color || "—"}
Categoría: ${categoria || "—"}
Cantidad: ${cantidad || "—"}

Descripción del cliente: ${descripcion || "Sin descripción adicional"}`;

      const pedidoP = await PedidoPersonalizadoModel.crearPP(
        id_producto || null,
        idUsuario,
        descripcionFinal,
        nombre,
        correo,
        telefono,
        cantidad,
      );

      // Obtener con nombre del producto de referencia para el email
      const pedidoPCompleto = await PedidoPersonalizadoModel.obtenerPorId(
        pedidoP.id,
      );

      //Enviar email
      await enviarEmailPedidoPersonalizadoAdmin(pedidoPCompleto);

      res.status(201).json(pedidoP);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /* Actualizar el estado (solo admin). Valida contra la lista blanca antes
       de tocar la BD. El CHECK de la BD es la red secundaria. */
  actualizarEstado: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!estado) {
        return res.status(400).json({ error: "Falta el campo estado" });
      }

      if (!ESTADOS_VALIDOS.includes(estado)) {
        return res.status(400).json({
          error:
            "Estado no valido. Valores aceptados: " +
            ESTADOS_VALIDOS.join(", "),
        });
      }

      const pedido = await PedidoPersonalizadoModel.actualizarEstado(
        id,
        estado,
      );

      if (!pedido) {
        return res
          .status(404)
          .json({ error: "Pedido personalizado no encontrado" });
      }

      res.json(pedido);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  //Eliminar pedido personalizado (solo admin)
  eliminarPP: async (req, res) => {
    try {
      const { id } = req.params;

      const pedidoEliminado = await PedidoPersonalizadoModel.eliminarPP(id);

      if (!pedidoEliminado) {
        return res
          .status(404)
          .json({ error: "Pedido personalizado no encontrado" });
      }

      res.json({ mensaje: "Pedido personalizado eliminado correctamente" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = PedidoPersonalizadoController;
