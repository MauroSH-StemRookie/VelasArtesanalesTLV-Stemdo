import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import './index.css'

/* ==========================================================================
   PUNTO DE ENTRADA
   ----------------
   El orden de los providers es importante:
   - HelmetProvider debe estar por fuera para que cualquier componente de la
     app pueda inyectar etiquetas <title>, <meta>, Open Graph, etc.
   - BrowserRouter va por dentro para exponer el router a toda la app.
   - AuthProvider y CartProvider se montan dentro de App.jsx (necesitan estar
     por dentro del router para que los hooks de navegacion funcionen si los
     llegaran a usar en el futuro).
   ========================================================================== */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
