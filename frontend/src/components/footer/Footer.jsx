import { IconInstagram, IconFacebook, IconWhatsapp } from '../icons/Icons'

/* ==========================================================================
   FOOTER — pie de pagina con links, redes sociales y copyright
   ========================================================================== */
export default function Footer({ onNavigate }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">Artesanas de Velas</div>
          <p>Velas artesanales elaboradas con amor en Talavera de la Reina. Aromaticas, decorativas, cirios y liturgicas.</p>
          <div className="footer-social">
            <a href="https://www.instagram.com/artesanasdvelas/?__d=1%2F" title="Instagram"><IconInstagram /></a>
            <a href="#" title="Facebook"><IconFacebook /></a>
            <a href="#" title="WhatsApp"><IconWhatsapp /></a>
          </div>
        </div>
        <div className="footer-col"><h5>Tienda</h5><ul><li><a href="#">Aromaticas</a></li><li><a href="#">Decorativas</a></li><li><a href="#">Cirios</a></li><li><a href="#">Liturgicas</a></li><li><a href="#">Personalizadas</a></li></ul></div>
        <div className="footer-col"><h5>Informacion</h5><ul><li><a href="#">Sobre Nosotros</a></li><li><a href="#">Nuestro Taller</a></li><li><a href="#">Blog</a></li><li><a href="#">Contacto</a></li></ul></div>
        <div className="footer-col"><h5>Ayuda</h5><ul>
          <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('help') }}>Envios</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('help') }}>Devoluciones</a></li>
          <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('help') }}>Preguntas frecuentes</a></li>
          <li><a href="#">Aviso legal</a></li>
        </ul></div>
      </div>
      <div className="footer-bottom"><span>&copy; 2026 Artesanas de Velas. Todos los derechos reservados.</span><span><a href="#">Politica de privacidad</a> &middot; <a href="#">Cookies</a></span></div>
    </footer>
  )
}
