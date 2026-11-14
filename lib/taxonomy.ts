// Taxonomía de CundiMarket — fuente única para seed y formularios.

export type CategorySeed = {
  name: string;
  slug: string;
  icon: string;
  subcategories: string[];
};

export const CATEGORIES: CategorySeed[] = [
  {
    name: "Gastronomía",
    slug: "gastronomia",
    icon: "🍽️",
    subcategories: [
      "Restaurantes",
      "Comida rápida",
      "Cafeterías",
      "Panaderías",
      "Postres",
      "Comida típica",
      "Comida internacional",
      "Heladerías",
    ],
  },
  {
    name: "Moda y Vestuario",
    slug: "moda",
    icon: "👕",
    subcategories: ["Ropa", "Zapaterías", "Accesorios", "Ropa deportiva", "Moda infantil"],
  },
  {
    name: "Salud y Bienestar",
    slug: "salud",
    icon: "💊",
    subcategories: ["Droguerías", "Ópticas", "Consultorios", "Gimnasios", "Spa", "Veterinarias"],
  },
  {
    name: "Automotriz",
    slug: "automotriz",
    icon: "🚗",
    subcategories: [
      "Talleres mecánicos",
      "Lavaderos",
      "Repuestos",
      "Diagnóstico automotriz",
      "Venta de vehículos",
      "Lubricentros",
    ],
  },
  {
    name: "Hogar y Construcción",
    slug: "hogar",
    icon: "🏠",
    subcategories: [
      "Ferreterías",
      "Materiales de construcción",
      "Muebles",
      "Decoración",
      "Electrodomésticos",
    ],
  },
  {
    name: "Tecnología",
    slug: "tecnologia",
    icon: "📱",
    subcategories: [
      "Tiendas de celulares",
      "Reparación de equipos",
      "Computadores",
      "Accesorios tecnológicos",
    ],
  },
  {
    name: "Comercio General",
    slug: "comercio-general",
    icon: "🛒",
    subcategories: ["Supermercados", "Tiendas de barrio", "Minimercados", "Papelerías"],
  },
  {
    name: "Educación",
    slug: "educacion",
    icon: "🎓",
    subcategories: ["Institutos", "Academias", "Centros de formación"],
  },
  {
    name: "Entretenimiento",
    slug: "entretenimiento",
    icon: "🎉",
    subcategories: ["Salones de eventos", "Discotecas", "Bares", "Recreación"],
  },
  {
    name: "Mascotas",
    slug: "mascotas",
    icon: "🐾",
    subcategories: ["Veterinarias", "Tiendas de mascotas", "Guarderías"],
  },
];

// Tipo principal de usuario (cómo se presenta en la app)
export const USER_TYPES = {
  CITIZEN: { label: "Quiero descubrir", emoji: "🛍️" },
  MERCHANT: { label: "Tengo un negocio", emoji: "🏪" },
} as const;

/** Único municipio habilitado en el piloto; el resto se muestra como "Próximamente". */
export const PILOT_MUNICIPALITY = "Mosquera";

/** Los 116 municipios de Cundinamarca, en orden alfabético. */
const CUNDINAMARCA_MUNICIPALITIES = [
  "Agua de Dios", "Albán", "Anapoima", "Anolaima", "Apulo", "Arbeláez",
  "Beltrán", "Bituima", "Bojacá",
  "Cabrera", "Cachipay", "Cajicá", "Caparrapí", "Cáqueza", "Carmen de Carupa", "Chaguaní", "Chía", "Chipaque", "Choachí", "Chocontá", "Cogua", "Cota", "Cucunubá",
  "El Colegio", "El Peñón", "El Rosal",
  "Facatativá", "Fómeque", "Fosca", "Funza", "Fúquene", "Fusagasugá",
  "Gachalá", "Gachancipá", "Gachetá", "Gama", "Girardot", "Granada", "Guachetá", "Guaduas", "Guasca", "Guataquí", "Guatavita", "Guayabal de Síquima", "Guayabetal", "Gutiérrez",
  "Jerusalén", "Junín",
  "La Calera", "La Mesa", "La Palma", "La Peña", "La Vega", "Lenguazaque",
  "Machetá", "Madrid", "Manta", "Medina", "Mosquera",
  "Nariño", "Nemocón", "Nilo", "Nimaima", "Nocaima",
  "Pacho", "Paime", "Pandi", "Paratebueno", "Pasca", "Puerto Salgar", "Pulí",
  "Quebradanegra", "Quetame", "Quipile",
  "Ricaurte",
  "San Antonio del Tequendama", "San Bernardo", "San Cayetano", "San Francisco", "San Juan de Rioseco", "Sasaima", "Sesquilé", "Sibaté", "Silvania", "Simijaca", "Soacha", "Sopó", "Subachoque", "Suesca", "Supatá", "Susa", "Sutatausa",
  "Tabio", "Tausa", "Tena", "Tenjo", "Tibacuy", "Tibirita", "Tocaima", "Tocancipá", "Topaipí",
  "Ubalá", "Ubaque", "Ubaté", "Une", "Útica",
  "Venecia", "Vergara", "Vianí", "Villagómez", "Villapinzón", "Villeta", "Viotá",
  "Yacopí",
  "Zipacón", "Zipaquirá",
];

