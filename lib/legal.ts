/** Datos comunes de las políticas legales (web). La app móvil abre estas mismas rutas. */
export const LEGAL = {
  brand: "CundiMarket",
  url: "https://cundimarket.online",
  contactEmail: "danifersilrod@gmail.com",
  /** Fecha de la última revisión de todas las políticas. */
  updated: "30 de octubre de 2026",
} as const;

export const LEGAL_LINKS = [
  {
    href: "/terminos",
    label: "Términos y condiciones",
    text: "Reglas de uso de la plataforma y alcance de nuestra responsabilidad.",
  },
  {
    href: "/privacidad",
    label: "Política de privacidad",
    text: "Qué datos recolectamos, para qué los usamos y cómo ejercer tus derechos (Ley 1581 de 2012).",
  },
  {
    href: "/cookies",
    label: "Política de cookies",
    text: "Cookies y almacenamiento local que usamos en la web y la app.",
  },
  {
    href: "/contenido",
    label: "Normas de la comunidad",
    text: "Qué se puede publicar, cómo reportar contenido y qué hacemos al respecto.",
  },
  {
    href: "/eliminar-cuenta",
    label: "Eliminar mi cuenta",
    text: "Borra tu cuenta y tus datos de forma definitiva.",
  },
] as const;
