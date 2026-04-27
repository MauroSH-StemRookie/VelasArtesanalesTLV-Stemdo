import { useEffect, useState } from "react";
import "./SobreNosotros.css";

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
      <div className="nosotros-page">
        <h2 style={{ textAlign: "center" }}>Cargando contenido...</h2>
      </div>
    );
  }

  return (
    <div className="nosotros-page">
      <h1>🕯️SOBRE NOSOTROS</h1>

      <p>
        En Artesanas de Velas, cada vela cuenta una historia. Somos un pequeño
        taller artesanal dedicado a la creación de velas hechas a mano,
        combinando tradición, creatividad y materiales naturales.
      </p>

      <h2>Nuestra historia</h2>
      <p>
        Nacimos con la idea de recuperar la esencia de lo artesanal, creando
        productos únicos que aporten calidez y personalidad a cualquier espacio.
        Cada pieza es elaborada con mimo, cuidando cada detalle desde el diseño
        hasta el acabado final.
      </p>

      <h2>Nuestra filosofía</h2>
      <p>
        Apostamos por una producción responsable y sostenible, utilizando ceras
        naturales y evitando materiales contaminantes. Creemos en el valor de lo
        hecho a mano, en la autenticidad y en la conexión con lo local.
      </p>

      <h2>Qué nos hace diferentes</h2>
      <p>
        No fabricamos en masa. Cada vela es única. Nos centramos en la calidad,
        el diseño y la experiencia que transmite cada producto.
      </p>

      <ul>
        <li>✔ Hechas a mano una a una</li>
        <li>✔ Materiales naturales</li>
        <li>✔ Diseños originales</li>
        <li>✔ Producción local</li>
      </ul>

      <h2>Nuestro compromiso</h2>
      <p>
        Queremos que cada vela no solo ilumine, sino que cree un ambiente
        especial. Trabajamos para ofrecer productos que transmitan calma,
        belleza y personalidad.
      </p>
    </div>
  );
}
