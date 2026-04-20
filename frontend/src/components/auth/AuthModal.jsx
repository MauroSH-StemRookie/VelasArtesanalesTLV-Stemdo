import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import {
  validatePassword,
  isPasswordValid,
} from "../../utils/passwordValidation";
import { IconClose, IconEye, IconEyeOff } from "../icons/Icons";

/* ==========================================================================
   MODAL DE AUTENTICACION — conectado al backend
   -----------------------------------------------
   Login → POST /api/auth/login → recibe { token, user }
   Registro → POST /api/auth/registro → recibe { id, nombre, correo }
              Despues del registro hacemos login automatico.
   ========================================================================== */
export default function AuthModal({ isOpen, onClose, initialTab }) {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [tab, setTab] = useState(initialTab || "login");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ correo: "", password: "" });
  const [regForm, setRegForm] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    password: "",
    passwordConfirm: "",
    calle: "",
    numero: "",
    cp: "",
    ciudad: "",
    provincia: "",
    piso: "",
  });

  useEffect(() => {
    setTab(initialTab || "login");
  }, [initialTab]);
  useEffect(() => {
    if (isOpen) {
      setError("");
      setShowPassword(false);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;
  <span
    className="terms-link"
    onClick={() => {
      onClose();
      navigate("/aviso-legal");
    }}
  >
    aviso legal y política de privacidad
  </span>;
  const pwRules = validatePassword(regForm.password);
  const pwValid = isPasswordValid(regForm.password);
  const passwordsMatch =
    regForm.password === regForm.passwordConfirm &&
    regForm.passwordConfirm !== "";
  const canRegister =
    regForm.nombre.trim() &&
    regForm.correo.trim() &&
    regForm.telefono.trim() &&
    regForm.nombre.trim() &&
    regForm.correo.trim() &&
    regForm.telefono.trim() &&
    regForm.calle.trim() &&
    regForm.numero.trim() &&
    regForm.cp.trim() &&
    regForm.ciudad.trim() &&
    regForm.provincia.trim() &&
    pwValid &&
    passwordsMatch &&
    acceptedTerms;

  // ── LOGIN REAL contra el backend ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!loginForm.correo || !loginForm.password) {
      setError("Por favor, rellena todos los campos");
      return;
    }

    setLoading(true);
    try {
      // El backend devuelve { token, user: { id, nombre, correo, tipo } }
      const data = await authAPI.login(loginForm.correo, loginForm.password);
      login(data.token, data.user);
      onClose();
    } catch (err) {
      // El backend devuelve "Correo o contrasena incorrectos" con status 401
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── REGISTRO REAL contra el backend ──
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!canRegister) return;

    if (!acceptedTerms) {
      setError("Debes aceptar los términos y condiciones");
      return;
    }

    setLoading(true);
    try {
      // Enviamos todos los campos al backend tal cual los espera
      // La ruta es /api/auth/registro (no /register)
      await authAPI.registro({
        nombre: regForm.nombre,
        correo: regForm.correo,
        password: regForm.password, // se envia en texto plano, el backend cifra con bcrypt
        telefono: regForm.telefono,
        calle: regForm.calle,
        numero: regForm.numero,
        cp: regForm.cp,
        ciudad: regForm.ciudad,
        provincia: regForm.provincia,
        piso: regForm.piso,
      });

      // El registro no devuelve token, asi que hacemos login automatico
      const data = await authAPI.login(regForm.correo, regForm.password);
      register(data.token, data.user);
      onClose();
    } catch (err) {
      // "Correo ya esta registrado" o cualquier otro error del backend
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateReg = (field, value) =>
    setRegForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container auth-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          <IconClose />
        </button>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "login" ? "active" : ""}`}
            onClick={() => {
              setTab("login");
              setError("");
            }}
          >
            Iniciar sesion
          </button>
          <button
            className={`auth-tab ${tab === "register" ? "active" : ""}`}
            onClick={() => {
              setTab("register");
              setError("");
            }}
          >
            Registrarse
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {/* -- LOGIN -- */}
        {tab === "login" && (
          <div className="auth-form-wrapper">
            <p className="auth-subtitle">Accede con tu correo y contraseña</p>
            <div className="auth-form">
              <div className="form-group">
                <label>Correo electronico</label>
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  value={loginForm.correo}
                  onChange={(e) =>
                    setLoginForm((p) => ({ ...p, correo: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <div className="input-password-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm((p) => ({ ...p, password: e.target.value }))
                    }
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>
              <button
                className="btn-auth"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "Entrando..." : "Iniciar sesion"}
              </button>
              <p className="auth-switch">
                No tienes cuenta?{" "}
                <button onClick={() => setTab("register")}>
                  Registrate aqui
                </button>
              </p>
            </div>
          </div>
        )}

        {/* -- REGISTRO -- */}
        {tab === "register" && (
          <div className="auth-form-wrapper">
            <p className="auth-subtitle">
              Crea tu cuenta para disfrutar de todas las ventajas
            </p>
            <div className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre completo *</label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={regForm.nombre}
                    onChange={(e) => updateReg("nombre", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Telefono *</label>
                  <input
                    type="tel"
                    placeholder="600 000 000"
                    value={regForm.telefono}
                    onChange={(e) => updateReg("telefono", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Correo electronico *</label>
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  value={regForm.correo}
                  onChange={(e) => updateReg("correo", e.target.value)}
                />
              </div>

              <div className="form-section-label">Direccion de envio</div>
              <div className="form-row">
                <div className="form-group form-group-wide">
                  <label>Calle *</label>
                  <input
                    type="text"
                    placeholder="Nombre de la calle"
                    value={regForm.calle}
                    onChange={(e) => updateReg("calle", e.target.value)}
                  />
                </div>
                <div className="form-group form-group-small">
                  <label>Numero *</label>
                  <input
                    type="text"
                    placeholder="N"
                    value={regForm.numero}
                    onChange={(e) => updateReg("numero", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Codigo Postal *</label>
                  <input
                    type="text"
                    placeholder="45600"
                    value={regForm.cp}
                    onChange={(e) => updateReg("cp", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Ciudad *</label>
                  <input
                    type="text"
                    placeholder="Talavera de la Reina"
                    value={regForm.ciudad}
                    onChange={(e) => updateReg("ciudad", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Provincia *</label>
                  <input
                    type="text"
                    placeholder="Toledo"
                    value={regForm.provincia}
                    onChange={(e) => updateReg("provincia", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Piso / Puerta</label>
                  <input
                    type="text"
                    placeholder="2B (opcional)"
                    value={regForm.piso}
                    onChange={(e) => updateReg("piso", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-section-label">Contraseña</div>
              <div className="form-group">
                <label>Contraseña *</label>
                <div className="input-password-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimo 12 caracteres"
                    value={regForm.password}
                    onChange={(e) => updateReg("password", e.target.value)}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {regForm.password.length > 0 && (
                  <div className="password-rules">
                    <span
                      className={pwRules.minLength ? "rule-ok" : "rule-fail"}
                    >
                      {pwRules.minLength ? "\u2713" : "\u2717"} 12 caracteres
                      minimo
                    </span>
                    <span
                      className={pwRules.hasUppercase ? "rule-ok" : "rule-fail"}
                    >
                      {pwRules.hasUppercase ? "\u2713" : "\u2717"} 1 mayuscula
                    </span>
                    <span
                      className={pwRules.hasNumber ? "rule-ok" : "rule-fail"}
                    >
                      {pwRules.hasNumber ? "\u2713" : "\u2717"} 1 numero
                    </span>
                    <span
                      className={
                        pwRules.hasPunctuation ? "rule-ok" : "rule-fail"
                      }
                    >
                      {pwRules.hasPunctuation ? "\u2713" : "\u2717"} 1 signo de
                      puntuacion
                    </span>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Confirmar contraseña *</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Repite la contraseña"
                  value={regForm.passwordConfirm}
                  onChange={(e) => updateReg("passwordConfirm", e.target.value)}
                  className={
                    regForm.passwordConfirm && !passwordsMatch
                      ? "input-error"
                      : ""
                  }
                />
                {regForm.passwordConfirm && !passwordsMatch && (
                  <span className="field-error">
                    Las contraseñas no coinciden
                  </span>
                )}
              </div>
              <button
                className="btn-auth"
                onClick={handleRegister}
                disabled={!canRegister || loading}
              >
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </button>
              <p className="auth-switch">
                Ya tienes cuenta?{" "}
                <button onClick={() => setTab("login")}>Inicia sesion</button>
              </p>
            </div>
            <div className="terms-group">
              <label className="terms-label">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <span className="checkmark"></span>

                <label className="terms-label">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                  />

                  <span className="terms-text">
                    Acepto el{" "}
                    <span
                      className="terms-link"
                      onClick={() => {
                        onClose();
                        navigate("/aviso-legal");
                      }}
                    >
                      aviso legal y política de privacidad
                    </span>
                  </span>
                </label>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
