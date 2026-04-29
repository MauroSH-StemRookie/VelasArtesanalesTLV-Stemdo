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

          historia:
            "Nacimos con la idea de recuperar la esencia de lo artesanal, creando productos únicos que aporten calidez y personalidad a cualquier espacio.",

          filosofia:
            "Apostamos por una producción responsable y sostenible, utilizando ceras naturales.",

          diferencia: "No fabricamos en masa. Cada vela es única.",

          compromiso: "Queremos que cada vela cree un ambiente especial.",
        };
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
    localStorage.setItem("SobreNosotros", JSON.stringify(draft));
    setIsEditing(false);
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
      {/* 🔧 LAPIZ (MISMO DISEÑO DE ANTES) */}
      {!isEditing && isAdmin && (
        <button className="edit-float-btn" onClick={startEdit}>
          ✏️
        </button>
      )}

      {/* BOTONES (MISMO DISEÑO DE ANTES) */}
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
        <h1>{contenido.titulo}</h1>
      )}

      {/* INTRO */}
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="intro"
          value={draft.intro}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.intro}</p>
      )}

      <h2>Nuestra historia</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="historia"
          value={draft.historia}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.historia}</p>
      )}

      <h2>Nuestra filosofía</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="filosofia"
          value={draft.filosofia}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.filosofia}</p>
      )}

      <h2>Qué nos hace diferentes</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="diferencia"
          value={draft.diferencia}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.diferencia}</p>
      )}

      <h2>Nuestro compromiso</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="compromiso"
          value={draft.compromiso}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.compromiso}</p>
      )}
    </div>
  );
}
