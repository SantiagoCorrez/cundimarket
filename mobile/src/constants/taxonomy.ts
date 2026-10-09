// Taxonomía de CundiMarket — copia de lib/taxonomy.ts (fuente: repo web).

export const USER_TYPES = {
  CITIZEN: { label: 'Quiero descubrir', emoji: '🛍️' },
  MERCHANT: { label: 'Tengo un negocio', emoji: '🏪' },
} as const;

export const MUNICIPALITIES = [
  'Mosquera',
  'Funza',
  'Madrid',
  'Soacha',
  'Facatativá',
  'Zipaquirá',
  'Chía',
  'Cota',
  'Girardot',
  'Fusagasugá',
];

/** Único municipio habilitado en el piloto; el resto se muestra como "Próximamente". */
export const PILOT_MUNICIPALITY = 'Mosquera';

export const COMING_SOON = {
  title: '📍 ¡Pronto llegaremos a tu municipio!',
  body: 'CundiMarket aún no está habilitado en este municipio. Actualmente estamos recopilando y validando información para preparar su lanzamiento y ofrecerte una mejor experiencia. Puedes registrarte desde ahora y, cuando CundiMarket esté disponible en tu municipio, serás de los primeros en enterarte y empezar a disfrutar de todo lo que tenemos para ti.',
};

export const SERVICE_CATEGORIES = [
  { key: 'hogar', name: 'Servicios para el hogar', icon: '🔧' },
  { key: 'tecnico', name: 'Servicios técnicos', icon: '💻' },
  { key: 'profesional', name: 'Servicios profesionales', icon: '📊' },
  { key: 'personal', name: 'Servicios personales', icon: '💇' },
];

export const OFFER_TYPES = [
  { key: 'RENT', label: 'Arriendo' },
  { key: 'SALE', label: 'Venta' },
  { key: 'SWAP', label: 'Permuta' },
];

export const CONTRACT_TYPES = [
  'Tiempo completo',
  'Medio tiempo',
  'Temporal',
  'Prestación de servicios',
  'Por días',
];

export const NEWS_TYPES: Record<string, { label: string; icon: string }> = {
  NEWS: { label: 'Noticia', icon: '📰' },
  BULLETIN: { label: 'Boletín', icon: '📋' },
  OFFICIAL: { label: 'Comunicado oficial', icon: '🏛️' },
  ALERT: { label: 'Alerta', icon: '🚨' },
  EVENT: { label: 'Evento', icon: '🎉' },
};
