const db = require('../db');
const { obtenerPorUsuario } = require('./pedidosModel');

const PedidoPersonaliadoModel = {

    //Obtener todos los pedidos personalizados
    obtenerTodo: async() => {
        const { rows } = db.query(
            `SELECT  pp.id, pp.correo, pp.cantidad, pp.fecha_creacion, pr.nombre AS producto_referencia
             FROM pedido_personalizado AS pp
             LEFT JOIN producto pr ON pp.id_producto = pr.id
             ORDER BY pp.id DESC`
        );
        return rows;
    },


    //Obtener por id del pedido
    obtenerPorId: async(id) => {
        const { rows } = db.query(
            `SELECT  pp.id, pp.decripcion, pp.nombre, pp.correo, pp.telefono, pp.cantidad, pp.fecha_creacion, pr.nombre AS producto_referencia
             FROM pedido_personalizado AS pp
             LEFT JOIN producto pr ON pp.id_producto = pr.id
             WHERE pp.id = $1`,
            [id]
        );
        return rows[0];
    },



    //Obtener por Usuario
    obtenerPorUsuario: async(idUsuario) => {
        const { rows } = db.query(
            `SELECT  pp.id, pp.correo, pp.cantidad, pp.fecha_creacion, pr.nombre AS producto_referencia
             FROM pedido_personalizado AS pp
             LEFT JOIN producto pr ON pp.id_producto = pr.id
             WHERE pp.id_usuario = $1
             ORDER BY pp.id DESC`,
            [idUsuario]
        );
        return rows;
    },



    //Crear pedido personalizado
    crearPP: async (idProducto, idUsuario, descripcion, nombre, correo, telefono, cantidad) => {
        const { rows } = await db.query(
            `INSERT INTO predido_personalizado
             (id_producto, id_usuario, descripcion, nombre, correo, telefono, cantidad)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [idProducto, idUsuario, descripcion, nombre, correo, telefono, cantidad]
        );
        return rows[0];
    },


    //Eliminar pedido personalizado
    eliminarPP: async (id) => {
        const {rows } = await db.query(
            `DELETE FROM pedido_personalizado WHERE id = $1 RETURNING *`,
            [id]
        );
        return rows[0];
    }
}
module.exports = PedidoPersonaliadoModel;