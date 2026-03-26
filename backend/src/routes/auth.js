//Imports
const router  = require('express').Router();
const db = require('../db');
const bcCrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try{
    const { nombre, correo, password, telefono } = req.body;

    //Verificar que esten todos los campos
    if (!nombre || !correo || !password || !telefono) {
      return res.status(400).json({error: 'Todos los campos son requeridos para registrarse'});
    }

    //Encriptar password
    const hash = await bcCrypt.hash(password, 10);

    //Crear usuario en la base de datos
    const { rows } = await db.query(
      `INSERT INTO usuario (persona, password, tipo)
       VALUES (
        ROW($1, ROW(NULL, NULL, NULL, NULL, NULL, NULL)::direccion, $2, $3)::persona,
        $4,
        2
       ) RETIURNING id, (persona).nombre, (persona).correo`,
      //$1 = nombre, $2 = correo, $3 = telefono, $4 = hash(password)
      [nombre, correo, telefono, hash]
    );

    //Confirmacion de registro
    res.status(201).json(rows[0]);

  } catch (err){
    //23505 es el código de error de Postgres para "violación de restricción de unicidad" (correo ya existe)
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Correo ya esta registrado' });
    }

    //Mensaje de error por defecto del fallo que haya ocurrido
    res.status(500).json({ error: err.message });
  }
});


// POST /api/auth/login
router.post('/login', async (req, res) => {

  try {
    const { correo, password } = req.body;

    //Obtener usuario por correo
    const { rows } = await db.query(
      `SELECT id, password, (persona).nombre, (persona).correo, tipo
       FROM usuario WHERE (persona).correo = $1`,
      [correo]
    );
    const user = rows[0];

    //Comprobamos que exista un usuario, y que el usuario ha introducido la password correcta
    if ( !user || !(await bcCrypt.compare(password, user.password)) ) {
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
      token, user: { id: user.id, nombre: user.nombre, correo: user.correo, tipo: user.tipo}
    });

  } catch (err) {
    //Mensaje de error por defecto del fallo que haya ocurrido
    res.status(500).json({ error: err.message });
  }

});

module.exports = router;
