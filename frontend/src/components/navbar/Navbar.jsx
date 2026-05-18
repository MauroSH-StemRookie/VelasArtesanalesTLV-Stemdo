import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { NAV_LINKS } from "../../data/staticData";
import { IconSearch, IconUser, IconCart, IconClose } from "../icons/Icons";
import CartDropdown from "./CartDropdown";
import UserDropdown from "./UserDropdown";
import logo from "../../assets/logo.png";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

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
    if (link === "Tienda") { navigate("/catalogo"); return; }
    if (link === "Personalizar") { navigate("/personalizar"); return; }
    if (link === "Contacto") { navigate("/contacto"); return; }
    if (link === "Sobre Nosotros") { navigate("/sobre-nosotros"); return; }
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

  function handleSearchSubmit(e) {
    e.preventDefault();
    const termino = searchText.trim();
    if (!termino) return;
    setSearchOpen(false);
    navigate("/catalogo?q=" + encodeURIComponent(termino));
    setSearchText("");
  }

  return (
    <>
      <div style={{
        backgroundColor: "#5a3e2b",
        color: "#fff",
        textAlign: "center",
        padding: "8px 16px",
        fontSize: "13px",
        letterSpacing: "0.5px"
      }}>
        {"🚚 Envío gratis a partir de 40\u20AC · Entrega en 48-72h días laborables"}
      </div>

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
                  onClick={() => { setSearchOpen(false); setSearchText(""); }}
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
    </>
  );
}
