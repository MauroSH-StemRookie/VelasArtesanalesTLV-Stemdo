/*
 * RecuperarPasswordPage.jsx
 *
 * Flujo de recuperación de contraseña en 3 pasos:
 *   1. El usuario introduce su correo  → POST /api/auth/recuperar
 *   2. Introduce correo + código + nueva contraseña → POST /api/auth/recuperar/verificar
 *   3. Card de éxito con botón para volver a inicio
 *
 * Recibe:
 *   - onNavigate(page) — función del App.jsx para cambiar currentPage
 *
 * Uso en App.jsx:
 *   {currentPage === 'recuperarPassword' && (
 *     <RecuperarPasswordPage onNavigate={setCurrentPage} />
 *   )}
 */

import { useState } from "react";
import SEO from "../shared/SEO";
import "./RecuperarPasswordPage.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function handleACasaDeNuevo() {
  navigate("/home");
}
// ─── Paso 1 ────────────────────────────────────────────────────────────────────
function PasoCorreo({ onSiguiente }) {
  const [correo, setCorreo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function handleEnviar(e) {
    e.preventDefault();
    setError("");

    if (!correo.trim()) {
      setError("Introduce tu correo electrónico.");
      return;
    }

    setCargando(true);
    try {
      await fetch(`${BASE_URL}/auth/recuperar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correo.trim() }),
      });
      // Siempre avanzamos — el backend no revela si el correo existe o no
      onSiguiente(correo.trim());
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  function handleChangeCorreo(e) {
    setCorreo(e.target.value);
  }

  return (
    <div className="rp-card">
      <div className="rp-icono-wrap">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <h1 className="rp-titulo">¿Olvidaste tu contraseña?</h1>
      <p className="rp-subtitulo">
        Introduce tu correo y te enviaremos un código para restablecerla.
      </p>

      <form onSubmit={handleEnviar} className="rp-form" noValidate>
        <div className="rp-campo">
          <label className="rp-label" htmlFor="rp-correo-1">
            Correo electrónico
          </label>
          <input
            id="rp-correo-1"
            type="email"
            className="rp-input"
            placeholder="tu@correo.com"
            value={correo}
            onChange={handleChangeCorreo}
            autoComplete="email"
            disabled={cargando}
          />
        </div>

        {error && (
          <p className="rp-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="rp-btn-primary" disabled={cargando}>
          {cargando ? "Enviando..." : "Enviar código"}
        </button>
      </form>
    </div>
  );
}

// ─── Paso 2 ────────────────────────────────────────────────────────────────────
function PasoCodigo({ correoInicial, onExito }) {
  const [correo, setCorreo] = useState(correoInicial);
  const [codigo, setCodigo] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function handleVerificar(e) {
    e.preventDefault();
    setError("");

    if (!correo.trim() || !codigo.trim() || !passwordNueva || !confirmar) {
      setError("Rellena todos los campos.");
      return;
    }
    if (codigo.trim().length !== 6) {
      setError("El código debe tener exactamente 6 dígitos.");
      return;
    }
    if (passwordNueva !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (passwordNueva.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setCargando(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/recuperar/verificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: correo.trim(),
          codigo: codigo.trim(),
          passwordNueva,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(function () {
          return {};
        });
        setError(
          data.mensaje || "Código inválido o expirado. Solicita uno nuevo.",
        );
        return;
      }

      onExito();
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  function handleChangeCodigo(e) {
    var val = e.target.value.replace(/[^0-9]/g, "");
    setCodigo(val);
  }

  function toggleVerPassword() {
    setVerPassword(function (prev) {
      return !prev;
    });
  }

  var tipoInput = verPassword ? "text" : "password";

  return (
    <div className="rp-card">
      <div className="rp-icono-wrap">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      </div>

      <h1 className="rp-titulo">Introduce el código</h1>
      <p className="rp-subtitulo">
        Revisa tu bandeja de entrada. El código caduca en{" "}
        <strong>15&nbsp;minutos</strong>.
      </p>

      <form onSubmit={handleVerificar} className="rp-form" noValidate>
        <div className="rp-campo">
          <label className="rp-label" htmlFor="rp-correo-2">
            Correo electrónico
          </label>
          <input
            id="rp-correo-2"
            type="email"
            className="rp-input"
            value={correo}
            onChange={function (e) {
              setCorreo(e.target.value);
            }}
            autoComplete="email"
            disabled={cargando}
          />
        </div>

        <div className="rp-campo">
          <label className="rp-label" htmlFor="rp-codigo">
            Código de verificación
          </label>
          <input
            id="rp-codigo"
            type="text"
            inputMode="numeric"
            className="rp-input rp-input--codigo"
            placeholder="123456"
            maxLength={6}
            value={codigo}
            onChange={handleChangeCodigo}
            autoComplete="one-time-code"
            disabled={cargando}
          />
        </div>

        <div className="rp-campo">
          <label className="rp-label" htmlFor="rp-password-nueva">
            Nueva contraseña
          </label>
          <div className="rp-password-wrap">
            <input
              id="rp-password-nueva"
              type={tipoInput}
              className="rp-input"
              placeholder="Nueva contraseña"
              value={passwordNueva}
              onChange={function (e) {
                setPasswordNueva(e.target.value);
              }}
              autoComplete="new-password"
              disabled={cargando}
            />
            <button
              type="button"
              className="rp-toggle-pass"
              onClick={toggleVerPassword}
              aria-label={verPassword ? "Ocultar contraseña" : "Ver contraseña"}
            >
              {verPassword ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="rp-campo">
          <label className="rp-label" htmlFor="rp-confirmar">
            Confirmar contraseña
          </label>
          <input
            id="rp-confirmar"
            type={tipoInput}
            className="rp-input"
            placeholder="Repite la contraseña"
            value={confirmar}
            onChange={function (e) {
              setConfirmar(e.target.value);
            }}
            autoComplete="new-password"
            disabled={cargando}
          />
        </div>

        {error && (
          <p className="rp-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="rp-btn-primary" disabled={cargando}>
          {cargando ? "Verificando..." : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  );
}

// ─── Paso 3 ────────────────────────────────────────────────────────────────────
function PasoExito({ onIrAInicio }) {
  return (
    <div className="rp-card rp-card--exito">
      <div className="rp-exito-check" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 className="rp-titulo">¡Contraseña actualizada!</h1>
      <p className="rp-subtitulo">
        Tu contraseña se ha cambiado correctamente. Ya puedes iniciar sesión con
        tus nuevas credenciales.
      </p>

      <button
        type="button"
        className="rp-btn-primary rp-btn--exito"
        onClick={handleACasaDeNuevo}
      >
        Volver a la tienda
      </button>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
function RecuperarPasswordPage({ onNavigate }) {
  const [paso, setPaso] = useState(1);
  const [correoGuardado, setCorreoGuardado] = useState("");

  function handleSiguiente(correo) {
    setCorreoGuardado(correo);
    setPaso(2);
  }

  function handleExito() {
    setPaso(3);
  }

  function handleIrAInicio() {
    onNavigate("home");
  }

  function handleVolverLogin() {
    onNavigate("home"); // Abre AuthModal desde home si es necesario
  }

  return (
    <>
      <SEO
        title="Recuperar contraseña · Velas Artesanales"
        description="Restablece tu contraseña de acceso a la tienda de Velas Artesanales."
      />

      <main className="rp-main">
        {/* Indicador de pasos */}
        <div className="rp-pasos" aria-label="Paso actual">
          <div
            className={
              paso >= 1 ? "rp-paso-dot rp-paso-dot--activo" : "rp-paso-dot"
            }
          >
            {paso > 1 ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              "1"
            )}
          </div>
          <div
            className={
              paso >= 2
                ? "rp-paso-linea rp-paso-linea--activa"
                : "rp-paso-linea"
            }
          />
          <div
            className={
              paso >= 2 ? "rp-paso-dot rp-paso-dot--activo" : "rp-paso-dot"
            }
          >
            {paso > 2 ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              "2"
            )}
          </div>
          <div
            className={
              paso >= 3
                ? "rp-paso-linea rp-paso-linea--activa"
                : "rp-paso-linea"
            }
          />
          <div
            className={
              paso >= 3 ? "rp-paso-dot rp-paso-dot--activo" : "rp-paso-dot"
            }
          >
            3
          </div>
        </div>

        {paso === 1 && <PasoCorreo onSiguiente={handleSiguiente} />}
        {paso === 2 && (
          <PasoCodigo correoInicial={correoGuardado} onExito={handleExito} />
        )}
        {paso === 3 && <PasoExito onIrAInicio={handleIrAInicio} />}

        {paso !== 3 && (
          <p className="rp-volver">
            <button
              type="button"
              className="rp-link"
              onClick={handleVolverLogin}
            >
              &#8592; Volver al inicio de sesión
            </button>
          </p>
        )}
      </main>
    </>
  );
}

export default RecuperarPasswordPage;
