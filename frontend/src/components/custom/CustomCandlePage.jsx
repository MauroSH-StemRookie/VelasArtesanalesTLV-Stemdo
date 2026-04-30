import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { IconBack, IconFlame, IconArrow } from "../icons/Icons";
import {
  aromaAPI,
  colorAPI,
  categoriaAPI,
  usuarioAPI,
  pedidosPersonalizadosAPI,
} from "../../services/api";
import "./CustomCandlePage.css";

/* ==========================================================================
   PERSONALIZA TU VELA
   -------------------
   El usuario elige tipo, aroma, color, categoria, tamano, cantidad y deja un
   mensaje. Si esta logueado, sus datos de contacto se precargan con lo que
   devuelve GET /api/usuario/me (nombre, correo y telefono).

   TODO BACKEND: Cuando la API de pedidos personalizados este lista,
   el boton "Solicitar presupuesto" creara un pedido especial:
   POST /api/pedidos con { tipo: 'personalizado', datos_personalizacion: {...}, ... }

   El boton "Mas informacion" redirigira a una URL que Sergio proporcionara.
   De momento muestra un aviso indicando que el enlace esta pendiente.
   ========================================================================== */

const TIPOS_VELA = ["Aromatica", "Decorativa", "Liturgica", "Cirio", "Otra"];

