const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthModel = require('../models/authModel');

const AuthController = {

    register: async (req, res) => {
        try{
            const { nombre, correo, password, telefono, calle, numero, cp, ciudad, provincia, piso } = req.body;

            //Verificar que esten los campos obligatorios
            if (!nombre || !correo || !password || !telefono){
                return res.status(400).json({error: 'Faltan campos obligatorios para registrarse'});
            }

            //Encriptar password
             const hash = await bcrypt.hash(password, 10);

             //Crear usuario en la base de datos
             const usuario = await AuthModel.create(nombre, calle, numero, cp, ciudad, provincia, piso, correo, telefono, hash);
             //Confirmacion de registro
             res.status(201).json(usuario);

        } catch (err){
            //23505 es el código de error de Postgres para "violación de restricción de unicidad" (correo ya existe)
            if (err.code === '23505') {
            return res.status(400).json({ error: 'Correo ya esta registrado' });
            }

            //Mensaje de error por defecto del fallo que haya ocurrido
            res.status(500).json({ error: err.message });
        }
    },

    login: async (req, res) => {
    
        try{
            const { correo, password } = req.body;

            //Obtener usuario por correo
            const user = await AuthModel.findByCorreo(correo);

            //Comprobamos que existe el usuario y que ha introduccido la password correctamente
            if( !user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({error: 'Correo o contraseña incorrectos'});
            }
            //Generacion del token JWT
            const token = jwt.sign(
              {id: user.id, nombre: user.nombre, correo: user.correo, tipo: user.tipo},
              process.env.JWT_SECRET,
              { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } //El token expira en 7 dias, pero se puede configuarar en el .env con JWT_EXPIRES_IN
            );
        
            //Respuesta con el token y los datos del usuario sin password para el front
            res.json({
              token, user: { id: user.id, nombre: user.nombre, correo: user.correo, tipo: Number(user.tipo)}
            });
        
          } catch (err) {
            //Mensaje de error por defecto del fallo que haya ocurrido
            res.status(500).json({ error: err.message });
          }
    }
}