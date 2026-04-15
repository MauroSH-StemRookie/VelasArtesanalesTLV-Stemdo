//Imports
const jwt = require('jsonwebtoken');
const db = require('../db');

module.exports = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Eliminar <token> de la cabecera y quedarnos con el token"

  //Comprobar si existe el token
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  try{
    console.log('TOKEN HEADER:', token);
    //Comprobar que el token no este invalidado
    const { rows } = await db.query(
      `SELECT token FROM tokens_invalidados WHERE token = $1`,
      [token]
    );

    if (rows.length > 0) {
      return res.status(401).json({ error: 'Sesión cerrada' });
    }

    //Verificacion del token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // accesible en todas las rutas como req.user.id
    next();

  } catch {
    res.status(403).json({ error: 'Token inválido o expirado' });
  }
};