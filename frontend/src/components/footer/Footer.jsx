import { IconInstagram, IconFacebook, IconWhatsapp } from "../icons/Icons";

/* ==========================================================================
   FOOTER — pie de pagina con links, redes sociales y copyright
   ========================================================================== */
export default function Footer({ onNavigate }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">Artesanas de Velas</div>

          <p className="footer-seo-text">
            En Artesanas de Velas elaboramos velas artesanales hechas a mano en
            España con cera natural. Creamos velas aromáticas, velas decorativas
            y velas personalizadas ideales para regalar, bodas, baby showers,
            despedidas de soltera y eventos especiales.
          </p>

          <p className="footer-seo-use">
            Nuestras velas ecológicas de soja son naturales, sin tóxicos y
            perfectas para relajación, decoración del hogar y crear ambientes
            elegantes y relajantes.
          </p>

          <ul className="footer-keywords">
            <li>
              <a href="/catalog?categoria=aromaticas">Velas aromáticas</a>
            </li>
            <li>
              <a href="/catalog?categoria=decorativas">Velas decorativas</a>
            </li>
            <li>
              <a href="/catalog?categoria=personalizadas">
                Velas personalizadas
              </a>
            </li>
            <li>
              <a href="/catalog?categoria=ecologicas">
                Velas ecológicas de soja
              </a>
            </li>
            <li>
              <a href="/catalog?categoria=regalos">Regalos personalizados</a>
            </li>
          </ul>

          <p>
            Velas artesanales elaboradas con amor en Talavera de la Reina.
            Aromaticas, decorativas, cirios y liturgicas.
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
            <a href="#" title="WhatsApp">
              <IconWhatsapp />
            </a>
          </div>
        </div>
        <div className="footer-col">
          <h5>Tienda</h5>
          <ul>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("catalog");
                }}
              >
                Velas aromáticas
              </a>
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
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("about");
                }}
              >
                Sobre Nosotros
              </a>
            </li>
            <li>
              <a href="#">Nuestro Taller</a>
            </li>
            <li>
              <a href="#">Blog</a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("contact");
                }}
              >
                Contacto
              </a>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Ayuda</h5>
          <ul>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("help");
                }}
              >
                Envios
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("help");
                }}
              >
                Devoluciones
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("help");
                }}
              >
                Preguntas frecuentes
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate("legal");
                }}
              >
                Aviso legal
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          &copy; 2026 Artesanas de Velas. Todos los derechos reservados.
        </span>
        <span>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("legal");
            }}
          >
            Politica de privacidad
          </a>{" "}
          &middot; <a href="#">Cookies</a>
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
