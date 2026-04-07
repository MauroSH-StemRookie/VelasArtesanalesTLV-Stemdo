//Imports
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Si no hay token, no esta logueado, es invitado
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // si es válido, tendrás usuario
  } catch (err) {
    // Si el token es inválido pero la auth es opcional,
    // NO devuelves error, sigues como invitado
  }

  next();
};