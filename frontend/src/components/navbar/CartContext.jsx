import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

/* ==========================================================================
   CONTEXTO DEL CARRITO
   --------------------
   Gestiona los productos anadidos al carrito. Ahora escucha los cambios
   de sesion: cuando el usuario cierra sesion (o cambia de cuenta),
   el carrito se vacia automaticamente.
   ========================================================================== */
const CartContext = createContext();

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  // Cuando cambia el usuario (login, logout, cambio de cuenta),
  // vaciamos el carrito para que no se mezclen productos entre sesiones
  useEffect(() => {
    setItems([]);
  }, [user?.id]);

  const addToCart = useCallback((producto) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === producto.id);
      if (existing) {
        return prev.map((i) =>
          i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  }, []);

  const updateCantidad = useCallback((id, cantidad) => {
    const n = Math.max(1, Math.min(99, Number(cantidad) || 1));
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, cantidad: n } : i))
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0);
  const totalPrecio = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, updateCantidad, removeFromCart, clearCart, totalItems, totalPrecio }}
    >
      {children}
    </CartContext.Provider>
  );
}
