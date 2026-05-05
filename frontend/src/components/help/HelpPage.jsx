import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  IconBack,
  IconChevron,
  IconMail,
  IconPhone,
  IconPin,
  IconInstagram,
} from "../icons/Icons";

export default function HelpPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.tipo === 1;

  const [openFaq, setOpenFaq] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [contenido, setContenido] = useState(() => {
    const saved = localStorage.getItem("helpPage");

    return saved
      ? JSON.parse(saved)
      : {
          titulo: "Ayuda",
          faqTitle: "Preguntas frecuentes",
          contacto: {
            email: "info@artesanasdevelas.com",
            phone: "+34 925 000 000",
            address: "Talavera de la Reina, Toledo",
            instagram: "@artesanasdvelas",
          },
          faq: [
            {
              q: "Hacéis envíos a toda España?",
              a: "Sí, enviamos a toda la península y Baleares. Los envíos a Canarias, Ceuta y Melilla pueden tener coste adicional.",
            },
            {
              q: "Puedo comprar sin registrarme?",
              a: "Por supuesto. Puedes realizar tu compra como invitado introduciendo tus datos al finalizar el pedido.",
            },
            {
              q: "Cuánto tarda el envío?",
              a: "Los pedidos se preparan en 24-48h laborables. El envío estándar tarda entre 3-5 días laborables.",
            },
            {
              q: "Hacéis velas personalizadas?",
              a: "Sí, creamos velas a medida para bodas, bautizos, comuniones y eventos especiales.",
            },
            {
              q: "Qué materiales utilizáis?",
              a: "Trabajamos con cera de soja, cera de abeja pura y aceites esenciales naturales. No usamos parafinas.",
            },
            {
              q: "Puedo devolver un producto?",
              a: "Aceptamos devoluciones en los 14 días siguientes a la recepción, siempre que el producto esté sin usar.",
            },
          ],
        };
  });

  const [draft, setDraft] = useState(contenido);

  const startEdit = () => {
    setDraft(contenido);
    setIsEditing(true);
  };

  const saveChanges = () => {
    setContenido(draft);
    localStorage.setItem("helpPage", JSON.stringify(draft));
    setIsEditing(false);
  };

  const handleFaqChange = (i, field, value) => {
    const updated = [...draft.faq];
    updated[i][field] = value;
    setDraft({ ...draft, faq: updated });
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setDraft({
      ...draft,
      contacto: { ...draft.contacto, [name]: value },
    });
  };

  const addFaq = () => {
    setDraft({
      ...draft,
      faq: [...draft.faq, { q: "", a: "" }],
    });
  };

  return (
    <div className="help-page">
      {/* HEADER */}
      <div className="admin-header">
        <button className="admin-back" onClick={() => navigate("/")}>
          <IconBack /> Volver a la tienda
        </button>

        <h2>
          {isEditing ? (
            <input
              className="full-input"
              value={draft.titulo}
              onChange={(e) => setDraft({ ...draft, titulo: e.target.value })}
            />
          ) : (
            contenido.titulo
          )}
        </h2>
      </div>

      {/* LAPIZ */}
      {!isEditing && isAdmin && (
        <button className="edit-float-btn" onClick={startEdit}>
          ✏️
        </button>
      )}

      {/* BOTONES */}
      {isEditing && (
        <div className="edit-actions">
          <button onClick={saveChanges}>💾 Guardar</button>
          <button onClick={() => setIsEditing(false)}>❌ Cancelar</button>
          <button onClick={addFaq}>➕ Añadir pregunta</button>
        </div>
      )}

      <div className="help-content">
        {/* ================= FAQ ================= */}
        <div className="help-section">
          {/* TITULO FAQ */}
          {isEditing ? (
            <input
              className="full-input"
              value={draft.faqTitle}
              onChange={(e) => setDraft({ ...draft, faqTitle: e.target.value })}
            />
          ) : (
            <h3>{contenido.faqTitle}</h3>
          )}

          <div className="faq-list">
            {draft.faq.map((faq, i) => (
              <div key={i} className="faq-item">
                {/* MODO LECTURA */}
                {!isEditing && (
                  <>
                    <button
                      className="faq-question"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      {faq.q}
                      <IconChevron />
                    </button>

                    {openFaq === i && <div className="faq-answer">{faq.a}</div>}
                  </>
                )}

                {/* MODO EDICIÓN */}
                {isEditing && (
                  <div className="faq-edit-block">
                    <input
                      className="full-input"
                      value={faq.q}
                      placeholder="Pregunta"
                      onChange={(e) => handleFaqChange(i, "q", e.target.value)}
                    />

                    <textarea
                      className="full-textarea"
                      value={faq.a}
                      placeholder="Respuesta"
                      onChange={(e) => handleFaqChange(i, "a", e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ================= CONTACTO ================= */}
        <div className="help-section">
          <h3>Contacto</h3>

          <div className="help-contact-grid">
            <div className="help-contact-item">
              <IconMail />
              {isEditing ? (
                <input
                  name="email"
                  className="full-input"
                  value={draft.contacto.email}
                  onChange={handleContactChange}
                />
              ) : (
                <a href={`mailto:${contenido.contacto.email}`}>
                  {contenido.contacto.email}
                </a>
              )}
            </div>

            <div className="help-contact-item">
              <IconPhone />
              {isEditing ? (
                <input
                  name="phone"
                  className="full-input"
                  value={draft.contacto.phone}
                  onChange={handleContactChange}
                />
              ) : (
                <a href={`tel:${contenido.contacto.phone}`}>
                  {contenido.contacto.phone}
                </a>
              )}
            </div>

            <div className="help-contact-item">
              <IconPin />
              {isEditing ? (
                <input
                  name="address"
                  className="full-input"
                  value={draft.contacto.address}
                  onChange={handleContactChange}
                />
              ) : (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    contenido.contacto.address,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {contenido.contacto.address}
                </a>
              )}
            </div>

            <div className="help-contact-item">
              <IconInstagram />
              {isEditing ? (
                <input
                  name="instagram"
                  className="full-input"
                  value={draft.contacto.instagram}
                  onChange={handleContactChange}
                />
              ) : (
                <a
                  href={`https://instagram.com/${contenido.contacto.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {contenido.contacto.instagram}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
