import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { validatePassword, isPasswordValid } from '../../utils/passwordValidation'
import { IconClose, IconEye, IconEyeOff } from '../icons/Icons'

/* ==========================================================================
   MODAL DE AUTENTICACION (Login + Registro)
   -----------------------------------------
   Modal con dos pestanas. El registro valida la contrasena en tiempo real.
   TODO BACKEND: anadir los fetch() donde se indica.
   ========================================================================== */
export default function AuthModal({ isOpen, onClose, initialTab }) {
  const { login, register } = useAuth()
  const [tab, setTab] = useState(initialTab || 'login')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  // Formulario de LOGIN
  const [loginForm, setLoginForm] = useState({ correo: '', password: '' })

  // Formulario de REGISTRO — campos del tipo composite "persona" de la BBDD
  const [regForm, setRegForm] = useState({
    nombre: '', correo: '', telefono: '', password: '', passwordConfirm: '',
    calle: '', numero: '', cp: '', ciudad: '', provincia: '', piso: '',
  })

  useEffect(() => { setTab(initialTab || 'login') }, [initialTab])
  useEffect(() => { if (isOpen) { setError(''); setShowPassword(false) } }, [isOpen])

  if (!isOpen) return null

  // Validacion en tiempo real de la contrasena
  const pwRules = validatePassword(regForm.password)
  const pwValid = isPasswordValid(regForm.password)
  const passwordsMatch = regForm.password === regForm.passwordConfirm && regForm.passwordConfirm !== ''

  // Solo se habilita el boton si todo esta correcto
  const canRegister = regForm.nombre.trim() && regForm.correo.trim() && regForm.telefono.trim() &&
    regForm.calle.trim() && regForm.numero.trim() && regForm.cp.trim() &&
    regForm.ciudad.trim() && regForm.provincia.trim() && pwValid && passwordsMatch

  const handleLogin = (e) => {
    e.preventDefault(); setError('')
    // TODO BACKEND: fetch POST /api/auth/login { correo, password }
    // El backend compara con bcrypt.compare() y devuelve usuario + JWT
    if (!loginForm.correo || !loginForm.password) { setError('Por favor, rellena todos los campos'); return }
    // Simulacion provisional
    login({ id: 1, nombre: loginForm.correo === 'sergioAdmin@gmail.com' ? 'Sergio Admin' : 'Usuario', correo: loginForm.correo, telefono: '600000000' })
    onClose()
  }

  const handleRegister = (e) => {
    e.preventDefault(); setError('')
    if (!canRegister) return
    // TODO BACKEND: fetch POST /api/auth/register { persona: { nombre, direccion, correo, telefono }, password }
    // Backend cifra con bcrypt.hash(password, 10)
    register({ id: Date.now(), nombre: regForm.nombre, correo: regForm.correo, telefono: regForm.telefono })
    onClose()
  }

  const updateReg = (field, value) => setRegForm(prev => ({ ...prev, [field]: value }))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><IconClose /></button>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError('') }}>Iniciar sesion</button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError('') }}>Registrarse</button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {/* -- LOGIN -- */}
        {tab === 'login' && (
          <div className="auth-form-wrapper">
            <p className="auth-subtitle">Accede con tu correo y contrasena</p>
            <div className="auth-form">
              <div className="form-group"><label>Correo electronico</label><input type="email" placeholder="tu@correo.com" value={loginForm.correo} onChange={(e) => setLoginForm(p => ({ ...p, correo: e.target.value }))} /></div>
              <div className="form-group"><label>Contrasena</label>
                <div className="input-password-wrap">
                  <input type={showPassword ? 'text' : 'password'} placeholder="Tu contrasena" value={loginForm.password} onChange={(e) => setLoginForm(p => ({ ...p, password: e.target.value }))} />
                  <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <IconEyeOff /> : <IconEye />}</button>
                </div>
              </div>
              <button className="btn-auth" onClick={handleLogin}>Iniciar sesion</button>
              <p className="auth-switch">No tienes cuenta? <button onClick={() => setTab('register')}>Registrate aqui</button></p>
            </div>
          </div>
        )}

        {/* -- REGISTRO -- */}
        {tab === 'register' && (
          <div className="auth-form-wrapper">
            <p className="auth-subtitle">Crea tu cuenta para disfrutar de todas las ventajas</p>
            <div className="auth-form">
              <div className="form-row">
                <div className="form-group"><label>Nombre completo *</label><input type="text" placeholder="Tu nombre" value={regForm.nombre} onChange={(e) => updateReg('nombre', e.target.value)} /></div>
                <div className="form-group"><label>Telefono *</label><input type="tel" placeholder="600 000 000" value={regForm.telefono} onChange={(e) => updateReg('telefono', e.target.value)} /></div>
              </div>
              <div className="form-group"><label>Correo electronico *</label><input type="email" placeholder="tu@correo.com" value={regForm.correo} onChange={(e) => updateReg('correo', e.target.value)} /></div>

              <div className="form-section-label">Direccion de envio</div>
              <div className="form-row">
                <div className="form-group form-group-wide"><label>Calle *</label><input type="text" placeholder="Nombre de la calle" value={regForm.calle} onChange={(e) => updateReg('calle', e.target.value)} /></div>
                <div className="form-group form-group-small"><label>Numero *</label><input type="text" placeholder="N" value={regForm.numero} onChange={(e) => updateReg('numero', e.target.value)} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Codigo Postal *</label><input type="text" placeholder="45600" value={regForm.cp} onChange={(e) => updateReg('cp', e.target.value)} /></div>
                <div className="form-group"><label>Ciudad *</label><input type="text" placeholder="Talavera de la Reina" value={regForm.ciudad} onChange={(e) => updateReg('ciudad', e.target.value)} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Provincia *</label><input type="text" placeholder="Toledo" value={regForm.provincia} onChange={(e) => updateReg('provincia', e.target.value)} /></div>
                <div className="form-group"><label>Piso / Puerta</label><input type="text" placeholder="2B (opcional)" value={regForm.piso} onChange={(e) => updateReg('piso', e.target.value)} /></div>
              </div>

              <div className="form-section-label">Contraseña</div>
              <div className="form-group"><label>Contraseña *</label>
                <div className="input-password-wrap">
                  <input type={showPassword ? 'text' : 'password'} placeholder="Minimo 12 caracteres" value={regForm.password} onChange={(e) => updateReg('password', e.target.value)} />
                  <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <IconEyeOff /> : <IconEye />}</button>
                </div>
                {regForm.password.length > 0 && (
                  <div className="password-rules">
                    <span className={pwRules.minLength ? 'rule-ok' : 'rule-fail'}>{pwRules.minLength ? '\u2713' : '\u2717'} 12 caracteres minimo</span>
                    <span className={pwRules.hasUppercase ? 'rule-ok' : 'rule-fail'}>{pwRules.hasUppercase ? '\u2713' : '\u2717'} 1 mayuscula</span>
                    <span className={pwRules.hasNumber ? 'rule-ok' : 'rule-fail'}>{pwRules.hasNumber ? '\u2713' : '\u2717'} 1 numero</span>
                    <span className={pwRules.hasPunctuation ? 'rule-ok' : 'rule-fail'}>{pwRules.hasPunctuation ? '\u2713' : '\u2717'} 1 signo de puntuacion</span>
                  </div>
                )}
              </div>
              <div className="form-group"><label>Confirmar contrasena *</label>
                <input type={showPassword ? 'text' : 'password'} placeholder="Repite la contrasena" value={regForm.passwordConfirm} onChange={(e) => updateReg('passwordConfirm', e.target.value)} className={regForm.passwordConfirm && !passwordsMatch ? 'input-error' : ''} />
                {regForm.passwordConfirm && !passwordsMatch && <span className="field-error">Las contrasenas no coinciden</span>}
              </div>
              <button className="btn-auth" onClick={handleRegister} disabled={!canRegister}>Crear cuenta</button>
              <p className="auth-switch">Ya tienes cuenta? <button onClick={() => setTab('login')}>Inicia sesion</button></p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
