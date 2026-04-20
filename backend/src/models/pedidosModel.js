//Imports
const db = require('../db');

const PedidosModel = {

    //Obtener todos los pedidos
    obtenerTodo: async () => {
        const { rows } = await db.query(
            `SELECT id, total, direccion, nombre, correo, telefono, fecha_creacion
             FROM pedido ORDER BY id DESC`
        );
        return rows;
    },


    //Obtener pedido por Id
    obtenerPorId: async (id) => {
        const { rows } = await db.query(
            `SELECT p.id, p.total, p.direccion, p.nombre, p.correo, p.telefono, p.fecha_creacion
             JSON_AGG( JSON_BUILD_OBJECT(
                'id_producto', dp.id_producto,
                'nombre',      pr.nombre,
                'cantidad',    dp.cantidad,
                'precio',      dp.precio,
                'subtotal',    dp.cantidad * dp.precio
             ) ) AS productos
             FROM pedido p
             LEFT JOIN detalle_pedido dp    ON dp.id_pedido = p.id
             LEFT JOIN producto pr          ON dp.id_producto = pr.id
             WHERE p.id = $1
             GROUP BY p.id, p.total, p.direccion, p.nombre, p.correo, p.telefono, p.fecha_creacion`,
            [id]
        );
        return rows[0];
    },


    //Obtener pedidos por usuario
    obtenerPorUsuario: async (idUsuario) => {
        const { rows } = await db.query(
             `SELECT id, total, direccion, nombre, correo, telefono, fecha_creacion
             FROM pedido 
             WHERE id_usuario = $1
             ORDER BY id DESC`,
            [idUsuario]
        );
        return rows;
    },



    //Crear pedido
    crearPedido: async (direccion, idUsuario, nombre, correo, telefono, productos) =>{
        const client = await db.connect();

        try{
            await client.query('BEGIN');

             const { calle, numero, cp, ciudad, provincia, piso } = direccion;

            //Crear pedido
             const { rows: pedidosRows } = await client.query(
            `INSERT INTO pedido (total, direccion, id_usuario, nombre, correo, telefono)
             VALUES (0, ROW($1, $2, $3, $4, $5, $6)::direccion, $7, $8, $9, $10)
             RETURNING *`,
            [calle, numero, cp, ciudad, provincia, piso, idUsuario, nombre, correo, telefono]
        );
        const pedido = pedidosRows[0];

        //Insertar cada producto al pedido (detalle_pedido)
        for (const producto of productos){
            await client.query(
                `INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio)
                 VALUES ($1, $2, $3, $4)`,
                [pedido.id, producto.id_producto, producto.cantidad, producto.precio]
            );
        }

        //Calcular y actualizar el total de pedido
        const { rows: totalRows } = await client.query(
            `UPDATE pedido SET total = (
             SELECT SUM(cantidad*precio) FROM detalle_pedido WHERE id_pedido = $1)
             WHERE id = $1
             RETURNING total`,
            [pedido.id]
        );
        pedido.total = totalRows[0].total;

        await client.query('COMMIT');
        return pedido
            
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
            
        } finally {
            client.release()
        }
    },


    //Eliminar pedido
    eliminarPedido: async (id) => {
        const { rows } = await db.query(
            `DELETE FROM pedido WHERE id = $1 RETURNING *`,
            [id]
        );
        return rows[0];
    }

}
module.exports = PedidosModel;