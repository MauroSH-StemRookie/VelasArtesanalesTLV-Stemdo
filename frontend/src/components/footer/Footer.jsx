import { Link } from "react-router-dom";
import { IconInstagram, IconFacebook, IconMail } from "../icons/Icons";

/* ==========================================================================
   FOOTER — pie de pagina con links, redes sociales y copyright
   ------------------------------------------------------------
   Migrado a react-router-dom. Los enlaces del footer ahora son <Link>
   para que funcionen con el router del lado cliente, conserven el
   historial del navegador y permitan ctrl+click para abrir en pestana
   nueva con una URL real y compartible.

   Los "#" que apuntaban a funcionalidades aun no existentes (Cookies,
   Blog, Nuestro Taller, los submenus del catalogo por tipo) se dejan
   como anchors inertes hasta que haya ruta o pagina destino.
   ========================================================================== */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">Artesanas de Velas</div>

          <p className="footer-seo-text">
            En Artesanas de Velas elaboramos velas artesanales hechas a mano en
            España con cera natural y aromas exclusivos. Creamos velas
            aromáticas, decorativas y personalizadas ideales para regalar,
            decorar el hogar o crear ambientes de relajación y bienestar.
          </p>

          <div className="footer-social">
            <a
              href="https://www.instagram.com/artesanasdvelas/?__d=1%2F"
              title="Instagram"
            >
              <IconInstagram />
            </a>
            <a href="#" title="Facebook">
              <IconFacebook />
            </a>
            <a
              href="mailto:infoartesanasdevelas@gmail.com"
              title="Correo electrónico"
            >
              <IconMail />
            </a>
          </div>
        </div>
        <div className="footer-col">
          <h5>Tienda</h5>
          <ul>
            <li>
              <Link to="/catalogo">Velas aromáticas</Link>
            </li>
            <li>
              <a href="#">Decorativas</a>
            </li>
            <li>
              <a href="#">Cirios</a>
            </li>
            <li>
              <a href="#">Liturgicas</a>
            </li>
            <li>
              <a href="#">Personalizadas</a>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Informacion</h5>
          <ul>
            <li>
              <Link to="/sobre-nosotros">Sobre Nosotros</Link>
            </li>
            <li>
              <a href="#">Nuestro Taller</a>
            </li>
            <li>
              <a href="#">Blog</a>
            </li>
            <li>
              <Link to="/contacto">Contacto</Link>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Ayuda</h5>
          <ul>
            <li>
              <Link to="/ayuda">Envios</Link>
            </li>
            <li>
              <Link to="/ayuda">Devoluciones</Link>
            </li>
            <li>
              <Link to="/ayuda">Preguntas frecuentes</Link>
            </li>
            <li>
              <Link to="/aviso-legal">Aviso legal</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          &copy; 2026 Artesanas de Velas. Todos los derechos reservados.
        </span>
        <span>
          <Link to="/privacidad">Politica de privacidad</Link> &middot;{" "}
          <a href="#">Cookies</a>
        </span>
      </div>
      <div className="footer-keywords">
        <p>
          Velas artesanales | Velas aromáticas | Velas decorativas | Velas
          personalizadas | Velas para bodas | Velas naturales
        </p>
      </div>
    </footer>
  );
}
