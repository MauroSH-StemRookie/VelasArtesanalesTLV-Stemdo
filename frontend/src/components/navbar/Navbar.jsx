import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { NAV_LINKS } from "../../data/staticData";
import { IconSearch, IconUser, IconCart, IconClose } from "../icons/Icons";
import CartDropdown from "./CartDropdown";
import UserDropdown from "./UserDropdown";
import logo from "../../assets/logo.png";
import SobreNosotros from "../about/SobreNosotros";

/* ==========================================================================
   NAVBAR — actualizada con busqueda funcional y navegacion al catalogo
   ---------------------------------------------------------------------
   - "Tienda" en los links de navegacion lleva al catalogo
   - La lupa abre una barra de busqueda; al hacer submit navega al catalogo
     con ese termino de busqueda
   - Si estamos en el catalogo, "Tienda" aparece como link activo
   ========================================================================== */
export default function Navbar({
  currentPage,
  onNavClick,
  onOpenAuth,
  onNavigate,
  onSearch,
}) {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Inicio");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  // Estado de la barra de busqueda
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Si la pagina actual es el catalogo, marcamos "Tienda" como activo
  useEffect(() => {
    if (currentPage === "catalog") setActiveLink("Tienda");
    else if (currentPage === "home") setActiveLink("Inicio");
  }, [currentPage]);

  function handleNavClick(link) {
    setActiveLink(link);
    setMenuOpen(false);

    // Si el usuario pulsa "Tienda", navegamos al catalogo
    if (link === "Tienda") {
      onNavigate("catalog");
      return;
    }
    if (link == "Personalizar") {
      onNavigate("custom");
      return;
    }

    if (link=="Contacto") {
      onNavigate("contact")

      return;
    }

    if(link=="Sobre Nosotros") {
      onNavigate("about")

      return;
    }

    // El resto de links de momento vuelven al home
    onNavClick(link);
  }

  function handleLogoClick(e) {
    e.preventDefault();
    onNavigate("home");
  }

  function handleNavLinkClick(e, link) {
    e.preventDefault();
    handleNavClick(link);
  }

  function handleCartCheckout() {
    setCartOpen(false);
    onNavigate("checkout");
  }

  // Cuando el usuario envia la busqueda (pulsa Enter o el boton)
  function handleSearchSubmit(e) {
    e.preventDefault();
    if (!searchText.trim()) return;
    // Cerramos la barra y navegamos al catalogo con el termino de busqueda
    setSearchOpen(false);
    onSearch(searchText.trim());
    setSearchText("");
  }

  return (
    <nav className={scrolled ? "navbar scrolled" : "navbar"}>
      <div className="navbar-inner">
        <a href="#" className="navbar-logo" onClick={handleLogoClick}>
          <img src={logo} alt="Artesanas de Velas" />
          <div className="navbar-logo-text">
            Artesanas de Velas
            <span>Talavera de la Reina</span>
          </div>
        </a>

        <ul className={menuOpen ? "navbar-links open" : "navbar-links"}>
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <a
                href="#"
                className={activeLink === link ? "active" : ""}
                onClick={(e) => handleNavLinkClick(e, link)}
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        <div className="navbar-actions">
          {/* Barra de busqueda expandible */}
          {searchOpen ? (
            <form className="navbar-search-bar" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Buscar velas..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                autoFocus
              />
              <button type="submit" className="nav-icon-btn" title="Buscar">
                <IconSearch />
              </button>
              <button
                type="button"
                className="nav-icon-btn"
                title="Cerrar"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchText("");
                }}
              >
                <IconClose />
              </button>
            </form>
          ) : (
            <button
              className="nav-icon-btn"
              title="Buscar"
              onClick={() => setSearchOpen(true)}
            >
              <IconSearch />
            </button>
          )}

          <div className="user-menu-wrapper">
            <button
              className="nav-icon-btn user-btn"
              title={user ? user.nombre : "Mi cuenta"}
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            >
              {user ? (
                <div className="user-avatar">
                  {user.nombre.charAt(0).toUpperCase()}
                </div>
              ) : (
                <IconUser />
              )}
            </button>
            {user && (
              <span
                className="user-name-nav"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                {user.nombre.split(" ")[0]}
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
            <button
              className="nav-icon-btn"
              title="Carrito"
              onClick={() => setCartOpen(!cartOpen)}
            >
              <IconCart />
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </button>
            <CartDropdown
              isOpen={cartOpen}
              onClose={() => setCartOpen(false)}
              onGoCheckout={handleCartCheckout}
            />
          </div>

          <button
            className={menuOpen ? "hamburger open" : "hamburger"}
            aria-label="Menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </nav>
  );
}
