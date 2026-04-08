//Imports
const db = require('../db');

const ProductosModel = {

    //Obtener todos los productos (para mostrar en la pagina principal)
    obtenerTodo: async() => {
        const { rows } = await db.query(
            `SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.oferta, p.precio_oferta, p.imagen,
             c.id AS categoria_id, c.nombre_categoria AS categoria_nombre
             FROM producto p
             JOIN categoria c ON c.id = p.categoria`
        );
        return rows;
    },


    //Obtener producto por id (para mostrar en la pagina de detalles del producto) (Devuelve todos los datos)
    obtenerPorId: async(id) => {
        const { rows } = await db.query(
            `SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.oferta, p.precio_oferta, p.imagen,
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
             GROUP BY p.id, c.id`
            , [id]
        );
        return rows[0];
    },


    //Obtener producto por categoria (para mostrar en la pagina de categoria) (Deveulve los datos de la vista total)
    obtenerPorCategoria: async(idCategoria) => {
        const { rows } = await db.query(
            `SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.oferta, p.precio_oferta, p.imagen,
             c.id AS categoria_id, c.nombre_categoria AS categoria_nombre
             FROM producto p
             JOIN categoria c ON c.id = p.categoria 
             WHERE p.categoria = $1`
            , [idCategoria]
        );
        return rows;
    },


    //Obtener producto por color (para mostrar en la pagina de color) (Deveulve los datos de la vista total)
    obtenerPorColor: async(idColor) => {
        const { rows } = await db.query(
            `SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.oferta, p.precio_oferta, p.imagen,
             c.id AS categoria_id, c.nombre_categoria AS categoria_nombre
             FROM producto p
             JOIN categoria c ON c.id = p.categoria 
             LEFT JOIN producto_color pc ON pc.id_producto = p.id 
             LEFT JOIN color col ON col.id = pc.id_color 
             WHERE p.id IN (SELECT id_producto FROM producto_color WHERE id_color = $1)`
            , [idColor]
        );
        return rows;
    },


    //Obtener producto por aroma (para mostrar en la pagina de aroma) (Deveulve los datos de la vista total)
    obtenerPorAroma: async(idAroma) => {
        const { rows } = await db.query(
            `SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.oferta, p.precio_oferta, p.imagen,
             c.id AS categoria_id, c.nombre_categoria AS categoria_nombre
             FROM producto p
             JOIN categoria c ON c.id = p.categoria 
             LEFT JOIN producto_aroma pa ON pa.id_producto = p.id 
             LEFT JOIN aroma a ON a.id = pa.id_aroma 
             WHERE p.id IN (SELECT id_producto FROM producto_aroma WHERE id_aroma = $1)`
            , [idAroma]
        );
        return rows;
    },


    //Agregar nuevo producto (solo para admin)
    agregarProducto: async(client, nombre, descripcion, precio, stock, imagen, categoria) => {
        const { rows } = await client.query(
            `INSERT INTO producto (nombre, descripcion, precio, stock, oferta, precio_oferta, imagen, categoria)
            VALUES ($1, $2, $3, $4, 0, $3, $5, $6) RETURNING *`,
            [nombre, descripcion, precio, stock, imagen ?? null, categoria]
        );
        return rows[0];
    },


    //Agregar aroma a producto existente (Tabla aroma_producto) (solo para admin)
    agregarAromaProducto: async(client, idProducto, idAroma) => {
        await client.query(
            `INSERT INTO producto_aroma (id_producto, id_aroma) VALUES ($1, $2)`,
            [idProducto, idAroma]
        );
    },


    //Agregar color a producto existente (Tabla color_producto) (solo para admin)
    agregarColorProducto: async(client, idProducto, idColor) => {
        await client.query(
            `INSERT INTO producto_color (id_producto, id_color) VALUES ($1, $2)`,
            [idProducto, idColor]
        );
    },


    //Modificar producto existente (solo para admin) (Se pueden modificar todos los campos excepto el id, y se pueden agregar o eliminar colores y aromas)
    modificarProducto: async(client, id, nombre, descripcion, precio, stock, oferta, precio_oferta, imagen, categoria) => {
        const { rows } = await client.query(
            `UPDATE producto SET
             nombre = $1, descripcion = $2, precio = $3, stock = $4, oferta = $5, precio_oferta = $6, imagen = $7, categoria = $8
             WHERE id = $9
             RETURNING *`,
            [nombre, descripcion, precio, stock, oferta, precio_oferta, imagen ?? null, categoria, id]
        );
        return rows[0];
    },

    //Eliminar todos los aromas de un producto (solo para admin) (Se utiliza para eliminar los aromas de un producto antes de agregar nuevos aromas en la modificacion del producto)
    eliminarAromaProducto: async(client, idProducto) => {
        await client.query(
            `DELETE FROM producto_aroma WHERE id_producto = $1`,
            [idProducto]
        );
    },

    //Eliminar todos los colores de un producto (solo para admin) (Se utiliza para eliminar los colores de un producto antes de agregar nuevos colores en la modificacion del producto)
    eliminarColorProducto: async(client, idProducto) => { 
        await client.query(
            `DELETE FROM producto_color WHERE id_producto = $1`,
            [idProducto]
        );
    },


    //Eliminar producto (solo para admin) (Elimina el producto de la base de datos, no solo lo marca como eliminado)
    eliminarProducto: async(id) => {
        const { rows } = await db.query(
            `DELETE FROM producto WHERE id = $1 RETURNING id`,
            [id]
        );
        return rows[0];
    }

};

module.exports = ProductosModel;