/* ==========================================================================
   ROUTES — PAYPAL
   ---------------
   Dos rutas para el flujo de pago con PayPal:

     1) POST /api/paypal/orders                      -> SIN auth
        - Solo registra la "intencion de pago" en PayPal y devuelve el
          orderID para que el SDK abra el popup. No toca BD ni necesita
          saber quien es el usuario.

     2) POST /api/paypal/orders/:orderID/capture     -> auth OPCIONAL
        - Aqui es donde el dinero se cobra de verdad y se crea el pedido
          en BD. El controller hace `req.user ? req.user.id : null` para
          decidir si vincular el pedido al usuario logueado o guardarlo
          como invitado.
        - Sin optionalAuth, `req.user` siempre seria undefined y todos
          los pedidos pagados con PayPal se guardarian como invitado,
          aunque el usuario hubiese iniciado sesion. Esto rompia que la
          pagina /pedidos del cliente mostrase sus compras.
        - Con optionalAuth, si llega Authorization: Bearer <token> valido
          el pedido se vincula al usuario, y si no llega (o el token es
          invalido) se guarda como invitado igualmente — ambos casos son
          legales en PayPal y ningun usuario se queda fuera.
   ========================================================================== */

const express                              = require('express');
const optionalAuth                         = require('../middleware/optionalAuth');
const { createOrder, captureOrder }        = require('../controllers/paypalController');

const router = express.Router();

// POST /api/paypal/orders
// El frontend llama aqui cuando el usuario pulsa el boton de PayPal.
// Devuelve el ID de la orden para que el frontend abra el popup.
// No necesita auth: solo es la creacion de la orden en PayPal, no toca BD.
router.post('/orders', createOrder);

// POST /api/paypal/orders/:orderID/capture
// El frontend llama aqui despues de que el usuario aprueba el pago en el popup.
// Aqui es donde se cobra realmente el dinero y se crea el pedido en BD.
// optionalAuth: vincula al usuario logueado si hay token, sino sigue como invitado.
router.post('/orders/:orderID/capture', optionalAuth, captureOrder);

module.exports = router;
