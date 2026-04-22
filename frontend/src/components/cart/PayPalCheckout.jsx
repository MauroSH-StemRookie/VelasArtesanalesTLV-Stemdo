import { PayPalButtons } from "@paypal/react-paypal-js";
import { paypalAPI } from "../../services/api";
import "./PayPalCheckout.css";

/* ==========================================================================
   PayPalCheckout — Boton oficial de PayPal integrado con nuestro backend
   ----------------------------------------------------------------------
   Flujo (README del backend, seccion "Pagos online con PayPal"):

     Frontend calcula total
           |
           v
     createOrder  --> POST /api/paypal/orders
           |         (body: { amount: "25.00" })
           v
     PayPal devuelve orderID
           |
           v
     El usuario aprueba el pago en el popup de PayPal
           |
           v
     onApprove    --> POST /api/paypal/orders/:orderID/capture
           |         (body: datos del comprador + carrito + total)
           v
     El backend captura el pago, crea el pedido en BD
     y envia los emails de confirmacion al cliente y al admin.

   Si cualquier paso falla, el backend hace ROLLBACK y no se crea pedido.
   El flujo aqui solo conoce el orderID — todo lo sensible (client secret,
   captura real) vive en el backend.

   Props:
     - carrito          → items del carrito (array). Cada item: { id, nombre, cantidad, precio }
     - datosComprador   → form validado del paso 1 del checkout (nombre, email, telefono, direccion...)
     - total            → total en euros (number)
     - onSuccess(pedido) → callback que dispara el paso 3 de confirmacion con el pedido creado
     - onError(mensaje)  → callback cuando PayPal o el backend fallan

   Sobre forceReRender:
     PayPal Buttons cachea los callbacks createOrder/onApprove la primera vez
     que se renderiza. Si cambian el total o los datos del comprador y no
     forzamos el re-render, el boton seguiria usando los valores viejos.
     Por eso pasamos las dependencias que pueden cambiar en forceReRender.
   ========================================================================== */
export default function PayPalCheckout({
  carrito,
  datosComprador,
  total,
  onSuccess,
  onError,
}) {
  /* createOrder: crea la orden en PayPal a traves de nuestro backend.
     Devuelve el orderID (string) que PayPal necesita para abrir el popup. */
  async function handleCreateOrder() {
    try {
      const orden = await paypalAPI.createOrder(total.toFixed(2));
      return orden.id;
    } catch (err) {
      console.error("Error al crear la orden de PayPal:", err.message);
      if (onError) onError("No se pudo crear la orden de pago");
      throw err;
    }
  }

  /* onApprove: el usuario ya aprobo el pago en PayPal. Ahora capturamos el
     pago en el backend pasando todos los datos del pedido. El backend hace
     la captura real contra PayPal, crea el pedido en BD y devuelve el objeto
     del pedido creado.

     NOTA: mandamos `precio: it.precio` tal cual viene del carrito. El carrito
     guarda el precio que el usuario vio en el momento de añadir el producto
     (precio_oferta si habia descuento, precio normal si no). El backend
     guarda ese precio como snapshot en detalle_pedido — si Sergio cambia el
     precio del producto mañana, el pedido mantiene el precio que el cliente
     pago realmente. De esta manera tenemos si o si un mantenimiento adecuado y firme de los datos*/
  async function handleApprove(data) {
    try {
      const pedidoCreado = await paypalAPI.captureOrder(data.orderID, {
        nombre: datosComprador.nombre,
        correo: datosComprador.email,
        telefono: datosComprador.telefono,
        calle: datosComprador.calle,
        numero: datosComprador.numero,
        cp: datosComprador.cp,
        ciudad: datosComprador.ciudad,
        provincia: datosComprador.provincia,
        piso: datosComprador.piso || "",
        total: total.toFixed(2),
        productos: carrito.map(function (it) {
          return {
            id_producto: it.id,
            cantidad: it.cantidad,
            precio: it.precio,
          };
        }),
      });
      if (onSuccess) onSuccess(pedidoCreado);
    } catch (err) {
      console.error("Error al capturar el pago:", err.message);
      if (onError) onError(err.message || "No se pudo completar el pago");
    }
  }

  /* onError: errores del propio SDK de PayPal (no de nuestro backend).
     Por ejemplo, fallos de red al cargar el popup, cancelacion inesperada,
     token de cliente invalido. */
  function handleError(err) {
    console.error("Error del SDK de PayPal:", err);
    if (onError) onError("Hubo un problema con PayPal");
  }

  /* onCancel: el usuario cerro el popup sin completar el pago.
     No lo tratamos como error: simplemente no avanzamos de paso. */
  function handleCancel() {
    console.log("Pago cancelado por el usuario");
  }

  return (
    <div className="paypal-checkout">
      <PayPalButtons
        style={{
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
          height: 48,
        }}
        forceReRender={[total, carrito.length, datosComprador.email]}
        createOrder={handleCreateOrder}
        onApprove={handleApprove}
        onError={handleError}
        onCancel={handleCancel}
      />
      <p className="paypal-checkout__hint">
        Al pulsar el boton se abrira una ventana segura de PayPal. Tu pedido
        solo se creara si el pago se completa correctamente.
      </p>
    </div>
  );
}
