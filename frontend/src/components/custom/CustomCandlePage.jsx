import { useState } from 'react'
import { IconBack, IconFlame, IconArrow } from '../icons/Icons'
import './CustomCandlePage.css'

/* ==========================================================================
   PERSONALIZA TU VELA
   -------------------
   Seccion donde el usuario puede disenar una vela a medida eligiendo
   tipo, aroma, color, tamano y un mensaje personalizado.

   TODO BACKEND: Cuando la API de pedidos personalizados este lista,
   el boton "Solicitar" creara un pedido especial via POST /api/pedidos
   con un campo extra indicando que es un pedido personalizado.

   El boton "Mas informacion" redirigira a una pagina externa que el
   cliente (Sergio) proporcionara mas adelante.
   ========================================================================== */
export default function CustomCandlePage({ onBack, onNavigateExternal }) {
  const [form, setForm] = useState({
    tipo: '',
    aroma: '',
    color: '',
    tamano: '',
    mensaje: '',
    cantidad: 1,
    nombre: '',
    email: '',
    telefono: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const tiposVela = ['Aromatica', 'Decorativa', 'Liturgica', 'Cirio', 'Otra']
  const aromas = ['Lavanda', 'Rosa', 'Vainilla', 'Canela', 'Sandalo', 'Jazmin', 'Romero', 'Sin aroma']
  const colores = ['Blanco', 'Crema', 'Rosa', 'Morado', 'Dorado', 'Verde', 'Rojo', 'Personalizado']
  const tamanos = ['Pequena (100g)', 'Mediana (220g)', 'Grande (400g)', 'Extra grande (600g)']

  const canSubmit = form.tipo && form.nombre.trim() && form.email.trim() && form.telefono.trim()

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return

    // TODO BACKEND: Aqui se hara un POST /api/pedidos con los datos del formulario
    // indicando que es un pedido personalizado. Ejemplo:
    // await pedidosAPI.create({
    //   tipo: 'personalizado',
    //   datos_personalizacion: { tipo: form.tipo, aroma: form.aroma, ... },
    //   datos_cliente: { nombre: form.nombre, email: form.email, telefono: form.telefono },
    //   cantidad: form.cantidad,
    // })

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="custom-page">
        <div className="custom-success">
          <div className="custom-success-icon"><IconFlame /></div>
          <h2>Solicitud enviada</h2>
          <p>Hemos recibido tu solicitud de vela personalizada. Nos pondremos en contacto contigo en las proximas 24-48 horas para confirmar los detalles y el presupuesto.</p>
          <div className="custom-success-actions">
            <button className="btn-primary" onClick={onBack}><span>Volver al inicio</span><IconArrow /></button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="custom-page">
      <div className="admin-header">
        <button className="admin-back" onClick={onBack}><IconBack /> Volver a la tienda</button>
        <h2>Personaliza tu vela</h2>
      </div>

      <div className="custom-intro">
        <p>Disena tu vela ideal eligiendo el tipo, aroma, color y tamano. Nos encargaremos de hacerla realidad con todo el carino artesanal que nos caracteriza.</p>
        {/* Boton de mas informacion — redirigira a donde Sergio indique */}
        <button
          className="custom-info-btn"
          onClick={() => {
            // TODO: Sustituir esta URL por la que proporcione el cliente
            if (onNavigateExternal) onNavigateExternal()
            else alert('Enlace de mas informacion pendiente de configurar')
          }}
        >
          Mas informacion sobre velas personalizadas &rarr;
        </button>
      </div>

      <div className="custom-form-wrapper">
        {/* Diseno de la vela */}
        <div className="custom-section">
          <h3><IconFlame /> Disena tu vela</h3>

          <div className="custom-option-group">
            <label>Tipo de vela *</label>
            <div className="custom-pills">
              {tiposVela.map(t => (
                <button key={t} className={`custom-pill ${form.tipo === t ? 'active' : ''}`} onClick={() => update('tipo', t)}>{t}</button>
              ))}
            </div>
          </div>

          <div className="custom-option-group">
            <label>Aroma</label>
            <div className="custom-pills">
              {aromas.map(a => (
                <button key={a} className={`custom-pill ${form.aroma === a ? 'active' : ''}`} onClick={() => update('aroma', a)}>{a}</button>
              ))}
            </div>
          </div>

          <div className="custom-option-group">
            <label>Color</label>
            <div className="custom-pills">
              {colores.map(c => (
                <button key={c} className={`custom-pill ${form.color === c ? 'active' : ''}`} onClick={() => update('color', c)}>{c}</button>
              ))}
            </div>
          </div>

          <div className="custom-option-group">
            <label>Tamano</label>
            <div className="custom-pills">
              {tamanos.map(t => (
                <button key={t} className={`custom-pill ${form.tamano === t ? 'active' : ''}`} onClick={() => update('tamano', t)}>{t}</button>
              ))}
            </div>
          </div>

          <div className="custom-option-group">
            <label>Mensaje o dedicatoria (opcional)</label>
            <textarea placeholder="Escribe aqui si quieres una dedicatoria, grabado o detalle especial..." value={form.mensaje} onChange={(e) => update('mensaje', e.target.value)} rows="3" />
          </div>

          <div className="custom-option-group">
            <label>Cantidad</label>
            <div className="catalog-qty" style={{ display: 'inline-flex' }}>
              <button onClick={() => update('cantidad', Math.max(1, form.cantidad - 1))}>&minus;</button>
              <span>{form.cantidad}</span>
              <button onClick={() => update('cantidad', Math.min(99, form.cantidad + 1))}>+</button>
            </div>
          </div>
        </div>

        {/* Datos de contacto */}
        <div className="custom-section">
          <h3>Tus datos de contacto</h3>
          <div className="auth-form">
            <div className="form-group"><label>Nombre completo *</label><input type="text" placeholder="Tu nombre" value={form.nombre} onChange={(e) => update('nombre', e.target.value)} /></div>
            <div className="form-row">
              <div className="form-group"><label>Email *</label><input type="email" placeholder="tu@correo.com" value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
              <div className="form-group"><label>Telefono *</label><input type="tel" placeholder="600 000 000" value={form.telefono} onChange={(e) => update('telefono', e.target.value)} /></div>
            </div>
          </div>
        </div>

        <button className="btn-primary custom-submit" onClick={handleSubmit} disabled={!canSubmit}>
          <span>Solicitar presupuesto</span><IconArrow />
        </button>
      </div>
    </div>
  )
}
