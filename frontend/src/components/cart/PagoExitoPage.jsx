import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import "./PagoResult.css";

/* ==========================================================================
   PagoExitoPage — Aterrizaje tras pago con tarjeta aprobado en el TPV
   ------------------------------------------------------------------
   Cuando el usuario paga con Redsys, el SPA se descarga al redirigir al
   TPV del banco. Cuando el banco aprueba el pago redirige al usuario a
   la URL configurada en REDSYS_SUCCESS_URL del backend, que apunta aqui
   (/pago/exito).

   Al volver a entrar:
     - El SPA arranca desde cero — el carrito (que vivia solo en memoria
       de React) ya esta vacio. Por seguridad, llamamos a clearCart() de
       todas formas: si el carrito se persistiera en localStorage en el
       futuro, este vaciado seguiria siendo correcto.
     - El AuthContext re-hidrata desde localStorage, asi que el usuario
       sigue logueado si lo estaba antes.
     - El pedido ya esta en la BD (lo creo /api/redsys/iniciar) y el
       webhook /api/redsys/notificacion ya lo habra movido a 'pendiente'
       de envio. El correo de confirmacion ya se envio.

   No mostramos el numero de pedido aqui porque Redsys no lo manda como
   query param fiable en el redirect (lo manda en la notificacion al
   webhook, que es server-to-server). El usuario lo ve en el correo de
   confirmacion y en /pedidos si esta logueado.
   ========================================================================== */
export default function PagoExitoPage() {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { user } = useAuth();

  /* Vaciar el carrito al aterrizar aqui — el pago ya se completo y los
     productos se han movido al pedido. Lo hacemos en useEffect porque
     clearCart muta estado y queremos hacerlo despues del primer render. */
  useEffect(
    function () {
      clearCart();
    },
    [clearCart],
  );

  return (
    <div className="pago-result">
      <div className="pago-result__panel pago-result__panel--ok">
        <div className="pago-result__icon">✅</div>
        <h1 className="pago-result__title">Pago realizado con exito!</h1>
        <p className="pago-result__text">
          Tu pago ha sido aprobado por el banco. Hemos recibido tu pedido
          correctamente y nos pondremos manos a la obra.
        </p>
        <p className="pago-result__text">
          Te hemos enviado un correo con los detalles de la compra.
          {user
            ? " Tambien puedes consultar el estado en cualquier momento desde el apartado de mis pedidos."
            : ""}
        </p>

        <div className="pago-result__actions">
          {user ? (
            <button
              className="pago-result__btn"
              onClick={function () {
                navigate("/pedidos");
              }}
            >
              Ver mis pedidos &rarr;
            </button>
          ) : null}
          <button
            className="pago-result__btn pago-result__btn--secondary"
            onClick={function () {
              navigate("/");
            }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
