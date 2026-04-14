//Imports
const db = require('../db');

const ProductosModel = {

    //Obtener todos los productos (para mostrar en la pagina principal)
    obtenerTodo: async() => {
        const { rows } = await db.query(
            `SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.oferta, p.precio_oferta,
             c.id AS categoria_id, c.nombre_categoria AS categoria_nombre
             FROM producto p
             JOIN categoria c ON c.id = p.categoria`
        );
        return rows;
    },

    //Obtener producto por id (para mostrar en la pagina de detalles del producto) (Devuelve todos los datos)
    obtenerPorId: async(id) => {
        const { rows } = await db.query(
            `SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.oferta, p.precio_oferta,
             c.id AS categoria_id, c.nombre_categoria AS categoria_nombre,
             COALESCE(JSON_AGG(
                DISTINCT JSONB_BUILD_OBJECT('id', a.id, 'nombre', a.nombre_aroma))
                FILTER (WHERE a.id IS NOT NULL), '[]')
                AS aromas,
             COALESCE(JSON_AGG(
                DISTINCT JSONB_BUILD_OBJECT('id', col.id, 'nombre', col.color))
                FILTER (WHERE col.id IS NOT NULL), '[]')
                AS colores
             FROM producto p
             JOIN categoria c ON c.id = p.categoria
             LEFT JOIN producto_aroma pa ON pa.id_producto = p.id
             LEFT JOIN aroma a ON a.id = pa.id_aroma
             LEFT JOIN producto_color pc ON pc.id_producto = p.id
             LEFT JOIN color col ON col.id = pc.id_color
             WHERE p.id = $1
             GROUP BY p.id, c.id`,
            [id]
        );
        return rows[0];
    },

    //Obtener producto por categoria
    obtenerPorCategoria: async(idCategoria) => {
        const { rows } = await db.query(
            `SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.oferta, p.precio_oferta,
             c.id AS categoria_id, c.nombre_categoria AS categoria_nombre
             FROM producto p
             JOIN categoria c ON c.id = p.categoria
             WHERE p.categoria = $1`,
            [idCategoria]
        );
        return rows;
    },

    //Obtener producto por color
    obtenerPorColor: async(idColor) => {
        const { rows } = await db.query(
            `SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.oferta, p.precio_oferta,
             c.id AS categoria_id, c.nombre_categoria AS categoria_nombre
             FROM producto p
             JOIN categoria c ON c.id = p.categoria
             LEFT JOIN producto_color pc ON pc.id_producto = p.id
             LEFT JOIN color col ON col.id = pc.id_color
             WHERE p.id IN (SELECT id_producto FROM producto_color WHERE id_color = $1)`,
            [idColor]
        );
        return rows;
    },

    //Obtener producto por aroma
    obtenerPorAroma: async(idAroma) => {
        const { rows } = await db.query(
            `SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.oferta, p.precio_oferta,
             c.id AS categoria_id, c.nombre_categoria AS categoria_nombre
             FROM producto p
             JOIN categoria c ON c.id = p.categoria
             LEFT JOIN producto_aroma pa ON pa.id_producto = p.id
             LEFT JOIN aroma a ON a.id = pa.id_aroma
             WHERE p.id IN (SELECT id_producto FROM producto_aroma WHERE id_aroma = $1)`,
            [idAroma]
        );
        return rows;
    },

    //Agregar nuevo producto
    agregarProducto: async(client, nombre, descripcion, precio, stock, categoria) => {
        const { rows } = await client.query(
            `INSERT INTO producto (nombre, descripcion, precio, stock, oferta, precio_oferta, categoria)
             VALUES ($1, $2, $3, $4, 0, $3, $5)
             RETURNING *`,
            [nombre, descripcion, precio, stock, categoria]
        );
        return rows[0];
    },

    //Agregar aroma a producto existente
    agregarAromaProducto: async(client, idProducto, idAroma) => {
        await client.query(
            `INSERT INTO producto_aroma (id_producto, id_aroma) VALUES ($1, $2)`,
            [idProducto, idAroma]
        );
    },

    //Agregar color a producto existente
    agregarColorProducto: async(client, idProducto, idColor) => {
        await client.query(
            `INSERT INTO producto_color (id_producto, id_color) VALUES ($1, $2)`,
            [idProducto, idColor]
        );
    },

    //Agregar imagen a producto existente
    agregarImagenProducto: async(client, idProducto, imagen, imagenMime, orden) => {
        await client.query(
            `INSERT INTO producto_imagen (id_producto, imagen, imagen_mime, orden)
             VALUES ($1, $2, $3, $4)`,
            [idProducto, imagen, imagenMime, orden]
        );
    },

    //Modificar producto existente
    modificarProducto: async(client, id, nombre, descripcion, precio, stock, oferta, precio_oferta, categoria) => {
        const { rows } = await client.query(
            `UPDATE producto SET
             nombre = $1, descripcion = $2, precio = $3, stock = $4, oferta = $5, precio_oferta = $6, categoria = $7
             WHERE id = $8
             RETURNING *`,
            [nombre, descripcion, precio, stock, oferta, precio_oferta, categoria, id]
        );
        return rows[0];
    },

    //Eliminar todos los aromas de un producto
    eliminarAromaProducto: async(client, idProducto) => {
        await client.query(
            `DELETE FROM producto_aroma WHERE id_producto = $1`,
            [idProducto]
        );
    },

    //Eliminar todos los colores de un producto
    eliminarColorProducto: async(client, idProducto) => {
        await client.query(
            `DELETE FROM producto_color WHERE id_producto = $1`,
            [idProducto]
        );
    },

    //Obtener IDs de imágenes actuales de un producto
    obtenerIdsImagenesProducto: async(client, idProducto) => {
        const result = await client.query(
            `SELECT id FROM producto_imagen WHERE id_producto = $1`,
            [idProducto]
        );
        return result.rows;
    },

    //Eliminar una imagen concreta por ID y producto
    eliminarImagenProductoPorId: async(client, idProducto, imagenId) => {
        await client.query(
            `DELETE FROM producto_imagen
             WHERE id_producto = $1 AND id = $2`,
            [idProducto, imagenId]
        );
    },

    //Actualizar orden de una imagen existente
    actualizarOrdenImagenProducto: async(client, idProducto, imagenId, orden) => {
        await client.query(
            `UPDATE producto_imagen
             SET orden = $1
             WHERE id_producto = $2 AND id = $3`,
            [orden, idProducto, imagenId]
        );
    },

    //Eliminar producto
    eliminarProducto: async(id) => {
        const { rows } = await db.query(
            `DELETE FROM producto WHERE id = $1 RETURNING id`,
            [id]
        );
        return rows[0];
    },

    //Obtener imagen principal por producto y orden
    obtenerImagenIdProducto: async(idProducto, orden) => {
        const result = await db.query(
            `SELECT id FROM producto_imagen
             WHERE id_producto = $1 AND orden = $2`,
            [idProducto, orden]
        );
        return result.rows[0] || null;
    },

    //Obtener imágenes para detalle
    obtenerImagenesIdProducto: async(idProducto) => {
        const result = await db.query(
            `SELECT id, orden FROM producto_imagen
             WHERE id_producto = $1 ORDER BY orden`,
            [idProducto]
        );
        return result.rows;
    },

    //Obtener binario de una imagen
    obtenerImagenIdImagen: async(imagenId) => {
        const result = await db.query(
            `SELECT imagen, imagen_mime FROM producto_imagen
             WHERE id = $1`,
            [imagenId]
        );
        return result.rows[0];
    },

    //Obtener último orden por producto
    obtenerUltimoOrden: async(idProducto) => {
        const result = await db.query(
            `SELECT COALESCE(MAX(orden), -1) AS ultimo
             FROM producto_imagen
             WHERE id_producto = $1`,
            [idProducto]
        );
        return result.rows[0].ultimo;
    },
};

module.exports = ProductosModel;