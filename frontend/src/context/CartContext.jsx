import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext();

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

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

  /* TODO BACKEND: sincronizar carrito con /api/carrito si el usuario está logueado */

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateCantidad,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrecio,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
