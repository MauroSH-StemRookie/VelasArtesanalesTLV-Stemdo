import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Link } from "react-router-dom"
import './App.css'
import Contact from "./Contact"
import AvisoLegal from "./AvisoLegal"
import PoliticaPrivacidad from "./PoliticaPrivacidad"
import SobreNosotros from './SobreNosotros'
import logo from './assets/logo.png'
import velasdecorativas from './assets/velasdecorativas.png'
import velalisa from './assets/velalisa.png'
import velaspostre from './assets/velaspostre.jpg'
import postreC from './assets/postreC.png'
import post from './assets/post.png'
import postreB from './assets/postreB.png'
import decorativa from './assets/decorativa.png'
import decorativaD from './assets/decorativaD.png'
import decorativaC from './assets/decorativaC.png'
import lisaA from './assets/lisaA.png'
import lisaB from './assets/lisaB.png'
import lisaD from './assets/lisaD.png'


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

const IconMail = () => (
  <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" />
    <polyline points="3,7 12,13 21,7" />
  </svg>
)


/* ═══════════════════════════════════════
   DATOS — arrays para mapear
   ═══════════════════════════════════════ */
const NAV_LINKS = ['Inicio', 'Tienda', 'Aromáticas', 'Litúrgicas', 'Sobre Nosotros', 'Contacto']

const HERO_PRODUCTS = [
  {
    name: "Velas Postre",
    desc: "Tan reales que dan ganas de probarlas",
    label: "Gourmet",
    image: velaspostre,
    bg: "linear-gradient(135deg, #FAE8EA, #F2D1D5)",
  },
  {
    name: "Velas Lisas",
    desc: "Minimalismo que transforma tu hogar",
    label: "Clásica",
    image: velalisa,
    bg: "linear-gradient(135deg, #E8D5A0, #F5EED5)",
  },
  {
    name: "Velas Decorativas",
    desc: "Piezas únicas que no pasan desapercibidas",
    label: "DECORATIVA",
    image: velasdecorativas,
    bg: "linear-gradient(135deg, #C8BDD9, #E8E0F0)",
  },
  //{ name: 'Pascual Artesano', desc: 'Tradición & devoción', price: '35,00 €', label: 'LITÚRGICA', bg: 'linear-gradient(135deg, #B5CEAC, #D5E8CC)' },
];

const CATEGORIES = [
  {
    title: 'Velas Postre',
    desc: 'Fragancias naturales que transforman tu hogar en un refugio de calma y bienestar.',
    bgClass: 'cat-bg-aromaticas',
    icon: <svg viewBox="0 0 24 24"><path d="M12 2c-1 4-4 6-4 10a4 4 0 1 0 8 0c0-4-3-6-4-10z" /><path d="M8 22h8" /><path d="M10 22v-2.5" /><path d="M14 22v-2.5" /></svg>,
    images: [postreC, post, postreB]
  },
  {
    title: 'Velas Lisas',
    desc: 'Elaboradas con cera de abeja pura siguiendo la tradición artesanal más auténtica.',
    bgClass: 'cat-bg-liturgicas',
    icon: <svg viewBox="0 0 24 24"><rect x="8" y="4" width="8" height="16" rx="1" /><path d="M12 2v2" /><path d="M12 2c-0.5 1-1 1.5-1 2.5" /></svg>,
    images: [lisaA, lisaB, lisaD]
  },
  {
    title: 'Velas Decorativas',
    desc: 'Piezas únicas que combinan diseño y artesanía para embellecer cualquier espacio.',
    bgClass: 'cat-bg-decorativas',
    icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><path d="M12 4c-1 3-3 5-3 8a3 3 0 1 0 6 0c0-3-2-5-3-8z" /></svg>,
    images: [decorativa, decorativaD, decorativaC]
  
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
                <Link
                to={
                  link === "Contacto"
                  ? "/contacto"
                  : link === "Sobre Nosotros"
                  ? "/sobre-nosotros"
                  : "/"
                }
                className={activeLink === link ? 'active' : ''}
                onClick={() => handleNavClick(link)}>
                  {link}
                  </Link>
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
      
      <Routes>
      <Route
        path="/"
        element={
          <>

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
            {HERO_PRODUCTS.map((product, i) => (
              <div className="hero-card" key={i}>
                <div className="hero-card-img">
                  <img src={product.image} alt={product.name} />
                  </div>

      <div className="hero-card-body">
        <h4>{product.name}</h4>
        <p>{product.desc}</p>
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
        <div className="carousel-container">
          <div className="carousel">
            {(cat.images || [cat.image]).map((img, index) => (
              <img key={index} src={img} alt={cat.title} />
              ))}
              </div>
              </div>
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
      </>
        }
      />

      {/* Enlaces */}
      <Route path="/contacto" element={<Contact />} />
      <Route path="/aviso-legal" element={<AvisoLegal />} />
      <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
      <Route path="/sobre-nosotros" element={<SobreNosotros />} />
      
    </Routes>
    

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
              <a href="mailto:info@artesanasdevelas.com" title="Email"><IconMail/></a>
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
              <Link to="/sobre-nosotros" reloadDocument>Sobre Nosotros</Link>
              <li><a href="#">Nuestro Taller</a></li>
              <li><a href="#">Blog</a></li>
              <Link to="/contacto" reloadDocument>Contacto</Link>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Ayuda</h5>
            <ul>
              <li><a href="#">Envíos</a></li>
              <li><a href="#">Devoluciones</a></li>
              <li><a href="#">Preguntas frecuentes</a></li>
              <div>
                <Link to="/aviso-legal" reloadDocument>Aviso Legal</Link>
              </div>
              
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Artesanas de Velas. Todos los derechos reservados.</span>
          <span className="footer-links">
            <Link to="/politica-privacidad">Política de Privacidad</Link>
            {" · "}
            <Link to="/cookies">Cookies</Link>
          </span>
        </div>
      </footer>

      {/* ═══════════ WhatsApp Botón ═══════════ */}
    <div className="whatsapp-container" id="whatsappBox">
      <a href="https://wa.me/34640727283?text=Hola%20me%20interesan%20vuestras%20velas%20" target="_blank" className="whatsapp-btn">
        <svg viewBox="0 0 32 32">
          <path d="M16 .396C7.163.396 0 7.559 0 16.396c0 2.885.756 5.59 2.077 7.94L0 32l7.856-2.056A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16.004C32 7.559 24.837.396 16 .396z"/>
        </svg>
      </a>

      <button className="whatsapp-close" onClick={() => {
        document.getElementById("whatsappBox").style.display = "none"
      }}>
        ×
      </button>
    </div>

  </>     
  )
}

       
export default App
