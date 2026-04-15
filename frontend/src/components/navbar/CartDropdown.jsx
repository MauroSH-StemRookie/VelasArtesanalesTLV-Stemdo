import { useRef } from 'react';
import { useCart } from '../../context/CartContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import './CartDropdown.css';

export default function CartDropdown({ isOpen, onClose, onGoCheckout }) {
  const ref = useRef(null);
  const { items, updateCantidad, removeFromCart, totalPrecio } = useCart();

  useClickOutside(ref, onClose);

  if (!isOpen) return null;

  return (
    <div className="cart-dropdown" ref={ref}>
      <div className="cart-dropdown__header">
        <h3>Tu carrito</h3>
        <button className="cart-dropdown__close" onClick={onClose} aria-label="Cerrar carrito">
          ✕
        </button>
      </div>

      {items.length === 0 ? (
        <p className="cart-dropdown__empty">Tu carrito está vacío</p>
      ) : (
        <>
          <ul className="cart-dropdown__list">
            {items.map((item) => (
              <li key={item.id} className="cart-item">
                <div className="cart-item__info">
                  <span className="cart-item__name">{item.nombre}</span>
                  <span className="cart-item__desc">{item.descripcion}</span>
                </div>

                <div className="cart-item__controls">
                  <button
                    className="cart-item__btn"
                    onClick={() => updateCantidad(item.id, item.cantidad - 1)}
                    disabled={item.cantidad <= 1}
                    aria-label="Reducir cantidad"
                  >
                    −
                  </button>
                  <input
                    className="cart-item__qty"
                    type="number"
                    min="1"
                    max="99"
                    value={item.cantidad}
                    onChange={(e) => updateCantidad(item.id, e.target.value)}
                  />
                  <button
                    className="cart-item__btn"
                    onClick={() => updateCantidad(item.id, item.cantidad + 1)}
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>

                <div className="cart-item__right">
                  <span className="cart-item__price">
                    {(item.precio * item.cantidad).toFixed(2)} €
                  </span>
                  <button
                    className="cart-item__remove"
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Eliminar producto"
                  >
                    🗑
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart-dropdown__footer">
            <div className="cart-dropdown__total">
              <span>Total</span>
              <span className="cart-dropdown__total-price">
                {totalPrecio.toFixed(2)} €
              </span>
            </div>
            <button
              className="cart-dropdown__pay"
              onClick={() => {
                onClose();
                onGoCheckout();
              }}
            >
              Pagar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
