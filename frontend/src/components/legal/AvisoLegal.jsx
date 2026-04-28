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
          titulo: "TÉRMINOS Y CONDICIONES GENERALES DE USO",

          introduccion:
            "El objeto de las presentes Condiciones Generales de Uso es regular el acceso y la utilización del Sitio Web, así como los servicios ofrecidos en él.",

          modificacion:
            "Aretsanas de Velas se reserva la facultad de modificar en cualquier momento el Sitio Web y sus contenidos sin previo aviso.",

          acceso:
            "El acceso al Sitio Web es libre y gratuito, salvo el coste de conexión a Internet del Usuario.",

          usuario:
            "El Usuario asume la responsabilidad del uso correcto del Sitio Web, comprometiéndose a no utilizarlo para fines ilícitos o contrarios a la ley.",

          responsabilidades:
            "Aretsanas de Velas no garantiza la continuidad ni la ausencia de errores en el acceso al Sitio Web.",

          enlaces:
            "El Sitio Web puede contener enlaces a sitios de terceros, sin que Aretsanas de Velas se responsabilice de sus contenidos.",

          propiedadIntelectual:
            "Todos los contenidos del Sitio Web son propiedad de Aretsanas de Velas y están protegidos por la legislación vigente.",

          jurisdiccion:
            "La relación entre el Usuario y Aretsanas de Velas se regirá por la legislación española.",
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
    localStorage.setItem("AvisoLegal", JSON.stringify(draft));
    setIsEditing(false);
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
      {/* ✏️ BOTÓN EDITAR */}
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

      {/* TÍTULO */}
      {isEditing ? (
        <textarea
          className="title-edit"
          name="titulo"
          value={draft.titulo}
          onChange={handleChange}
        />
      ) : (
        <h1>⚖️ {contenido.titulo}</h1>
      )}

      {/* INTRODUCCIÓN */}
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="introduccion"
          value={draft.introduccion}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.introduccion}</p>
      )}

      <h2>Modificación del sitio</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="modificacion"
          value={draft.modificacion}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.modificacion}</p>
      )}

      <h2>Acceso al sitio</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="acceso"
          value={draft.acceso}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.acceso}</p>
      )}

      <h2>Responsabilidad del usuario</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="usuario"
          value={draft.usuario}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.usuario}</p>
      )}

      <h2>Responsabilidad del sitio</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="responsabilidades"
          value={draft.responsabilidades}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.responsabilidades}</p>
      )}

      <h2>Política de enlaces</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="enlaces"
          value={draft.enlaces}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.enlaces}</p>
      )}

      <h2>Propiedad intelectual</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="propiedadIntelectual"
          value={draft.propiedadIntelectual}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.propiedadIntelectual}</p>
      )}

      <h2>Legislación y jurisdicción</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="jurisdiccion"
          value={draft.jurisdiccion}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.jurisdiccion}</p>
      )}
    </div>
  );
}
