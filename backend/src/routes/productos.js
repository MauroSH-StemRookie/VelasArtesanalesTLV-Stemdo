const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/productos
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM productos ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/productos/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM productos WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