/** Municipios para los desplegables: el habilitado primero y luego el resto en orden alfabético. */
export const MUNICIPALITIES = [
  PILOT_MUNICIPALITY,
  ...CUNDINAMARCA_MUNICIPALITIES.filter((m) => m !== PILOT_MUNICIPALITY),
];

/** Devuelve el municipio si es uno de Cundinamarca; si no, `fallback` (o el habilitado). */
export function normalizeMunicipality(value: string | null | undefined, fallback?: string | null) {
  if (value && MUNICIPALITIES.includes(value)) return value;
  if (fallback && MUNICIPALITIES.includes(fallback)) return fallback;
  return PILOT_MUNICIPALITY;
}

/**
 * Municipio permitido para publicar (negocios, empleos, servicios, inmuebles): solo los habilitados.
 * `keep` conserva el valor actual al editar una publicación antigua de otro municipio.
 */
export function publishableMunicipality(value: string, keep?: string) {
  return value === PILOT_MUNICIPALITY || (keep !== undefined && value === keep) ? value : PILOT_MUNICIPALITY;
}

/** Texto del aviso "Próximamente" cuando se elige un municipio que aún no está habilitado. */
export const COMING_SOON = {
  title: "📍 ¡Pronto llegaremos a tu municipio!",
  body: "CundiMarket aún no está habilitado en este municipio. Actualmente estamos recopilando y validando información para preparar su lanzamiento y ofrecerte una mejor experiencia. Puedes registrarte desde ahora y, cuando CundiMarket esté disponible en tu municipio, serás de los primeros en enterarte y empezar a disfrutar de todo lo que tenemos para ti.",
} as const;

// Coordenadas aproximadas (centro urbano) por municipio, para la vista de mapa.
export const MUNICIPALITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Mosquera: { lat: 4.7059, lng: -74.2306 },
  Funza: { lat: 4.7167, lng: -74.2117 },
  Madrid: { lat: 4.7328, lng: -74.2653 },
  Soacha: { lat: 4.5794, lng: -74.2168 },
  Facatativá: { lat: 4.8145, lng: -74.3547 },
  Zipaquirá: { lat: 5.0221, lng: -74.0048 },
  Chía: { lat: 4.8619, lng: -74.0326 },
  Cota: { lat: 4.8094, lng: -74.0983 },
  Girardot: { lat: 4.3045, lng: -74.8003 },
  Fusagasugá: { lat: 4.3373, lng: -74.3644 },
};

export const NEIGHBORHOODS_MOSQUERA = [
  "Centro",
  "El Recreo",
  "Porvenir",
  "Serrezuela",
  "Planadas",
  "La Estancia",
  "Rubí",
  "Diana Turbay",
];

// CundiServicios
export const SERVICE_CATEGORIES = [
  {
    key: "hogar",
    name: "Servicios para el hogar",
    icon: "🔧",
    types: ["Plomería", "Electricidad", "Cerrajería", "Pintura", "Reparaciones generales"],
  },
  {
    key: "tecnico",
    name: "Servicios técnicos",
    icon: "💻",
    types: [
      "Reparación de electrodomésticos",
      "Reparación de celulares",
      "Reparación de computadores",
      "Instalación de cámaras de seguridad",
    ],
  },
  {
    key: "profesional",
    name: "Servicios profesionales",
    icon: "📊",
    types: ["Contabilidad", "Asesoría jurídica", "Diseño gráfico", "Marketing digital"],
  },
  {
    key: "personal",
    name: "Servicios personales",
    icon: "💇",
    types: ["Peluquería a domicilio", "Maquillaje", "Entrenadores personales", "Cuidado de mascotas"],
  },
];

// CundiEspacios
export const OFFER_TYPES = [
  { key: "RENT", label: "Arriendo" },
  { key: "SALE", label: "Venta" },
  { key: "SWAP", label: "Permuta" },
];

export const PROPERTY_TYPES = [
  "Casa",
  "Apartamento",
  "Habitación",
  "Local comercial",
  "Oficina",
  "Lote",
];

export const PROPERTY_STATUS = [
  { key: "ACTIVE", label: "Activo" },
  { key: "RESERVED", label: "Reservado" },
  { key: "CLOSED", label: "Vendido / Arrendado" },
];

// CundiEmpleo
export const JOB_SECTORS = [
  "Comercio",
  "Gastronomía",
  "Servicios",
  "Construcción",
  "Tecnología",
  "Logística",
  "Atención al cliente",
];

export const CONTRACT_TYPES = [
  "Tiempo completo",
  "Medio tiempo",
  "Temporal",
  "Prestación de servicios",
  "Por días",
];

// Estados de verificación de comercio
export const BUSINESS_STATUS: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  PENDING: { label: "Registro pendiente", color: "ink-soft", icon: "⏳" },
  IN_REVIEW: { label: "En verificación", color: "warn", icon: "🔍" },
  VERIFIED: { label: "Comercio verificado", color: "success", icon: "✔" },
  REJECTED: { label: "Registro rechazado", color: "danger", icon: "✕" },
  SUSPENDED: { label: "Comercio suspendido", color: "danger", icon: "⛔" },
};

export const NEWS_TYPES: Record<string, { label: string; icon: string }> = {
  NEWS: { label: "Noticia", icon: "📰" },
  BULLETIN: { label: "Boletín", icon: "📋" },
  OFFICIAL: { label: "Comunicado oficial", icon: "🏛️" },
  ALERT: { label: "Alerta", icon: "🚨" },
  EVENT: { label: "Evento", icon: "🎉" },
};
