import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./PoliticaCookies.css";

export default function Cookies() {
  const { user } = useAuth();
  const isAdmin = user?.tipo === 1;

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [contenido, setContenido] = useState(() => {
    const saved = localStorage.getItem("Cookies");

    return saved
      ? JSON.parse(saved)
      : {
          titulo: "",

          introduccion: "",

          queSonTitulo: "",
          definicion: "",

          usoTitulo: "",
          uso: "",

          noUsoTitulo: "",
          noUso: "",

          quienTitulo: "",
          quien: "",

          evitarTitulo: "",
          evitar: "",

          eliminarTitulo: "",
          eliminar: "",

          tiposEntidadTitulo: "",
          tiposEntidad: "",

          tiposFinalidadTitulo: "",
          tiposFinalidad: "",

          tiposTiempoTitulo: "",
          tiposTiempo: "",

          tecnicasTitulo: "",
          tecnicas: "",

          tercerosTitulo: "",
          terceros: "",

          cambiosTitulo: "",
          cambios: "",

          contactoTitulo: "",
          contacto: "",
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
    localStorage.setItem("Cookies", JSON.stringify(draft));
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
      <div className="cookies-page">
        <h2 style={{ textAlign: "center" }}>Cargando contenido...</h2>
      </div>
    );
  }

  return (
    <div className="cookies-page">
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
      {renderField("titulo", "h1", "title-edit")}

      {renderField("introduccion")}

      {renderField("queSonTitulo", "h2", "subtitle-edit")}
      {renderField("definicion")}

      {renderField("usoTitulo", "h2", "subtitle-edit")}
      {renderField("uso")}

      {renderField("noUsoTitulo", "h2", "subtitle-edit")}
      {renderField("noUso")}

      {renderField("quienTitulo", "h2", "subtitle-edit")}
      {renderField("quien")}

      {renderField("evitarTitulo", "h2", "subtitle-edit")}
      {renderField("evitar")}

      {renderField("eliminarTitulo", "h2", "subtitle-edit")}
      {renderField("eliminar")}

      {renderField("tiposEntidadTitulo", "h2", "subtitle-edit")}
      {renderField("tiposEntidad")}

      {renderField("tiposFinalidadTitulo", "h2", "subtitle-edit")}
      {renderField("tiposFinalidad")}

      {renderField("tiposTiempoTitulo", "h2", "subtitle-edit")}
      {renderField("tiposTiempo")}

      {renderField("tecnicasTitulo", "h2", "subtitle-edit")}
      {renderField("tecnicas")}

      {renderField("tercerosTitulo", "h2", "subtitle-edit")}
      {renderField("terceros")}

      {renderField("cambiosTitulo", "h2", "subtitle-edit")}
      {renderField("cambios")}

      {renderField("contactoTitulo", "h2", "subtitle-edit")}
      {renderField("contacto")}
    </div>
  );
}
