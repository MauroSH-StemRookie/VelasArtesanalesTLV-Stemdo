//Imports
const ColorModel = require('../models/colorModel');

const ColorController = {

    //Obtener todos los colores (GET /api/color)
    obtenerTodo: async (req, res) => {
        try {
            const colores = await ColorModel.obtenerTodo();
            res.json(colores);
        
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },


    //Crear nuevo color (POST /api/color) - Solo para admin
    crearColor: async (req, res) => {
        try {
            const { nombre_color } = req.body;

            //Verificar que el campo esta relleno
            if (!nombre_color) {
                return res.status(400).json({ error: 'No has introducido ningun nombre para el nuevo color' });
            }

            const color = await ColorModel.agregarColor(nombre_color);
            res.status(201).json(color);
        
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },


    //Modificar un color (PUT /api/color/:id) - Solo para admin
    modificarColor: async (req, res) => {
        try {
            const { nombre_color } = req.body;
            const color = await ColorModel.modificarColor(req.params.id, nombre_color);

            //Comprobar que el color existe
            if (!color) {
                return res.status(404).json({ error: 'Color no encontrado' });
            }
            res.json(color);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },


    //Eliminar un color (DELETE /api/color/:id) - Solo para admin
    eliminarColor: async (req, res) => {
        try {
            const color = await ColorModel.eliminarColor(req.params.id);
            
            //Comprobar que el color existe 
            if (!color) {
                return res.status(404).json({ error: 'Color no encontrado' });
            }
            res.json({ message: 'Color eliminado correctamente' });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = ColorController;