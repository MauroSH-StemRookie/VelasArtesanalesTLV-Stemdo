import { createContext, useContext, useState } from 'react'

/* ==========================================================================
   CONTEXTO DE AUTENTICACION
   -------------------------
   Caja compartida que cualquier componente puede abrir para saber si hay
   un usuario logueado, quien es, si es admin, etc.

   Uso: const { user, isAdmin, login, logout, register } = useAuth()
   ========================================================================== */
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const isAdmin = user?.correo === 'sergioAdmin@gmail.com'

  // TODO BACKEND: fetch POST /api/auth/login -> devuelve usuario + JWT
  const login = (userData) => {
    setUser(userData)
    // TODO BACKEND: localStorage.setItem('token', userData.token)
  }

  const logout = () => {
    setUser(null)
    // TODO BACKEND: localStorage.removeItem('token')
  }

  // TODO BACKEND: fetch POST /api/auth/register
  // NOTA: No ciframos la contrasena en el front. Se hace en backend con bcryptjs.
  const register = (userData) => {
    setUser(userData)
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
