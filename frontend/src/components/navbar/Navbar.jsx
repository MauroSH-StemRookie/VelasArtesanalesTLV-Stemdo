import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { NAV_LINKS } from '../../data/staticData'
import { IconSearch, IconUser, IconCart } from '../icons/Icons'
import { useCart } from '../../context/CartContext'
import CartDropdown from './CartDropdown'
import UserDropdown from './UserDropdown'
import logo from '../../assets/logo.png'

/* ==========================================================================
   NAVBAR — barra de navegacion fija con glassmorphism
   ========================================================================== */
export default function Navbar({ currentPage, onNavClick, onOpenAuth, onNavigate }) {
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState('Inicio')
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  const handleNavClick = (link) => { setActiveLink(link); setMenuOpen(false); onNavClick(link) }

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="navbar-inner">
        <a href="#" className="navbar-logo" onClick={(e) => { e.preventDefault(); onNavigate('home') }}>
          <img src={logo} alt="Artesanas de Velas" />
          <div className="navbar-logo-text">Artesanas de Velas<span>Talavera de la Reina</span></div>
        </a>
        <ul className={`navbar-links${menuOpen ? ' open' : ''}`}>
          {NAV_LINKS.map((link) => (<li key={link}><a href="#" className={activeLink === link && currentPage === 'home' ? 'active' : ''} onClick={(e) => { e.preventDefault(); handleNavClick(link) }}>{link}</a></li>))}
        </ul>
        <div className="navbar-actions">
          <button className="nav-icon-btn" title="Buscar"><IconSearch /></button>
          <div className="user-menu-wrapper">
            <button className="nav-icon-btn user-btn" title={user ? user.nombre : 'Mi cuenta'} onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
              {user ? <div className="user-avatar">{user.nombre.charAt(0).toUpperCase()}</div> : <IconUser />}
            </button>
            {user && <span className="user-name-nav" onClick={() => setUserDropdownOpen(!userDropdownOpen)}>{user.nombre.split(' ')[0]}</span>}
            <UserDropdown isOpen={userDropdownOpen} onClose={() => setUserDropdownOpen(false)} onOpenAuth={onOpenAuth} onNavigate={onNavigate} />
          </div>
          <button className="nav-icon-btn" title="Carrito"><IconCart /><span className="cart-badge">2</span></button>
          <button className={`hamburger${menuOpen ? ' open' : ''}`} aria-label="Menu" onClick={() => setMenuOpen(!menuOpen)}><span /><span /><span /></button>
        </div>
      </div>
    </nav>
  )
}
