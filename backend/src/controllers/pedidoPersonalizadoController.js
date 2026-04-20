//Imports
const PedidoPersonalizadoModel = require('../models/pedidoPersonalizadoModel');

const PedidoPersonalizadoController = {
    
    //Obtener todo
    obtenerTodo: async (req, res) => {
        try{
            const pedidos = await PedidoPersonalizadoModel.obtenerTodo();
            res.json(pedidos);
        
        }catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    //Obtener pedido por id (solo usuarios logueados)
    obtenerPorId: async (req, res) => {
        try {
            const { id } = req.params;

            const pedido = await PedidoPersonalizadoModel.obtenerPorId(id);

            if (!pedido) {
                return res.status(404).json({ error: 'Pedido no encontrado' });
            }
            res.json(pedido);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }

    },


    //Obtener pedido por usuario
    obtenerPedidoUsuario: async (req, res) => {
        try{
            const idUsuario = req.user.id;

            const pedidos = await PedidoPersonalizadoModel.obtenerPorUsuario(idUsuario);
            
            res.json(pedidos);

        }catch (err) {
            res.status(500).json({ error: err.message });
        }
    },


    //Crear pedido perosonalizado
    crearPP: async (req, res) => {
        try{

            const idUsuario = req.user ? req.user.id : null;
            const { id_producto, descripcion, nombre, correo, telefono, cantidad } = req.body;

            if (!descripcion || !nombre || !correo) {
                return res.status(400).json({ error: 'Descripción, nombre y correo son obligatorios' });
            }

            const pedidoP = await PedidoPersonalizadoModel.crearPP(id_producto, idUsuario, descripcion, nombre, correo, telefono, cantidad);
            res.status(201).json(pedido);
        
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },


    //Eliminar Pedido Personalizado
    eliminarPP: async (req, res) => {
        try {
            const { id } = req.params;

            const pedidoEliminado = await PedidoPersonalizadoModel.eliminar(id);

            if (!pedidoEliminado) {
                return res.status(404).json({ error: 'Pedido personalizado no encontrado' });
            }

            res.json({ mensaje: 'Pedido personalizado eliminado correctamente' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

}
module.exports = PedidoPersonalizadoController;