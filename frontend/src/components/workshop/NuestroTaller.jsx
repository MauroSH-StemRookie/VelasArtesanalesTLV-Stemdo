import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./NuestroTaller.css";

export default function NuestroTaller() {
  const { user } = useAuth();
  const isAdmin = user?.tipo === 1;

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [contenido, setContenido] = useState({
    titulo: "NUESTRO TALLER",
    subtitulo: "El lugar donde nace cada vela",

    intro:
      "En nuestro taller es donde comienza todo el proceso creativo. Transformamos materias primas en velas artesanales únicas hechas a mano.",

    proceso:
      "Cada vela sigue un proceso completamente manual: mezcla, vertido, enfriado y acabado. Todo se realiza artesanalmente.",

    filosofia:
      "No trabajamos con producción industrial. Cada vela tiene su propio carácter y esencia gracias al trabajo manual.",

    materiales:
      "Usamos ceras de calidad, fragancias seleccionadas y mechas diseñadas para una combustión limpia y duradera.",

    lista:
      "✔ Elaboración manual\n✔ Control de calidad en cada pieza\n✔ Atención al detalle\n✔ Producción cuidada y limitada",

    espacio:
      "Nuestro taller es un espacio donde creatividad y tradición se unen para dar vida a cada vela.",
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
      <div className="taller-page">
        <h2 style={{ textAlign: "center" }}>Cargando contenido...</h2>
      </div>
    );
  }

  return (
    <div className="taller-page">
      {/* ✏️ EDIT BUTTON */}
      {!isEditing && isAdmin && (
        <button className="edit-float-btn" onClick={startEdit}>
          ✏️
        </button>
      )}

      {/* SAVE / CANCEL */}
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
        <h1>🏭 {contenido.titulo}</h1>
      )}

      {/* SUBTITULO */}
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="subtitulo"
          value={draft.subtitulo}
          onChange={handleChange}
        />
      ) : (
        <h2>✨ {contenido.subtitulo}</h2>
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

      <h2>Cómo trabajamos</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="proceso"
          value={draft.proceso}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.proceso}</p>
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

      <h2>Materiales</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="materiales"
          value={draft.materiales}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.materiales}</p>
      )}

      <h2>Características</h2>

      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="lista"
          value={draft.lista}
          onChange={handleChange}
        />
      ) : (
        <ul>
          {contenido.lista.split("\n").map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}

      <h2>Nuestro espacio</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="espacio"
          value={draft.espacio}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.espacio}</p>
      )}
    </div>
  );
}
