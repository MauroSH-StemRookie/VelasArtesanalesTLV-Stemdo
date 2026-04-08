import { useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useClickOutside } from '../../hooks/useClickOutside'
import { IconUser, IconArrow, IconSettings, IconPackage, IconEdit, IconHelp, IconLogout } from '../icons/Icons'

/* ==========================================================================
   DROPDOWN DE USUARIO — ahora detecta admin por user.tipo === 1
   (antes se comparaba por email hardcodeado)
   ========================================================================== */
export default function UserDropdown({ isOpen, onClose, onOpenAuth, onNavigate }) {
  const { user, isAdmin, logout } = useAuth()
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

  return (
    <div className="user-dropdown" ref={dropdownRef}>
      <div className="dropdown-header"><p>Hola, {user.nombre}</p><small>{user.correo}</small></div>
      <div className="dropdown-divider" />
      {isAdmin ? (
        <button className="dropdown-item" onClick={() => { onNavigate('admin'); onClose() }}><IconSettings /> Panel Administrador</button>
      ) : (
        <button className="dropdown-item" onClick={() => { onNavigate('orders'); onClose() }}><IconPackage /> Mis Pedidos</button>
      )}
      <button className="dropdown-item" onClick={() => { onNavigate('profile'); onClose() }}><IconEdit /> Configurar perfil</button>
      <button className="dropdown-item" onClick={() => { onNavigate('help'); onClose() }}><IconHelp /> Ayuda</button>
      <div className="dropdown-divider" />
      <button className="dropdown-item dropdown-item-danger" onClick={() => { logout(); onNavigate('home'); onClose() }}><IconLogout /> Cerrar sesion</button>
    </div>
  )
}
