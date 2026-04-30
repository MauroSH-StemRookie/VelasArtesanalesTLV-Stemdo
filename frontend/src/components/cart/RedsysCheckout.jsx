import { useState } from "react";
import { redsysAPI } from "../../services/api";
import "./RedsysCheckout.css";

/* ==========================================================================
   RedsysCheckout — Pago con tarjeta bancaria a traves del TPV de Redsys
   --------------------------------------------------------------------
   Hermano gemelo de PayPalCheckout, pero adaptado al flujo de Redsys.
   La diferencia clave entre los dos flujos esta en COMO se cobra el dinero:

     PayPal: popup dentro de la pagina. El SPA nunca pierde el control,
             onApprove se ejecuta en el mismo contexto y avanzamos al
             paso 3 del CheckoutPage con el pedido recien creado.

     Redsys: redireccion completa al TPV del banco. El SPA se descarga,
             el usuario teclea su tarjeta en la pagina de Redsys y al
             terminar el banco redirige a /pago/exito o /pago/error.
             Cuando volvemos, el SPA arranca desde cero — la cuenta
             del paso 3 NO se llega a renderizar.

   Por eso este componente NO necesita callbacks onSuccess/onError como
   PayPalCheckout; el resultado del pago se gestiona en las paginas
   /pago/exito y /pago/error, no aqui.

   Flujo (README del backend, seccion "Pagos online con Redsys"):

     Click en "Pagar con tarjeta"
           |
           v
     redsysAPI.iniciarPago()  --> POST /api/redsys/iniciar
           |                      Body: datos comprador + carrito + total
           v
     El backend crea el pedido en BD ('pendiente') y devuelve:
       { pedidoId, url, Ds_SignatureVersion, Ds_MerchantParameters, Ds_Signature }
           |
           v
     Construimos un <form> oculto con los 3 hidden inputs y hacemos submit
           |
           v
     El navegador redirige al TPV de Redsys con un POST nativo
           |
           v
     Usuario teclea la tarjeta en la pagina del banco
           |
           v
     Redsys llama (por su cuenta) a POST /api/redsys/notificacion
     y redirige al usuario a /pago/exito o /pago/error

   IMPORTANTE: el formulario se construye DINAMICAMENTE en JS, no como HTML
   estatico. Esto es asi porque los 3 valores (Ds_*) cambian en cada pago
   y dependen de la respuesta del backend.

   Sobre la prop onError:
     Solo se usa para errores ANTES del redirect (fallo de red al llamar
     a /api/redsys/iniciar, validaciones que rechaza el backend, etc).
     Una vez que el form se envia al banco, ya no podemos hacer nada desde
     aqui — el flujo continua en /pago/exito o /pago/error.

   Props:
     - carrito         -> items del carrito (array). Cada item: { id, nombre, cantidad, precio }
     - datosComprador  -> form validado del paso 1 del checkout (los 9 campos)
     - total           -> total en euros (number)
     - onError(mensaje)-> callback opcional para fallos previos al redirect
   ========================================================================== */
export default function RedsysCheckout({
  carrito,
  datosComprador,
  total,
  onError,
}) {
  /* loading: mientras esta a true mostramos el boton deshabilitado con un
     "Redirigiendo al banco...". Se queda asi hasta que la pagina realmente
     navega al TPV (cuestion de milisegundos). Si algo falla antes del
     submit, lo volvemos a poner a false para que el usuario pueda reintentar. */
  const [loading, setLoading] = useState(false);

  /* Crea un <form> oculto con los 3 hidden inputs que exige Redsys
     y lo envia. Al hacer submit, el navegador redirige al TPV.

     Importante:
       - El formulario debe ser POST (Redsys no acepta GET)
       - Los 3 campos deben llamarse exactamente asi (mayusculas/minusculas
         incluidas), o el TPV los ignora
       - Hacemos appendChild al body porque algunos navegadores no envian
         formularios que no esten en el DOM */
  function redirigirAlBanco({ url, Ds_SignatureVersion, Ds_MerchantParameters, Ds_Signature }) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = url;

    const campos = [
      ["Ds_SignatureVersion",   Ds_SignatureVersion],
      ["Ds_MerchantParameters", Ds_MerchantParameters],
      ["Ds_Signature",          Ds_Signature],
    ];

    campos.forEach(function (par) {
      const input = document.createElement("input");
      input.type  = "hidden";
      input.name  = par[0];
      input.value = par[1];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  }

  /* handlePagar: dispara todo el flujo cuando el usuario pulsa el boton.
     1) Pide al backend los parametros firmados (esto crea el pedido en BD).
     2) Construye el formulario y lo envia al TPV.

     NOTA sobre el precio: igual que en PayPalCheckout, mandamos
     `precio: it.precio` tal cual viene del carrito. El carrito ya guardo
     el precio que el usuario vio (precio_oferta si habia descuento, precio
     normal si no). El backend almacena ese mismo valor como snapshot en
     detalle_pedido — si Sergio sube el precio mañana, el pedido conserva
     el precio que el cliente pago realmente. */
  async function handlePagar() {
    if (loading) return;
    setLoading(true);

    try {
      const datosPedido = {
        nombre:    datosComprador.nombre,
        correo:    datosComprador.email,
        telefono:  datosComprador.telefono,
        calle:     datosComprador.calle,
        numero:    datosComprador.numero,
        cp:        datosComprador.cp,
        ciudad:    datosComprador.ciudad,
        provincia: datosComprador.provincia,
        piso:      datosComprador.piso || "",
        total:     total.toFixed(2),
        productos: carrito.map(function (it) {
          return {
            id_producto: it.id,
            cantidad:    it.cantidad,
            precio:      it.precio,
          };
        }),
      };

      const respuesta = await redsysAPI.iniciarPago(datosPedido);

      /* La respuesta del backend trae el pedidoId (ya guardado en BD como
         'pendiente') y los 3 parametros firmados. Los pasamos al helper
         que construye el form y redirige. A partir de aqui el SPA se descarga
         — no hay codigo que se ejecute despues del submit. */
      redirigirAlBanco(respuesta);
    } catch (err) {
      console.error("Error al iniciar el pago con Redsys:", err.message);
      setLoading(false);
      if (onError) {
        onError(err.message || "No se pudo iniciar el pago con tarjeta");
      }
    }
  }

  return (
    <div className="redsys-checkout">
      <button
        type="button"
        className="redsys-checkout__btn"
        onClick={handlePagar}
        disabled={loading}
      >
        <span className="redsys-checkout__btn-icon" aria-hidden="true">
          {/* Tarjeta bancaria minimalista en SVG inline (sin assets externos) */}
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5"  width="20" height="14" rx="2" ry="2" />
            <line x1="2"  y1="10" x2="22" y2="10" />
            <line x1="6"  y1="15" x2="10" y2="15" />
          </svg>
        </span>
        <span className="redsys-checkout__btn-label">
          {loading ? "Redirigiendo al banco..." : "Pagar con tarjeta"}
        </span>
      </button>

      <p className="redsys-checkout__hint">
        Al pulsar el boton seras redirigido a la pasarela segura de Redsys
        para introducir los datos de tu tarjeta. Tu pedido se confirmara
        cuando el banco apruebe el pago.
      </p>
    </div>
  );
}
