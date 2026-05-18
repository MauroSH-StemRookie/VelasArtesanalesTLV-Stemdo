import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { usuarioAPI } from "../../services/api";
import RedsysCheckout from "./RedsysCheckout";
import PayPalLogo from "../../assets/PayPal_Logo.svg";
import "./CheckoutPage.css";

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

  const costeEnvio = totalPrecio >= 40 ? 0 : 6;
  const totalConEnvio = totalPrecio + costeEnvio;

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

  function handleRedsysError(mensaje) {
    setPaymentError(mensaje || "No se pudo iniciar el pago con tarjeta");
    setPaymentResult("error");
    setStep(3);
  }

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

            {!user && (
              <div className="checkout__guest-info">
                <span className="checkout__guest-info-icon" aria-hidden="true">
                  ✉️
                </span>
                <span>
                  Estás comprando como invitado. Te enviaremos los detalles del
                  pedido al correo que indiques arriba — revisalo bien antes
                  de continuar.
                </span>
              </div>
            )}

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
              <span>Subtotal productos</span>
              <span>{totalPrecio.toFixed(2)} &euro;</span>
            </div>
            <div className="checkout__summary-total">
              <span>Envio (GLS / Correos)</span>
              <span>{costeEnvio === 0 ? "Gratis 🎉" : "6.00 €"}</span>
            </div>
            <div className="checkout__summary-total" style={{fontWeight:"bold"}}>
              <span>Total</span>
              <span>{totalConEnvio.toFixed(2)} &euro;</span>
            </div>
          </div>

          <div className="checkout__methods-grid">
            <div
              className={
                metodoPago === "tarjeta"
                  ? "checkout__method-card selected"
                  : "checkout__method-card"
              }
              onClick={function () {
                setMetodoPago("tarjeta");
              }}
            >
              <svg
                className="checkout__method-card-svg"
                viewBox="0 0 64 40"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="60" height="36" rx="5" ry="5" fill="#1a1f3a" />
                <rect x="2" y="11" width="60" height="6" fill="#0c1027" />
                <rect x="8" y="22" width="10" height="8" rx="1" ry="1" fill="#d4a76a" />
                <rect x="22" y="29" width="14" height="2" fill="#9ba3c0" />
                <rect x="40" y="29" width="14" height="2" fill="#9ba3c0" />
              </svg>
              <span className="checkout__method-label-text">Tarjeta</span>
            </div>
          </div>

          {metodoPago === "tarjeta" && (
            <RedsysCheckout
              carrito={items}
              datosComprador={form}
              total={totalConEnvio}
              onError={handleRedsysError}
            />
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

      {/* PASO 3: Resultado */}
      {step === 3 && (
        <div className="checkout__panel fade-up">
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
        </div>
      )}
    </div>
  );
}
