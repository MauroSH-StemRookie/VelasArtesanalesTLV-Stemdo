//Imports
const db = require("../db");

const UsuarioModel = {

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