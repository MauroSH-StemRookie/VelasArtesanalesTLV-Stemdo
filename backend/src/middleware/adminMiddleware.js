//Comprobacion de que el usuario tiene el rol de administrador (tipo = 1)
// para poder acceder a las rutas exclusivas para administradores (crear, editar, eliminar productos)

module.exports = (req, res, next) => {

    if (!req.user || !req.user.tipo !== 1){
        return res.status(403).json({ error: 'Acceso denegado, se requiere rol de administrador'});
    }

    next();

}