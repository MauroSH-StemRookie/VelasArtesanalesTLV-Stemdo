//Imports
const jwt = requiere('jsonwebtoken');


module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Eliminar <token> de la cabecera y quedarnos con el token"

  //Comprobar que existe el token
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  //Verificacion del token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // accesible en todas las rutas como req.user.id
    next();
  } catch {
    res.status(403).json({ error: 'Token inválido o expirado' });
  }
};