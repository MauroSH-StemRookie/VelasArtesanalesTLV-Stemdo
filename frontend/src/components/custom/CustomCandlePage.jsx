import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { IconBack, IconFlame, IconArrow } from "../icons/Icons";
import { aromaAPI, colorAPI, categoriaAPI } from "../../services/api";
import "./CustomCandlePage.css";

/* ==========================================================================
   PERSONALIZA TU VELA
   -------------------
   El usuario elige tipo, aroma, color, tamano, cantidad y deja un mensaje.
   Si esta logueado, sus datos de contacto se precargan.

   TODO BACKEND: Cuando la API de pedidos personalizados este lista,
   el boton "Solicitar presupuesto" creara un pedido especial:
   POST /api/pedidos con { tipo: 'personalizado', datos_personalizacion: {...}, ... }

   El boton "Mas informacion" redirigira a una URL que Sergio proporcionara.
   De momento muestra un aviso indicando que el enlace esta pendiente.
   ========================================================================== */

export default function CustomCandlePage({ onBack }) {
  useEffect(() => {
    Promise.all([aromaAPI.getAll(), colorAPI.getAll(), categoriaAPI.getAll()])
      .then(([dataAromas, dataColores, dataCategorias]) => {
        setAromas(dataAromas);
        setColores(dataColores);
        setCategorias(dataCategorias);
      })
      .catch(console.error)
      .finally(() => setLoadingOpts(false));
  }, []);
  const [aromas, setAromas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [colores, setColores] = useState([]);
  const TIPOS_VELA = ["Aromatica", "Decorativa", "Liturgica", "Cirio", "Otra"];
  const [loadingOpts, setLoadingOpts] = useState(true);
  const { user } = useAuth();

  // Si el usuario esta logueado, precargamos sus datos de contacto
  const [form, setForm] = useState({
    tipo: "",
    aroma: "",
    color: "",
    categoria: "",
    mensaje: "",
    cantidad: 1,
    nombre: user?.nombre || "",
    email: user?.correo || "",
    telefono: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function update(field, value) {
    setForm(function (prev) {
      return Object.assign({}, prev, { [field]: value });
    });
  }

  // El boton solo se activa si se ha elegido un tipo y hay datos de contacto
  var canSubmit =
    form.tipo &&
    form.nombre.trim() &&
    form.email.trim() &&
    form.telefono.trim();

  function handleSubmit() {
    if (!canSubmit) return;

    // TODO BACKEND: Aqui se creara el pedido personalizado cuando la API este lista.
    // El fetch sera algo asi:
    //
    // await pedidosAPI.create({
    //   tipo: 'personalizado',
    //   datos_personalizacion: {
    //     tipo_vela: form.tipo,
    //     aroma: form.aroma,
    //     color: form.color,
    //     categorias: form categorias
    //     mensaje: form.mensaje,
    //     cantidad: form.cantidad,
    //   },
    //   datos_cliente: {
    //     nombre: form.nombre,
    //     email: form.email,
    //     telefono: form.telefono,
    //   },
    //   usuario_id: user?.id || null,
    // })

    setSubmitted(true);
  }

  // -- Pantalla de confirmacion despues de enviar --
  if (submitted) {
    return (
      <div className="custom-page">
        <div className="custom-result">
          <div className="custom-result-icon">
            <IconFlame />
          </div>
          <h2>Solicitud enviada</h2>
          <p>
            Hemos recibido tu solicitud de vela personalizada. Nos pondremos en
            contacto contigo en las proximas 24-48 horas para confirmar los
            detalles y el presupuesto.
          </p>
          <button className="custom-btn-primary" onClick={onBack}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // -- Formulario principal --
  return (
    <div className="custom-page">
      {/* Cabecera con boton de volver */}
      <div className="custom-header">
        <button className="custom-back" onClick={onBack}>
          <IconBack /> Volver a la tienda
        </button>
      </div>

      {/* Titulo e introduccion */}
      <div className="custom-hero">
        <h1>Personaliza tu vela</h1>
        <p>
          Disena tu vela ideal eligiendo el tipo, aroma, color y categoria. Nos
          encargaremos de hacerla realidad con todo el carino artesanal que nos
          caracteriza.
        </p>
        {/* Boton "Mas informacion" — URL pendiente de Sergio */}
        <button
          className="custom-moreinfo"
          onClick={function () {
            // TODO: Sustituir por la URL real que proporcione Sergio
            window.alert(
              "Enlace de mas informacion pendiente de configurar por el cliente.",
            );
          }}
        >
          Mas informacion sobre velas personalizadas
          <IconArrow />
        </button>
      </div>

      {/* Formulario dividido en dos bloques */}
      <div className="custom-body">
        {/* Bloque 1: Diseno de la vela */}
        <div className="custom-card">
          <h3>
            <IconFlame /> Disena tu vela
          </h3>

          <div className="custom-field">
            <label>Tipo de vela *</label>
            <div className="custom-pills">
              {TIPOS_VELA.map(function (t) {
                return (
                  <button
                    key={t}
                    type="button"
                    className={
                      form.tipo === t ? "custom-pill active" : "custom-pill"
                    }
                    onClick={function () {
                      update("tipo", t);
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="custom-field">
            <label>Aroma</label>
            <div className="custom-pills">
              {aromas.map((a) => (
                <button
                  key={a.id}
                  className={`custom-pill ${form.aroma === a.id ? "active" : ""}`}
                  onClick={() => update("aroma", a.id)}
                >
                  {a.nombre_aroma}{" "}
                  {/* Utiliza los campos de la nueva api del día 13/04 */}
                </button>
              ))}
            </div>
          </div>

          <div className="custom-field">
            <label>Color</label>
            <div className="custom-pills">
              {colores.map((c) => (
                <button
                  key={c.id}
                  className={`custom-pill ${form.color === c.id ? "active" : ""}`}
                  onClick={() => update("color", c.id)}
                >
                  {c.color}{" "}
                  {/* Utiliza los campos de la nueva api del día 13/04 */}
                </button>
              ))}
            </div>
          </div>

          <div className="custom-field">
            <label>Catregoria</label>
            <div className="custom-pills">
              {categorias.map((c) => (
                <button
                  key={c.id}
                  className={`custom-pill${form.categoria === c.id ? " active" : ""}`}
                  onClick={() => update("categoria", c.id)}
                >
                  {c.nombre_categoria}
                </button>
              ))}
            </div>
          </div>

          <div className="custom-field">
            <label>Mensaje o dedicatoria (opcional)</label>
            <textarea
              placeholder="Escribe aqui si quieres una dedicatoria, grabado o detalle especial..."
              value={form.mensaje}
              onChange={function (e) {
                update("mensaje", e.target.value);
              }}
              rows="3"
            />
          </div>

          <div className="custom-field">
            <label>Cantidad</label>
            <div className="custom-qty">
              <button
                type="button"
                onClick={function () {
                  update("cantidad", Math.max(1, form.cantidad - 1));
                }}
              >
                &minus;
              </button>
              <input
                type="number"
                min="1"
                max="99"
                value={form.cantidad}
                onBlur={(e) => {
                  // Al salir del campo, convierte a número válido
                  const val = parseInt(e.target.value, 10);
                  setQty(
                    p.id,
                    isNaN(val) ? 1 : Math.min(p.stock, Math.max(1, val)),
                  );
                }}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val))
                    update("cantidad", Math.min(99, Math.max(1, val)));
                }}
              />
              <button
                type="button"
                onClick={function () {
                  update("cantidad", Math.min(99, form.cantidad + 1));
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Bloque 2: Datos de contacto */}
        <div className="custom-card">
          <h3>Tus datos de contacto</h3>

          <div className="custom-field">
            <label>Nombre completo *</label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={function (e) {
                update("nombre", e.target.value);
              }}
            />
          </div>

          <div className="custom-field-row">
            <div className="custom-field">
              <label>Email *</label>
              <input
                type="email"
                placeholder="tu@correo.com"
                value={form.email}
                onChange={function (e) {
                  update("email", e.target.value);
                }}
              />
            </div>
            <div className="custom-field">
              <label>Telefono *</label>
              <input
                type="tel"
                placeholder="600 000 000"
                value={form.telefono}
                onChange={function (e) {
                  update("telefono", e.target.value);
                }}
              />
            </div>
          </div>
        </div>

        {/* Boton de envio */}
        <button
          className="custom-btn-primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          Solicitar presupuesto
          <IconArrow />
        </button>
      </div>
    </div>
  );
}
