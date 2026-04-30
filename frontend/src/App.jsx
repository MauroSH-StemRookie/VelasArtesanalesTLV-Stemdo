import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import SEO from "./components/shared/SEO";
import Navbar from "./components/navbar/Navbar";
import AuthModal from "./components/auth/AuthModal";
import HomePage from "./components/home/HomePage";
import CatalogPage from "./components/catalog/CatalogPage";
import CustomCandlePage from "./components/custom/CustomCandlePage";
import AdminPanel from "./components/admin/AdminPanel";
import ProfilePage from "./components/profile/ProfilePage";
import HelpPage from "./components/help/HelpPage";
import OrdersPage from "./components/orders/OrdersPage";
import CheckoutPage from "./components/cart/CheckoutPage";
import PagoExitoPage from "./components/cart/PagoExitoPage";
import PagoErrorPage from "./components/cart/PagoErrorPage";
import Footer from "./components/footer/Footer";
import ContactPage from "./components/contact/Contact";
import SobreNosotros from "./components/about/SobreNosotros";
import NuestroTaller from "./components/workshop/NuestroTaller";
import AvisoLegal from "./components/legal/AvisoLegal";
import PoliticaPrivacidad from "./components/legal/PoliticaPrivacidad";
import Blog from "./components/blog/Blog";
import PoliticaCookies from "./components/legal/Cookies";
import RecuperarPasswordPage from "./components/recuperarPassword/RecuperarPasswordPage";

/* ==========================================================================
   APP — migrada a react-router-dom
   --------------------------------
   Antes la app usaba un useState "currentPage" y renderizaba la pagina
   activa con condicionales. Ahora cada pagina tiene su propia URL y se
   monta mediante <Routes>. Esto nos da:
   - URLs compartibles y con historial del navegador.
   - Cabeceras SEO por ruta (cada pagina monta su propio <SEO>).
   - Guards de acceso para /admin, /perfil y /pedidos.

   Rutas canonicas:
   /                 Home
   /catalogo         Catalogo (acepta ?q= para busqueda preseleccionada)
   /personalizar     Personaliza tu vela
   /checkout         Pasarela de pago
   /pago/exito       Aterrizaje tras pago con tarjeta aprobado (Redsys)
   /pago/error       Aterrizaje tras pago con tarjeta denegado (Redsys)
   /ayuda            FAQ y contacto
   /contacto         Formulario de contacto
   /sobre-nosotros   Pagina "Sobre nosotros"
   /aviso-legal      Terminos y condiciones
   /privacidad       Politica de privacidad
   /admin            Panel admin          (solo isAdmin)
   /perfil           Configuracion cuenta (solo user)
   /pedidos          Historial de pedidos (solo user)
   *                 Cualquier otra URL redirige a /

   Por que cada pagina monta su propio SEO:
   -  Mantiene la "fuente de verdad" cerca del contenido de la pagina,
      en lugar de acoplarlo al componente de rutas.
   -  Si algun dia se hace SSR/SSG, las cabeceras viajan con la pagina.
   -  Facilita que cada ruta tenga titulo y descripcion propios sin tocar
      este componente cuando se crea una pagina nueva.
   Aqui en App.jsx colocamos <SEO> directamente en el Route para cumplir
   con el requisito del paso 2, que pide que "cada ruta incluya su <SEO>
   con canonical a URL real". Asi queda todo el mapa SEO a la vista.
   ========================================================================== */

/* ── GUARDS ──────────────────────────────────────────────────────────────
   Componentes que envuelven rutas restringidas. Si el usuario no cumple
   la condicion, se redirige a la home. No se muestra un error ni una
   pantalla de "prohibido" porque la nav tampoco deberia exponer esos
   enlaces a usuarios sin permiso; este guard es una red de seguridad
   para accesos directos por URL o tras logout.
   ──────────────────────────────────────────────────────────────────────── */
function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

/* ── SCROLL AL CAMBIAR DE RUTA ───────────────────────────────────────────
   Antes el scroll al tope vivia en AppContent observando currentPage.
   Ahora escuchamos el pathname del router.
   ──────────────────────────────────────────────────────────────────────── */
function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return null;
}

/* ==========================================================================
   APP CONTENT
   ========================================================================== */
