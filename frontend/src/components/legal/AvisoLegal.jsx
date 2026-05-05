import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./AvisoLegal.css";

export default function AvisoLegal() {
  const { user } = useAuth();
  const isAdmin = user?.tipo === 1;

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [contenido, setContenido] = useState(() => {
    const saved = localStorage.getItem("AvisoLegal");
    return saved
      ? JSON.parse(saved)
      : {
          tituloPrincipal: "",

          objetoTitulo: "",
          objetoTexto: "",

          usuarioTitulo: "",
          usuarioTexto: "",

          tituloPrincipal1: "",
          accesoTexto: "",

          tituloPrincipal2: "",
          accesoTexto: "",

          enlacesTitulo: "",
          enlacesTexto: "",

          propiedadTitulo: "",
          propiedadTexto: "",

          tituloPrincipal4: "",
          accesoTexto: "",

          jurisdiccionTitulo: "",
          jurisdiccionTexto: "",
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
    localStorage.setItem("AvisoLegal", JSON.stringify(draft));
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
          placeholder={`Escribe ${name}...`}
        />
      );
    }

    const Tag = tag;
    return <Tag>{contenido[name]}</Tag>;
  };

  if (loading) {
    return (
      <div className="legal-page">
        <h2 style={{ textAlign: "center" }}>Cargando contenido...</h2>
      </div>
    );
  }

  return (
    <div className="legal-page">
      {/* BOTÓN EDITAR */}
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

      {/* CONTENIDO */}
      {renderField("tituloPrincipal", "h1", "title-edit")}

      {renderField("objetoTitulo", "h2", "subtitle-edit")}
      {renderField("objetoTexto")}

      {renderField("usuarioTitulo", "h2", "subtitle-edit")}
      {renderField("usuarioTexto")}

      {renderField("tituloPrincipal1", "h1", "title-edit")}

      {renderField("accesoTitulo", "h2", "subtitle-edit")}
      {renderField("accesoTexto")}

      {renderField("tituloPrincipal2", "h1", "title-edit")}

      {renderField("propiedadTitulo", "h2", "subtitle-edit")}
      {renderField("propiedadTexto")}

      {renderField("tituloPrincipal3", "h1", "title-edit")}

      {renderField("legalTitulo", "h2", "subtitle-edit")}
      {renderField("legalTexto")}

      {renderField("tituloPrincipal4", "h1", "title-edit")}
      {renderField("jurisdiccionTitulo", "h2", "subtitle-edit")}
      {renderField("jurisdiccionTexto")}
    </div>
  );
}
