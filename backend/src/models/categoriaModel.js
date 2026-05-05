//Imports
const db = require('../db');

const CategoriaModel = {

    //Obtener todas las categorias
    obtenerTodo: async() => {
        const { rows } = await db.query(
            `SELECT * FROM categoria`
        );
        return rows;
    },

    //Agregar nueva categoria (solo para admin)
    agregarCategoria : async(nombre_categoria) => {
        const { rows } = await db.query(
            `INSERT INTO categoria (nombre_categoria) VALUES ($1) RETURNING *`,
            [nombre_categoria]
        );
        return rows[0];
    },

    //Modificar una categoria (solo para admin)
    modificarCategoria : async(id, nombre_categoria) => {
        const { rows } = await db.query(
            `UPDATE categoria SET nombre_categoria = $1 WHERE id = $2 RETURNING *`,
            [nombre_categoria, id]
        );
        return rows[0];
    },

    //Eliminar una categoria (solo para admin)
    eliminarCategoria : async(id) => {
        const { rows } = await db.query(
            `DELETE FROM categoria WHERE id = $1 AND id != 1 RETURNING *`,
            [id]
        );
        return rows[0];
    }

};


module.exports = CategoriaModel;