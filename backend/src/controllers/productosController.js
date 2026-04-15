const db = require('../db');
const ProductosModel = require('../models/productosModel');

const ProductosController = {

    // ─── OBTENER TODOS LOS PRODUCTOS ───────────────────────────
    obtenerTodo: async(req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 15;
            const sort = req.query.sort || "nuevos"

            //Como se van a ordenar (por precio, novedad, oferta, etc)
            let orderBy = 'ORDER BY id DESC';
            if (sort === 'oferta') {
                orderBy = 'ORDER BY oferta DESC, p.precio_oferta ASC';
            } else if (sort === 'precio_asc') {
                orderBy = 'ORDER BY precio_oferta ASC';
            } else if (sort === 'precio_desc') {
                orderBy = 'ORDER BY precio_oferta DESC';
            }

            //Calcular cuantos productos debe saltarse por cada pagina
            const offset = (page -1) * limit;

            const productos = await ProductosModel.obtenerTodo(limit, offset, orderBy);

            for (const producto of productos) {
                const imagen = await ProductosModel.obtenerImagenIdProducto(producto.id, 0);
                producto.imagen_id = imagen ? imagen.id : null;
            }

            res.json(productos);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // ─── OBTENER UN PRODUCTO POR ID ────────────────────────────
    obtenerPorId: async(req, res) => {
        try {
            const producto = await ProductosModel.obtenerPorId(req.params.id);

            if (!producto) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            producto.imagenes = await ProductosModel.obtenerImagenesIdProducto(producto.id);

            res.json(producto);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // ─── OBTENER PRODUCTOS POR CATEGORIA ───────────────────────
    obtenerPorCategoria: async(req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 15;
            const sort = req.query.sort || "nuevos"

            //Como se van a ordenar (por precio, novedad, oferta, etc)
            let orderBy = 'ORDER BY p.id DESC';
            if (sort === 'oferta') {
                orderBy = 'ORDER BY p.oferta DESC, p.precio_oferta ASC';
            } else if (sort === 'precio_asc') {
                orderBy = 'ORDER BY p.precio_oferta ASC';
            } else if (sort === 'precio_desc') {
                orderBy = 'ORDER BY p.precio_oferta DESC';
            }

            //Calcular cuantos productos debe saltarse por cada pagina
            const offset = (page -1) * limit;

            const productos = await ProductosModel.obtenerPorCategoria(req.params.categoria, limit, offset, orderBy);

            if (!productos.length) {
                return res.status(404).json({ error: 'No se encontraron productos en esta categoría' });
            }

            for (const producto of productos) {
                const imagen = await ProductosModel.obtenerImagenIdProducto(producto.id, 0);
                producto.imagen_id = imagen ? imagen.id : null;
            }

            res.json(productos);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // ─── OBTENER PRODUCTOS POR AROMA ───────────────────────────
    obtenerPorAroma: async(req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 15;
            const sort = req.query.sort || "nuevos"

            //Como se van a ordenar (por precio, novedad, oferta, etc)
            let orderBy = 'ORDER BY p.id DESC';
            if (sort === 'oferta') {
                orderBy = 'ORDER BY p.oferta DESC, p.precio_oferta ASC';
            } else if (sort === 'precio_asc') {
                orderBy = 'ORDER BY p.precio_oferta ASC';
            } else if (sort === 'precio_desc') {
                orderBy = 'ORDER BY p.precio_oferta DESC';
            }

            //Calcular cuantos productos debe saltarse por cada pagina
            const offset = (page -1) * limit;

            const productos = await ProductosModel.obtenerPorAroma(req.params.aroma, limit, offset, orderBy);

            if (!productos.length) {
                return res.status(404).json({ error: 'No se encontraron productos con este aroma' });
            }

            for (const producto of productos) {
                const imagen = await ProductosModel.obtenerImagenIdProducto(producto.id, 0);
                producto.imagen_id = imagen ? imagen.id : null;
            }

            res.json(productos);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // ─── OBTENER PRODUCTO POR COLOR ───────────────────────────
    obtenerPorColor: async(req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 15;
            const sort = req.query.sort || "nuevos"

            //Como se van a ordenar (por precio, novedad, oferta, etc)
            let orderBy = 'ORDER BY p.id DESC';
            if (sort === 'oferta') {
                orderBy = 'ORDER BY p.oferta DESC, p.precio_oferta ASC';
            } else if (sort === 'precio_asc') {
                orderBy = 'ORDER BY p.precio_oferta ASC';
            } else if (sort === 'precio_desc') {
                orderBy = 'ORDER BY p.precio_oferta DESC';
            }

            //Calcular cuantos productos debe saltarse por cada pagina
            const offset = (page -1) * limit;

            const productos = await ProductosModel.obtenerPorColor(req.params.color, limit, offset, orderBy);

            if (!productos.length) {
                return res.status(404).json({ error: 'No se encontraron productos con este color' });
            }

            for (const producto of productos) {
                const imagen = await ProductosModel.obtenerImagenIdProducto(producto.id, 0);
                producto.imagen_id = imagen ? imagen.id : null;
            }

            res.json(productos);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // ─── CREAR PRODUCTO ─────────────────────────────────────
    crearProducto: async(req, res) => {
        const client = await db.connect();

        try {
            const { nombre, descripcion, precio, stock, categoria, aromas, colores } = req.body;
            await client.query('BEGIN');

            const producto = await ProductosModel.agregarProducto( client, nombre, descripcion, precio, stock, categoria );

            if (aromas && aromas.length) {
                for (const idAroma of [].concat(aromas)) {
                    await ProductosModel.agregarAromaProducto(client, producto.id, idAroma);
                }
            }

            if (colores && colores.length) {
                for (const idColor of [].concat(colores)) {
                    await ProductosModel.agregarColorProducto(client, producto.id, idColor);
                }
            }

            if (req.files && req.files.length > 0) {
                for (const [index, file] of req.files.entries()) {
                    await ProductosModel.agregarImagenProducto( client, producto.id, file.buffer, file.mimetype, index );
                }
            }

            await client.query('COMMIT');
            res.status(201).json(producto);

        } catch (err) {
            await client.query('ROLLBACK');
            res.status(500).json({ error: err.message });

        } finally {
            client.release();
        }
    },

    // ─── MODIFICAR PRODUCTO ─────────────────────────────────
    modificarProducto: async(req, res) => {
        const client = await db.connect();

        try {
            const { nombre, descripcion, precio, stock, oferta, precio_oferta, categoria, aromas, colores } = req.body;
            const { id } = req.params;

            await client.query('BEGIN');

            const producto = await ProductosModel.modificarProducto( client, id, nombre, descripcion, precio, stock, oferta, precio_oferta, categoria );

            //Comprobar que se ha modificado correctamente
            if (!producto) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            //GESTION DE AROMAS
            if (aromas !== undefined) {
                await ProductosModel.eliminarAromaProducto(client, id);
                for (const idAroma of [].concat(aromas)) {
                    await ProductosModel.agregarAromaProducto(client, id, idAroma);
                }
            }

            //GESTION DE COLORES
            if (colores !== undefined) {
                await ProductosModel.eliminarColorProducto(client, id);
                for (const idColor of [].concat(colores)) {
                    await ProductosModel.agregarColorProducto(client, id, idColor);
                }
            }

            //GESTION DE IMAGENES
            const imagenesConfig = req.body.imagenesConfig
                ? JSON.parse(req.body.imagenesConfig)
                : null;

            if (imagenesConfig) {
                const imagenesActuales = await ProductosModel.obtenerIdsImagenesProducto(client, id);
                const idsActuales = imagenesActuales.map(img => img.id);

                const idsConservar = imagenesConfig
                    .filter(img => img.tipo === 'existente')
                    .map(img => Number(img.id));

                for (const idImagen of idsActuales) {
                    if (!idsConservar.includes(idImagen)) {
                        await ProductosModel.eliminarImagenProductoPorId(client, id, idImagen);
                    }
                }

                for (const img of imagenesConfig) {
                    if (img.tipo === 'existente') {
                        await ProductosModel.actualizarOrdenImagenProducto(
                            client,
                            id,
                            Number(img.id),
                            Number(img.orden)
                        );
                    }
                }

                const nuevasConfig = imagenesConfig.filter(img => img.tipo === 'nueva');

                if (req.files && req.files.length > 0) {
                    for (const [index, file] of req.files.entries()) {
                        const configNueva = nuevasConfig[index];

                        if (!configNueva) {
                            throw new Error('Falta configuración para una imagen nueva');
                        }

                        await ProductosModel.agregarImagenProducto(
                            client,
                            id,
                            file.buffer,
                            file.mimetype,
                            Number(configNueva.orden)
                        );
                    }
                }
            }

            await client.query('COMMIT');
            res.json(producto);

        } catch (err) {
            await client.query('ROLLBACK');
            res.status(500).json({ error: err.message });

        } finally {
            client.release();
        }
    },

    // ─── ELIMINAR PRODUCTO ────────────────────────────────────
    eliminarProducto: async(req, res) => {
        try {
            const producto = await ProductosModel.eliminarProducto(req.params.id);

            if (!producto) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            res.json({ message: 'Producto eliminado correctamente' });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // ─── OBTENER IMAGEN POR ID ─────────────────────────────────
    obtenerImagen: async(req, res) => {
        try {
            const { imagenId } = req.params;
            const img = await ProductosModel.obtenerImagenIdImagen(imagenId);

            if (!img) {
                return res.status(404).json({ error: 'Imagen no encontrada' });
            }

            res.setHeader('Content-Type', img.imagen_mime);
            res.setHeader('Cache-Control', 'public, max-age=7200');
            res.send(img.imagen);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = ProductosController;