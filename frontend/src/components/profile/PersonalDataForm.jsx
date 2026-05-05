import { useState, useEffect } from "react";
import { usuarioAPI } from "../../services/api";
import { IconUser } from "../icons/Icons";

/* ==========================================================================
   PersonalDataForm — nombre y telefono del usuario
   ------------------------------------------------
   Son los dos campos personales (aparte de la direccion) que el backend
   deja editar en PUT /api/usuario/me. El correo NO se puede cambiar desde
   aqui (esta protegido a nivel de backend para evitar suplantaciones).

   El componente recibe el perfil completo como prop para pintarlo. Al guardar,
   hace PUT /me y avisa al padre con onUpdated(perfilNuevo) para que refresque
   el estado global y otros formularios que dependan de los mismos datos.
   ========================================================================== */
export default function PersonalDataForm({ perfil, onUpdated }) {
  const [form, setForm] = useState({
    nombre: perfil?.nombre || "",
    telefono: perfil?.telefono || "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* Si el perfil del padre cambia (por ejemplo, porque otro formulario
     ha guardado y ha refrescado el perfil global), sincronizamos. */
  useEffect(
    function () {
      setForm({
        nombre: perfil?.nombre || "",
        telefono: perfil?.telefono || "",
      });
    },
    [perfil],
  );

  /* Calcula si hay cambios sin guardar para habilitar el boton.
     Evita llamadas innecesarias al backend cuando el usuario no cambio nada. */
  const hayCambios =
    form.nombre !== (perfil?.nombre || "") ||
    form.telefono !== (perfil?.telefono || "");

  const camposValidos = form.nombre.trim().length > 0;

  function handleChange(campo, valor) {
    setForm(function (prev) {
      var next = Object.assign({}, prev);
      next[campo] = valor;
      return next;
    });
    setSuccess("");
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!hayCambios || !camposValidos || saving) return;

    setSaving(true);
    setSuccess("");
    setError("");

    try {
      /* PUT /me requiere enviar TODOS los campos editables. Si solo mandamos
         nombre+telefono, el backend interpretaria los demas como vacios.
         Por eso tomamos la direccion del perfil actual y la reenviamos tal cual. */
      var payload = {
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        calle: perfil?.calle || "",
        numero: perfil?.numero || "",
        cp: perfil?.cp || "",
        ciudad: perfil?.ciudad || "",
        provincia: perfil?.provincia || "",
        piso: perfil?.piso || "",
      };
      var actualizado = await usuarioAPI.me.actualizar(payload);
      setSuccess("Datos personales actualizados");
      if (onUpdated) onUpdated(actualizado);
    } catch (err) {
      setError(err.message || "No se han podido guardar los cambios");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-section">
      <h3>
        <IconUser /> Datos personales
      </h3>
      <div className="auth-form">
        <div className="form-group">
          <label>Nombre completo</label>
          <input
            type="text"
            placeholder="Tu nombre"
            value={form.nombre}
            onChange={(e) => handleChange("nombre", e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="form-group">
          <label>Telefono</label>
          <input
            type="tel"
            placeholder="600 123 456"
            value={form.telefono}
            onChange={(e) => handleChange("telefono", e.target.value)}
            disabled={saving}
          />
        </div>

        {error && <div className="profile-error">{error}</div>}
        {success && <div className="profile-success-inline">{success}</div>}

        <button
          className="btn-auth"
          onClick={handleSubmit}
          disabled={!hayCambios || !camposValidos || saving}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
