const db = require('../db');
const ProductosModel = require('../models/productosModel');

const ProductosController = {

    obtenerTodo: async(req, res) => {
        try {
            const productos = await ProductosModel.obtenerTodo();
            res.json(productos);

        } catch (err){
            res.status(500).json({ error: err.message });
        }
    },


    obtenerPorId: async(req, res) => {
        try {
            const producto = await ProductosModel.obtenerPorId(req.params.id);
            //Comprobar que el producto existe
            if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

            res.json(producto);

        } catch (err){
            res.status(500).json({ error: err.message });
        }
    },


    obtenerPorCategoria: async(req, res) => {
        try {
            const productos = await ProductosModel.obtenerPorCategoria(req.params.categoria);
            //Comprobar que existen productos en esa categoria
            if (!productos.length) return res.status(404).json({ error: 'No se encontraron productos en esta categoría' });

            res.json(productos);

        } catch (err){
            res.status(500).json({ error: err.message });
        }
    },


    obtenerPorAroma: async(req, res) => {
        try {
            const productos = await ProductosModel.obtenerPorAroma(req.params.aroma);
            //Comprobar que existen productos en ese aroma
            if (!productos.length) return res.status(404).json({ error: 'No se encontraron productos con este aroma' });

            res.json(productos);

        } catch (err){
            res.status(500).json({ error: err.message });
        }
    },


    obtenerPorColor: async(req, res) => {
        try {
            const productos = await ProductosModel.obtenerPorColor(req.params.color);
            //Comprobar que existen productos en ese color
            if (!productos.length) return res.status(404).json({ error: 'No se encontraron productos con este color' });

            res.json(productos);

        } catch (err){
            res.status(500).json({ error: err.message });
        }
    },


    crearProducto: async(req, res) => {
        const client = await db.connect();
        
        try {
            const { nombre, descripcion, precio, stock, imagen, categoria, aromas, colores} = req.body;
            await client.query('BEGIN');

            //Crear producto
            const producto = await ProductosModel.agregarProducto(client, nombre, descripcion, precio, stock, imagen, categoria);

            //Insertar aromas en tabla aromas_producto
            if (aromas && aromas.length) {
                for (const idAroma of aromas){
                    await ProductosModel.agregarAromaProducto(client, producto.id, idAroma);
                }
            }

            //Insertar colores en tabla colores_producto
            if (colores && colores.length) {
                for (const idColor of colores){
                    await ProductosModel.agregarColorProducto(client, producto.id, idColor);
                }
            }

            await client.query('COMMIT');
            res.status(201).json(producto);

        } catch ( err ) {
            await client.query('ROLLBACK');
            res.status(500).json({ error: err.message});

        } finally {
            client.release();
        }
    },


    modificarProducto: async(req, res) => {
        const client = await db.connect();

        try {
            const { nombre, descripcion, precio, stock, oferta, precio_oferta, imagen, categoria, aromas, colores} = req.body;
            const { id } = req.params;

            await client.query('BEGIN');

            //Modificar producto
            const producto = await ProductosModel.modificarProducto(client, id, nombre, descripcion, precio, stock, oferta, precio_oferta, imagen, categoria);

            if (!producto) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            //Eliminar aromas antiguos y agregar los nuevos
            if (aromas !== undefined) {
                await ProductosModel.eliminarAromaProducto(client, id);
                for (const idAroma of aromas){
                    await ProductosModel.agregarAromaProducto(client, id, idAroma);
                }
            }

            //Eliminar colores antiguos y agregar los nuevos
            if (colores !== undefined) {
                await ProductosModel.eliminarColorProducto(client, id);
                for (const idColor of colores){
                    await ProductosModel.agregarColorProducto(client, id, idColor);
                }
            }

            await client.query('COMMIT');
            res.json(producto);

        } catch ( err ) {
            await client.query('ROLLBACK');
            res.status(500).json({ error: err.message});
        
        } finally {
            client.release();
        }
    },


    eliminarProducto: async(req, res) => {
        try {
            const producto = await ProductosModel.eliminarProducto(req.params.id);

            //Comprobar que el producto existe
            if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

            res.json({ message: 'Producto eliminado correctamente' });

        } catch (err){
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = ProductosController;