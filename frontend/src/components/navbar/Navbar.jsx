import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { NAV_LINKS } from "../../data/staticData";
import { IconSearch, IconUser, IconCart, IconClose } from "../icons/Icons";
import CartDropdown from "./CartDropdown";
import UserDropdown from "./UserDropdown";
import logo from "../../assets/logo.png";

/* ==========================================================================
   NAVBAR — migrada a react-router-dom
   -----------------------------------
   La navegacion ya no viaja por props desde App.jsx. Usamos:
   - useNavigate() para navegacion programatica (p. ej. submit del formulario
     de busqueda, clicks del menu, click en el logo).
   - useLocation() para saber en que ruta estamos y resaltar el link activo.

   La barra de busqueda sigue haciendo exactamente lo mismo que antes: al
   enviar, se navega al catalogo pasando el termino en la query string ?q=.
   CatalogPage lee ese parametro y lo usa como semilla del filtro de texto,
   que es lo que antes hacia el prop "initialSearch".
   ========================================================================== */
export default function Navbar({ onOpenAuth }) {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

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

  /* Sincroniza el link activo con la ruta actual. Mantenemos la misma logica
     que tenia el Navbar con el viejo sistema: si la URL es del catalogo,
     "Tienda" se marca como activa; si es la home, "Inicio". El resto de
     paginas no tienen un link asociado en el menu principal, asi que el
     activeLink queda en el ultimo valor explicitamente seleccionado. */
  useEffect(() => {
    if (location.pathname.startsWith("/catalogo")) {
      setActiveLink("Tienda");
    } else if (location.pathname === "/") {
      setActiveLink("Inicio");
    } else if (location.pathname.startsWith("/personalizar")) {
      setActiveLink("Personalizar");
    }
  }, [location.pathname]);
  function handleNavClick(link) {
    setActiveLink(link);
    setMenuOpen(false);

    if (link === "Tienda") {
      navigate("/catalogo");
      return;
    }
    if (link == "Personalizar") {
      navigate("/personalizar");
      return;
    }

    if (link == "Contacto") {
      navigate("/contacto");
      return;
    }

    if (link == "Sobre Nosotros") {
      navigate("/sobre-nosotros");
      return;
    }

    // El resto de links (por ejemplo "Inicio") vuelven al home
    navigate("/");
  }

  function handleLogoClick(e) {
    e.preventDefault();
    navigate("/");
  }

  function handleNavLinkClick(e, link) {
    e.preventDefault();
    handleNavClick(link);
  }

  function handleCartCheckout() {
    setCartOpen(false);
    navigate("/checkout");
  }

  // Cuando el usuario envia la busqueda (pulsa Enter o el boton)
  function handleSearchSubmit(e) {
    e.preventDefault();
    const termino = searchText.trim();
    if (!termino) return;
    setSearchOpen(false);
    /* Navegamos al catalogo con el termino en la query string. CatalogPage
       lo lee con useSearchParams y lo usa como valor inicial del filtro. */
    navigate("/catalogo?q=" + encodeURIComponent(termino));
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
