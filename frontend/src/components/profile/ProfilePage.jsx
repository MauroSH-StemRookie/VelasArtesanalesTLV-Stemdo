import { useState, useEffect } from "react";
import "./ProfilePage.css";
import { useAuth } from "../../context/AuthContext";
import { usuarioAPI } from "../../services/api";
import { IconBack, IconMail } from "../icons/Icons";
import PersonalDataForm from "./PersonalDataForm";
import AddressForm from "./AddressForm";
import PasswordForm from "./PasswordForm";
import DeleteAccountForm from "./DeleteAccountForm";

/* ==========================================================================
   PROFILE PAGE — configurar la cuenta del usuario logueado
   --------------------------------------------------------
   Es un orquestador: se encarga de cargar el perfil desde GET /api/usuario/me
   y de distribuirlo a los subformularios. Cada subformulario (PersonalDataForm,
   AddressForm, PasswordForm, DeleteAccountForm) es independiente y maneja su
   propia logica de guardado.

   Cuando un subformulario guarda algo, llama a onUpdated(nuevoPerfil) para que
   esta pagina actualice su estado y los demas subformularios reciban los
   datos frescos.

   El correo se muestra pero es SOLO LECTURA — el backend no permite cambiarlo
   a traves de PUT /me para evitar suplantaciones silenciosas.
   ========================================================================== */
export default function ProfilePage({ onBack }) {
  const { user } = useAuth();

  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* Carga inicial del perfil completo desde el backend. Aunque el AuthContext
     ya tiene algunos datos (nombre, correo, tipo), el GET /me devuelve la
     direccion completa y el telefono, que no estaban en el token. */
  useEffect(function () {
    async function cargarPerfil() {
      setLoading(true);
      setError("");
      try {
        var datos = await usuarioAPI.me.obtener();
        setPerfil(datos);
      } catch (err) {
        setError(err.message || "No se ha podido cargar el perfil");
      } finally {
        setLoading(false);
      }
    }
    cargarPerfil();
  }, []);

  /* Handler que reciben los subformularios para refrescar el perfil global
     cuando guardan algo correctamente. */
  function handleUpdated(perfilNuevo) {
    setPerfil(perfilNuevo);
  }

  /* Cuando el usuario borra su cuenta, volvemos a la home. El logout ya lo
     hace el propio DeleteAccountForm. */
  function handleDeleted() {
    if (onBack) onBack();
  }

  /* --- Render de estados previos (loading / error) --- */
  if (loading) {
    return (
      <div className="profile-page">
        <div className="admin-header">
          <button className="admin-back" onClick={onBack}>
            <IconBack /> Volver a la tienda
          </button>
          <h2>Configurar perfil</h2>
        </div>
        <div className="profile-loading">Cargando tus datos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="admin-header">
          <button className="admin-back" onClick={onBack}>
            <IconBack /> Volver a la tienda
          </button>
          <h2>Configurar perfil</h2>
        </div>
        <div className="profile-error">{error}</div>
      </div>
    );
  }

  /* --- Render normal --- */
  return (
    <div className="profile-page">
      <div className="admin-header">
        <button className="admin-back" onClick={onBack}>
          <IconBack /> Volver a la tienda
        </button>
        <h2>Configurar perfil</h2>
      </div>

      <div className="profile-content">
        {/* Cabecera con avatar, nombre y correo (solo lectura) */}
        <div className="profile-header-card">
          <div className="profile-avatar-large">
            {perfil?.nombre?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="profile-header-text">
            <p className="profile-name">{perfil?.nombre || user?.nombre}</p>
            <p className="profile-email">
              <IconMail />
              <span>{perfil?.correo || user?.correo}</span>
            </p>
            <span className="profile-email-note">
              El correo no se puede cambiar
            </span>
          </div>
        </div>

        {/* Formularios en rejilla: en escritorio van 2 por fila,
            en movil se apilan. */}
        <div className="profile-forms-grid">
          <PersonalDataForm perfil={perfil} onUpdated={handleUpdated} />
          <AddressForm perfil={perfil} onUpdated={handleUpdated} />
          <PasswordForm />
          <DeleteAccountForm onDeleted={handleDeleted} />
        </div>
      </div>
    </div>
  );
}
