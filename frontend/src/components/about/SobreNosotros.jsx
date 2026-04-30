import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./SobreNosotros.css";

export default function SobreNosotros() {
  const { user } = useAuth();
  const isAdmin = user?.tipo === 1;

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [contenido, setContenido] = useState(() => {
    const saved = localStorage.getItem("SobreNosotros");

    return saved
      ? JSON.parse(saved)
      : {
          titulo: "SOBRE NOSOTROS",

          intro:
            "En Artesanas de Velas, cada vela cuenta una historia. Somos un pequeño taller artesanal dedicado a la creación de velas hechas a mano, combinando tradición, creatividad y materiales naturales.",

          historiaTitulo: "Nuestra historia",
          historia:
            "Nacimos con la idea de recuperar la esencia de lo artesanal, alejándonos de la producción industrial en masa. Empezamos como un pequeño proyecto familiar hasta convertirnos en un espacio creativo donde cada vela tiene su propio carácter.",

          filosofiaTitulo: "Nuestra filosofía",
          filosofia:
            "Apostamos por una producción responsable y sostenible, utilizando ceras naturales y materiales respetuosos con el medio ambiente.",

          diferenciaTitulo: "Qué nos hace diferentes",
          diferencia:
            "No fabricamos en masa. Cada vela es única, elaborada a mano con atención al detalle.",

          compromisoTitulo: "Nuestro compromiso",
          compromiso:
            "Queremos que cada vela cree un ambiente especial, aportando calidez y bienestar en cada hogar.",
        };
  });

  const [draft, setDraft] = useState(contenido);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
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
    localStorage.setItem("SobreNosotros", JSON.stringify(draft));
    setIsEditing(false);
  };

  const renderField = (name, tag = "p", className = "") => {
    if (isEditing) {
      return (
        <textarea
          name={name}
          value={draft[name]}
          onChange={handleChange}
          className={className || "textarea-edit"}
        />
      );
    }

    const Tag = tag;
    return <Tag>{contenido[name]}</Tag>;
  };

  if (loading) {
    return (
      <div className="nosotros-page">
        <h2 style={{ textAlign: "center" }}>Cargando contenido...</h2>
      </div>
    );
  }

  return (
    <div className="nosotros-page">
      {!isEditing && isAdmin && (
        <button className="edit-float-btn" onClick={startEdit}>
          ✏️
        </button>
      )}

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

      {/* TÍTULO PRINCIPAL */}
      {renderField("titulo", "h1", "title-edit")}

      {/* INTRO */}
      {renderField("intro")}

      {/* SECCIONES CON TÍTULOS EDITABLES */}
      {renderField("historiaTitulo", "h2", "subtitle-edit")}
      {renderField("historia")}

      {renderField("filosofiaTitulo", "h2", "subtitle-edit")}
      {renderField("filosofia")}

      {renderField("diferenciaTitulo", "h2", "subtitle-edit")}
      {renderField("diferencia")}

      {renderField("compromisoTitulo", "h2", "subtitle-edit")}
      {renderField("compromiso")}
    </div>
  );
}
