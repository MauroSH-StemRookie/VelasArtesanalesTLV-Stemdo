import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./NuestroTaller.css";

export default function NuestroTaller() {
  const { user } = useAuth();
  const isAdmin = user?.tipo === 1;

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [contenido, setContenido] = useState(() => {
    const saved = localStorage.getItem("NuestroTaller");

    return saved
      ? JSON.parse(saved)
      : {
          titulo: "NUESTRO TALLER",
          subtitulo: "El lugar donde nace cada vela",

          intro:
            "En nuestro taller es donde comienza todo el proceso creativo. Transformamos materias primas en velas artesanales únicas hechas a mano.",

          procesoTitulo: "Cómo trabajamos",
          proceso:
            "Cada vela sigue un proceso completamente manual: mezcla, vertido, enfriado y acabado.",

          filosofiaTitulo: "Nuestra filosofía",
          filosofia:
            "No trabajamos con producción industrial. Cada vela tiene su propio carácter gracias al trabajo manual.",

          materialesTitulo: "Materiales",
          materiales:
            "Usamos ceras de calidad, fragancias seleccionadas y mechas diseñadas para una combustión limpia y duradera.",

          listaTitulo: "Características",
          lista:
            "✔ Elaboración manual\n✔ Control de calidad en cada pieza\n✔ Atención al detalle\n✔ Producción cuidada y limitada",

          espacioTitulo: "Nuestro espacio",
          espacio:
            "Nuestro taller es un espacio donde creatividad y tradición se unen para dar vida a cada vela.",
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
    localStorage.setItem("NuestroTaller", JSON.stringify(draft));
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

  const renderList = () => {
    if (isEditing) {
      return (
        <textarea
          name="lista"
          value={draft.lista}
          onChange={handleChange}
          className="textarea-edit"
        />
      );
    }

    return (
      <ul>
        {contenido.lista.split("\n").map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
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

      {/* TITULO + SUBTITULO */}
      {renderField("titulo", "h1", "title-edit")}
      {renderField("subtitulo", "h2", "subtitle-edit")}

      {/* CONTENIDO */}
      {renderField("intro")}

      {renderField("procesoTitulo", "h2", "subtitle-edit")}
      {renderField("proceso")}

      {renderField("filosofiaTitulo", "h2", "subtitle-edit")}
      {renderField("filosofia")}

      {renderField("materialesTitulo", "h2", "subtitle-edit")}
      {renderField("materiales")}

      {renderField("listaTitulo", "h2", "subtitle-edit")}
      {renderList()}

      {renderField("espacioTitulo", "h2", "subtitle-edit")}
      {renderField("espacio")}
    </div>
  );
}
