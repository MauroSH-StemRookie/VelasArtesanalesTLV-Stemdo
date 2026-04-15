import { useState, useEffect } from "react";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
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
import Footer from "./components/footer/Footer";
// ── Nuevas páginas integradas desde el merge ──────────────────────────────
import ContactPage from "./components/contact/Contact";
import SobreNosotros from "./components/about/SobreNosotros";
import AvisoLegal from "./components/legal/AvisoLegal";
import PoliticaPrivacidad from "./components/legal/PoliticaPrivacidad";

/* ==========================================================================
   APP CONTENT
   ========================================================================== */
function AppContent() {
  const { user, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const openAuth = (tab) => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };
  const goHome = () => setCurrentPage("home");

  function handleSearch(query) {
    setSearchQuery(query);
    setCurrentPage("catalog");
  }

  function navigateTo(page) {
    if (page === "catalog") setSearchQuery("");
    setCurrentPage(page);
  }

  return (
    <>
      <Navbar
        currentPage={currentPage}
        onNavClick={goHome}
        onOpenAuth={openAuth}
        onNavigate={navigateTo}
        onSearch={handleSearch}
      />

      {/* ── Páginas principales ─────────────────────────────────────────── */}
      {currentPage === "home" && <HomePage onNavigate={navigateTo} />}
      {currentPage === "catalog" && <CatalogPage initialSearch={searchQuery} />}
      {currentPage === "custom" && <CustomCandlePage onBack={goHome} />}
      {currentPage === "admin" && isAdmin && <AdminPanel onBack={goHome} />}
      {currentPage === "profile" && user && <ProfilePage onBack={goHome} />}
      {currentPage === "help" && <HelpPage onBack={goHome} />}
      {currentPage === "orders" && user && <OrdersPage onBack={goHome} />}
      {currentPage === "checkout" && (
        <CheckoutPage user={user} onNavigate={navigateTo} />
      )}

      {/* ── Nuevas páginas del merge ─────────────────────────────────────── */}
      {currentPage === "contact" && (
        <ContactPage onBack={goHome} onNavigate={navigateTo} />
      )}
      {currentPage === "about" && (
        <SobreNosotros onBack={goHome} onNavigate={navigateTo} />
      )}
      {currentPage === "legal" && <AvisoLegal onBack={goHome} />}
      {currentPage === "privacidad" && <PoliticaPrivacidad onBack={goHome} />}

      <Footer onNavigate={navigateTo} />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />

      {/* ── WhatsApp flotante ────────────────────────────────────────────── */}
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
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16 .396C7.163.396 0 7.559 0 16.396c0 2.885.756 5.59 2.077 7.94L0 32l7.856-2.056A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16.004C32 7.559 24.837.396 16 .396z" />
        </svg>
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
