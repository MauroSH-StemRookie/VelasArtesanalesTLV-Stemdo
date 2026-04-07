import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { NAV_LINKS } from '../../data/staticData'
import { IconSearch, IconUser, IconCart } from '../icons/Icons'
import CartDropdown from './CartDropdown'
import UserDropdown from './UserDropdown'
import logo from '../../assets/logo.png'

export default function Navbar({ currentPage, onNavClick, onOpenAuth, onNavigate }) {
  const { user } = useAuth()
  const { totalItems } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState('Inicio')
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  function handleNavClick(link) {
    setActiveLink(link)
    setMenuOpen(false)
    onNavClick(link)
  }

  function handleLogoClick(e) {
    e.preventDefault()
    onNavigate('home')
  }

  function handleNavLinkClick(e, link) {
    e.preventDefault()
    handleNavClick(link)
  }

  function handleCartCheckout() {
    setCartOpen(false)
    onNavigate('checkout')
  }

  return (
    <nav className={scrolled ? 'navbar scrolled' : 'navbar'}>
      <div className="navbar-inner">

        <a href="#" className="navbar-logo" onClick={handleLogoClick}>
          <img src={logo} alt="Artesanas de Velas" />
          <div className="navbar-logo-text">
            Artesanas de Velas
            <span>Talavera de la Reina</span>
          </div>
        </a>

        <ul className={menuOpen ? 'navbar-links open' : 'navbar-links'}>
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <a
                href="#"
                className={activeLink === link && currentPage === 'home' ? 'active' : ''}
                onClick={(e) => handleNavLinkClick(e, link)}
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        <div className="navbar-actions">

          <button className="nav-icon-btn" title="Buscar">
            <IconSearch />
          </button>

          <div className="user-menu-wrapper">
            <button
              className="nav-icon-btn user-btn"
              title={user ? user.nombre : 'Mi cuenta'}
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            >
              {user
                ? <div className="user-avatar">{user.nombre.charAt(0).toUpperCase()}</div>
                : <IconUser />
              }
            </button>
            {user && (
              <span className="user-name-nav" onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
                {user.nombre.split(' ')[0]}
              </span>
            )}
            <UserDropdown
              isOpen={userDropdownOpen}
              onClose={() => setUserDropdownOpen(false)}
              onOpenAuth={onOpenAuth}
              onNavigate={onNavigate}
            />
          </div>

          <div className="cart-menu-wrapper">
            <button className="nav-icon-btn" title="Carrito" onClick={() => setCartOpen(!cartOpen)}>
              <IconCart />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </button>
            <CartDropdown
              isOpen={cartOpen}
              onClose={() => setCartOpen(false)}
              onGoCheckout={handleCartCheckout}
            />
          </div>

          <button
            className={menuOpen ? 'hamburger open' : 'hamburger'}
            aria-label="Menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span /><span /><span />
          </button>

        </div>
      </div>
    </nav>
  )
}
