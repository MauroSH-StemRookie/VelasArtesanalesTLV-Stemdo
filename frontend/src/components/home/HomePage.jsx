import { HERO_PRODUCTS, CATEGORIES, VALUES } from "../../data/staticData";
import { FadeUp } from "../../hooks/useFadeUp";
import { IconArrow, IconFlame } from "../icons/Icons";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ==========================================================================
    PAGINA DE INICIO — migrada a react-router-dom
    --------------------------------------------
    - "Ver Coleccion" y "Explorar" navegan a /catalogo
    - "Diseñar mi vela" navega a /personalizar
    - Usamos useNavigate en vez del prop onNavigate que tenia antes
    ========================================================================== */

export default function HomePage() {
  const navigate = useNavigate();
  const [catIndex, setCatIndex] = useState({});

  function goToCatalog(e) {
    e.preventDefault();
    navigate("/catalogo");
  }
  function goToCustom(e) {
    e.preventDefault();
    navigate("/personalizar");
  }
  function goToBlog(e) {
    e.preventDefault();
    navigate("/blog");
  }
  useEffect(() => {
    const interval = setInterval(() => {
      setCatIndex((prev) => {
        const updated = { ...prev };

        CATEGORIES.forEach((cat) => {
          const len = cat.images.length;
          const current = prev[cat.title] || 0;
          updated[cat.title] = (current + 1) % len;
        });

        return updated;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-eyebrow">Artesania desde Talavera</div>
          <h1 className="hero-title">
            Velas hechas
            <br />
            con <em>alma</em>
          </h1>
          <p className="hero-desc">
            Elaboramos a mano cada vela con ceras naturales y fragancias
            cuidadosamente seleccionadas. Aromaticas, decorativas y liturgicas
            &mdash; cada pieza cuenta una historia.
          </p>
          <div className="hero-buttons">
            <a href="#" className="btn-primary" onClick={goToCatalog}>
              <span>Ver Coleccion</span>
              <IconArrow />
            </a>
            <a href="#" className="btn-secondary" onClick={goToBlog}>
              Nuestra Historia
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card-grid">
            {HERO_PRODUCTS.map((p) => (
              <div className="hero-card" key={p.name}>
                <div className="hero-card-img">
                  <img src={p.image} alt={p.name} className="hero-img" />
                </div>
                <div className="hero-card-body">
                  <h4>{p.name}</h4>
                  <p>{p.desc}</p>
                  <div className="price">{p.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="categories">
        <div className="section-header">
          <div className="section-eyebrow">Nuestras colecciones</div>
          <h2 className="section-title">Encuentra tu vela perfecta</h2>
          <div className="section-divider" />
        </div>
        <div className="cat-grid">
          {CATEGORIES.map((cat, i) => (
            <FadeUp key={cat.title} delay={i * 0.1}>
              <div className="cat-card">
                <div className="cat-card-visual">
                  <div className="cat-images">
                    <img
                      src={cat.images[catIndex[cat.title] || 0]}
                      alt={cat.title}
                      className="cat-main-img fade"
                    />
                  </div>
                  <div className="cat-icon">{cat.icon}</div>
                </div>
                <div className="cat-card-content">
                  <h3>{cat.title}</h3>
                  <p>{cat.desc}</p>
                  <a href="#" className="cat-link" onClick={goToCatalog}>
                    Explorar <IconArrow />
                  </a>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* CTA Banner — ahora navega a "Personaliza tu vela" */}
      <section className="cta-banner">
        <div className="cta-text">
          <h2>Personaliza tu vela</h2>
          <p>
            Creamos velas a medida para bodas, bautizos, comuniones y cualquier
            evento especial.
          </p>
        </div>
        <a href="#" className="btn-cta" onClick={goToCustom}>
          Diseñar mi vela <IconArrow />
        </a>
      </section>

      <section className="values">
        <div className="section-header">
          <div className="section-eyebrow">Por que elegirnos</div>
          <h2 className="section-title">Artesania con proposito</h2>
          <div className="section-divider" />
        </div>
        <div className="values-grid">
          {VALUES.map((v, i) => (
            <FadeUp key={v.title} delay={i * 0.1}>
              <div className="value-item">
                <div className="value-icon">{v.icon}</div>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>
    </>
  );
}
