import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useClickOutside } from '../../hooks/useClickOutside'
import { IconUser, IconArrow, IconSettings, IconPackage, IconEdit, IconHelp, IconLogout } from '../icons/Icons'

/* ==========================================================================
   DROPDOWN DE USUARIO — migrado a react-router-dom
   ------------------------------------------------
   Antes recibia un prop onNavigate desde el Navbar. Ahora cada item del
   menu navega directamente con useNavigate. El comportamiento de admin
   sigue siendo el mismo: se detecta por user.tipo === 1 via useAuth.
   ========================================================================== */
export default function UserDropdown({ isOpen, onClose, onOpenAuth }) {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  useClickOutside(dropdownRef, onClose)

  if (!isOpen) return null

  if (!user) {
    return (
      <div className="user-dropdown" ref={dropdownRef}>
        <div className="dropdown-header"><p>Bienvenido/a</p><small>Accede a tu cuenta o create una</small></div>
        <div className="dropdown-divider" />
        <button className="dropdown-item" onClick={() => { onOpenAuth('register'); onClose() }}><IconUser /> Registrarse</button>
        <button className="dropdown-item" onClick={() => { onOpenAuth('login'); onClose() }}><IconArrow /> Iniciar sesion</button>
      </div>
    )
  }

  /* Al cerrar sesion llevamos al usuario a la home. Si estaba en una ruta
     protegida (admin, perfil, pedidos), el guard tambien lo redirigiria,
     pero hacemos el navigate explicito para mantener la intencion clara. */
  function handleLogout() {
    logout()
    navigate('/')
    onClose()
  }

  return (
    <div className="user-dropdown" ref={dropdownRef}>
      <div className="dropdown-header"><p>Hola, {user.nombre}</p><small>{user.correo}</small></div>
      <div className="dropdown-divider" />
      {isAdmin ? (
        <button className="dropdown-item" onClick={() => { navigate('/admin'); onClose() }}><IconSettings /> Panel Administrador</button>
      ) : (
        <button className="dropdown-item" onClick={() => { navigate('/pedidos'); onClose() }}><IconPackage /> Mis Pedidos</button>
      )}
      <button className="dropdown-item" onClick={() => { navigate('/perfil'); onClose() }}><IconEdit /> Configurar perfil</button>
      <button className="dropdown-item" onClick={() => { navigate('/ayuda'); onClose() }}><IconHelp /> Ayuda</button>
      <div className="dropdown-divider" />
      <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}><IconLogout /> Cerrar sesion</button>
    </div>
  )
}
