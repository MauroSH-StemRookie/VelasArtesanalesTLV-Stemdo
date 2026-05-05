import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./PoliticaPrivacidad.css";

export default function PoliticaPrivacidad() {
  const { user } = useAuth();
  const isAdmin = user?.tipo === 1;

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [contenido, setContenido] = useState(() => {
    const saved = localStorage.getItem("PoliticaPrivacidad");

    return saved
      ? JSON.parse(saved)
      : {
          tituloPrincipal: "",

          intro: "",

          leyesTitulo: "",
          leyesTexto: "",
          rgpd: "",
          lopd: "",
          rd: "",
          lssi: "",

          registroTitulo: "",
          registroTexto: "",

          principiosTitulo: "",
          principiosTexto: "",

          categoriasTitulo: "",
          categoriasTexto: "",

          baseLegalTitulo: "",
          baseLegalTexto: "",

          finesTitulo: "",
          finesTexto: "",

          conservacionTitulo: "",
          conservacionTexto: "",

          destinatariosTitulo: "",
          destinatariosTexto: "",

          menoresTitulo: "",
          menoresTexto: "",

          seguridadTitulo: "",
          seguridadTexto: "",

          derechosTitulo: "",
          derechosTexto: "",

          enlacesTitulo: "",
          enlacesTexto: "",

          reclamacionesTitulo: "",
          reclamacionesTexto: "",

          tituloPrincipal1: "",

          cambiosTitulo: "",
          cambiosTexto: "",
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
    localStorage.setItem("PoliticaPrivacidad", JSON.stringify(draft));
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

      {renderField("intro")}

      {renderField("leyesTitulo", "h2", "subtitle-edit")}
      {renderField("leyesTexto")}

      {renderField("registroTitulo", "h2", "subtitle-edit")}
      {renderField("registroTexto")}

      {renderField("principiosTitulo", "h2", "subtitle-edit")}
      {renderField("principiosTexto")}

      {renderField("categoriasTitulo", "h2", "subtitle-edit")}
      {renderField("categoriasTexto")}

      {renderField("baseLegalTitulo", "h2", "subtitle-edit")}
      {renderField("baseLegalTexto")}

      {renderField("finesTitulo", "h2", "subtitle-edit")}
      {renderField("finesTexto")}

      {renderField("conservacionTitulo", "h2", "subtitle-edit")}
      {renderField("conservacionTexto")}

      {renderField("destinatariosTitulo", "h2", "subtitle-edit")}
      {renderField("destinatariosTexto")}

      {renderField("menoresTitulo", "h2", "subtitle-edit")}
      {renderField("menoresTexto")}

      {renderField("seguridadTitulo", "h2", "subtitle-edit")}
      {renderField("seguridadTexto")}

      {renderField("derechosTitulo", "h2", "subtitle-edit")}
      {renderField("derechosTexto")}

      {renderField("enlacesTitulo", "h2", "subtitle-edit")}
      {renderField("enlacesTexto")}

      {renderField("reclamacionesTitulo", "h2", "subtitle-edit")}
      {renderField("reclamacionesTexto")}

      {renderField("tituloPrincipal1", "h1", "title-edit")}

      {renderField("cambiosTitulo", "h2", "subtitle-edit")}
      {renderField("cambiosTexto")}
    </div>
  );
}
