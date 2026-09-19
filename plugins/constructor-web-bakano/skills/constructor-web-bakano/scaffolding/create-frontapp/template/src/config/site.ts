/**
 * El copy es configuración: todos los textos y datos de la marca viven acá.
 * Los componentes solo consumen y pintan.
 */
export const site = {
  name: '__TITLE__',
  tagline: 'Tu nueva app, lista para crecer.',
  description: '__TITLE__ — hecho con Vue 3, TypeScript y SCSS.',
  url: '__SITE_URL__',
  email: 'hola@__DOMAIN__',
  // Solo dígitos con código de país, ej: 593984934039
  whatsapp: '',
  social: {
    instagram: '',
    facebook: '',
    tiktok: '',
  },
  nav: [
    { label: 'Inicio', to: '/' },
    { label: 'Nosotros', to: '/#nosotros' },
    { label: 'Contacto', to: '/#contacto' },
  ],
} as const

export function whatsappLink(message = 'Hola, quiero más información'): string {
  if (!site.whatsapp) return '#'
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`
}
