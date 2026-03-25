import { useState, useEffect, useRef } from 'react'
import './App.css'
import logo from './assets/logo.png'

/* ═══════════════════════════════════════
   ICONOS SVG — componentes reutilizables
   ═══════════════════════════════════════ */
const IconArrow = () => (
  <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
)

const IconSearch = () => (
  <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
)

const IconUser = () => (
  <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
)

const IconCart = () => (
  <svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
)

const IconFlame = () => (
  <svg viewBox="0 0 24 24"><path d="M12 2c-1 4-4 6-4 10a4 4 0 1 0 8 0c0-4-3-6-4-10z" /></svg>
)

const IconShield = () => (
  <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
)

const IconHeart = () => (
  <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
)

const IconPin = () => (
  <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
)

const IconTruck = () => (
  <svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" /><polygon points="23 7 16 12 16 3 23 7" /><line x1="1" y1="20" x2="23" y2="20" /></svg>
)

const IconInstagram = () => (
  <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" /></svg>
)

const IconFacebook = () => (
  <svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
)

const IconWhatsapp = () => (
  <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
)

/* ═══════════════════════════════════════
   DATOS — arrays para mapear
   ═══════════════════════════════════════ */
const NAV_LINKS = ['Inicio', 'Tienda', 'Aromáticas', 'Litúrgicas', 'Sobre Nosotros', 'Contacto']

const HERO_PRODUCTS = [
  { name: 'Rosa & Lavanda', desc: 'Vela aromática 220g', price: '14,90 €', label: 'AROMÁTICA', bg: 'linear-gradient(135deg, #FAE8EA, #F2D1D5)' },
  { name: 'Cirio Clásico', desc: 'Cera de abeja pura', price: '22,50 €', label: 'CIRIO', bg: 'linear-gradient(135deg, #E8D5A0, #F5EED5)' },
  { name: 'Zen Meditación', desc: 'Soja & sándalo', price: '18,90 €', label: 'DECORATIVA', bg: 'linear-gradient(135deg, #C8BDD9, #E8E0F0)' },
  { name: 'Pascual Artesano', desc: 'Tradición & devoción', price: '35,00 €', label: 'LITÚRGICA', bg: 'linear-gradient(135deg, #B5CEAC, #D5E8CC)' },
]

const CATEGORIES = [
  {
    title: 'Velas Aromáticas',
    desc: 'Fragancias naturales que transforman tu hogar en un refugio de calma y bienestar.',
    bgClass: 'cat-bg-aromaticas',
    icon: <svg viewBox="0 0 24 24"><path d="M12 2c-1 4-4 6-4 10a4 4 0 1 0 8 0c0-4-3-6-4-10z" /><path d="M8 22h8" /><path d="M10 22v-2.5" /><path d="M14 22v-2.5" /></svg>,
  },
  {
    title: 'Cirios & Litúrgicas',
    desc: 'Elaboradas con cera de abeja pura siguiendo la tradición artesanal más auténtica.',
    bgClass: 'cat-bg-liturgicas',
    icon: <svg viewBox="0 0 24 24"><rect x="8" y="4" width="8" height="16" rx="1" /><path d="M12 2v2" /><path d="M12 2c-0.5 1-1 1.5-1 2.5" /></svg>,
  },
  {
    title: 'Decorativas',
    desc: 'Piezas únicas que combinan diseño y artesanía para embellecer cualquier espacio.',
    bgClass: 'cat-bg-decorativas',
    icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><path d="M12 4c-1 3-3 5-3 8a3 3 0 1 0 6 0c0-3-2-5-3-8z" /></svg>,
  },
]

const VALUES = [
  { icon: <IconShield />, title: '100% Natural', desc: 'Ceras vegetales y de abeja pura, sin parafinas ni productos químicos.' },
  { icon: <IconHeart />, title: 'Hecho a Mano', desc: 'Cada vela es elaborada artesanalmente con dedicación y cariño en nuestro taller.' },
  { icon: <IconPin />, title: 'Talavera de la Reina', desc: 'Orgullosamente fabricadas en nuestra ciudad, apoyando el comercio local.' },
  { icon: <IconTruck />, title: 'Envío Cuidado', desc: 'Empaquetamos con mimo para que cada pedido llegue en perfectas condiciones.' },
]

/* ═══════════════════════════════════════
   HOOK — Intersection Observer
   ═══════════════════════════════════════ */
function useFadeUp() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}

