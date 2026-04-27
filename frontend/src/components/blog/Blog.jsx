import { useEffect, useState } from "react";
import "./Blog.css";

export default function SobreNosotros() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    window.scrollTo(0, 0);

    return () => clearTimeout(timer);
  }, []);

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
        <h1>📝 BLOG</h1>

        <p className="blog-intro">
          Un espacio dedicado a la creación artesanal de velas, donde
          compartimos nuestro proceso, inspiración y el cuidado detrás de cada
          pieza hecha a mano.
        </p>

        {/* POST 1 */}
        <div className="blog-post">
          <h2>El arte de crear velas artesanales</h2>
          <p>
            Cada vela comienza con una idea, pero se transforma en algo único a
            través del trabajo manual, la paciencia y la elección cuidadosa de
            materiales.
          </p>
        </div>

        {/* POST 2 */}
        <div className="blog-post">
          <h2>La importancia de los materiales naturales</h2>
          <p>
            Utilizar ceras y esencias de calidad no solo mejora el resultado
            final, sino que también garantiza una experiencia más limpia y
            duradera.
          </p>
        </div>

        {/* POST 3 */}
        <div className="blog-post">
          <h2>Detrás de cada vela</h2>
          <p>
            En nuestro taller, cada pieza pasa por un proceso artesanal donde
            cuidamos cada detalle para mantener la esencia de lo hecho a mano.
          </p>
        </div>
      </div>
    </div>
  );
}
