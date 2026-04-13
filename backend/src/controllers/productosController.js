const db = require('../db');
const ProductosModel = require('../models/productosModel');

const ProductosController = {

    // ─── OBTENER TODOS LOS PRODUCTOS ───────────────────────────
    obtenerTodo: async(req, res) => {
        try {
            const productos = await ProductosModel.obtenerTodo();
            
            //Obtener las imagenes
            for (const producto of productos){
                const imagen = await ProductosModel.obtenerImagenIdProducto(producto.id, 0);
                producto.imagen_id = imagen ? imagen.id : null;
            }

            res.json(productos);
            
        } catch (err){
            res.status(500).json({ error: err.message });
        }
    },


    // ─── OBTENER UN PRODUCTO POR ID ────────────────────────────
    obtenerPorId: async(req, res) => {
        try {
            const producto = await ProductosModel.obtenerPorId(req.params.id);
            //Comprobar que el producto existe
            if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

            //Obtener las imagenes
            producto.imagenes = await ProductosModel.obtenerImagenesIdProducto(producto.id);

            res.json(producto);

        } catch (err){
            res.status(500).json({ error: err.message });
        }
    },


    // ─── OBTENER PRODUCTOS POR CATEGORIA ───────────────────────
    obtenerPorCategoria: async(req, res) => {
        try {
            const productos = await ProductosModel.obtenerPorCategoria(req.params.categoria);
            //Comprobar que existen productos en esa categoria
            if (!productos.length) return res.status(404).json({ error: 'No se encontraron productos en esta categoría' });

            //Obtener las imagenes
            for (const producto of productos){
                const imagen = await ProductosModel.obtenerImagenIdProducto(producto.id, 0);
                producto.imagen_id = imagen ? imagen.id : null;
            }

            res.json(productos);

        } catch (err){
            res.status(500).json({ error: err.message });
        }
    },


    // ─── OBTENER PRODUCTOS POR AROMA ───────────────────────────
    obtenerPorAroma: async(req, res) => {
        try {
            const productos = await ProductosModel.obtenerPorAroma(req.params.aroma);
            //Comprobar que existen productos en ese aroma
            if (!productos.length) return res.status(404).json({ error: 'No se encontraron productos con este aroma' });

            //Obtener las imagenes
            for (const producto of productos){
                const imagen = await ProductosModel.obtenerImagenIdProducto(producto.id, 0);
                producto.imagen_id = imagen ? imagen.id : null;
            }

            res.json(productos);

        } catch (err){
            res.status(500).json({ error: err.message });
        }
    },


    // ─── OBTERNER PRODUCTO POR COLOR ───────────────────────────
    obtenerPorColor: async(req, res) => {
        try {
            const productos = await ProductosModel.obtenerPorColor(req.params.color);
            //Comprobar que existen productos en ese color
            if (!productos.length) return res.status(404).json({ error: 'No se encontraron productos con este color' });

            //Obtener las imagenes
            for (const producto of productos){
                const imagen = await ProductosModel.obtenerImagenIdProducto(producto.id, 0);
                producto.imagen_id = imagen ? imagen.id : null;
            }

            res.json(productos);

        } catch (err){
            res.status(500).json({ error: err.message });
        }
    },


    // ─── CREAR PRODUCTO ─────────────────────────────────────
    crearProducto: async(req, res) => {
        const client = await db.connect();
        
        try {
            const { nombre, descripcion, precio, stock, categoria, aromas, colores} = req.body;
            await client.query('BEGIN');

            //Crear producto
            const producto = await ProductosModel.agregarProducto(client, nombre, descripcion, precio, stock, categoria);

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

            //Insertamos imagenes en la tabla producto_imagen
            if(req.files && req.files.length > 0) {
                for (const [index, file] of req.files.entries()) {
                    await ProductosModel.agregarImagenProducto(client, producto.id, file.buffer, file.mimetype, index)
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


    // ─── MODIFICAR PRODUCTO ─────────────────────────────────
    modificarProducto: async(req, res) => {
        const client = await db.connect();

        try {
            const { nombre, descripcion, precio, stock, oferta, precio_oferta, categoria, aromas, colores} = req.body;
            const { id } = req.params;

            await client.query('BEGIN');

            //Modificar producto
            const producto = await ProductosModel.modificarProducto(client, id, nombre, descripcion, precio, stock, oferta, precio_oferta, categoria);

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

            // Gestión de imágenes
            // Se alamacenam los IDs de las imágenes existentes que el usuario NO eliminó
            // Si no se manda nada, se conservan todas las imágenes actuales
            const imagenesConservar = req.body.imagenesConservar ? [].concat(req.body.imagenesConservar).map(Number): null;
            // El "[].concat()" porque si solo hay 1 ID, FormData lo manda como string no como array

            if (imagenesConservar !== null) {
                // Borrar solo las imágenes que no están en imagenesConservar
                await ProductosModel.eliminarImagenesProducto(client, id, imagenesConservar);
            }

            // Insertar las imágenes nuevas si se enviaron
            if (req.files && req.files.length > 0) {
                // Calcular el siguiente orden para no pisar los existentes
                const ultimoOrden = await ProductosModel.obtenerUltimoOrden(id);
                for (const [index, file] of req.files.entries()) {
                    await ProductosModel.agregarImagenProducto(client, id, file.buffer, file.mimetype, ultimoOrden + 1 + index);
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


    // ─── ELIMINAR PRODUCTO ────────────────────────────────────
    eliminarProducto: async(req, res) => {
        try {
            const producto = await ProductosModel.eliminarProducto(req.params.id);

            //Comprobar que el producto existe
            if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

            res.json({ message: 'Producto eliminado correctamente' });

        } catch (err){
            res.status(500).json({ error: err.message });
        }
    },


    // ─── OBTENER IMAGEN POR ID ─────────────────────────────────
    obtenerImagen: async(req, res) => {
        try{
            const { imagenId } = req.params;
            
            const img = await ProductosModel.obtenerImagenIdImagen(imagenId);

            if (!img) return res.status(404).json({ error: 'Imagen no encontrada' });

            // Informar sobre que tipo de archivo es y almacenamiento en cache del navegador durante 2h
            res.setHeader('Content-Type', img.imagen_mime);
            res.setHeader('Cache-Control', 'public, max-age=7200');

            //Enviar binario, ya que el navegador lo interpreta como imagen debido al content-type
            res.send(img.imagen);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

};

module.exports = ProductosController;