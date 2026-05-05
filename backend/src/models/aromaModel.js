//Imports
const db = require('../db');

const AromaModel = {

    //Obtener todas las aromas
    obtenerTodo: async() => {
        const { rows } = await db.query(
            `SELECT * FROM aroma`
        );
        return rows;
    },

    //Agregar nuevo aroma (solo para admin)
    agregarAroma : async(nombre_aroma) => {
        const { rows } = await db.query(
            `INSERT INTO aroma (nombre_aroma) VALUES ($1) RETURNING *`,
            [nombre_aroma]
        );
        return rows[0];
    },

    //Modificar un aroma (solo para admin)
    modificarAroma : async(id, nombre_aroma) => {
        const { rows } = await db.query(
            `UPDATE aroma SET nombre_aroma = $1 WHERE id = $2 RETURNING *`,
            [nombre_aroma, id]
        );
        return rows[0];
    },

    //Eliminar un aroma (solo para admin)
    eliminarAroma : async(id) => {
        const { rows } = await db.query(
            `DELETE FROM aroma WHERE id = $1 RETURNING *`,
            [id]
        );
        return rows[0];
    }

};


module.exports = AromaModel;