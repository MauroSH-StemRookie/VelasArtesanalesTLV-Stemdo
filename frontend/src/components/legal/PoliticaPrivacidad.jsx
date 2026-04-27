import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./PoliticaPrivacidad.css";

export default function PoliticaPrivacidad() {
  const { user } = useAuth();
  const isAdmin = user?.tipo === 1;

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [contenido, setContenido] = useState({
    titulo: "POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS",

    introduccion:
      "Artesanas de Velas se compromete a proteger los datos personales de los usuarios y cumplir la normativa vigente en materia de protección de datos.",

    leyes:
      "Esta política se adapta al RGPD (UE 2016/679), la LOPDGDD 3/2018 y la LSSI-CE 34/2002.",

    registro:
      "Los datos recogidos serán tratados para gestionar consultas, servicios y comunicaciones con el usuario.",

    principios:
      "Los datos se tratan bajo los principios de licitud, lealtad, transparencia, minimización, exactitud y seguridad.",

    categorias:
      "Solo se tratan datos identificativos. No se tratan datos sensibles.",

    baseLegal:
      "La base legal del tratamiento es el consentimiento del usuario.",

    finalidades:
      "Los datos se utilizan para gestión de servicios, atención al cliente, mejoras del sitio y comunicaciones comerciales.",

    conservacion:
      "Los datos se conservarán el tiempo necesario para cumplir la finalidad para la que fueron recogidos.",

    derechos:
      "El usuario puede ejercer derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad.",

    seguridad:
      "Se aplican medidas técnicas y organizativas para garantizar la seguridad de los datos personales.",

    menores:
      "Solo mayores de 14 años pueden dar consentimiento. En menores, será necesario consentimiento de padres o tutores.",

    enlaces:
      "El sitio puede contener enlaces a terceros con sus propias políticas de privacidad.",

    reclamaciones:
      "El usuario puede presentar reclamación ante la Agencia Española de Protección de Datos (AEPD).",

    cambios:
      "Artesanas de Velas se reserva el derecho a modificar esta política de privacidad.",
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
      <div className="privacidad-container">
        <h2 style={{ textAlign: "center" }}>Cargando contenido...</h2>
      </div>
    );
  }

  return (
    <div className="privacidad-container">
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
        <h1>🔐 {contenido.titulo}</h1>
      )}

      {/* SECCIONES */}
      <h2>Introducción</h2>
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

      <h2>Leyes aplicables</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="leyes"
          value={draft.leyes}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.leyes}</p>
      )}

      <h2>Registro de datos</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="registro"
          value={draft.registro}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.registro}</p>
      )}

      <h2>Principios</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="principios"
          value={draft.principios}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.principios}</p>
      )}

      <h2>Categorías de datos</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="categorias"
          value={draft.categorias}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.categorias}</p>
      )}

      <h2>Base legal</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="baseLegal"
          value={draft.baseLegal}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.baseLegal}</p>
      )}

      <h2>Finalidades</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="finalidades"
          value={draft.finalidades}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.finalidades}</p>
      )}

      <h2>Conservación</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="conservacion"
          value={draft.conservacion}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.conservacion}</p>
      )}

      <h2>Derechos del usuario</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="derechos"
          value={draft.derechos}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.derechos}</p>
      )}

      <h2>Seguridad</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="seguridad"
          value={draft.seguridad}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.seguridad}</p>
      )}

      <h2>Menores de edad</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="menores"
          value={draft.menores}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.menores}</p>
      )}

      <h2>Enlaces externos</h2>
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

      <h2>Reclamaciones</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="reclamaciones"
          value={draft.reclamaciones}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.reclamaciones}</p>
      )}

      <h2>Cambios en la política</h2>
      {isEditing ? (
        <textarea
          className="textarea-edit"
          name="cambios"
          value={draft.cambios}
          onChange={handleChange}
        />
      ) : (
        <p>{contenido.cambios}</p>
      )}
    </div>
  );
}
