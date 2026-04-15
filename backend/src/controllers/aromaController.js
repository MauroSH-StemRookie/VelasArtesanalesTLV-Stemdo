//Imports
const aromaModel = require('../models/aromaModel');

const AromaController = {

    //Obtener todas las aromas (GET /api/aroma)
    obtenerTodo: async(req, res) => {
        try {
            const aromas = await aromaModel.obtenerTodo();
            res.json(aromas);

        } catch (err){
            res.status(500).json({ error: err.message });
        }
    },


    //Crear nuevo aroma (POST /api/aroma) - Solo para admin
    crearAroma: async(req, res) => {
        try{
            const {nombre_aroma} = req.body;

            //Verificar que el campo esta relleno
            if (!nombre_aroma) {
                return res.status(400).json({ error: 'No has introducido ningun nombre para el nuevo aroma' });
            }

            const aroma = await aromaModel.agregarAroma(nombre_aroma);
            res.status(201).json(aroma);

        } catch (err){
            res.status(500).json({ error: err.message });   
        }
    },


    //Modificar un aroma (PUT /api/aroma/:id) - Solo para admin
    modificarAroma: async(req, res) => {
        try{
            const { nombre_aroma } = req.body;
            const aroma = await aromaModel.modificarAroma(req.params.id, nombre_aroma);

            //Comprobar que el aroma existe
            if (!aroma) {
                return res.status(404).json({ error: 'Aroma no encontrado' });
            }
            res.json(aroma);
        }

        catch (err){
            res.status(500).json({ error: err.message });   
        }
    },


    //Eliminar un aroma (DELETE /api/aroma/:id) - Solo para admin
    eliminarAroma: async(req, res) => {
        try{
            const aroma = await aromaModel.eliminarAroma(req.params.id);

            //Comprobar que el aroma existe
            if (!aroma) {
                return res.status(404).json({ error: 'Aroma no encontrado'});
            }
            res.json({ message: 'Aroma eliminado correctamente' });

         } catch (err){
            res.status(500).json({ error: err.message });
         }
    }

};

module.exports = AromaController;