function FadeUp({ children, className = '', delay = 0 }) {
  const ref = useFadeUp()
  return (
    <div
      ref={ref}
      className={`fade-up ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════ */
function App() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState('Inicio')

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (link) => {
    setActiveLink(link)
    setMenuOpen(false)
  }

  return (
    <>
      {/* ═══════════ NAVBAR ═══════════ */}
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="navbar-inner">
          <a href="#" className="navbar-logo" onClick={(e) => e.preventDefault()}>
            <img src={logo} alt="Artesanas de Velas" />
            <div className="navbar-logo-text">
              Artesanas de Velas
              <span>Talavera de la Reina</span>
            </div>
          </a>

          <ul className={`navbar-links${menuOpen ? ' open' : ''}`}>
            {NAV_LINKS.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className={activeLink === link ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); handleNavClick(link) }}
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>

          <div className="navbar-actions">
            <button className="nav-icon-btn" title="Buscar"><IconSearch /></button>
            <button className="nav-icon-btn" title="Mi cuenta"><IconUser /></button>
            <button className="nav-icon-btn" title="Carrito">
              <IconCart />
              <span className="cart-badge">2</span>
            </button>
            <button
              className={`hamburger${menuOpen ? ' open' : ''}`}
              aria-label="Menú"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">Artesanía desde Talavera</div>
          <h1 className="hero-title">Velas hechas<br />con <em>alma</em></h1>
          <p className="hero-desc">
            Elaboramos a mano cada vela con ceras naturales y fragancias
            cuidadosamente seleccionadas. Aromáticas, decorativas y litúrgicas
            — cada pieza cuenta una historia.
          </p>
          <div className="hero-buttons">
            <a href="#" className="btn-primary" onClick={(e) => e.preventDefault()}>
              <span>Ver Colección</span>
              <IconArrow />
            </a>
            <a href="#" className="btn-secondary" onClick={(e) => e.preventDefault()}>
              Nuestra Historia
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card-grid">
            {HERO_PRODUCTS.map((p) => (
              <div className="hero-card" key={p.name}>
                <div className="hero-card-img">
                  <div className="placeholder-candle" style={{ background: p.bg }}>
                    <IconFlame />
                    {p.label}
                  </div>
                </div>
                <div className="hero-card-body">
                  <h4>{p.name}</h4>
                  <p>{p.desc}</p>
                  <div className="price">{p.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CATEGORÍAS ═══════════ */}
      <section className="categories">
        <div className="section-header">
          <div className="section-eyebrow">Nuestras colecciones</div>
          <h2 className="section-title">Encuentra tu vela perfecta</h2>
          <div className="section-divider" />
        </div>

        <div className="cat-grid">
          {CATEGORIES.map((cat, i) => (
            <FadeUp key={cat.title} delay={i * 0.1}>
              <div className="cat-card">
                <div className="cat-card-visual">
                  <div className={`cat-bg ${cat.bgClass}`} />
                  <div className="cat-icon">{cat.icon}</div>
                </div>
                <div className="cat-card-content">
                  <h3>{cat.title}</h3>
                  <p>{cat.desc}</p>
                  <a href="#" className="cat-link" onClick={(e) => e.preventDefault()}>
                    Explorar
                    <IconArrow />
                  </a>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ═══════════ CTA BANNER ═══════════ */}
      <section className="cta-banner">
        <div className="cta-text">
          <h2>¿Necesitas algo especial?</h2>
          <p>Creamos velas más especiales mediante encargo.</p>
        </div>
        <a href="#" className="btn-cta" onClick={(e) => e.preventDefault()}>
          Solicitar Presupuesto
          <IconArrow />
        </a>
      </section>

      {/* ═══════════ VALORES ═══════════ */}
      <section className="values">
        <div className="section-header">
          <div className="section-eyebrow">Por qué elegirnos</div>
          <h2 className="section-title">Artesanía con propósito</h2>
          <div className="section-divider" />
        </div>

        <div className="values-grid">
          {VALUES.map((v, i) => (
            <FadeUp key={v.title} delay={i * 0.1}>
              <div className="value-item">
                <div className="value-icon">{v.icon}</div>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">Artesanas de Velas</div>
            <p>
              Velas artesanales elaboradas con amor en Talavera de la Reina.
              Aromáticas, decorativas, cirios y litúrgicas.
            </p>
            <div className="footer-social">
              <a href="https://www.instagram.com/artesanasdvelas/?__d=1%2F" title="Instagram"><IconInstagram /></a>
              <a href="#" title="Facebook"><IconFacebook /></a>
              <a href="#" title="WhatsApp"><IconWhatsapp /></a>
            </div>
          </div>

          <div className="footer-col">
            <h5>Tienda</h5>
            <ul>
              <li><a href="#">Aromáticas</a></li>
              <li><a href="#">Decorativas</a></li>
              <li><a href="#">Cirios</a></li>
              <li><a href="#">Litúrgicas</a></li>
              <li><a href="#">Personalizadas</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Información</h5>
            <ul>
              <li><a href="#">Sobre Nosotros</a></li>
              <li><a href="#">Nuestro Taller</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Contacto</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Ayuda</h5>
            <ul>
              <li><a href="#">Envíos</a></li>
              <li><a href="#">Devoluciones</a></li>
              <li><a href="#">Preguntas frecuentes</a></li>
              <li><a href="#">Aviso legal</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Artesanas de Velas. Todos los derechos reservados.</span>
          <span>
            <a href="#">Política de privacidad</a> · <a href="#">Cookies</a>
          </span>
        </div>
      </footer>
    </>
  )
}

export default App