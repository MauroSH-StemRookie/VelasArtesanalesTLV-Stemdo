import { useState } from 'react';
import { useCart } from '../context/CartContext';
import './CheckoutPage.css';

/* ─────────────────────────────────────────────────────────
   CheckoutPage – 3 pasos:
     1. Datos del cliente (registrado o invitado)
     2. Dirección + método de pago
     3. Resultado del pago
   ───────────────────────────────────────────────────────── */

const STEP_LABELS = ['Datos', 'Envío y pago', 'Confirmación'];

const EMPTY_FORM = {
  nombre: '',
  direccion: '',
  telefono: '',
  email: '',
};

export default function CheckoutPage({ user, onNavigate }) {
  const { items, totalPrecio, clearCart } = useCart();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(
    user
      ? {
          nombre: user.nombre || '',
          direccion: user.direccion || '',
          telefono: user.telefono || '',
          email: user.email || '',
        }
      : { ...EMPTY_FORM }
  );
  const [metodoPago, setMetodoPago] = useState('');
  const [addressWarning, setAddressWarning] = useState('');
  const [paymentResult, setPaymentResult] = useState(null); // 'success' | 'error'
  const [createdOrder, setCreatedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ── Helpers ─────────────────────────────── */

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isStep1Valid = () =>
    form.nombre.trim() &&
    form.direccion.trim() &&
    form.telefono.trim() &&
    form.email.trim() &&
    /\S+@\S+\.\S+/.test(form.email);

  const checkTalavera = (direccion) => {
    const d = direccion.toLowerCase();
    return (
      d.includes('talavera') ||
      d.includes('45600') /* CP de Talavera de la Reina */
    );
  };

  /* ── Step transitions ────────────────────── */

  const goToStep2 = () => {
    if (!isStep1Valid()) return;
    const isTalavera = checkTalavera(form.direccion);
    setAddressWarning(
      isTalavera
        ? ''
        : 'La dirección no parece ser de Talavera de la Reina. El envío podría tener un coste extra o no estar disponible.'
    );
    setStep(2);
  };

  const goToStep3 = async () => {
    if (!metodoPago) return;
    setLoading(true);

   const response = await fetch('http://localhost:3000/api/pedidos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: items.map(i => ({ producto_id: i.id, cantidad: i.cantidad })),
    datos_cliente: form,
    metodo_pago: metodoPago,
    total: totalPrecio,
    usuario_id: user?.id || null,
  }),
});
const data = await response.json();

