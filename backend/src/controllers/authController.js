const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthModel = require('../models/authModel');
const UsuarioModel = require('../models/usuarioModel')
const { enviarEmailRecuperacion } = require('../services/emailService');

const AuthController = {

    // ─── REGISTRO ───────────────────────────────────────
    registro: async (req, res) => {
        try{
            const { nombre, correo, password, telefono, calle, numero, cp, ciudad, provincia, piso } = req.body;

            //Verificar que esten los campos obligatorios
            if (!nombre || !correo || !password || !telefono){
                return res.status(400).json({error: 'Faltan campos obligatorios para registrarse'});
            }

            //Verificar que el correo no este registrado
            if (await AuthModel.findByCorreo(correo)) {
                return res.status(400).json({ error: 'Correo ya esta registrado' });
            }

            //Encriptar password
            const hash = await bcrypt.hash(password, 10);

            //Crear usuario en la base de datos
            const user = await AuthModel.create({nombre, calle, numero, cp, ciudad, provincia, piso, correo, telefono, hash});
             
            //Generacion del token JWT
            const token = jwt.sign({id: user.id, nombre: user.nombre, correo: user.correo, tipo: Number(user.tipo)},
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } //El token expira en 7 dias, pero se puede configuarar en el .env con JWT_EXPIRES_IN
            );
        
            //Respuesta con el token y los datos del usuario sin password para el front
            res.json({
              token, user: { id: user.id, nombre: user.nombre, correo: user.correo, tipo: Number(user.tipo)}
            });

        } catch (err){
            //23505 es el código de error de Postgres para "violación de restricción de unicidad" (correo ya existe)
            if (err.code === '23505') {
            return res.status(400).json({ error: 'Correo ya esta registrado' });
            }

            //Mensaje de error por defecto del fallo que haya ocurrido
            res.status(500).json({ error: err.message });
        }
    },


    // ─── LOGIN ───────────────────────────────────────────
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
              {id: user.id, nombre: user.nombre, correo: user.correo, tipo: Number(user.tipo)},
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
    },


    // -- METODOS DE CAMBIO DE CONTRASEÑA MEDIANTE CODIGO DE SEGURIDAD ------------

    // POST /api/auth/recuperar — solicitar código
    solicitarRecuperacion: async (req, res) => {
        try {
            const { correo } = req.body;

            if (!correo) {
                return res.status(400).json({ error: 'El correo es obligatorio' });
            }

            const usuario = await AuthModel.findByCorreoRecuperacion(correo);

            // Respondemos igual exista o no el correo (evita enumerar usuarios)
            if (!usuario) {
                return res.json({ mensaje: 'Si el correo existe, recibirás las instrucciones' });
            }

            // Código de 6 dígitos aleatorio
            const codigo = Math.floor(100000 + Math.random() * 900000).toString();

            // Expira en 15 minutos
            const expiraEn = new Date(Date.now() + 15 * 60 * 1000);

            await AuthModel.guardarCodigoRecuperacion(usuario.id, codigo, expiraEn);
            await enviarEmailRecuperacion(correo, usuario.nombre, codigo);

            res.json({ mensaje: 'Si el correo existe, recibirás las instrucciones' });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },


    // POST /api/auth/recuperar/verificar — verificar código y cambiar contraseña
    verificarRecuperacion: async (req, res) => {
        try {
            const { correo, codigo, passwordNueva } = req.body;

            if (!correo || !codigo || !passwordNueva) {
                return res.status(400).json({ error: 'Correo, código y nueva contraseña son obligatorios' });
            }

            const registro = await AuthModel.obtenerCodigoValido(correo, codigo);

            if (!registro) {
                return res.status(400).json({ error: 'Código inválido o expirado' });
            }

            const nuevoHash = await bcrypt.hash(passwordNueva, 10);
            await UsuarioModel.cambiarPassword(registro.id_usuario, nuevoHash);
            await AuthModel.marcarCodigoUsado(registro.id);

            res.json({ mensaje: 'Contraseña actualizada correctamente' });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

};

module.exports = AuthController; 