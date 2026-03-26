import { useState, useEffect } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/navbar/Navbar'
import AuthModal from './components/auth/AuthModal'
import HomePage from './components/home/HomePage'
import AdminPanel from './components/admin/AdminPanel'
import ProfilePage from './components/profile/ProfilePage'
import HelpPage from './components/help/HelpPage'
import OrdersPage from './components/orders/OrdersPage'
import Footer from './components/footer/Footer'

/* ==========================================================================
   APP CONTENT — orquesta toda la app
   -----------------------------------
   Maneja que "pagina" se muestra y controla modales + navegacion.
   Este componente esta dentro del AuthProvider, asi que puede usar useAuth().
   ========================================================================== */
function AppContent() {
  const { user, isAdmin } = useAuth()

  // Sistema de "paginas" sencillo. Se puede migrar a React Router facilmente.
  const [currentPage, setCurrentPage] = useState('home')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState('login')

  // Al cambiar de pagina, scroll arriba
  useEffect(() => { window.scrollTo(0, 0) }, [currentPage])

  const openAuth = (tab) => { setAuthModalTab(tab); setAuthModalOpen(true) }
  const goHome = () => setCurrentPage('home')

  return (
    <>
      <Navbar
        currentPage={currentPage}
        onNavClick={() => setCurrentPage('home')}
        onOpenAuth={openAuth}
        onNavigate={setCurrentPage}
      />

      {currentPage === 'home' && <HomePage />}
      {currentPage === 'admin' && isAdmin && <AdminPanel onBack={goHome} />}
      {currentPage === 'profile' && user && <ProfilePage onBack={goHome} />}
      {currentPage === 'help' && <HelpPage onBack={goHome} />}
      {currentPage === 'orders' && user && <OrdersPage onBack={goHome} />}

      <Footer onNavigate={setCurrentPage} />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialTab={authModalTab} />
    </>
  )
}

/* ==========================================================================
   APP — componente raiz envuelto en AuthProvider
   ========================================================================== */
function App() {
  return (<AuthProvider><AppContent /></AuthProvider>)
}

export default App
