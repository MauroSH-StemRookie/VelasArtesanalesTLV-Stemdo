//Imports
const db = require("../db");

const UsuarioModel = {

    // ----- OPCIONES DE USUARIO (PERSONAL) -----------------------------------

    //Obtener los datos de un usuario
    obtenerPerfilUsuario: async (id) => {
        const { rows } = await db.query(
            `SELECT id, (persona).nombre, (persona).correo, (persona).telefono, ((persona).direccion).calle, ((persona).direccion).numero, 
             ((persona).direccion).cp, ((persona).direccion).ciudad, ((persona).direccion).provincia, ((persona).direccion).piso
             FROM usuario WHERE id = $1`,
            [id]
        );
        return rows[0];
    },

    //Obtener Usuario con Password 
    obtenerUsuarioConPassword: async (id) => {
        const { rows } = await db.query(
            `SELECT id, password, tipo
             FROM usuario
             WHERE id = $1`,
            [id]
        );
        return rows[0];
    },

    //Modificar perfil(todos los datos excepto correo, contrase, id, tipo)
    modificarPerfil: async (id, nombre, telefono, calle, numero, cp, ciudad, provincia, piso) =>{
        const { rows } = await db.query(
                   `UPDATE usuario SET
                    persona = ROW($1, ROW($3, $4, $5, $6, $7, $8)::direccion, (persona).correo, $2)::persona
                    WHERE id = $9
                    RETURNING id, (persona).nombre, (persona).telefono, (persona).correo, ((persona).direccion).calle, ((persona).direccion).numero, 
                    ((persona).direccion).cp, ((persona).direccion).ciudad, ((persona).direccion).provincia, ((persona).direccion).piso`,
            [nombre, telefono, calle, numero, cp, ciudad, provincia, piso, id]
        );
        return rows[0];
    },

    //Modificar la password del usuario, requiere la actual
    cambiarPassword: async (id, passwordHash) =>{
        const { rows } = await db.query(
            `UPDATE usuario SET 
             password = $1 WHERE id = $2
             RETURNING id`,
            [passwordHash, id]
        );
        return rows[0];
    },


    //Eliminar usuario (a si mismo)
    eliminarMiCuenta: async (id) =>{
      const { rows } = await db.query(
        `DELETE FROM usuario WHERE id = $1`,
        [id]
        );
        return rows[0];
    },


    // ----- OPCIONES DE ADMINISTRADOR ----------------------------------------

    //Mostrar todos los usuarios (solo admin)
    listarUsuarios: async() => {
        const { rows } = await db.query(
            `SELECT id, (persona).nombre, (persona).correo, tipo FROM usuario`
        );
        return rows;
    },

    //Obtener cantidad de usuarios administradores
    cantidadAdmin: async() => {
        const { rows } = await db.query(
            `SELECT COUNT(id) FROM usuario WHERE tipo = 1`
        );
        return parseInt(rows[0].count);
    },

    //Modificar tipo de usuario
    modificarTipoUsuario: async(id, tipo) => {
        const { rows } = await db.query(
            `UPDATE usuario SET tipo = $1 WHERE id = $2
             RETURNING id, (persona).nombre, (persona).correo, tipo`,
            [tipo, id]
        );
        return rows[0];
    },

    //Eliminar Usuario
    eliminarUsuario: async(id) => {
        const { rows } = await db.query(
            `DELETE FROM usuario WHERE id = $1`,
            [id]
        );
        return rows[0]
    },


    //Invalidar Token
    invalidarToken: async(token) => {
        await db.query(
            `INSERT INTO tokens_invalidados (token) VALUES ($1) ON CONFLICT DO NOTHING`,
            [token]
        );
    }


};

module.exports = UsuarioModel;