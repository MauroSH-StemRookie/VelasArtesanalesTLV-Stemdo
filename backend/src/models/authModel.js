//Imports
const db = require('../db');

const AuthModel = {
    //Buscar usuario por correo (para login)(y para comprobar que el correo no esta registrado) 
    findByCorreo: async (correo) => {

        const { rows } = await db.query(
            `SELECT id, password, (persona).nombre, (persona).correo, tipo
             FROM usuario WHERE (persona).correo = $1`,
            [correo]
        );
        return rows[0];
    },

    //Crear nuevo usuario (registro)
    create: async ({ nombre, calle, numero, cp, ciudad, provincia, piso, correo, telefono, hash }) => {
        const { rows } = await db.query(
            `INSERT INTO usuario (persona, password, tipo)
             VALUES (
                ROW($1, ROW($2, $3, $4, $5, $6, $7)::direccion, $8, $9)::persona, $10, 2) 
             RETURNING id, (persona).nombre, (persona).correo`,
            [nombre, calle, numero, cp, ciudad, provincia, piso, correo, telefono, hash]   
        );
        return rows[0];
    },


    // -- METODOS DE CAMBIO DE CONTRASEÑA MEDIANTE CODIGO DE SEGURIDAD ------------

    // Buscar usuario por correo (para recuperación)
    findByCorreoRecuperacion: async (correo) => {
        const { rows } = await db.query(
            `SELECT id, (persona).nombre, (persona).correo
             FROM usuario WHERE (persona).correo = $1`,
            [correo]
        );
        return rows[0];
    },

    // Guardar código (borra los anteriores del mismo usuario primero)
    guardarCodigoRecuperacion: async (idUsuario, codigo, expiraEn) => {
        await db.query(
            `DELETE FROM cambiar_password WHERE id_usuario = $1`,
            [idUsuario]
        );
        await db.query(
            `INSERT INTO cambiar_password (id_usuario, codigo, expira_en)
             VALUES ($1, $2, $3)`,
            [idUsuario, codigo, expiraEn]
        );
    },

    // Buscar código válido (no usado y no expirado)
    obtenerCodigoValido: async (correo, codigo) => {
        const { rows } = await db.query(
            `SELECT cp.* FROM cambiar_password cp
             JOIN usuario u ON cp.id_usuario = u.id
             WHERE (u.persona).correo = $1
               AND cp.codigo = $2
               AND cp.usado = false
               AND cp.expira_en > NOW()`,
            [correo, codigo]
        );
        return rows[0];
    },

    // Marcar código como usado
    marcarCodigoUsado: async (id) => {
        await db.query(
            `UPDATE cambiar_password SET usado = true WHERE id = $1`,
            [id]
        );
    }

};

module.exports = AuthModel;