if (data.ok) {
  setCreatedOrder(data.pedido);
  setPaymentResult('success');
  clearCart();
} else {
  setPaymentResult('error');
}

    // --- Simulación mientras no hay backend ---
    await new Promise((r) => setTimeout(r, 1200));
    const simulatedSuccess = Math.random() > 0.15; // 85% éxito

    if (simulatedSuccess) {
      const order = {
        id: `PED-${Date.now().toString(36).toUpperCase()}`,
        fecha: new Date().toISOString(),
        estado: 'Confirmado',
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
      setPaymentResult('success');
      clearCart();
    } else {
      setPaymentResult('error');
    }
    // --- Fin simulación ---

    setLoading(false);
    setStep(3);
  };

  /* ── Render guards ───────────────────────── */

  if (items.length === 0 && step < 3) {
    return (
      <div className="checkout">
        <div className="checkout__empty">
          <span className="checkout__empty-icon">🛒</span>
          <p>Tu carrito está vacío</p>
          <button className="checkout__btn" onClick={() => onNavigate('catalogo')}>
            Ver catálogo
          </button>
        </div>
      </div>
    );
  }

  /* ── Render ──────────────────────────────── */

  return (
    <div className="checkout">
      {/* ── Progress bar ── */}
      <div className="checkout__progress">
        {STEP_LABELS.map((label, i) => {
          const num = i + 1;
          const done = step > num;
          const active = step === num;
          return (
            <div
              key={num}
              className={`checkout__step-indicator ${active ? 'active' : ''} ${done ? 'done' : ''}`}
            >
              <div className="checkout__step-circle">
                {done ? '✓' : num}
              </div>
              <span className="checkout__step-label">{label}</span>
              {i < STEP_LABELS.length - 1 && <div className="checkout__step-line" />}
            </div>
          );
        })}
      </div>

      {/* ══════════ PASO 1 ══════════ */}
      {step === 1 && (
        <div className="checkout__panel fade-up">
          <h2 className="checkout__title">Tus datos</h2>
          {user && (
            <p className="checkout__subtitle">
              Hemos rellenado tus datos. Revísalos antes de continuar.
            </p>
          )}

          <div className="checkout__form">
            <label className="checkout__label">
              <span>Nombre completo</span>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej: María García López"
                className="checkout__input"
              />
            </label>

            <label className="checkout__label">
              <span>Dirección de envío</span>
              <input
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Calle, número, CP, ciudad"
                className="checkout__input"
              />
            </label>

            <div className="checkout__row">
              <label className="checkout__label">
                <span>Teléfono</span>
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
              onClick={() => onNavigate('catalogo')}
            >
              ← Volver al catálogo
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

      {/* ══════════ PASO 2 ══════════ */}
      {step === 2 && (
        <div className="checkout__panel fade-up">
          <h2 className="checkout__title">Envío y método de pago</h2>

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
                  <span>{item.nombre} × {item.cantidad}</span>
                  <span>{(item.precio * item.cantidad).toFixed(2)} €</span>
                </li>
              ))}
            </ul>
            <div className="checkout__summary-total">
              <span>Total</span>
              <span>{totalPrecio.toFixed(2)} €</span>
            </div>
          </div>

          {/* Método de pago */}
          <div className="checkout__payment-methods">
            <h3>Método de pago</h3>
            <div className="checkout__methods-grid">
              <button
                className={`checkout__method ${metodoPago === 'paypal' ? 'selected' : ''}`}
                onClick={() => setMetodoPago('paypal')}
              >
                <span className="checkout__method-icon">🅿️</span>
                <span>PayPal</span>
              </button>
              <button
                className={`checkout__method ${metodoPago === 'bizum' ? 'selected' : ''}`}
                onClick={() => setMetodoPago('bizum')}
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
              ← Atrás
            </button>
            <button
              className="checkout__btn"
              onClick={goToStep3}
              disabled={!metodoPago || loading}
            >
              {loading ? 'Procesando…' : `Pagar ${totalPrecio.toFixed(2)} €`}
            </button>
          </div>
        </div>
      )}

      {/* ══════════ PASO 3 ══════════ */}
      {step === 3 && (
        <div className="checkout__panel fade-up">
          {paymentResult === 'success' ? (
            <div className="checkout__result checkout__result--ok">
              <div className="checkout__result-icon">✅</div>
              <h2>¡Pago realizado con éxito!</h2>
              <p>
                Pedido <strong>{createdOrder?.id}</strong> confirmado.
                Recibirás un correo de confirmación en <strong>{form.email}</strong>.
              </p>

              <div className="checkout__order-recap">
                <h4>Detalles del pedido</h4>
                <ul>
                  {createdOrder?.items.map((it, i) => (
                    <li key={i}>
                      {it.nombre} × {it.cantidad} — {(it.precio * it.cantidad).toFixed(2)} €
                    </li>
                  ))}
                </ul>
                <p className="checkout__order-total">
                  Total: <strong>{createdOrder?.total.toFixed(2)} €</strong>
                </p>
                <p className="checkout__order-method">
                  Pagado con <strong>{createdOrder?.metodoPago === 'paypal' ? 'PayPal' : 'Bizum'}</strong>
                </p>
              </div>

              <button
                className="checkout__btn"
                onClick={() => onNavigate('pedidos')}
              >
                Ver mis pedidos →
              </button>
            </div>
          ) : (
            <div className="checkout__result checkout__result--error">
              <div className="checkout__result-icon">❌</div>
              <h2>Error en el pago</h2>
              <p>No se pudo procesar tu pago. Por favor, inténtalo de nuevo.</p>
              <div className="checkout__actions">
                <button
                  className="checkout__btn checkout__btn--secondary"
                  onClick={() => { setStep(2); setPaymentResult(null); }}
                >
                  ← Reintentar
                </button>
                <button
                  className="checkout__btn"
                  onClick={() => onNavigate('home')}
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
