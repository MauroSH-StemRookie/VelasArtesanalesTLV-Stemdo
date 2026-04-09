const categoriaModel = require('../models/categoriaModel');

const CategoriaController = {

    // Obtener todas las categorias (GET /api/categoria)
    obtenerTodo: async(req, res) => {
        try {
            const categorias = await categoriaModel.obtenerTodo();
            res.json(categorias);
        } catch (err){
            res.status(500).json({ error: err.message });
        }
    },


    // Crear nueva categoria (POST /api/categoria) - Solo para admin
    crearCategoria: async(req, res) => {
        try {
            const { nombre_categoria } = req.body;

            //Verificar que el campo obligatorio esta presente
            if (!nombre_categoria) {
                return res.status(400).json({ error: 'No has introducido ningun nombre para la nueva categoria' });
            }
            //Crear nueva categoria
            const categoria = await categoriaModel.agregarCategoria(nombre_categoria);
            res.status(201).json(categoria);

        } catch (err){
            res.status(500).json({ error: err.message });
        }
    },


    // Modificar categoria existente (PUT /api/categoria/:id) - Solo para admin
    modificarCategoria: async(req, res) => {
        try {
            const { nombre_categoria } = req.body;
            const categoria = await categoriaModel.modificarCategoria(req.params.id, nombre_categoria);

            //Comprobar que la categoria existe
            if (!categoria) return res.status(404).json({ error: 'Categoria no encontrada' });
            res.json(categoria);

        } catch (err){
            res.status(500).json({ error: err.message });
        }
    },


    // Eliminar categoria existente (DELETE /api/categoria/:id) - Solo para admin
    eliminarCategoria: async(req, res) => {
        try {
            const categoria = await categoriaModel.eliminarCategoria(req.params.id);

            //Comprobar que la categoria existe
            if (!categoria) return res.status(404).json({ error: 'Categoria no encontrada' });
            res.json({ message: 'Categoria eliminada correctamente' });

        } catch (err){
            res.status(500).json({ error: err.message });
        }
    }


}

module.exports = CategoriaController;