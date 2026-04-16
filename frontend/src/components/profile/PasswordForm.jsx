import { useState } from "react";
import { usuarioAPI } from "../../services/api";
import { validatePassword, isPasswordValid } from "../../utils/passwordValidation";
import { IconSettings, IconEye, IconEyeOff } from "../icons/Icons";

/* ==========================================================================
   PasswordForm — cambiar contrasena del usuario logueado
   ------------------------------------------------------
   El backend valida la contrasena actual con bcrypt.compare y genera un
   hash nuevo con bcrypt.hash(10). Si la actual es incorrecta, responde 401.
   Las reglas de la contrasena nueva estan centralizadas en utils/passwordValidation.
   ========================================================================== */
export default function PasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    passwordActual: "",
    passwordNueva: "",
    confirmarPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const reglas = validatePassword(form.passwordNueva);
  const pwValid = isPasswordValid(form.passwordNueva);
  const passwordsCoinciden =
    form.passwordNueva === form.confirmarPassword &&
    form.confirmarPassword !== "";

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
    if (!form.passwordActual || !pwValid || !passwordsCoinciden || saving) return;

    setSaving(true);
    setSuccess("");
    setError("");

    try {
      await usuarioAPI.me.cambiarPassword(form.passwordActual, form.passwordNueva);
      setSuccess("Contrasena actualizada correctamente");
      setForm({ passwordActual: "", passwordNueva: "", confirmarPassword: "" });
    } catch (err) {
      /* El backend devuelve distintos codigos con su propio mensaje:
           400 → campos vacios
           401 → contrasena actual incorrecta
           404 → usuario no encontrado (raro si el token es valido)
         Todos vienen en err.message. */
      setError(err.message || "No se ha podido cambiar la contrasena");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-section">
      <h3>
        <IconSettings /> Cambiar contrasena
      </h3>
      <div className="auth-form">
        <div className="form-group">
          <label>Contrasena actual</label>
          <input
            type="password"
            placeholder="Tu contrasena actual"
            value={form.passwordActual}
            onChange={(e) => handleChange("passwordActual", e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="form-group">
          <label>Nueva contrasena</label>
          <div className="input-password-wrap">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Minimo 12 caracteres"
              value={form.passwordNueva}
              onChange={(e) => handleChange("passwordNueva", e.target.value)}
              disabled={saving}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
            >
              {showPassword ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>

          {form.passwordNueva.length > 0 && (
            <div className="password-rules">
              <span className={reglas.minLength ? "rule-ok" : "rule-fail"}>
                {reglas.minLength ? "\u2713" : "\u2717"} 12 caracteres minimo
              </span>
              <span className={reglas.hasUppercase ? "rule-ok" : "rule-fail"}>
                {reglas.hasUppercase ? "\u2713" : "\u2717"} 1 mayuscula
              </span>
              <span className={reglas.hasNumber ? "rule-ok" : "rule-fail"}>
                {reglas.hasNumber ? "\u2713" : "\u2717"} 1 numero
              </span>
              <span className={reglas.hasPunctuation ? "rule-ok" : "rule-fail"}>
                {reglas.hasPunctuation ? "\u2713" : "\u2717"} 1 signo puntuacion
              </span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Confirmar nueva contrasena</label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Repite la nueva contrasena"
            value={form.confirmarPassword}
            onChange={(e) => handleChange("confirmarPassword", e.target.value)}
            disabled={saving}
            className={
              form.confirmarPassword && !passwordsCoinciden ? "input-error" : ""
            }
          />
          {form.confirmarPassword && !passwordsCoinciden && (
            <span className="field-error">Las contrasenas no coinciden</span>
          )}
        </div>

        {error && <div className="profile-error">{error}</div>}
        {success && <div className="profile-success-inline">{success}</div>}

        <button
          className="btn-auth"
          onClick={handleSubmit}
          disabled={
            !form.passwordActual || !pwValid || !passwordsCoinciden || saving
          }
        >
          {saving ? "Actualizando..." : "Actualizar contrasena"}
        </button>
      </div>
    </div>
  );
}
