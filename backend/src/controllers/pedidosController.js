//Imports 
const PedidosModel = require('../models/pedidosModel')

const PedidosController = {

    //Obtener todos los pedidos (solo admin)
    obtenerTodo: async (req, res) => {
        try {
            const pedidos = await PedidosModel.obtenerTodo();
            res.json(pedidos);

        } catch (err){
            res.status(500).json({ error: err.message });
        }
    },


    //Obtener pedido por id (solo usuarios logueados)
    obtenerPorId: async (req, res) => {
        try {
            const { id } = req.params;

            const pedido = await PedidosModel.obtenerPorId(id);

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

            const pedidos = await PedidosModel.obtenerPorUsuario(idUsuario);
            
            res.json(pedidos);

        }catch (err) {
            res.status(500).json({ error: err.message });
        }
    },


    //Crear pedido
    crearPedido: async (req, res) => {
        try{
            //Si hay token se asocia el pedido al usuario, si no, null
             const idUsuario = req.user ? req.user.id : null;
            const { nombre, correo, telefono, productos } = req.body;

            // direccion como objeto separado del body
            const { calle, numero, cp, ciudad, provincia, piso } = req.body;
            const direccion = { calle, numero, cp, ciudad, provincia, piso };

            //Comprobar que no falten datos
            if (!nombre || !correo || !productos || productos.length === 0) {
                return res.status(400).json({ error: 'Nombre, correo y productos son obligatorios' });
            }

            // Validar estructura de cada producto
            for (const item of productos) {
                if (!item.id_producto || !item.cantidad || !item.precio) {
                    return res.status(400).json({ error: 'Cada producto debe tener id_producto, cantidad y precio' });
                }
            }

            const pedido = await PedidosModel.crearPedido(direccion, idUsuario, nombre, correo, telefono, productos);

            res.status(201).json(pedido);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },


    //Eliminar pedido (solo admin)
    eliminarPedido: async (req, res) => {
        try{
            const { id } = req.params

            const pedidoEliminado = await PedidosModel.eliminarPedido(id)

             if (!pedidoEliminado) {
                return res.status(404).json({ error: 'Pedido no encontrado' });
            }

            res.json({ mensaje: 'Pedido eliminado correctamente' });

        }catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

}
module.exports = PedidosController;