export default function CustomCandlePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [aromas, setAromas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [colores, setColores] = useState([]);
  const [loadingOpts, setLoadingOpts] = useState(true);
  const [mensajeError, setMensajeError] = useState(false);

  /* Estado inicial del formulario. El nombre y correo los podemos prellenar
     directamente desde el AuthContext porque los tenemos al loguear, pero el
     telefono no viaja en el token: para eso hace falta el GET /me. */
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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  /* Panel desplegable de FAQ de personalizacion. Empezamos cerrado para
     no abrumar al visitante; lo abre/cierra el boton "Mas informacion". */
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  /* Carga en paralelo los catalogos de aromas/colores/categorias.
     Son listas pequenas que no necesitan paginacion. */
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

  /* Si el usuario esta logueado, pedimos su perfil completo para autocompletar
     el telefono. Usamos una bandera para no pisar campos que el usuario ya
     haya editado a mano antes de que llegara la respuesta.

     NOTA: Si hay token pero /me devuelve 401 (token caducado), el helper de
     api.js ya limpia localStorage. No hacemos nada aqui, el usuario seguira
     rellenando a mano como si no estuviera logueado. */
  useEffect(() => {
    if (!user) return;
    let cancelado = false;

    async function cargarPerfil() {
      try {
        const perfil = await usuarioAPI.me.obtener();
        if (cancelado) return;
        setForm(function (prev) {
          return Object.assign({}, prev, {
            /* Solo pisamos el valor si el campo sigue vacio. Asi, si el usuario
               ya ha empezado a escribir, no le borramos lo que ha puesto. */
            nombre: prev.nombre || perfil?.nombre || "",
            email: prev.email || perfil?.correo || "",
            telefono: prev.telefono || perfil?.telefono || "",
          });
        });
      } catch (err) {
        /* Si falla /me, seguimos con lo que haya. No bloqueamos el formulario. */
        console.warn("No se ha podido autocompletar el perfil:", err.message);
      }
    }
    cargarPerfil();

    return function () {
      cancelado = true;
    };
  }, [user]);

  function update(field, value) {
    setForm(function (prev) {
      return Object.assign({}, prev, { [field]: value });
    });
  }

  /* El boton solo se activa si hay tipo + datos de contacto validos +
     descripcion. Sin descripcion Sergio no sabe que quiere el cliente —
     antes era opcional pero el resultado practico era que llegaban
     solicitudes vacias y habia que pedir info por correo, asi que ahora
     la pedimos en el formulario. */
  const canSubmit =
    form.tipo &&
    form.nombre.trim() &&
    form.email.trim() &&
    form.telefono.trim() &&
    form.mensaje.trim();

  /* Helpers para traducir los IDs seleccionados a nombres legibles. El
     backend solo guarda `descripcion` (texto libre) e `id_producto` como
     referencia, asi que si el usuario eligio aroma/color/categoria, los
     incluimos dentro de la descripcion para que a Sergio le quede todo a
     la vista al abrir la solicitud. */
  function nombreDe(lista, id, campo) {
    if (id === "" || id === null || id === undefined) return "";
    const match = lista.find(function (x) {
      return x.id === id;
    });
    return match ? match[campo] || "" : "";
  }

  function construirDescripcion() {
    const lineas = [];

    if (form.tipo) lineas.push("Tipo: " + form.tipo);

    const aromaNombre = nombreDe(aromas, form.aroma, "nombre_aroma");
    if (aromaNombre) lineas.push("Aroma: " + aromaNombre);

    const colorNombre = nombreDe(colores, form.color, "color");
    if (colorNombre) lineas.push("Color: " + colorNombre);

    const categoriaNombre = nombreDe(
      categorias,
      form.categoria,
      "nombre_categoria",
    );
    if (categoriaNombre) lineas.push("Categoria: " + categoriaNombre);

    lineas.push("Cantidad: " + form.cantidad);

    if (form.mensaje && form.mensaje.trim()) {
      lineas.push("");
      lineas.push("<strong>Mensaje del cliente:</strong>");
      lineas.push(form.mensaje.trim());
    }

    return lineas.join("<br>");
  }

  /* Envio real de la solicitud personalizada al backend.
     ------------------------------------------------------
     El backend guarda:
       - descripcion  (texto libre con todo el detalle)
       - id_producto  (opcional — aqui no lo enviamos porque el formulario
                       trabaja con categorias/aromas, no con productos
                       existentes. Si un dia se pudiera escoger "igual que
                       este producto pero...", se rellenaria aqui.)
       - cantidad     (entero)
       - nombre, correo, telefono
     Si el usuario esta logueado, el backend asocia la solicitud al usuario
     mediante el token. Si no, queda como solicitud de invitado. */
  async function handleSubmit() {
    if (submitting) return;

    // ✅ validar mensaje (tu requisito nuevo)
    if (!form.mensaje.trim()) {
      setMensajeError(true);
      return;
    }

    // ✅ validar resto de campos (antes lo hacía canSubmit)
    if (
      !form.tipo ||
      !form.nombre.trim() ||
      !form.email.trim() ||
      !form.telefono.trim()
    ) {
      setSubmitError("Completa todos los campos obligatorios.");
      return;
    }

    setMensajeError(false);
    setSubmitting(true);
    setSubmitError("");

    try {
      await pedidosPersonalizadosAPI.create({
        nombre: form.nombre.trim(),
        correo: form.email.trim(),
        telefono: form.telefono.trim(),

        tipo: form.tipo,
        aroma: nombreDe(aromas, form.aroma, "nombre_aroma"),
        color: nombreDe(colores, form.color, "color"),
        categoria: nombreDe(categorias, form.categoria, "nombre_categoria"),

        descripcion: form.mensaje.trim(),
        id_producto: null,
        cantidad: form.cantidad,
      });

      setSubmitted(true);
    } catch (err) {
      console.error("Error al enviar:", err.message);
      setSubmitError("No hemos podido enviar tu solicitud.");
    } finally {
      setSubmitting(false);
    }
  }
  function normalizarCantidad(valorBruto) {
    const n = parseInt(valorBruto, 10);
    if (isNaN(n)) return 1;
    if (n < 1) return 1;
    if (n > 99) return 99;
    return n;
  }
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
          <button className="custom-btn-primary" onClick={() => navigate("/")}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  /* -- Formulario principal -- */
  return (
    <div className="custom-page">
      {/* Cabecera con boton de volver */}
      <div className="custom-header">
        <button className="custom-back" onClick={() => navigate("/")}>
          <IconBack /> Volver a la tienda
        </button>
      </div>

      {/* Titulo e introduccion */}
      <div className="custom-hero">
        <h1>Personaliza tu vela</h1>
        <p>
          Diseña tu vela ideal eligiendo el tipo, aroma, color y categoria. Nos
          encargaremos de hacerla realidad con todo el carino artesanal que nos
          caracteriza.
        </p>
        <p>Los campos con * son obligatorios</p>
        {/* Boton "Mas informacion" — URL pendiente de Sergio */}
        <button className="custom-moreinfo" onClick={() => navigate("/ayuda")}>
          Mas informacion sobre velas personalizadas
          <IconArrow />
        </button>

        {showMoreInfo && (
          <div className="custom-moreinfo-panel">
            <div className="custom-moreinfo-item">
              <h4>¿Cuanto tarda en estar lista?</h4>
              <p>
                Las velas personalizadas se elaboran a mano una vez confirmamos
                el presupuesto. El plazo habitual es de <strong>7 a 14 dias</strong>{" "}
                segun la complejidad. Si tienes una fecha limite (boda, cumpleanos,
                evento), indicalo en el mensaje y haremos lo posible por
                ajustarnos.
              </p>
            </div>
            <div className="custom-moreinfo-item">
              <h4>¿Como se calcula el precio?</h4>
              <p>
                No hay tarifa fija — depende del tipo, tamano, materiales y nivel
                de detalle. Tras enviar la solicitud, Sergio te respondera por
                correo con un presupuesto personalizado. Sin compromiso.
              </p>
            </div>
            <div className="custom-moreinfo-item">
              <h4>¿Puedo personalizar el grabado?</h4>
              <p>
                Si. Indicanos en el campo de descripcion el texto, fuente
                aproximada y donde quieres que aparezca. Para regalos
                consultamos antes de elaborar para asegurarnos del resultado.
              </p>
            </div>
            <div className="custom-moreinfo-item">
              <h4>¿Que pasa despues de enviar el formulario?</h4>
              <p>
                Recibirimos tu solicitud y te contactaremos en menos de 48
                horas para confirmar detalles, presupuesto y plazo.
                Si necesitas algo urgente, llamanos directamente.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Formulario dividido en dos bloques */}
      <div className="custom-body">
        {/* Bloque 1: Diseno de la vela */}
        <div className="custom-card">
          <h3>
            <IconFlame /> Diseña tu vela
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
                  type="button"
                  className={
                    form.aroma === a.id ? "custom-pill active" : "custom-pill"
                  }
                  onClick={() => update("aroma", a.id)}
                >
                  {a.nombre_aroma}
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
                  type="button"
                  className={
                    form.color === c.id ? "custom-pill active" : "custom-pill"
                  }
                  onClick={() => update("color", c.id)}
                >
                  {c.color}
                </button>
              ))}
            </div>
          </div>

          <div className="custom-field">
            <label>Categoria</label>
            <div className="custom-pills">
              {categorias.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={
                    form.categoria === c.id
                      ? "custom-pill active"
                      : "custom-pill"
                  }
                  onClick={() => update("categoria", c.id)}
                >
                  {c.nombre_categoria}
                </button>
              ))}
            </div>
          </div>

          <div className="custom-field">
            <label>Mensaje o dedicatoria *</label>
            <textarea
              className={mensajeError ? "input-error" : ""}
              placeholder="Escribe aqui si quieres una dedicatoria..."
              value={form.mensaje}
              onChange={(e) => {
                update("mensaje", e.target.value);
                if (e.target.value.trim()) setMensajeError(false);
              }}
              rows="3"
              required
            />

            {mensajeError && (
              <p className="error-text">Este campo es obligatorio</p>
            )}
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
                onBlur={(e) =>
                  update("cantidad", normalizarCantidad(e.target.value))
                }
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    update("cantidad", Math.min(99, Math.max(1, val)));
                  }
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
          {user && (
            <p className="custom-autofill-note">
              Hemos rellenado tus datos con tu perfil. Puedes editarlos si lo
              necesitas para este pedido en concreto.
            </p>
          )}

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

        {/* Mensaje de error si falla el envio. Si el backend responde mal,
            el usuario puede reintentar sin perder los datos del formulario. */}
        {/* Mensaje de error si falla el envio. Si el backend responde mal,
            el usuario puede reintentar sin perder los datos del formulario. */}
        {submitError && (
          <p className="custom-submit-error" role="alert">
            {submitError}
          </p>
        )}

        {/* Boton de envio */}
        <button
          className="custom-btn-primary"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Enviando..." : "Solicitar presupuesto"}
          <IconArrow />
        </button>
      </div>
    </div>
  );
}
