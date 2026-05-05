import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import App from "./App.jsx";
import "./index.css";

/* ==========================================================================
   PUNTO DE ENTRADA
   ----------------
   El orden de los providers es importante:
   - HelmetProvider debe estar por fuera para que cualquier componente de la
     app pueda inyectar etiquetas <title>, <meta>, Open Graph, etc.
   - BrowserRouter va por dentro para exponer el router a toda la app.
   - PayPalScriptProvider carga el SDK oficial de PayPal una sola vez a nivel
     global. Asi el <PayPalButtons> del CheckoutPage no tiene que esperar a
     cargar el script cada vez que el usuario llega al paso 2. El client-id
     viene de VITE_PAYPAL_CLIENT_ID (sandbox en desarrollo, live en prod).
   - AuthProvider y CartProvider se montan dentro de App.jsx (necesitan estar
     por dentro del router para que los hooks de navegacion funcionen si los
     llegaran a usar en el futuro).

   Configuracion del SDK de PayPal:
     - clientId: id de la app de PayPal (viene del .env del frontend).
     - currency: EUR (es un comercio en España).
     - intent: "capture" → cobramos al momento cuando se aprueba el pago
               (alternativa: "authorize" + captura diferida, no la usamos).
   ========================================================================== */
const PAYPAL_OPTIONS = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
  currency: "EUR",
  intent: "capture",
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <PayPalScriptProvider options={PAYPAL_OPTIONS}>
          <App />
        </PayPalScriptProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
