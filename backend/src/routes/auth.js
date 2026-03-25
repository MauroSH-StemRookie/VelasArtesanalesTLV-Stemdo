const express = require('express');
const router  = express.Router();

// POST /api/auth/login — placeholder
router.post('/login', (req, res) => {
  res.json({ mensaje: 'Ruta de autenticación — en desarrollo' });
});

module.exports = router;
