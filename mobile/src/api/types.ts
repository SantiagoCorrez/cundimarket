export type Role = 'CITIZEN' | 'MERCHANT' | 'ADMIN';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  municipality: string;
  avatarUrl?: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
  subcategories?: Subcategory[];
};

export type Subcategory = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
};

export type BusinessPhoto = { id: string; url: string; type: string };
export type Product = { id: string; name: string; description: string; price?: number | null; imageUrl?: string | null };
export type Promotion = {
  id: string;
  title: string;
  description: string;
  discount?: number | null;
  imageUrl?: string | null;
  active: boolean;
  business?: { id: string; name: string; logoUrl?: string | null };
};
export type Rating = {
  id: string;
  stars: number;
  comment?: string | null;
  createdAt: string;
  user: { name: string };
};

export type Business = {
  id: string;
  name: string;
  description: string;
  address: string;
  neighborhood?: string | null;
  municipality: string;
  phone: string;
  whatsapp?: string | null;
  schedule?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  lat?: number | null;
  lng?: number | null;
  status: string;
  featured: boolean;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  category: Category;
  subcategory?: Subcategory | null;
  photos: BusinessPhoto[];
  products: Product[];
  promotions: Promotion[];
  ratings: Rating[];
  _count?: { promotions: number };
  /** Calculados por la API de búsqueda: null cuando no se pudo determinar. */
  openNow?: boolean | null;
  distanceKm?: number | null;
};

export type News = {
  id: string;
  title: string;
  body: string;
  type: 'NEWS' | 'BULLETIN' | 'OFFICIAL' | 'ALERT' | 'EVENT';
  imageUrl?: string | null;
  municipality: string;
  publishedAt: string;
  /** Página original de la noticia en el sitio de la alcaldía. */
  sourceUrl?: string | null;
};

export type EmergencyContact = {
  id: string;
  scope?: 'MUNICIPAL' | 'DEPARTAMENTAL' | 'NACIONAL';
  name: string;
  /** Entidad o aclaración (p. ej. "CAI Santa Rita"). */
  detail?: string | null;
  /** Uno o varios números separados por " / "; vacío = solo informativo. */
  phone: string;
  icon: string;
};

export type EmergencyDirectory = {
  municipality: string;
  local: EmergencyContact[];
  departmental: EmergencyContact[];
  national: EmergencyContact[];
};

export type MunicipalityNews = {
  municipality: string;
  news: News[];
  /** Sitio y sección de noticias oficiales de la alcaldía. */
  source: { site: string; news: string } | null;
  /** La primera descarga de noticias de esa alcaldía sigue en curso. */
  syncing?: boolean;
};

export type PropertyPhoto = { id: string; url: string };
export type Property = {
  id: string;
  offerType: 'RENT' | 'SALE' | 'SWAP';
  propertyType: string;
  municipality: string;
  neighborhood?: string | null;
  address?: string | null;
  area?: number | null;
  rooms?: number | null;
  bathrooms?: number | null;
  parking: boolean;
  stratum?: number | null;
  price?: number | null;
  description: string;
  services?: string | null;
  ownerName: string;
  phone: string;
  whatsapp?: string | null;
  status: 'ACTIVE' | 'RESERVED' | 'CLOSED';
  verified: boolean;
  createdAt: string;
  photos: PropertyPhoto[];
};

export type ServiceProvider = {
  id: string;
  providerName: string;
  category: string;
  serviceType: string;
  municipality: string;
  coverageZone?: string | null;
  description: string;
  yearsExperience?: number | null;
  phone: string;
  whatsapp?: string | null;
  photoUrl?: string | null;
  verified: boolean;
  ratingAvg: number;
  ratingCount: number;
  photos?: { id: string; url: string }[];
  ratings?: Rating[];
};

export type Job = {
  id: string;
  companyName: string;
  sector: string;
  title: string;
  contractType: string;
  workday?: string | null;
  salary?: number | null;
  functions: string;
  requirements: string;
  experience?: string | null;
  municipality: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  whatsapp?: string | null;
  active: boolean;
  createdAt: string;
};

export type HomeFeed = {
  session: { name: string; municipality: string } | null;
  categories: Category[];
  featured: Business[];
  promos: Promotion[];
  news: News[];
};
