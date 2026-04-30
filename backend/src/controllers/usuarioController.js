//Imports
const bcrypt = require("bcryptjs/dist/bcrypt");
const UsuarioModel = require("../models/usuarioModel");

const UsuarioController = {
  // ----- OPCIONES DE USUARIO (PERSONAL) -----------------------------------

  //Obtener todos los datos del usuario (Menos ps, tipo e id)
  obtenerInformacionUsuario: async (req, res) => {
    try {
      const idUsuario = req.user.id;
      const usuario = await UsuarioModel.obtenerPerfilUsuario(idUsuario);

      //Comprobar que el usuario existe
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.json(usuario);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  //Modificar perfil de usuario
  modificarMiPerfil: async (req, res) => {
    try {
      const idUsuario = req.user.id;
      const { nombre, telefono, calle, numero, cp, ciudad, provincia, piso } =
        req.body;

      //console.log({ idUsuario, nombre, telefono, calle, numero, cp, ciudad, provincia, piso });
      //Modificar perfil de usuario
      const usuarioActualizado = await UsuarioModel.modificarPerfil(
        idUsuario,
        nombre,
        telefono,
        calle,
        numero,
        cp,
        ciudad,
        provincia,
        piso,
      );

      //Comprobar que el usuario existe
      if (!usuarioActualizado) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.json(usuarioActualizado);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  //Modificar password
  modificarPasswordUsuario: async (req, res) => {
    try {
      const idUsuario = req.user.id;
      const { passwordActual, passwordNueva } = req.body;

      //Comprobar que los campos no vengan vacio
      if (!passwordActual || !passwordNueva) {
        return res.status(400).json({ error: `Los campos son obligatorios` });
      }

      //Comprobar que el usuario existe
      const usuario = await UsuarioModel.obtenerUsuarioConPassword(idUsuario);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      //Comprobar que la password sea correcta
      const passwordCorrecta = await bcrypt.compare(
        passwordActual,
        usuario.password,
      );
      if (!passwordCorrecta) {
        return res
          .status(401)
          .json({ error: "La contraseña actual no es correcta" });
      }

      //Cambio de password
      const nuevoHash = await bcrypt.hash(passwordNueva, 10);
      await UsuarioModel.cambiarPassword(idUsuario, nuevoHash);

      res.json({ mensaje: "Contraseña actualizada correctamente" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  //Eliminar cuenta de usuario (a si mismo)
  eliminarMiCuenta: async (req, res) => {
    try {
      const idUsuario = req.user.id;
      const { password } = req.body;

      //Comprobar que los campos no vengan vacios
      if (!password) {
        return res
          .status(400)
          .json({
            error: "La contraseña es obligatoria para eliminar la cuenta",
          });
      }

      //Comprobar que el usuario existe
      const usuario = await UsuarioModel.obtenerUsuarioConPassword(idUsuario);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      //Comprobar que la password sea correcta
      const passwordCorrecta = await bcrypt.compare(password, usuario.password);
      if (!passwordCorrecta) {
        return res.status(401).json({ error: "La contraseña no es correcta" });
      }

      //Comprobar de que si el usuario es admin y es el ultimo no se elimine la cuenta para que la pagina se quede sin administrador
      if (Number(usuario.tipo) === 1) {
        const admins = await UsuarioModel.cantidadAdmin();
        if (admins === 1) {
          return res
            .status(400)
            .json({
              error:
                "No se puede eliminar al administrador ya que solo queda un unico administrador",
            });
        }
      }

      //Eliminar usuario
      await UsuarioModel.eliminarMiCuenta(idUsuario);

      res.json({ mensaje: "Cuenta eliminada correctamente" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ----- OPCIONES DE ADMINISTRADOR ----------------------------------------

  //Obtener todos los usuarios (GET /api/usuario) - Solo para admin
  //Acepta paginacion via query params: ?page=1&limit=15
  listarUsuarios: async (req, res) => {
    try {
      //Defaults: page=1, limit=15. Si llegan negativos o invalidos los normalizamos.
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.max(1, parseInt(req.query.limit) || 15);
      const offset = (page - 1) * limit;

      const usuarios = await UsuarioModel.listarUsuarios(limit, offset);
      res.json(usuarios);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  /* Obtener el perfil completo de un usuario por id (GET /api/usuario/:id)
       Solo admin. Se usa desde el panel para ver los datos de un cliente
       que ha hecho un pedido personalizado cuando queremos contactar con el
       y necesitamos su direccion o telefono, mas alla de lo que viene en el
       propio pedido. */
  obtenerUsuarioPorIdAdmin: async (req, res) => {
    try {
      const { id } = req.params;
      const usuario = await UsuarioModel.obtenerPerfilUsuarioAdmin(id);

      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.json(usuario);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  //Modificar el tipo de usuario (PUT api/usuario/:id) - Solo para admin
  //Cambia el tipo de usuario de Usuario a Administrador o de Administrador a Usuario
  cambiarTipoUsuario: async (req, res) => {
    try {
      const { id } = req.params;
      const { tipo } = req.body;
      let usuario = null;

      if (tipo === 1) {
        usuario = await UsuarioModel.modificarTipoUsuario(id, 2);
        if (!usuario) {
          return res.status(404).json({ error: "Usuario no encontrado" });
        }
      }

      if (tipo === 2) {
        usuario = await UsuarioModel.modificarTipoUsuario(id, 1);
        if (!usuario) {
          return res.status(404).json({ error: "Usuario no encontrado" });
        }
      }

      res.json(usuario);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  //Eliminar usuario (DELETE /api/usuario/:id) - Solo para admin
  //Si se quiere eliminar un administrador pero solo hay un unico adminiestrado no te va a dejar eliminarlo
  eliminarUsuario: async (req, res) => {
    try {
      const { id } = req.params;
      const { tipo } = req.body;

      if (tipo === 1) {
        const admins = await UsuarioModel.cantidadAdmin();
        if (admins === 1) {
          return res
            .status(400)
            .json({
              error:
                "No se puede eliminar al administrador ya que solo queda un unico administrador",
            });
        }
      }

      const usuario = await UsuarioModel.eliminarUsuario(id);

      // Invalidar el token si lo mandan en el header
      const token = req.headers.authorization?.split(" ")[1];
      if (token) await UsuarioModel.invalidarToken(token);

      res.json({ message: "Usuario eliminado correctamente" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = UsuarioController;
