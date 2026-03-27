const express = require('express');
const router  = express.Router();
const db      = require('../db');
const auth = require('../middleware/optionalAuth');

//Obtener todos los productos (para vista previa de productos en catalogo, sin color ni aroma)
// GET /api/productos
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.oferta, p.precio_oferta, p.imagen,
       c.id AS categoria_id, c.nombre_categoria AS categoria_nombre
       FROM producto p
       JOIN categoria c ON c.id = p.categoria`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Obtener producto por categoria (obtener datos para vista previa, sin colores ni aromas)
// GET /api/productos/categoria/:id
router.get('/categoria/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.oferta, p.precio_oferta, p.imagen,
       c.id AS categoria_id, c.nombre_categoria AS categoria_nombre
       FROM producto p
       JOIN categoria c ON c.id = p.categoria 
       WHERE p.categoria = $1`
      , [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Categoria no encontrada' });
    res.json(rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Obtener producto por aroma (obtener datos para vista previa, sin colores ni aromas)
// GET /api/productos/aroma/:id
router.get('/aroma/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.oferta, p.precio_oferta, p.imagen,
       c.id AS categoria_id, c.nombre_categoria AS categoria_nombre
       FROM producto p
       JOIN categoria c ON c.id = p.categoria 
       LEFT JOIN producto_color pc ON pc.id_producto = p.id 
       LEFT JOIN color col ON col.id = pc.id_color 
       WHERE p.id IN (SELECT id_producto FROM producto_color WHERE id_color = $1)`
      , [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Color no encontrado' });
    res.json(rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Obtener producto por colores (obtener datos para vista previa, sin colores ni aromas)
// GET /api/productos/color/:id
router.get('/color/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.oferta, p.precio_oferta, p.imagen,
       c.id AS categoria_id, c.nombre_categoria AS categoria_nombre
       FROM producto p
       JOIN categoria c ON c.id = p.categoria 
       LEFT JOIN producto_aroma pa ON pa.id_producto = p.id 
       LEFT JOIN aroma a ON a.id = pa.id_aroma 
       WHERE p.id IN (SELECT id_producto FROM producto_aroma WHERE id_aroma = $1)`
      , [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Aroma no encontrado' });
    res.json(rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Obtener producto por id (obtener todos los datos del producto)
// GET /api/productos/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock, p.oferta, p.precio_oferta, p.imagen,
       c.id AS categoria_id, c.nombre_categoria AS categoria_nombre,
       COALESCE(JSON_AGG(
          DISTINCT JSONB_BUILD_OBJECT('id', a.id, 'nombre', a.nombre_aroma)) 
          FILTER (WHERE a.id IS NOT NULL), '[]') 
          AS aromas,
       COALESCE(JSON_AGG(
          DISTINCT JSONB_BUILD_OBJECT('id', col.id, 'nombre', col.nombre_color))
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
      , [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Insertar producto (solo para admin)
// POST /api/productos
router.post('/', auth, async (req, res) => {
  const client = await db.connect();
  try {
    const { nombre, descripcion, precio, stock, imagen, categoria, aromas, colores} = req.body;

    await client.query('BEGIN');

    // Insertar producto
    const { rows } = await client.query(
      `INSERT INTO producto (nombre, descripcion, precio, stock, oferta, precio_oferta, imagen, categoria)
       VALUES ($1, $2, $3, $4, 0, $3, $5, $6) RETURNING *`,
      [nombre, descripcion, precio, stock, imagen ?? null, categoria]
    );

    const producto = rows[0];
    // Insertar aromas
    if (aromas && aromas.length) {
      for (const idAroma of aromas) {
        await client.query(
          `INSERT INTO producto_aroma (id_producto, id_aroma) VALUES ($1, $2)`,
          [producto.id, idAroma]
        );
      }
    }
    // Insertar colores
    if (colores && colores.length) {
      for (const idColor of colores) {
        await client.query(
          `INSERT INTO producto_color (id_producto, id_color) VALUES ($1, $2)`,
          [producto.id, idColor]
        );
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
});

//Modificar producto (solo para admin)
// PUT /api/productos/:id
router.put('/:id', auth, async (req, res) => {
  const client = await db.connect();
  try {
    const { nombre, descripcion, precio, stock, oferta, precio_oferta, imagen, categoria, aromas, colores} = req.body; 
    const { id } = req.params;

    await client.query('BEGIN');

    // Actualizar datos del producto
    const { rows } = await client.query(
      `UPDATE producto SET
       nombre = $1, descripcion = $2, precio = $3, stock = $4, oferta = $5, precio_oferta = $6, imagen = $7, categoria = $8
       WHERE id = $9
       RETURNING *`,
      [nombre, descripcion, precio, stock, oferta, precio_oferta, imagen ?? null, categoria, id]
    );

    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Actualizar aromas solo si vienen en el body
    if (aromas !== undefined) {
      //Borrar los aromas viejos
      await client.query(
        'DELETE FROM producto_aroma WHERE id_producto = $1',
        [id]
      );
      //Insertar los aromas nuevos
      for (const idAroma of aromas) {
        await client.query(
          `INSERT INTO producto_aroma (id_producto, id_aroma) VALUES ($1, $2)`,
          [id, idAroma]
        );
      }
    }

    // Actualizar colores solo si vienen en el body
    if (colores !== undefined) {
      //Borrar los colores viejos
      await client.query(
        'DELETE FROM producto_color WHERE id_producto = $1',
        [id]
      );  
      //Insertar los colores nuevos
      for (const idColor of colores) {
        await client.query(
          `INSERT INTO producto_color (id_producto, id_color) VALUES ($1, $2)`,
          [id, idColor]
        );
      }

      await client.query('COMMIT');
      res.json(rows[0]);
    }

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });

  } finally {
    client.release();
  }

});

//Eliminar producto (solo para admin)
// DELETE /api/productos/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    //aromas y colores se borran automáticamente por ON DELETE CASCADE
    const { rows } = await db.query(
      `DELETE FROM producto WHERE id = $1 RETURNING id`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto eliminado correctamente' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
