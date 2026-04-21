//Imports
const db = require("../db");

const PedidoPersonalizadoModel = {
  //Obtener todos los pedidos personalizados (solo admin)
  obtenerTodo: async () => {
    const { rows } = await db.query(
      `SELECT id, correo, cantidad, estado, fecha_creacion
             FROM pedido_personalizado 
             ORDER BY id DESC`,
    );
    return rows;
  },

  //Obtener por id (usuario logueado)
  obtenerPorId: async (id) => {
    const { rows } = await db.query(
      `SELECT pp.id, pp.id_producto, pp.id_usuario, pp.descripcion, pp.nombre, pp.correo, pp.telefono, pp.cantidad, pp.estado, pp.fecha_creacion, pr.nombre AS producto_referencia
             FROM pedido_personalizado AS pp
             LEFT JOIN producto pr ON pp.id_producto = pr.id
             WHERE pp.id = $1`,
      [id],
    );
    return rows[0];
  },

  //Obtener por usuario (sus propias solicitudes)
  obtenerPorUsuario: async (idUsuario) => {
    const { rows } = await db.query(
      `SELECT id, correo, cantidad, estado, fecha_creacion
             FROM pedido_personalizado
             WHERE id_usuario = $1
             ORDER BY id DESC`,
      [idUsuario],
    );
    return rows;
  },

  //Crear pedido personalizado. El estado por defecto (pendiente) lo pone la BD.
  crearPP: async (
    idProducto,
    idUsuario,
    descripcion,
    nombre,
    correo,
    telefono,
    cantidad,
  ) => {
    const { rows } = await db.query(
      `INSERT INTO pedido_personalizado
                (id_producto, id_usuario, descripcion, nombre, correo, telefono, cantidad)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, id_producto, id_usuario, descripcion, nombre, correo,
                       telefono, cantidad, estado, fecha_creacion`,
      [idProducto, idUsuario, descripcion, nombre, correo, telefono, cantidad],
    );
    return rows[0];
  },

  //Actualizar estado (solo admin)
  actualizarEstado: async (id, estado) => {
    const { rows } = await db.query(
      `UPDATE pedido_personalizado SET estado = $1
             WHERE id = $2
             RETURNING id, id_producto, id_usuario, descripcion, nombre, correo,
                       telefono, cantidad, estado, fecha_creacion`,
      [estado, id],
    );
    return rows[0];
  },

  //Eliminar pedido personalizado (solo admin)
  eliminarPP: async (id) => {
    const { rows } = await db.query(
      `DELETE FROM pedido_personalizado WHERE id = $1 RETURNING id`,
      [id],
    );
    return rows[0];
  },
};

module.exports = PedidoPersonalizadoModel;
