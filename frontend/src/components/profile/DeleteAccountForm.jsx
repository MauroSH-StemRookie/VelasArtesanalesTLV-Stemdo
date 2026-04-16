import { useState } from "react";
import { usuarioAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { IconTrash } from "../icons/Icons";

/* ==========================================================================
   DeleteAccountForm — eliminar cuenta del usuario logueado
   --------------------------------------------------------
   Es una operacion irreversible, asi que pedimos dos confirmaciones:
     1. La palabra "ELIMINAR" escrita a mano (para evitar clicks accidentales)
     2. La contrasena actual (para verificar identidad a nivel de backend)

   El backend valida la password con bcrypt.compare y, si el usuario es el
   ultimo administrador, devuelve 400 sin borrar nada (proteccion del sistema).

   Tras borrar la cuenta, hacemos logout y el onDeleted del padre le devuelve
   a la home.
   ========================================================================== */
export default function DeleteAccountForm({ onDeleted }) {
  const { logout } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const puedeBorrar =
    password.length > 0 && confirmText === "ELIMINAR" && !deleting;

  function abrirPanel() {
    setAbierto(true);
    setError("");
  }

  function cancelar() {
    setAbierto(false);
    setPassword("");
    setConfirmText("");
    setError("");
  }

  async function handleDelete() {
    if (!puedeBorrar) return;

    setDeleting(true);
    setError("");

    try {
      await usuarioAPI.me.eliminarCuenta(password);
      /* Limpiamos la sesion local: el token ya no vale para nada porque
         la cuenta asociada ya no existe. */
      logout();
      if (onDeleted) onDeleted();
    } catch (err) {
      /* Posibles errores:
           400 → es el ultimo admin, no se puede eliminar
           401 → contrasena incorrecta
           404 → usuario no encontrado (raro)  */
      setError(err.message || "No se ha podido eliminar la cuenta");
      setDeleting(false);
    }
  }

  return (
    <div className="profile-section profile-danger-zone">
      <h3 className="profile-danger-title">
        <IconTrash /> Zona de peligro
      </h3>
      <p className="profile-danger-desc">
        Al eliminar tu cuenta, se borraran todos tus datos personales y no
        podras recuperarlos. Si eres el unico administrador del sistema, la
        cuenta no podra eliminarse.
      </p>

      {!abierto && (
        <button type="button" className="btn-danger" onClick={abrirPanel}>
          Eliminar mi cuenta
        </button>
      )}

      {abierto && (
        <div className="profile-danger-form">
          <div className="form-group">
            <label>Contrasena actual</label>
            <input
              type="password"
              placeholder="Tu contrasena"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={deleting}
            />
          </div>

          <div className="form-group">
            <label>
              Escribe <strong>ELIMINAR</strong> en mayusculas para confirmar
            </label>
            <input
              type="text"
              placeholder="ELIMINAR"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={deleting}
            />
          </div>

          {error && <div className="profile-error">{error}</div>}

          <div className="profile-danger-actions">
            <button
              type="button"
              className="btn-auth-secondary"
              onClick={cancelar}
              disabled={deleting}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={handleDelete}
              disabled={!puedeBorrar}
            >
              {deleting ? "Eliminando..." : "Eliminar definitivamente"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
