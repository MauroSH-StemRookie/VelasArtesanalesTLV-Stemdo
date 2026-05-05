import { useRef, useEffect } from 'react'

/* ==========================================================================
   HOOK: useFadeUp
   ---------------
   Hace que un elemento "aparezca desde abajo" al entrar en pantalla.
   ========================================================================== */
export function useFadeUp() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible') },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

export function FadeUp({ children, className = '', delay = 0 }) {
  const ref = useFadeUp()
  return (
    <div ref={ref} className={`fade-up ${className}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  )
}
