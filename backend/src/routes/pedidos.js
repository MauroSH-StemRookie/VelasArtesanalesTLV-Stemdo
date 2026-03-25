const express = require('express');
const router  = express.Router();

// GET /api/pedidos — placeholder
router.get('/', (req, res) => {
  res.json({ mensaje: 'Ruta de pedidos — en desarrollo' });
});

module.exports = router;
