import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { validatePassword, isPasswordValid } from '../../utils/passwordValidation'
import { IconBack, IconMail, IconSettings, IconEye, IconEyeOff } from '../icons/Icons'

/* ==========================================================================
   CONFIGURAR PERFIL — cambiar correo y contrasena bajo confirmacion
   ========================================================================== */
export default function ProfilePage({ onBack }) {
  const { user } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState('')
  const [emailForm, setEmailForm] = useState({ newEmail: '', currentPassword: '' })
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  const pwRules = validatePassword(passForm.newPassword)
  const pwValid = isPasswordValid(passForm.newPassword)
  const passwordsMatch = passForm.newPassword === passForm.confirmPassword && passForm.confirmPassword !== ''

  const handleEmailChange = (e) => {
    e.preventDefault(); setSuccess('')
    // TODO BACKEND: PUT /api/auth/cambiar-correo (verifica contrasena actual)
    setSuccess('Correo actualizado correctamente')
    setEmailForm({ newEmail: '', currentPassword: '' })
  }

  const handlePasswordChange = (e) => {
    e.preventDefault(); setSuccess('')
    if (!pwValid || !passwordsMatch) return
    // TODO BACKEND: PUT /api/auth/cambiar-password (bcrypt.compare + bcrypt.hash)
    setSuccess('Contrasena actualizada correctamente')
    setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  return (
    <div className="profile-page">
      <div className="admin-header"><button className="admin-back" onClick={onBack}><IconBack /> Volver a la tienda</button><h2>Configurar perfil</h2></div>
      <div className="profile-content">
        <div className="profile-avatar-large">{user?.nombre?.charAt(0)?.toUpperCase() || 'U'}</div>
        <p className="profile-name">{user?.nombre}</p>
        <p className="profile-email">{user?.correo}</p>
        {success && <div className="profile-success">{success}</div>}

        <div className="profile-section">
          <h3><IconMail /> Cambiar correo electronico</h3>
          <div className="auth-form">
            <div className="form-group"><label>Nuevo correo</label><input type="email" placeholder="nuevo@correo.com" value={emailForm.newEmail} onChange={(e) => setEmailForm(p => ({ ...p, newEmail: e.target.value }))} /></div>
            <div className="form-group"><label>Contrasena actual (para confirmar)</label><input type="password" placeholder="Tu contrasena actual" value={emailForm.currentPassword} onChange={(e) => setEmailForm(p => ({ ...p, currentPassword: e.target.value }))} /></div>
            <button className="btn-auth" onClick={handleEmailChange} disabled={!emailForm.newEmail || !emailForm.currentPassword}>Actualizar correo</button>
          </div>
        </div>

        <div className="profile-section">
          <h3><IconSettings /> Cambiar contrasena</h3>
          <div className="auth-form">
            <div className="form-group"><label>Contrasena actual</label><input type="password" placeholder="Tu contrasena actual" value={passForm.currentPassword} onChange={(e) => setPassForm(p => ({ ...p, currentPassword: e.target.value }))} /></div>
            <div className="form-group"><label>Nueva contrasena</label>
              <div className="input-password-wrap">
                <input type={showPassword ? 'text' : 'password'} placeholder="Minimo 12 caracteres" value={passForm.newPassword} onChange={(e) => setPassForm(p => ({ ...p, newPassword: e.target.value }))} />
                <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <IconEyeOff /> : <IconEye />}</button>
              </div>
              {passForm.newPassword.length > 0 && (
                <div className="password-rules">
                  <span className={pwRules.minLength ? 'rule-ok' : 'rule-fail'}>{pwRules.minLength ? '\u2713' : '\u2717'} 12 caracteres minimo</span>
                  <span className={pwRules.hasUppercase ? 'rule-ok' : 'rule-fail'}>{pwRules.hasUppercase ? '\u2713' : '\u2717'} 1 mayuscula</span>
                  <span className={pwRules.hasNumber ? 'rule-ok' : 'rule-fail'}>{pwRules.hasNumber ? '\u2713' : '\u2717'} 1 numero</span>
                  <span className={pwRules.hasPunctuation ? 'rule-ok' : 'rule-fail'}>{pwRules.hasPunctuation ? '\u2713' : '\u2717'} 1 signo puntuacion</span>
                </div>
              )}
            </div>
            <div className="form-group"><label>Confirmar nueva contrasena</label>
              <input type={showPassword ? 'text' : 'password'} placeholder="Repite" value={passForm.confirmPassword} onChange={(e) => setPassForm(p => ({ ...p, confirmPassword: e.target.value }))} className={passForm.confirmPassword && !passwordsMatch ? 'input-error' : ''} />
              {passForm.confirmPassword && !passwordsMatch && <span className="field-error">Las contrasenas no coinciden</span>}
            </div>
            <button className="btn-auth" onClick={handlePasswordChange} disabled={!passForm.currentPassword || !pwValid || !passwordsMatch}>Actualizar contrasena</button>
          </div>
        </div>
      </div>
    </div>
  )
}
