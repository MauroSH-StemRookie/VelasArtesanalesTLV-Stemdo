//Imports
const db = require('../db');


const ColorModel = {

    //Obtener todos los colores
    obtenerTodo: async() => {
        const { rows } = await db.query(
            `SELECT * FROM color`
        );
        return rows;
    },


    //Agregar nuevo color (solo para admin)
    agregarColor: async(nombre_color) => {
        const { rows } = await db.query(
            `INSERT INTO color (color) VALUES ($1) RETURNING *`,
            [nombre_color]
        );
        return rows[0];
    },


    //Modificar un color (solo para admin)
    modificarColor: async(id, nombre_color) => {
        const { rows } = await db.query(
            `UPDATE color SET color = $1 WHERE id = $2 RETURNING *`,
            [nombre_color, id]
        );
        return rows[0];
    },


    //Eliminar un color (solo para admin)
    eliminarColor: async(id) => {
        const { rows } = await db.query(
            `DELETE FROM color WHERE id = $1 RETURNING *`,
            [id]
        );
        return rows[0];
    }

};

module.exports = ColorModel;