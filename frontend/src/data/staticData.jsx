import { IconShield, IconHeart, IconPin, IconTruck } from '../components/icons/Icons'

/* ==========================================================================
   DATOS ESTATICOS — centralizados para editar facilmente
   ========================================================================== */
export const NAV_LINKS = ['Inicio', 'Tienda', 'Aromaticas', 'Liturgicas', 'Sobre Nosotros', 'Contacto']

export const HERO_PRODUCTS = [
  { name: 'Rosa & Lavanda', desc: 'Vela aromatica 220g', price: '14,90 €', label: 'AROMATICA', bg: 'linear-gradient(135deg, #FAE8EA, #F2D1D5)' },
  { name: 'Cirio Clasico', desc: 'Cera de abeja pura', price: '22,50 €', label: 'CIRIO', bg: 'linear-gradient(135deg, #E8D5A0, #F5EED5)' },
  { name: 'Zen Meditacion', desc: 'Soja & sandalo', price: '18,90 €', label: 'DECORATIVA', bg: 'linear-gradient(135deg, #C8BDD9, #E8E0F0)' },
  { name: 'Pascual Artesano', desc: 'Tradicion & devocion', price: '35,00 €', label: 'LITURGICA', bg: 'linear-gradient(135deg, #B5CEAC, #D5E8CC)' },
]

export const CATEGORIES = [
  { title: 'Velas Aromaticas', desc: 'Fragancias naturales que transforman tu hogar en un refugio de calma y bienestar.', bgClass: 'cat-bg-aromaticas', icon: <svg viewBox="0 0 24 24"><path d="M12 2c-1 4-4 6-4 10a4 4 0 1 0 8 0c0-4-3-6-4-10z" /><path d="M8 22h8" /><path d="M10 22v-2.5" /><path d="M14 22v-2.5" /></svg> },
  { title: 'Cirios & Liturgicas', desc: 'Elaboradas con cera de abeja pura siguiendo la tradicion artesanal mas autentica.', bgClass: 'cat-bg-liturgicas', icon: <svg viewBox="0 0 24 24"><rect x="8" y="4" width="8" height="16" rx="1" /><path d="M12 2v2" /><path d="M12 2c-0.5 1-1 1.5-1 2.5" /></svg> },
  { title: 'Decorativas', desc: 'Piezas unicas que combinan diseno y artesania para embellecer cualquier espacio.', bgClass: 'cat-bg-decorativas', icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><path d="M12 4c-1 3-3 5-3 8a3 3 0 1 0 6 0c0-3-2-5-3-8z" /></svg> },
]

export const VALUES = [
  { icon: <IconShield />, title: '100% Natural', desc: 'Ceras vegetales y de abeja pura, sin parafinas ni productos quimicos.' },
  { icon: <IconHeart />, title: 'Hecho a Mano', desc: 'Cada vela es elaborada artesanalmente con dedicacion y carino en nuestro taller.' },
  { icon: <IconPin />, title: 'Talavera de la Reina', desc: 'Orgullosamente fabricadas en nuestra ciudad, apoyando el comercio local.' },
  { icon: <IconTruck />, title: 'Envio Cuidado', desc: 'Empaquetamos con mimo para que cada pedido llegue en perfectas condiciones.' },
]

export const FAQ_DATA = [
  { q: 'Haceis envios a toda Espana?', a: 'Si, enviamos a toda la peninsula y Baleares. Los envios a Canarias, Ceuta y Melilla pueden tener un coste adicional.' },
  { q: 'Puedo comprar sin registrarme?', a: 'Por supuesto. Puedes realizar tu compra como invitado introduciendo tus datos de envio al finalizar el pedido.' },
  { q: 'Cuanto tarda el envio?', a: 'Los pedidos se preparan en 24-48h laborables. El envio estandar tarda entre 3-5 dias laborables.' },
  { q: 'Haceis velas personalizadas?', a: 'Si, creamos velas a medida para bodas, bautizos, comuniones y eventos especiales.' },
  { q: 'Que materiales utilizais?', a: 'Trabajamos con cera de soja, cera de abeja pura y aceites esenciales naturales. No usamos parafinas.' },
  { q: 'Puedo devolver un producto?', a: 'Aceptamos devoluciones en los 14 dias siguientes a la recepcion, siempre que el producto este sin usar.' },
]
