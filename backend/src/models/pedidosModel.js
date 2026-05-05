//Imports
const db = require("../db");

const PedidosModel = {
  //Obtener todos los pedidos (solo admin)
  obtenerTodo: async (limit, offset) => {
    const { rows } = await db.query(
      `SELECT id, total, correo, estado, fecha_creacion, nombre
             FROM pedido
             ORDER BY id DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset],
    );
    return rows;
  },

  //Obtener pedido por Id — cabecera + lineas del carrito
  obtenerPorId: async (id) => {
    const { rows } = await db.query(
      `SELECT p.id, p.total, JSON_BUILD_OBJECT(
  'calle', (p.direccion).calle,
  'numero', (p.direccion).numero,
  'cp', (p.direccion).cp,
  'ciudad', (p.direccion).ciudad,
  'provincia', (p.direccion).provincia,
  'piso', (p.direccion).piso
) AS direccion, p.nombre, p.correo, p.telefono,
                    p.estado, p.fecha_creacion, p.id_usuario,
                    COALESCE(
                      JSON_AGG(
                        JSON_BUILD_OBJECT(
                          'id_producto', dp.id_producto,
                          'nombre',      pr.nombre,
                          'cantidad',    dp.cantidad,
                          'precio',      dp.precio,
                          'subtotal',    dp.cantidad * dp.precio
                        )
                      ) FILTER (WHERE dp.id IS NOT NULL),
                      '[]'
                    ) AS productos
             FROM pedido p
             LEFT JOIN detalle_pedido dp ON dp.id_pedido = p.id
             LEFT JOIN producto pr       ON dp.id_producto = pr.id
             WHERE p.id = $1
             GROUP BY p.id`,
      [id],
    );
    return rows[0];
  },

  //Obtener pedidos por usuario (el usuario ve sus propios pedidos)
  obtenerPorUsuario: async (idUsuario) => {
    const { rows } = await db.query(
      `SELECT id, total, correo, estado, fecha_creacion, nombre, telefono
             FROM pedido
             WHERE id_usuario = $1
             ORDER BY id DESC`,
      [idUsuario],
    );
    return rows;
  },

  /* Crear pedido — transaccion con 3 pasos:
       1) INSERT en `pedido` con total=0 (lo recalculamos al final).
       2) INSERT de cada linea en `detalle_pedido` con el precio snapshot.
       3) UPDATE del total con SUM(cantidad*precio) de las lineas.
       4) UPDATE del id de transeferencia.

       Si cualquiera de los pasos falla, ROLLBACK y la BD queda intacta. */

  crearPedidoBase: async (
    client,
    direccion,
    idUsuario,
    nombre,
    correo,
    telefono,
    metodoPago,
    total,
  ) => {
    const { calle, numero, cp, ciudad, provincia, piso } = direccion;

    const { rows } = await client.query(
      `INSERT INTO pedido (total, direccion, id_usuario, nombre, correo, telefono, metodo_pago)
             VALUES ($7, ROW($1,$2,$3,$4,$5,$6)::direccion, $8, $9, $10, $11, $12)
             RETURNING *`,
      [
        calle,
        numero,
        cp,
        ciudad,
        provincia,
        piso,
        total,
        idUsuario,
        nombre,
        correo,
        telefono,
        metodoPago,
      ],
    );
    return rows[0]; // devuelve el pedido con su id recién generado
  },

  // PASO 2: Insertar cada producto en detalle_pedido
  insertarDetalle: async (client, idPedido, productos) => {
    for (const producto of productos) {
      await client.query(
        `INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio)
                 VALUES ($1, $2, $3, $4)`,
        [idPedido, producto.id_producto, producto.cantidad, producto.precio],
      );
    }
  },

  // PASO 3: Recalcular y actualizar el total desde las líneas reales de detalle_pedido
  // Devuelve el total calculado para usarlo en PayPal/Redsys
  actualizarTotal: async (client, idPedido) => {
    const { rows } = await client.query(
      `UPDATE pedido
             SET total = ( SELECT SUM(cantidad * precio) FROM detalle_pedido WHERE id_pedido = $1 )
             WHERE id = $1
             RETURNING total`,
      [idPedido],
    );
    return rows[0].total; // devuelve el total real calculado
  },

  // PASO 4: Actualizar el id_transaccion una vez que el pago ha sido confirmado
  actualizarTransaccion: async (client, idPedido, idTransaccion) => {
    const { rows } = await client.query(
      `UPDATE pedido SET id_transaccion = $1
             WHERE id = $2
             RETURNING *`,
      [idTransaccion, idPedido],
    );
    return rows[0];
  },

  // PASO 5: Actualiza el estado de pendiente de pago a pendiente de entrega
  actualizarEstadoInterno: async (client, idPedido, estado) => {
    const { rows } = await client.query(
      `UPDATE pedido SET estado = $1 WHERE id = $2 RETURNING *`,
      [estado, idPedido],
    );
    return rows[0];
  },

  /* Actualizar estado de un pedido (solo admin).
       La validacion del valor de `estado` se hace en el controller antes de
       llegar aqui, y tambien a nivel de BD con el CHECK constraint. */
  actualizarEstado: async (id, estado) => {
    const { rows } = await db.query(
      `UPDATE pedido SET estado = $1
             WHERE id = $2
             RETURNING *`,
      [estado, id],
    );
    return rows[0];
  },

  //Eliminar pedido (solo admin). Las lineas de detalle_pedido caen por CASCADE.
  eliminarPedido: async (id) => {
    const { rows } = await db.query(
      `DELETE FROM pedido WHERE id = $1 RETURNING id`,
      [id],
    );
    return rows[0];
  },
};

module.exports = PedidosModel;
