import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { usuarioAPI } from "../../services/api";
import PayPalCheckout from "./PayPalCheckout";
import PayPalLogo from "../../assets/PayPal_Logo.svg";
import "./CheckoutPage.css";

/* ==========================================================================
   CheckoutPage — 3 pasos: Datos, Envio+Pago, Confirmacion
   --------------------------------------------------------
   Paso 1: el usuario rellena sus datos (autocompletados desde /me si
           esta logueado).
   Paso 2: resumen del pedido + metodos de pago.
           - Si elige "PayPal" aparece el boton oficial de PayPal, que
             dispara el flujo real de pago contra el backend:
               POST /api/paypal/orders          -> crea la orden en PayPal
               POST /api/paypal/orders/:id/capture -> captura y crea pedido
           - Si elige "Bizum" mostramos un aviso de "proximamente" porque
             el backend solo implementa PayPal (el campo metodo_pago del
             modelo esta preparado para convivir con Redsys/Bizum en el
             futuro, pero la ruta aun no existe).
   Paso 3: exito o error. El exito lo dispara onSuccess del boton de PayPal
           con el pedido ya creado en BD; el error lo dispara onError.

   IMPORTANTE: ya NO existe pedidosAPI.create — la ruta publica POST /api/pedidos
   fue eliminada del backend. El pedido se crea unicamente como consecuencia
   de una captura exitosa en PayPal.
   ========================================================================== */

const STEP_LABELS = ["Datos", "Envio y pago", "Confirmacion"];

