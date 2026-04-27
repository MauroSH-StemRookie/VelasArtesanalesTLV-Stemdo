import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Contact.css";

export default function Contact() {
  const { user } = useAuth();
  const isAdmin = user?.tipo === 1;

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [contenido, setContenido] = useState({
    titulo: "📩 Contáctanos",

    texto1:
      "¡Nos encantaría saber de ti! En Artesanas de Velas, valoramos cada consulta, sugerencia y oportunidad de estar en contacto contigo. Para nosotros es importante conseguir tener los mejores productos personalizados para momentos especiales.",

    texto2:
      "Si tienes alguna pregunta sobre nuestros productos personalizados y artesanales, necesitas asesoramiento para elegir el regalo perfecto para ese momento especial o simplemente quieres compartir tus comentarios, no dudes en contactarnos.",

    texto3:
      "Nuestro equipo estará encantado de atenderte y brindarte la mejor atención posible. Escríbenos a nuestro correo electrónico y te responderemos con cariño y dedicación. También nos puedes llamar directamente a nuestro número de teléfono si así lo prefieres para aclarar todas tus dudas.",

    texto4:
      "Tu satisfacción y experiencia son nuestra máxima prioridad, así que no esperes más, ¡contáctanos ahora y permítenos hacer de tus momentos especiales algo inolvidable!",

    email: "infoartesanasdevelas@gmail.com",
    telefono: "+34640727283",
  });

  const [draft, setDraft] = useState(contenido);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    window.scrollTo(0, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setDraft({
      ...draft,
      [e.target.name]: e.target.value,
    });
  };

  const startEdit = () => {
    setDraft(contenido);
    setIsEditing(true);
  };

  const saveChanges = () => {
    setContenido(draft);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="contact-page">
        <h2 style={{ textAlign: "center" }}>Cargando contenido...</h2>
      </div>
    );
  }

  return (
    <div className="contact-page">
      {/* LAPIZ */}
      {!isEditing && isAdmin && (
        <button className="edit-float-btn" onClick={startEdit}>
          ✏️
        </button>
      )}

      {/* BOTONES */}
      {isEditing && (
        <div className="edit-actions">
          <button onClick={saveChanges} className="save-btn">
            💾 Guardar
          </button>
          <button onClick={() => setIsEditing(false)} className="cancel-btn">
            ❌ Cancelar
          </button>
        </div>
      )}

      {/* TITULO */}
      {isEditing ? (
        <textarea
          className="title-edit"
          name="titulo"
          value={draft.titulo}
          onChange={handleChange}
        />
      ) : (
        <h1 className="contact-title">{contenido.titulo}</h1>
      )}

      {/* TEXTOS */}
      {[1, 2, 3, 4].map((num) =>
        isEditing ? (
          <textarea
            key={num}
            className="textarea-edit"
            name={`texto${num}`}
            value={draft[`texto${num}`]}
            onChange={handleChange}
          />
        ) : (
          <p key={num} className="contact-text">
            {contenido[`texto${num}`]}
          </p>
        ),
      )}

      {/* CONTACTO */}
      <div className="contact-links">
        <p>
          📧{" "}
          {isEditing ? (
            <textarea
              className="textarea-edit"
              name="email"
              value={draft.email}
              onChange={handleChange}
            />
          ) : (
            <a href={`mailto:${contenido.email}`}>{contenido.email}</a>
          )}
        </p>

        <p>
          📞{" "}
          {isEditing ? (
            <textarea
              className="textarea-edit"
              name="telefono"
              value={draft.telefono}
              onChange={handleChange}
            />
          ) : (
            <a href={`tel:${contenido.telefono}`}>{contenido.telefono}</a>
          )}
        </p>
      </div>
    </div>
  );
}
