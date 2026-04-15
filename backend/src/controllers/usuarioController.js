//Imports
const UsuarioModel = require('../models/usuarioModel');

const UsuarioController = {

    //Obtener todos los usuarios (GET /api/usuario) - Solo para admin
    listarUsuarios: async(req, res) => {
        try {
            const usuarios = await UsuarioModel.listarUsuarios();
            res.json(usuarios);
        
        } catch (err){
            res.status(500).json({ error: err.message });
        }
    },


    //Modificar el tipo de usuario (PUT api/usuario/:id) - Solo para admin
    //Cambia el tipo de usuario de Usuario a Administrador o de Administrador a Usuario
    cambiarTipoUsuario: async(req, res) => {
        try{
            const { id } = req.params;
            const { tipo } = req.body;
            let usuario = null;

            if(tipo === 1){
                usuario = await UsuarioModel.modificarTipoUsuario(id, 2);
                if(!usuario){
                    return res.status(404).json({ error: 'Usuario no encontrado'})
             }
            }

            if(tipo === 2){
                usuario = await UsuarioModel.modificarTipoUsuario(id, 1);
                if(!usuario){
                    return res.status(404).json({ error: 'Usuario no encontrado'})
                }
            }

            res.json(usuario);

        } catch ( err ){
            res.status(500).json({ error: err.message });
        }
    },


    //Eliminar usuario (DELETE /api/usuario/:id) - Solo para admin
    //Si se quiere eliminar un administrador pero solo hay un unico adminiestrado no te va a dejar eliminarlo
    eliminarUsuario: async(req, res) => {
        try{

            const { id } = req.params;
            const { tipo } = req.body;
            
            if(tipo === 1){
                const admins = await UsuarioModel.cantidadAdmin();
                if(admins === 1){
                    return res.status(400).json({ error: "No se puede eliminar al administrador ya que solo queda un unico administrador" });
                }
            }

            const usuario = await UsuarioModel.eliminarUsuario(id);

            // Invalidar el token si lo mandan en el header
            const token = req.headers.authorization?.split(' ')[1];
            if(token) await UsuarioModel.invalidarToken(token);

            res.json({ message: 'Usuario eliminado correctamente' });

        } catch (err){
            res.status(500).json({ error: err.message})
        }
    }

};

module.exports = UsuarioController;