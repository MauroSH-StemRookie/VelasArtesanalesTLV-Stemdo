import { useState } from "react";
import { useCart } from "../../context/CartContext";
import "./CheckoutPage.css";
import { useAuth } from "../../context/AuthContext";

/* ==========================================================================
   CheckoutPage — 3 pasos: Datos, Envio+Pago, Confirmacion
   ---------------------------------------------------------
   FIX PRINCIPAL: Antes habia codigo de simulacion DESPUES del fetch real,
   lo que hacía que el paso 3 apareciera y desapareciera al instante.
   Ahora solo usamos la simulacion (el backend de pedidos aun es placeholder).
   Cuando la API de pedidos este lista, se descomenta el fetch y se quita
   la simulacion.
   ========================================================================== */

const STEP_LABELS = ["Datos", "Envio y pago", "Confirmacion"];
const EMPTY_FORM = { nombre: "", telefono: "", email: "" };

export default function CheckoutPage({ onNavigate }) {
  const { items, totalPrecio, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(
    user
      ? {
          nombre: user.nombre || "",
          direccion: user.direccion || "",
          telefono: user.telefono || "",
          email: user.correo || "",
        }
      : { ...EMPTY_FORM },
  );
  const [metodoPago, setMetodoPago] = useState("");
  const [addressWarning, setAddressWarning] = useState("");
  const [paymentResult, setPaymentResult] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const isStep1Valid = () =>
    form.nombre.trim() &&
    form.direccion.trim() &&
    form.telefono.trim() &&
    form.email.trim() &&
    /\S+@\S+\.\S+/.test(form.email);

  const checkTalavera = (d) => {
    const low = d.toLowerCase();
    return low.includes("talavera") || low.includes("45600");
  };

  const goToStep2 = () => {
    if (!isStep1Valid()) return;
    setAddressWarning(
      checkTalavera(form.direccion)
        ? ""
        : "La direccion no parece ser de Talavera de la Reina. El envio podria tener un coste extra.",
    );
    setStep(2);
  };

  // Procesar el pago y mostrar el resultado
  const goToStep3 = async () => {
    if (!metodoPago) return;
    setLoading(true);

    // TODO BACKEND: Cuando la API de pedidos este lista, descomentar este bloque
    // y eliminar la simulacion de abajo:
    //
    // try {
    //   const data = await pedidosAPI.create({
    //     items: items.map(i => ({ producto_id: i.id, cantidad: i.cantidad })),
    //     datos_cliente: form,
    //     metodo_pago: metodoPago,
    //     total: totalPrecio,
    //     usuario_id: user?.id || null,
    //   });
    //   setCreatedOrder(data.pedido);
    //   setPaymentResult('success');
    //   clearCart();
    // } catch (err) {
    //   setPaymentResult('error');
    // }

    // --- Simulacion temporal (quitar cuando el backend de pedidos funcione) ---
    await new Promise((r) => setTimeout(r, 1500));
    const simulatedSuccess = Math.random() > 0.15;

    if (simulatedSuccess) {
      const order = {
        id: `PED-${Date.now().toString(36).toUpperCase()}`,
        fecha: new Date().toISOString(),
        estado: "Confirmado",
        items: items.map((i) => ({
          nombre: i.nombre,
          cantidad: i.cantidad,
          precio: i.precio,
        })),
        total: totalPrecio,
        metodoPago,
        datosCliente: { ...form },
      };
      setCreatedOrder(order);
      setPaymentResult("success");
      clearCart();
    } else {
      setPaymentResult("error");
    }
    // --- Fin simulacion ---

    setLoading(false);
    setStep(3);
  };

  // Si el carrito esta vacio y no estamos en el paso 3 (confirmacion)
  if (items.length === 0 && step < 3) {
    return (
      <div className="checkout">
        <div className="checkout__empty">
          <span className="checkout__empty-icon">🛒</span>
          <p>Tu carrito esta vacio</p>
          <button
            className="checkout__btn"
            onClick={() => onNavigate("catalog")}
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
        {STEP_LABELS.map((label, i) => {
          const num = i + 1;
          return (
            <div
              key={num}
              className={`checkout__step-indicator ${step === num ? "active" : ""} ${step > num ? "done" : ""}`}
            >
              <div className="checkout__step-circle">
                {step > num ? "\u2713" : num}
              </div>
              <span className="checkout__step-label">{label}</span>
              {i < STEP_LABELS.length - 1 && (
                <div className="checkout__step-line" />
              )}
            </div>
          );
        })}
      </div>

      {/* ══════════ PASO 1: Datos del cliente ══════════ */}
      {step === 1 && (
        <div className="checkout__panel fade-up">
          <h2 className="checkout__title">Tus datos</h2>
          {user && (
            <p className="checkout__subtitle">
              Hemos rellenado tus datos. Revisalos antes de continuar.
            </p>
          )}
          <div className="checkout__form">
            <label className="checkout__label">
              <span>Nombre completo</span>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej: Maria Garcia Lopez"
                className="checkout__input"
              />
            </label>
            <label className="checkout__label">
              <span>Direccion de envio</span>
              <input
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Calle, numero, CP, ciudad"
                className="checkout__input"
              />
            </label>
            <div className="checkout__row">
              <label className="checkout__label">
                <span>Telefono</span>
                <input
                  name="telefono"
                  type="tel"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="600 123 456"
                  className="checkout__input"
                />
              </label>
              <label className="checkout__label">
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="maria@correo.com"
                  className="checkout__input"
                />
              </label>
            </div>
          </div>
          <div className="checkout__actions">
            <button
              className="checkout__btn checkout__btn--secondary"
              onClick={() => onNavigate("catalog")}
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

      {/* ══════════ PASO 2: Envio y metodo de pago ══════════ */}
      {step === 2 && (
        <div className="checkout__panel fade-up">
          <h2 className="checkout__title">Envio y metodo de pago</h2>
          {addressWarning && (
            <div className="checkout__warning">
              <span className="checkout__warning-icon">⚠️</span>
              {addressWarning}
            </div>
          )}
          {/* Resumen del pedido */}
          <div className="checkout__summary">
            <h3>Resumen del pedido</h3>
            <ul className="checkout__summary-list">
              {items.map((item) => (
                <li key={item.id}>
                  <span>
                    {item.nombre} x {item.cantidad}
                  </span>
                  <span>{(item.precio * item.cantidad).toFixed(2)} &euro;</span>
                </li>
              ))}
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
                className={`checkout__method ${metodoPago === "paypal" ? "selected" : ""}`}
                onClick={() => setMetodoPago("paypal")}
              >
                <span className="checkout__method-icon">🅿️</span>
                <span>PayPal</span>
              </button>
              <button
                className={`checkout__method ${metodoPago === "bizum" ? "selected" : ""}`}
                onClick={() => setMetodoPago("bizum")}
              >
                <span className="checkout__method-icon">📱</span>
                <span>Bizum</span>
              </button>
            </div>
          </div>
          <div className="checkout__actions">
            <button
              className="checkout__btn checkout__btn--secondary"
              onClick={() => setStep(1)}
            >
              &larr; Atras
            </button>
            <button
              className="checkout__btn"
              onClick={goToStep3}
              disabled={!metodoPago || loading}
            >
              {loading
                ? "Procesando..."
                : `Pagar ${totalPrecio.toFixed(2)} \u20AC`}
            </button>
          </div>
        </div>
      )}

      {/* ══════════ PASO 3: Resultado ══════════ */}
      {step === 3 && (
        <div className="checkout__panel fade-up">
          {paymentResult === "success" ? (
            <div className="checkout__result checkout__result--ok">
              <div className="checkout__result-icon">✅</div>
              <h2>Pago realizado con exito!</h2>
              <p>
                Pedido <strong>{createdOrder?.id}</strong> confirmado. Recibiras
                un correo en <strong>{form.email}</strong>.
              </p>
              <div className="checkout__order-recap">
                <h4>Detalles del pedido</h4>
                <ul>
                  {createdOrder?.items.map((it, i) => (
                    <li key={i}>
                      {it.nombre} x {it.cantidad} —{" "}
                      {(it.precio * it.cantidad).toFixed(2)} &euro;
                    </li>
                  ))}
                </ul>
                <p className="checkout__order-total">
                  Total:{" "}
                  <strong>{createdOrder?.total.toFixed(2)} &euro;</strong>
                </p>
                <p className="checkout__order-method">
                  Pagado con{" "}
                  <strong>
                    {createdOrder?.metodoPago === "paypal" ? "PayPal" : "Bizum"}
                  </strong>
                </p>
              </div>
              <div className="checkout__actions">
                <button
                  className="checkout__btn"
                  onClick={() => onNavigate("orders")}
                >
                  Ver mis pedidos &rarr;
                </button>
                <button
                  className="checkout__btn checkout__btn--secondary"
                  onClick={() => onNavigate("home")}
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          ) : (
            <div className="checkout__result checkout__result--error">
              <div className="checkout__result-icon">❌</div>
              <h2>Error en el pago</h2>
              <p>No se pudo procesar tu pago. Por favor, intentalo de nuevo.</p>
              <div className="checkout__actions">
                <button
                  className="checkout__btn checkout__btn--secondary"
                  onClick={() => {
                    setStep(2);
                    setPaymentResult(null);
                  }}
                >
                  &larr; Reintentar
                </button>
                <button
                  className="checkout__btn"
                  onClick={() => onNavigate("home")}
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
