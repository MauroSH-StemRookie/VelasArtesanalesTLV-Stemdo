//Imports
const db = requiere('../db');

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
    }
};

module.exports = AuthModel;