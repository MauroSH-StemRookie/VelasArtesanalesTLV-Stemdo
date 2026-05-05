import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Blog.css";

export default function Blog() {
  const { user } = useAuth();
  const isAdmin = user?.tipo === 1;

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [contenido, setContenido] = useState(() => {
    const saved = localStorage.getItem("Blog");
    return saved
      ? JSON.parse(saved)
      : {
          titulo: "📝 BLOG",
          intro:
            "Un espacio dedicado a la creación artesanal de velas, donde compartimos nuestro proceso, inspiración y el cuidado detrás de cada pieza hecha a mano.",

          post1_titulo: "El arte de crear velas artesanales",
          post1_texto:
            "Cada vela comienza con una idea, pero se transforma en algo único a través del trabajo manual, la paciencia y la elección cuidadosa de materiales.",

          post2_titulo: "La importancia de los materiales naturales",
          post2_texto:
            "Utilizar ceras y esencias de calidad no solo mejora el resultado final, sino que también garantiza una experiencia más limpia y duradera.",

          post3_titulo: "Detrás de cada vela",
          post3_texto:
            "En nuestro taller, cada pieza pasa por un proceso artesanal donde cuidamos cada detalle para mantener la esencia de lo hecho a mano.",
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
    localStorage.setItem("Blog", JSON.stringify(draft));
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="blog-page">
        <h2 style={{ textAlign: "center" }}>Cargando contenido...</h2>
      </div>
    );
  }

  return (
    <div className="blog-page">
      <div className="blog-container">
        {/* LAPIZ (MISMO SISTEMA QUE SOBRE NOSOTROS) */}
        {!isEditing && isAdmin && (
          <button className="edit-float-btn" onClick={startEdit}>
            ✏️
          </button>
        )}

        {/* BOTONES GUARDAR / CANCELAR */}
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

        {/* POST 1 */}
        <h2>
          {isEditing ? (
            <textarea
              className="textarea-edit"
              name="post1_titulo"
              value={draft.post1_titulo}
              onChange={handleChange}
            />
          ) : (
            contenido.post1_titulo
          )}
        </h2>

        {isEditing ? (
          <textarea
            className="textarea-edit"
            name="post1_texto"
            value={draft.post1_texto}
            onChange={handleChange}
          />
        ) : (
          <p>{contenido.post1_texto}</p>
        )}

        {/* POST 2 */}
        <h2>
          {isEditing ? (
            <textarea
              className="textarea-edit"
              name="post2_titulo"
              value={draft.post2_titulo}
              onChange={handleChange}
            />
          ) : (
            contenido.post2_titulo
          )}
        </h2>

        {isEditing ? (
          <textarea
            className="textarea-edit"
            name="post2_texto"
            value={draft.post2_texto}
            onChange={handleChange}
          />
        ) : (
          <p>{contenido.post2_texto}</p>
        )}

        {/* POST 3 */}
        <h2>
          {isEditing ? (
            <textarea
              className="textarea-edit"
              name="post3_titulo"
              value={draft.post3_titulo}
              onChange={handleChange}
            />
          ) : (
            contenido.post3_titulo
          )}
        </h2>

        {isEditing ? (
          <textarea
            className="textarea-edit"
            name="post3_texto"
            value={draft.post3_texto}
            onChange={handleChange}
          />
        ) : (
          <p>{contenido.post3_texto}</p>
        )}
      </div>
    </div>
  );
}