const EMPTY_FORM = {
  nombre: "",
  telefono: "",
  email: "",
  calle: "",
  numero: "",
  cp: "",
  ciudad: "",
  provincia: "",
  piso: "",
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrecio, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1);

  /* Estado inicial con los datos que YA tenemos en el AuthContext (nombre,
     correo). El telefono y la direccion completa llegaran despues con /me. */
  const [form, setForm] = useState(function () {
    if (!user) return Object.assign({}, EMPTY_FORM);
    return Object.assign({}, EMPTY_FORM, {
      nombre: user.nombre || "",
      email: user.correo || "",
    });
  });

  const [metodoPago, setMetodoPago] = useState("");
  const [addressWarning, setAddressWarning] = useState("");
  const [paymentResult, setPaymentResult] = useState(null);
  const [paymentError, setPaymentError] = useState("");
  const [createdOrder, setCreatedOrder] = useState(null);
  const [autofilled, setAutofilled] = useState(false);

  /* Autocompletar con el perfil del usuario logueado.
     Solo pisamos cada campo si sigue vacio, para respetar lo que el usuario
     haya podido empezar a escribir antes de que llegase la respuesta. */
  useEffect(
    function () {
      if (!user) return;
      let cancelado = false;

      async function cargarPerfil() {
        try {
          const perfil = await usuarioAPI.me.obtener();
          if (cancelado) return;

          setForm(function (prev) {
            return {
              nombre: prev.nombre || (perfil && perfil.nombre) || "",
              email: prev.email || (perfil && perfil.correo) || "",
              telefono: prev.telefono || (perfil && perfil.telefono) || "",
              calle: prev.calle || (perfil && perfil.calle) || "",
              numero:
                prev.numero ||
                (perfil && perfil.numero != null ? String(perfil.numero) : ""),
              cp:
                prev.cp ||
                (perfil && perfil.cp != null ? String(perfil.cp) : ""),
              ciudad: prev.ciudad || (perfil && perfil.ciudad) || "",
              provincia: prev.provincia || (perfil && perfil.provincia) || "",
              piso: prev.piso || (perfil && perfil.piso) || "",
            };
          });
          setAutofilled(true);
        } catch (err) {
          console.warn("No se pudo autocompletar el perfil:", err.message);
        }
      }
      cargarPerfil();
      return function () {
        cancelado = true;
      };
    },
    [user],
  );

  function handleChange(e) {
    const name = e.target.name;
    const value = e.target.value;
    setForm(function (prev) {
      const next = Object.assign({}, prev);
      next[name] = value;
      return next;
    });
  }

  function isStep1Valid() {
    return (
      form.nombre.trim() &&
      form.telefono.trim() &&
      form.email.trim() &&
      /\S+@\S+\.\S+/.test(form.email) &&
      form.calle.trim() &&
      form.numero.trim() &&
      form.cp.trim() &&
      form.ciudad.trim() &&
      form.provincia.trim()
    );
  }

  function checkTalavera() {
    const low = (form.ciudad + " " + form.cp).toLowerCase();
    return low.indexOf("talavera") !== -1 || low.indexOf("45600") !== -1;
  }

  function goToStep2() {
    if (!isStep1Valid()) return;
    setAddressWarning(
      checkTalavera()
        ? ""
        : "La direccion no parece ser de Talavera de la Reina. El envio podria tener un coste extra.",
    );
    setStep(2);
  }

  /* Callbacks que pasa CheckoutPage al boton de PayPal.
     --------------------------------------------------
     onSuccess: el backend ya capturo el pago y creo el pedido. Recibimos el
                pedido real (con su id y total) para pintarlo en el paso 3.
                Vaciamos el carrito y avanzamos de paso.
     onError:   algo fallo durante createOrder o captureOrder. Guardamos el
                mensaje para mostrarlo en el paso 3 y avanzamos a ese paso
                para que el usuario pueda reintentar. */
  function handlePayPalSuccess(pedidoBackend) {
    const order = {
      id: pedidoBackend.id,
      fecha: pedidoBackend.fecha_creacion || new Date().toISOString(),
      estado: pedidoBackend.estado || "pendiente",
      items: items.map(function (i) {
        return { nombre: i.nombre, cantidad: i.cantidad, precio: i.precio };
      }),
      total: Number(pedidoBackend.total) || totalPrecio,
      metodoPago: "paypal",
      datosCliente: Object.assign({}, form),
    };
    setCreatedOrder(order);
    setPaymentResult("success");
    setStep(3);
    clearCart();
  }

  function handlePayPalError(mensaje) {
    setPaymentError(mensaje || "No se pudo procesar el pago");
    setPaymentResult("error");
    setStep(3);
  }

  /* Si el carrito esta vacio y no estamos en el paso 3 (confirmacion),
     no tiene sentido mostrar el checkout. */
  if (items.length === 0 && step < 3) {
    return (
      <div className="checkout">
        <div className="checkout__empty">
          <span className="checkout__empty-icon">🛒</span>
          <p>Tu carrito esta vacio</p>
          <button
            className="checkout__btn"
            onClick={function () {
              navigate("/catalogo");
            }}
          >
            Ver catalogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout">
      {/* Barra de progreso */}
      <div className="checkout__progress">
        {STEP_LABELS.map(function (label, i) {
          const num = i + 1;
          const classActive = step === num ? "active" : "";
          const classDone = step > num ? "done" : "";
          const className =
            "checkout__step-indicator " + classActive + " " + classDone;
          return (
            <div key={num} className={className.trim()}>
              <div className="checkout__step-circle">
                {step > num ? "\u2713" : num}
              </div>
              <span className="checkout__step-label">{label}</span>
              {i < STEP_LABELS.length - 1 ? (
                <div className="checkout__step-line" />
              ) : null}
            </div>
          );
        })}
      </div>

      {/* PASO 1: Datos del cliente */}
      {step === 1 && (
        <div className="checkout__panel fade-up">
          <h2 className="checkout__title">Tus datos</h2>
          {user && autofilled ? (
            <p className="checkout__subtitle">
              Hemos rellenado tus datos desde tu perfil. Revisalos o editalos
              antes de continuar.
            </p>
          ) : null}
          {user && !autofilled ? (
            <p className="checkout__subtitle">Cargando tus datos...</p>
          ) : null}
          <div className="checkout__form">
            <div className="checkout__row">
              <label className="checkout__label">
                <span>Nombre completo *</span>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Maria Garcia Lopez"
                  className="checkout__input"
                />
              </label>
              <label className="checkout__label">
                <span>Telefono *</span>
                <input
                  name="telefono"
                  type="tel"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="600 123 456"
                  className="checkout__input"
                />
              </label>
            </div>

            <label className="checkout__label">
              <span>Email *</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="maria@correo.com"
                className="checkout__input"
              />
            </label>

            <div className="checkout__section-label">Direccion de envio</div>

            <div className="checkout__row">
              <label className="checkout__label checkout__label--wide">
                <span>Calle *</span>
                <input
                  name="calle"
                  value={form.calle}
                  onChange={handleChange}
                  placeholder="Calle Mayor"
                  className="checkout__input"
                />
              </label>
              <label className="checkout__label checkout__label--small">
                <span>Numero *</span>
                <input
                  name="numero"
                  value={form.numero}
                  onChange={handleChange}
                  placeholder="12"
                  className="checkout__input"
                />
              </label>
            </div>

            <div className="checkout__row">
              <label className="checkout__label">
                <span>Codigo Postal *</span>
                <input
                  name="cp"
                  value={form.cp}
                  onChange={handleChange}
                  placeholder="45600"
                  className="checkout__input"
                />
              </label>
              <label className="checkout__label">
                <span>Ciudad *</span>
                <input
                  name="ciudad"
                  value={form.ciudad}
                  onChange={handleChange}
                  placeholder="Talavera de la Reina"
                  className="checkout__input"
                />
              </label>
            </div>

            <div className="checkout__row">
              <label className="checkout__label">
                <span>Provincia *</span>
                <input
                  name="provincia"
                  value={form.provincia}
                  onChange={handleChange}
                  placeholder="Toledo"
                  className="checkout__input"
                />
              </label>
              <label className="checkout__label">
                <span>Piso / Puerta</span>
                <input
                  name="piso"
                  value={form.piso}
                  onChange={handleChange}
                  placeholder="3A (opcional)"
                  className="checkout__input"
                />
              </label>
            </div>
          </div>
          <div className="checkout__actions">
            <button
              className="checkout__btn checkout__btn--secondary"
              onClick={function () {
                navigate("/catalogo");
              }}
            >
              &larr; Volver al catalogo
            </button>
            <button
              className="checkout__btn"
              onClick={goToStep2}
              disabled={!isStep1Valid()}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* PASO 2: Envio y metodo de pago */}
      {step === 2 && (
        <div className="checkout__panel fade-up">
          <h2 className="checkout__title">Envio y metodo de pago</h2>
          {/* Resumen del pedido */}
          <div className="checkout__summary">
            <h3>Resumen del pedido</h3>
            <ul className="checkout__summary-list">
              {items.map(function (item) {
                return (
                  <li key={item.id}>
                    <span>
                      {item.nombre} x {item.cantidad}
                    </span>
                    <span>
                      {(item.precio * item.cantidad).toFixed(2)} &euro;
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="checkout__summary-total">
              <span>Total</span>
              <span>{totalPrecio.toFixed(2)} &euro;</span>
            </div>
          </div>

          {/* Metodo de pago */}
          <div className="checkout__payment-methods">
            <h3>Metodo de pago</h3>
            <div className="checkout__methods-grid">
              <button
                className={
                  metodoPago === "paypal"
                    ? "checkout__method selected"
                    : "checkout__method"
                }
                onClick={function () {
                  setMetodoPago("paypal");
                }}
              >
                <img
                  src={PayPalLogo}
                  alt="PayPal"
                  className="checkout__method-logo"
                />
              </button>
              <button
                className={
                  metodoPago === "bizum"
                    ? "checkout__method selected"
                    : "checkout__method"
                }
                onClick={function () {
                  setMetodoPago("bizum");
                }}
              >
                <span className="checkout__method-icon">📱</span>
                <span>Bizum (proximamente)</span>
              </button>
            </div>
          </div>

          {/* Segun el metodo elegido, mostramos el componente correspondiente.
              PayPal: boton oficial que dispara el flujo real de pago.
              Bizum:  aviso temporal hasta que se integre Redsys/Bizum real.  */}
          {metodoPago === "paypal" && (
            <PayPalCheckout
              carrito={items}
              datosComprador={form}
              total={totalPrecio}
              onSuccess={handlePayPalSuccess}
              onError={handlePayPalError}
            />
          )}

          {metodoPago === "bizum" && (
            <div className="checkout__warning">
              <span className="checkout__warning-icon">ℹ️</span>
              El pago con Bizum estara disponible proximamente. Por ahora, usa
              PayPal para completar tu compra.
            </div>
          )}

          <div className="checkout__actions">
            <button
              className="checkout__btn checkout__btn--secondary"
              onClick={function () {
                setStep(1);
              }}
            >
              &larr; Atras
            </button>
          </div>
        </div>
      )}

      {/* PASO 3: Resultado del pago */}
      {step === 3 && (
        <div className="checkout__panel fade-up">
          {paymentResult === "success" ? (
            <div className="checkout__result checkout__result--ok">
              <div className="checkout__result-icon">✅</div>
              <h2>Pago realizado con exito!</h2>
              <p>
                Pedido{" "}
                <strong>
                  #{createdOrder && createdOrder.id ? createdOrder.id : ""}
                </strong>{" "}
                confirmado. Recibiras un correo en <strong>{form.email}</strong>
                .
              </p>
              <div className="checkout__order-recap">
                <h4>Detalles del pedido</h4>
                <ul>
                  {createdOrder && createdOrder.items
                    ? createdOrder.items.map(function (it, i) {
                        return (
                          <li key={i}>
                            {it.nombre} x {it.cantidad} —{" "}
                            {(it.precio * it.cantidad).toFixed(2)} &euro;
                          </li>
                        );
                      })
                    : null}
                </ul>
                <p className="checkout__order-total">
                  Total:{" "}
                  <strong>
                    {createdOrder
                      ? Number(createdOrder.total).toFixed(2)
                      : "0.00"}{" "}
                    &euro;
                  </strong>
                </p>
                <p className="checkout__order-method">
                  Pagado con <strong>PayPal</strong>
                </p>
              </div>
              <div className="checkout__actions">
                <button
                  className="checkout__btn"
                  onClick={function () {
                    navigate("/pedidos");
                  }}
                >
                  Ver mis pedidos &rarr;
                </button>
                <button
                  className="checkout__btn checkout__btn--secondary"
                  onClick={function () {
                    navigate("/");
                  }}
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          ) : (
            <div className="checkout__result checkout__result--error">
              <div className="checkout__result-icon">❌</div>
              <h2>Error en el pago</h2>
              <p>
                {paymentError
                  ? paymentError
                  : "No se pudo procesar tu pago. Por favor, intentalo de nuevo."}
              </p>
              <div className="checkout__actions">
                <button
                  className="checkout__btn checkout__btn--secondary"
                  onClick={function () {
                    setStep(2);
                    setPaymentResult(null);
                    setPaymentError("");
                  }}
                >
                  &larr; Reintentar
                </button>
                <button
                  className="checkout__btn"
                  onClick={function () {
                    navigate("/");
                  }}
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