function AppContent() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");

  const openAuth = (tab) => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  return (
    <>
      <ScrollToTop />
      <Navbar onOpenAuth={openAuth} />

      <Routes>
        {/* ── Home ──────────────────────────────────────────────────── */}
        <Route
          path="/"
          element={
            <>
              <SEO
                canonical="/"
                description="Tienda local de velas artesanales en Talavera de la Reina. Velas aromaticas, decorativas, cirios y liturgicas elaboradas a mano con cera natural y aromas cuidadosamente seleccionados."
              />
              <HomePage />
            </>
          }
        />

        {/* ── Catalogo ──────────────────────────────────────────────── */}
        <Route
          path="/catalogo"
          element={
            <>
              <SEO
                title="Tienda de velas artesanales"
                canonical="/catalogo"
                description="Descubre toda nuestra coleccion de velas artesanales aromaticas, decorativas, cirios y liturgicas. Hechas a mano en Talavera de la Reina con cera natural y aromas exclusivos."
              />
              <CatalogPage />
            </>
          }
        />

        {/* ── Personaliza tu vela ───────────────────────────────────── */}
        <Route
          path="/personalizar"
          element={
            <>
              <SEO
                title="Personaliza tu vela"
                canonical="/personalizar"
                description="Disena tu propia vela artesanal para bodas, bautizos, comuniones o regalos. Elige tipo, aroma, color y dedicatoria y la elaboramos a mano en Talavera de la Reina."
              />
              <CustomCandlePage />
            </>
          }
        />

        {/* ── Checkout ──────────────────────────────────────────────── */}
        <Route
          path="/checkout"
          element={
            <>
              <SEO
                title="Finalizar compra"
                canonical="/checkout"
                description="Completa tu pedido de velas artesanales. Envio a domicilio y recogida local en Talavera de la Reina. Pago seguro con PayPal o tarjeta bancaria."
              />
              <CheckoutPage />
            </>
          }
        />

        {/* ── Pago con tarjeta — exito ──────────────────────────────
            Aterrizaje desde Redsys cuando el banco aprueba el pago
            (corresponde a REDSYS_SUCCESS_URL del backend). */}
        <Route
          path="/pago/exito"
          element={
            <>
              <SEO
                title="Pago realizado"
                canonical="/pago/exito"
                description="Tu pago con tarjeta ha sido aprobado. Hemos recibido tu pedido de velas artesanales y nos pondremos en contacto contigo."
              />
              <PagoExitoPage />
            </>
          }
        />

        {/* ── Pago con tarjeta — error ──────────────────────────────
            Aterrizaje desde Redsys cuando el banco deniega o el usuario
            cancela el pago (corresponde a REDSYS_ERROR_URL del backend). */}
        <Route
          path="/pago/error"
          element={
            <>
              <SEO
                title="Pago no completado"
                canonical="/pago/error"
                description="El pago con tarjeta no se ha completado. Puedes volver al catalogo e intentarlo de nuevo cuando quieras."
              />
              <PagoErrorPage />
            </>
          }
        />

        {/* ── Ayuda / FAQ ───────────────────────────────────────────── */}
        <Route
          path="/ayuda"
          element={
            <>
              <SEO
                title="Ayuda y preguntas frecuentes"
                canonical="/ayuda"
                description="Resuelve dudas sobre envios, devoluciones y personalizacion de velas artesanales. Contacto directo con el taller en Talavera de la Reina."
              />
              <HelpPage />
            </>
          }
        />

        {/* ── Recuperar contraseña ─────────────────────────────── */}
        <Route
          path="/recuperar-password"
          element={
            <>
              <SEO
                title="Recuperar contraseña"
                canonical="/recuperar-password"
                description="Restablece tu contraseña de acceso a la tienda de Velas Artesanales."
              />
              <RecuperarPasswordPage />
            </>
          }
        />

        {/* ── Contacto ──────────────────────────────────────────────── */}
        <Route
          path="/contacto"
          element={
            <>
              <SEO
                title="Contacto"
                canonical="/contacto"
                description="Ponte en contacto con Artesanas de Velas en Talavera de la Reina. Escribenos por correo o llamanos para pedidos personalizados."
              />
              <ContactPage />
            </>
          }
        />

        {/* ── Sobre nosotros ────────────────────────────────────────── */}
        <Route
          path="/sobre-nosotros"
          element={
            <>
              <SEO
                title="Sobre nosotros"
                canonical="/sobre-nosotros"
                description="Conoce la historia de Artesanas de Velas, un taller artesanal de Talavera de la Reina dedicado a elaborar velas a mano con cera natural y aromas exclusivos."
              />
              <SobreNosotros />
            </>
          }
        />

        {/* ── Nuestro taller ────────────────────────────────────────── */}
        <Route
          path="/nuestro-taller"
          element={
            <>
              <SEO
                title="Nuestro taller"
                canonical="/nuestro-taller"
                description="En nuestro taller damos vida a cada vela de forma artesanal, cuidando cada detalle desde la selección de materiales hasta el acabado final."
              />
              <NuestroTaller />
            </>
          }
        />

        {/* ── Blog ────────────────────────────────────────── */}
        <Route
          path="/blog"
          element={
            <>
              <SEO
                title="Blog"
                canonical="/blog"
                description="Un espacio dedicado a la creación artesanal de velas, donde compartimos nuestro proceso, inspiración y el cuidado detrás de cada pieza hecha a mano."
              />
              <Blog />
            </>
          }
        />

        {/* ── Aviso legal ───────────────────────────────────────────── */}
        <Route
          path="/aviso-legal"
          element={
            <>
              <SEO
                title="Aviso legal"
                canonical="/aviso-legal"
                description="Condiciones generales de uso y aviso legal del sitio web de Artesanas de Velas, Talavera de la Reina."
              />
              <AvisoLegal />
            </>
          }
        />

        {/* ── Politica de privacidad ────────────────────────────────── */}
        <Route
          path="/privacidad"
          element={
            <>
              <SEO
                title="Politica de privacidad"
                canonical="/privacidad"
                description="Politica de privacidad y tratamiento de datos personales de Artesanas de Velas, Talavera de la Reina."
              />
              <PoliticaPrivacidad />
            </>
          }
        />
        {/* ── Politica de Cookies ────────────────────────────────── */}
        <Route
          path="/cookies"
          element={
            <>
              <SEO
                title="Politica de Cookies"
                canonical="/cookies"
                description="Politica de Cookies y tratamiento de datos personales de Artesanas de Velas, Talavera de la Reina."
              />
              <PoliticaCookies />
            </>
          }
        />

        {/* ── Admin (solo tipo === 1) ───────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <SEO
                title="Panel de administracion"
                canonical="/admin"
                description="Panel privado de administracion de Artesanas de Velas."
              />
              <AdminPanel />
            </RequireAdmin>
          }
        />

        {/* ── Perfil (requiere sesion) ──────────────────────────────── */}
        <Route
          path="/perfil"
          element={
            <RequireAuth>
              <SEO
                title="Mi perfil"
                canonical="/perfil"
                description="Configura tus datos personales, direccion y preferencias de cuenta en Artesanas de Velas."
              />
              <ProfilePage />
            </RequireAuth>
          }
        />

        {/* ── Pedidos (requiere sesion) ─────────────────────────────── */}
        <Route
          path="/pedidos"
          element={
            <RequireAuth>
              <SEO
                title="Mis pedidos"
                canonical="/pedidos"
                description="Consulta el estado y el historial de tus pedidos de velas artesanales."
              />
              <OrdersPage />
            </RequireAuth>
          }
        />

        {/* ── 404 → redirige a la home ──────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />

      {/* ── WhatsApp flotante ────────────────────────────────────────── */}
      <WhatsAppButton />
    </>
  );
}
/* ==========================================================================
   WHATSAPP — componente propio con estado React (sin getElementById)
   ========================================================================== */
function WhatsAppButton() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="whatsapp-container">
      <a
        href="https://wa.me/34640727283?text=Hola%20me%20interesan%20vuestras%20velas%20"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-btn"
        aria-label="Contactar por WhatsApp"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp"
          width="32"
          height="32"
        />
      </a>

      <button
        className="whatsapp-close"
        onClick={() => setVisible(false)}
        aria-label="Cerrar WhatsApp"
      >
        ×
      </button>
    </div>
  );
}
/* ==========================================================================
   APP ROOT
   -----------
   HelmetProvider ahora esta en main.jsx, por fuera de BrowserRouter.
   Aqui solo montamos los providers que dependen del DOM de la app.
   ========================================================================== */
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
