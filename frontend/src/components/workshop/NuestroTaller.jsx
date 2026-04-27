import { useEffect, useState } from "react";
import "./NuestroTaller.css";

export default function NuestroTaller() {
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
      <div className="taller-page">
        <h2 style={{ textAlign: "center" }}>Cargando contenido...</h2>
      </div>
    );
  }

  return (
    <div className="taller-page">
      <h1>🏭 NUESTRO TALLER</h1>
      <h2>✨ El lugar donde nace cada vela</h2>

      <p>
        En nuestro taller es donde comienza todo el proceso creativo. Es el
        espacio donde transformamos materias primas cuidadosamente seleccionadas
        en velas artesanales únicas, hechas una a una con dedicación, paciencia
        y atención al detalle.
      </p>
      <p>
        Cada vela que producimos sigue un proceso completamente manual. Desde la
        preparación de la mezcla de ceras y fragancias, hasta el vertido, el
        enfriado y el acabado final, todo se realiza de forma artesanal. Esto
        nos permite cuidar cada detalle y asegurar un resultado único en cada
        pieza.
      </p>

      <h2>Cómo trabajamos</h2>
      <p>
        No trabajamos con producción industrial porque creemos en el valor de lo
        hecho a mano. Cada vela tiene su propio carácter, su propio ritmo y su
        propia esencia, algo que solo se consigue con tiempo y dedicación.
      </p>

      <h2>Materiales</h2>
      <p>
        Trabajamos con ceras de calidad, esencias cuidadosamente seleccionadas y
        mechas diseñadas para ofrecer una combustión limpia y duradera. Cada
        material es elegido pensando en la experiencia final.
      </p>

      <ul>
        <li>✔ Elaboración manual</li>
        <li>✔ Control de calidad en cada pieza</li>
        <li>✔ Atención al detalle</li>
        <li>✔ Producción cuidada y limitada</li>
      </ul>

      <h2>Nuestro espacio</h2>
      <p>
        Nuestro taller es un espacio donde creatividad y tradición se unen. Es
        el lugar donde diseñamos, probamos y creamos cada una de nuestras velas,
        manteniendo siempre la esencia de lo artesanal.
      </p>
    </div>
  );
}
