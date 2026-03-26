import { useEffect } from 'react'

/* ==========================================================================
   HOOK: useClickOutside
   ---------------------
   Detecta clic fuera de un elemento (para cerrar dropdowns, modales, etc.)
   ========================================================================== */
export function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return
      handler()
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler])
}
