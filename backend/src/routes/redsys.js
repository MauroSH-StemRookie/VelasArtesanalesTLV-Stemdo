/* ==========================================================================
   ROUTES — REDSYS (TPV)
   ---------------------
   Dos rutas para el flujo de pago con tarjeta a traves del TPV de Redsys:

     1) POST /api/redsys/iniciar     -> auth OPCIONAL
        - Si llega Authorization: Bearer <token> valido, optionalAuth
          rellena req.user y el pedido queda vinculado al usuario logueado.
        - Si no llega token (o es invalido), continua como invitado y el
          pedido se guarda con id_usuario = null.
        - El controller crea el pedido en BD con estado 'pendiente' y
          devuelve los parametros firmados para que el frontend redirija
          al TPV de Redsys.

     2) POST /api/redsys/notificacion  -> SIN auth
        - Webhook que Redsys llama automaticamente tras el pago.
        - El frontend NUNCA llama a este endpoint, asi que no tiene
          sentido aplicar optionalAuth aqui (no hay sesion del cliente).
        - El controller verifica la firma HMAC-SHA256, actualiza el
          estado del pedido y dispara los emails de confirmacion.
   ========================================================================== */

const express                                = require('express');
const optionalAuth                           = require('../middleware/optionalAuth');
const { iniciarPago, notificacion }          = require('../controllers/redsysController');

const router = express.Router();

// Crea el pedido en BD ('pendiente') y devuelve parametros firmados para el TPV.
// optionalAuth: vincula al usuario logueado si hay token, sino continua como invitado.
router.post('/iniciar', optionalAuth, iniciarPago);

// Webhook que Redsys llama tras el pago — sin auth (viene de los servidores de Redsys)
router.post('/notificacion', notificacion);

module.exports = router;
