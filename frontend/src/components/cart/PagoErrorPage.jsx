import { useNavigate } from "react-router-dom";
import "./PagoResult.css";

/* ==========================================================================
   PagoErrorPage — Aterrizaje tras pago con tarjeta denegado en el TPV
   -------------------------------------------------------------------
   Cuando Redsys deniega o cancela el pago, el banco redirige al usuario a
   la URL configurada en REDSYS_ERROR_URL del backend, que apunta aqui
   (/pago/error).

   Posibles causas (las decide el banco, no nuestra app):
     - Tarjeta denegada / sin saldo
     - 3D Secure fallido
     - El usuario cancelo en la pagina del TPV
     - CVV2 = 999 (forzar denegacion en entorno test)
     - Importe terminado en 96 (forzar denegacion en entorno test)

   El pedido ya existe en BD (lo creo /api/redsys/iniciar como 'pendiente'),
   pero el webhook /api/redsys/notificacion lo ha movido a 'cancelado' al
   recibir la notificacion de denegacion. NO se ha cobrado nada.

   Aqui SOLO mostramos el mensaje y damos la opcion de reintentar. NO
   limpiamos el carrito: si el usuario reintenta y el cart aun tiene
   datos en memoria (poco probable porque el SPA se recargo), conserva su
   intencion de compra. Si el cart esta vacio (lo normal tras un redirect),
   le dirigimos al catalogo.
   ========================================================================== */
export default function PagoErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="pago-result">
      <div className="pago-result__panel pago-result__panel--error">
        <div className="pago-result__icon">❌</div>
        <h1 className="pago-result__title">El pago no se pudo completar</h1>
        <p className="pago-result__text">
          El banco no ha aprobado el cargo en tu tarjeta. Esto puede pasar
          por varios motivos: la tarjeta ha sido rechazada, has cancelado
          el pago en la pasarela o ha fallado la verificacion 3D Secure.
        </p>
        <p className="pago-result__text">
          No se ha realizado ningun cobro. Puedes volver al catalogo y
          intentarlo de nuevo cuando quieras.
        </p>

        <div className="pago-result__actions">
          <button
            className="pago-result__btn"
            onClick={function () {
              navigate("/catalogo");
            }}
          >
            Volver al catalogo &rarr;
          </button>
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
