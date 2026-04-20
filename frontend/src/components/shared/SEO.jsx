import { Helmet } from "react-helmet-async";

/* ==========================================================================
   COMPONENTE SEO — cabeceras meta por pagina
   ------------------------------------------
   Centraliza la generacion de:
   - <title>  (plantilla: "`${title} | Velas Artesanales`" o solo la marca
              cuando no se pasa title, p. ej. en la home)
   - <meta name="description">
   - Open Graph (facebook, linkedin, whatsapp...)
   - Twitter Card

   Se llama desde cada ruta en App.jsx con textos especificos orientados a
   tienda local en Talavera de la Reina, velas artesanales y aromas
   naturales. Asi cada URL de la tienda tiene su propia firma en buscadores
   y al compartir enlaces en redes.

   Props:
   - title       texto corto que se antepone a la marca (ej. "Tienda")
   - description descripcion SEO de 50-160 caracteres aprox.
   - canonical   path relativo (ej. "/catalogo"). Se compone la URL absoluta
                 con el origen actual para que coincida con la URL visitada.
   - image       ruta a imagen de preview (absoluta o relativa al sitio).

   Notas:
   - El origen se calcula en runtime desde window.location.origin. En SSR
     se devolveria cadena vacia; aqui la app es puramente client-side con
     Vite, pero se mantiene la guarda por si se exporta a estatico mas adelante.
   - Cuando se despliegue en Railway, las URLs canonicas quedaran automaticas
     porque se derivan del host real. No hay que hardcodear dominio.
   ========================================================================== */

const BRAND = "Velas Artesanales";
const DEFAULT_DESCRIPTION =
  "Velas artesanales hechas a mano en Talavera de la Reina. Aromaticas, decorativas, cirios y liturgicas con cera natural y aromas exclusivos.";

export default function SEO({ title, description, canonical, image }) {
  const fullTitle = title ? title + " | " + BRAND : BRAND;
  const metaDescription = description || DEFAULT_DESCRIPTION;

  const origin =
    typeof window !== "undefined" && window.location
      ? window.location.origin
      : "";

  const canonicalUrl = canonical ? origin + canonical : null;

  /* Acepta URLs absolutas (empezando por http) o rutas relativas al sitio */
  let imageUrl = null;
  if (image) {
    imageUrl = image.startsWith("http") ? image : origin + image;
  }

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}

      {/* Open Graph — usado por Facebook, LinkedIn, WhatsApp, Telegram, etc. */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={BRAND} />
      <meta property="og:locale" content="es_ES" />
      {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
      {imageUrl ? <meta property="og:image" content={imageUrl} /> : null}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {imageUrl ? <meta name="twitter:image" content={imageUrl} /> : null}
    </Helmet>
  );
}
