import { useState, useEffect } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/navbar/Navbar'
import AuthModal from './components/auth/AuthModal'
import HomePage from './components/home/HomePage'
import CatalogPage from './components/catalog/CatalogPage'
import AdminPanel from './components/admin/AdminPanel'
import ProfilePage from './components/profile/ProfilePage'
import HelpPage from './components/help/HelpPage'
import OrdersPage from './components/orders/OrdersPage'
import CheckoutPage from './components/cart/CheckoutPage'
import Footer from './components/footer/Footer'

/* ==========================================================================
   APP CONTENT — orquesta toda la app
   -----------------------------------
   Gestiona que "pagina" se muestra y el estado compartido como la busqueda.
   La busqueda vive aqui arriba porque la Navbar la dispara y el CatalogPage
   la consume, asi que el estado tiene que estar en un nivel superior a ambos.
   ========================================================================== */
function AppContent() {
  const { user, isAdmin } = useAuth()

  const [currentPage, setCurrentPage] = useState('home')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState('login')

  // Estado de busqueda: cuando el usuario escribe en la barra de la navbar
  // y pulsa enter, guardamos el texto aqui y navegamos al catalogo
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => { window.scrollTo(0, 0) }, [currentPage])

  const openAuth = (tab) => { setAuthModalTab(tab); setAuthModalOpen(true) }
  const goHome = () => setCurrentPage('home')

  // Cuando la navbar envia una busqueda, la guardamos y vamos al catalogo
  function handleSearch(query) {
    setSearchQuery(query)
    setCurrentPage('catalog')
  }

  // Navegar al catalogo (desde "Tienda" en la navbar o "Ver Coleccion" en home)
  function navigateTo(page) {
    // Si navegamos al catalogo sin busqueda, limpiamos el termino anterior
    if (page === 'catalog') setSearchQuery('')
    setCurrentPage(page)
  }

  return (
    <>
      <Navbar
        currentPage={currentPage}
        onNavClick={() => setCurrentPage('home')}
        onOpenAuth={openAuth}
        onNavigate={navigateTo}
        onSearch={handleSearch}
      />

      {currentPage === 'home'     && <HomePage onNavigate={navigateTo} />}
      {currentPage === 'catalog'  && <CatalogPage initialSearch={searchQuery} />}
      {currentPage === 'admin'    && isAdmin && <AdminPanel onBack={goHome} />}
      {currentPage === 'profile'  && user && <ProfilePage onBack={goHome} />}
      {currentPage === 'help'     && <HelpPage onBack={goHome} />}
      {currentPage === 'orders'   && user && <OrdersPage onBack={goHome} />}
      {currentPage === 'checkout' && <CheckoutPage user={user} onNavigate={navigateTo} />}

      <Footer onNavigate={navigateTo} />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </>
  )
}

/* ==========================================================================
   APP — componente raiz envuelto en AuthProvider + CartProvider
   ========================================================================== */
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  )
}

export default App
