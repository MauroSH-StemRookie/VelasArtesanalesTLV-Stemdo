/* ==========================================================================
   VALIDACION DE CONTRASENA
   ------------------------
   Segun la Ley de Proteccion de Datos, necesitamos contrasenas robustas.
   Comprueba cada requisito y devuelve un objeto con el estado de cada regla.
   ========================================================================== */

export function validatePassword(password) {
  return {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasPunctuation: /[!@#$%^&*(),.?\":{}|<>_\-;'\\[\]/+=~`]/.test(password),
  }
}

export function isPasswordValid(password) {
  const rules = validatePassword(password)
  return Object.values(rules).every(Boolean)
}
