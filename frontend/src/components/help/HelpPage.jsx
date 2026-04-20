import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FAQ_DATA } from '../../data/staticData'
import { IconBack, IconChevron, IconMail, IconPhone, IconPin, IconInstagram } from '../icons/Icons'

/* ==========================================================================
   PAGINA DE AYUDA — FAQ en acordeon + datos de contacto
   -----------------------------------------------------
   Migrada a react-router-dom. El boton "Volver a la tienda" usa
   useNavigate en vez del prop onBack.
   ========================================================================== */
export default function HelpPage() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)
  return (
    <div className="help-page">
      <div className="admin-header"><button className="admin-back" onClick={() => navigate('/')}><IconBack /> Volver a la tienda</button><h2>Ayuda</h2></div>
      <div className="help-content">
        <div className="help-section">
          <h3>Preguntas frecuentes</h3>
          <div className="faq-list">{FAQ_DATA.map((faq, i) => (
            <div className={`faq-item ${openFaq === i ? 'open' : ''}`} key={i}>
              <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>{faq.q}<IconChevron /></button>
              {openFaq === i && <div className="faq-answer">{faq.a}</div>}
            </div>
          ))}</div>
        </div>
        <div className="help-section">
          <h3>Contacto</h3>
          <div className="help-contact-grid">
            <div className="help-contact-item"><IconMail /><div><strong>Correo</strong><p>info@artesanasdevelas.com</p></div></div>
            <div className="help-contact-item"><IconPhone /><div><strong>Telefono</strong><p>+34 925 000 000</p></div></div>
            <div className="help-contact-item"><IconPin /><div><strong>Direccion</strong><p>Talavera de la Reina, Toledo</p></div></div>
            <div className="help-contact-item"><IconInstagram /><div><strong>Instagram</strong><p>@artesanasdvelas</p></div></div>
          </div>
        </div>
      </div>
    </div>
  )
}
