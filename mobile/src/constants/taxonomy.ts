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
