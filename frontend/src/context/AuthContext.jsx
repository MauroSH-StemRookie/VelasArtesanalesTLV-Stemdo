import { createContext, useContext, useState, useEffect } from 'react'

/* ==========================================================================
   CONTEXTO DE AUTENTICACION — ahora conectado al backend con JWT
   ---------------------------------------------------------------
   Al hacer login, el backend nos devuelve un token JWT y los datos del
   usuario. Guardamos ambos en localStorage para que la sesion sobreviva
   si el usuario cierra el navegador y vuelve a abrir la pagina.

   El campo "tipo" del usuario indica su rol:
   - tipo === 1 → Administrador
   - tipo === 2 → Cliente normal
   ========================================================================== */
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Al arrancar la app, intentamos recuperar la sesion de localStorage
  // Si hay datos guardados, el usuario sigue logueado sin tener que repetir el login
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  // El admin se detecta por el campo "tipo" que viene del backend (1 = admin)
  const isAdmin = user?.tipo === 1

  // Cuando el usuario cambia, actualizamos localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  // LOGIN: recibe los datos que devuelve el backend (token + user)
  // Se llama desde AuthModal despues de un fetch exitoso
  const login = (token, userData) => {
    localStorage.setItem('token', token)
    setUser(userData)
  }

  // LOGOUT: limpiamos todo
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // REGISTRO: recibe los datos del usuario recien creado.
  // Despues del registro, hacemos login automaticamente para que
  // el usuario no tenga que volver a escribir sus credenciales.
  const register = (token, userData) => {
    localStorage.setItem('token', token)
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
