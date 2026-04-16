import { useState, useEffect } from "react";
import { usuarioAPI } from "../../services/api";
import { IconPin } from "../icons/Icons";

/* ==========================================================================
   AddressForm — direccion completa (calle, numero, cp, ciudad, provincia, piso)
   ----------------------------------------------------------------------------
   Todos los campos son opcionales a nivel UI (pueden venir vacios del backend
   si el usuario no los ha rellenado nunca), pero una vez rellenos se envian
   juntos en el PUT /api/usuario/me. El backend los guarda como un tipo
   "direccion" dentro del ROW "persona", por lo que conviene enviarlos siempre
   los 6 para no dejar partes de la estructura inconsistentes.
   ========================================================================== */
export default function AddressForm({ perfil, onUpdated }) {
  const [form, setForm] = useState({
    calle: perfil?.calle || "",
    numero: perfil?.numero || "",
    cp: perfil?.cp || "",
    ciudad: perfil?.ciudad || "",
    provincia: perfil?.provincia || "",
    piso: perfil?.piso || "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* Sincronizar con el perfil del padre cuando cambie */
  useEffect(
    function () {
      setForm({
        calle: perfil?.calle || "",
        numero: perfil?.numero || "",
        cp: perfil?.cp || "",
        ciudad: perfil?.ciudad || "",
        provincia: perfil?.provincia || "",
        piso: perfil?.piso || "",
      });
    },
    [perfil],
  );

  const hayCambios =
    form.calle !== (perfil?.calle || "") ||
    form.numero !== (perfil?.numero || "") ||
    form.cp !== (perfil?.cp || "") ||
    form.ciudad !== (perfil?.ciudad || "") ||
    form.provincia !== (perfil?.provincia || "") ||
    form.piso !== (perfil?.piso || "");

  /* Validacion del CP espanol: 5 digitos si se ha puesto algo. Si esta vacio,
     el backend acepta null. */
  const cpValido = form.cp === "" || /^\d{5}$/.test(form.cp);

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
    if (!hayCambios || !cpValido || saving) return;

    setSaving(true);
    setSuccess("");
    setError("");

    try {
      /* Reenviamos tambien nombre y telefono actuales para no sobrescribirlos */
      var payload = {
        nombre: perfil?.nombre || "",
        telefono: perfil?.telefono || "",
        calle: form.calle.trim(),
        numero: form.numero.trim(),
        cp: form.cp.trim(),
        ciudad: form.ciudad.trim(),
        provincia: form.provincia.trim(),
        piso: form.piso.trim(),
      };
      var actualizado = await usuarioAPI.me.actualizar(payload);
      setSuccess("Direccion actualizada");
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
        <IconPin /> Direccion de envio
      </h3>
      <div className="auth-form">
        <div className="profile-row profile-row-calle">
          <div className="form-group">
            <label>Calle</label>
            <input
              type="text"
              placeholder="Calle del Sol"
              value={form.calle}
              onChange={(e) => handleChange("calle", e.target.value)}
              disabled={saving}
            />
          </div>
          <div className="form-group form-group-short">
            <label>Numero</label>
            <input
              type="text"
              placeholder="12"
              value={form.numero}
              onChange={(e) => handleChange("numero", e.target.value)}
              disabled={saving}
            />
          </div>
          <div className="form-group form-group-short">
            <label>Piso</label>
            <input
              type="text"
              placeholder="3A"
              value={form.piso}
              onChange={(e) => handleChange("piso", e.target.value)}
              disabled={saving}
            />
          </div>
        </div>

        <div className="profile-row profile-row-ciudad">
          <div className="form-group form-group-short">
            <label>Codigo postal</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength="5"
              placeholder="45600"
              value={form.cp}
              onChange={(e) => handleChange("cp", e.target.value)}
              disabled={saving}
              className={form.cp !== "" && !cpValido ? "input-error" : ""}
            />
            {form.cp !== "" && !cpValido && (
              <span className="field-error">El CP debe tener 5 digitos</span>
            )}
          </div>
          <div className="form-group">
            <label>Ciudad</label>
            <input
              type="text"
              placeholder="Talavera de la Reina"
              value={form.ciudad}
              onChange={(e) => handleChange("ciudad", e.target.value)}
              disabled={saving}
            />
          </div>
          <div className="form-group">
            <label>Provincia</label>
            <input
              type="text"
              placeholder="Toledo"
              value={form.provincia}
              onChange={(e) => handleChange("provincia", e.target.value)}
              disabled={saving}
            />
          </div>
        </div>

        {error && <div className="profile-error">{error}</div>}
        {success && <div className="profile-success-inline">{success}</div>}

        <button
          className="btn-auth"
          onClick={handleSubmit}
          disabled={!hayCambios || !cpValido || saving}
        >
          {saving ? "Guardando..." : "Guardar direccion"}
        </button>
      </div>
    </div>
  );
}
