import './Contact.css'
export default function Contact() {
  return (
    <div className="contact-page">

      <h1 className="contact-title">Contáctanos</h1>

      <p className="contact-text">
        ¡Nos encantaría saber de ti! En Artesanas de Velas, valoramos cada consulta, sugerencia y oportunidad de estar en contacto contigo. Para nosotros es importante conseguir tener los mejores productos personalizados para momentos especiales.
      </p>

      <p className="contact-text">
        Si tienes alguna pregunta sobre nuestros productos personalizados y artesanales, necesitas asesoramiento para elegir el regalo perfecto para ese momento especial o simplemente quieres compartir tus comentarios, no dudes en contactarnos.
      </p>

      <p className="contact-text">
        Nuestro equipo estará encantado de atenderte y brindarte la mejor atención posible. Escríbenos a nuestro correo electrónico y te responderemos con cariño y dedicación. También nos puedes llamar directamente a nuestro número de teléfono si así lo prefieres para aclarar todas tus dudas.                               
        </p>

      <p className="contact-text">
        Tu satisfacción y experiencia son nuestra máxima prioridad, así que no esperes más, ¡contáctanos ahora y permítenos hacer de tus momentos especiales algo inolvidable!
        </p>

      <div className="contact-links">

        <p>
          📧{" "}
          <a href="mailto:infoartesanasdevelas@gmail.com">
            infoartesanasdevelas@gmail.com
          </a>
        </p>

        <p>
          📞{" "}
          <a href="tel:+34640727283">
            +34 640727283
          </a>
        </p>

      </div>

    </div>
  )
}