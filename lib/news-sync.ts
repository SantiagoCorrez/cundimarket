/**
 * Sincroniza las noticias de las alcaldías de Cundinamarca con la tabla `News`.
 *
 * La mayoría de alcaldías usan el mismo portal (SPA) con una API pública:
 *  - Lista:   GET /api/v1/contents?tags=1&orderBy=recent&pageSize=N   (tag 1 = "Noticias")
 *  - Detalle: GET /api/v1/contents/{id}                               (cuerpo HTML, fecha, imágenes)
 *  - Página pública de cada noticia: /noticias/{friendlyName}
 * Las que usan otro sistema (SharePoint, etc.) no se sincronizan: la app enlaza a su sección de noticias.
 */
import { prisma } from "./prisma";
import { MUNICIPAL_SITES } from "./municipal-sites";
import { PILOT_MUNICIPALITY } from "./taxonomy";

const NEWS_TAG_ID = 1;
const SYNC_INTERVAL_MS = 30 * 60 * 1000;
/** Si el portal no tiene la API, no se vuelve a intentar en un día. */
const UNSUPPORTED_RETRY_MS = 24 * 60 * 60 * 1000;
const DETAIL_CONCURRENCY = 6;

class UnsupportedPortal extends Error {}

/** Sitio y sección de noticias oficiales de la alcaldía. */
export function newsSourceFor(municipality: string) {
  const site = MUNICIPAL_SITES[municipality];
  return site ? { site: site.site, news: site.news } : null;
}

type ListItem = {
  contentID: number;
  friendlyName: string;
  name: string;
  defaultImage: string | null;
  metaDescription: string | null;
  modifiedDate: string | null;
};
type Detail = { body: string | null; creationDate: string | null; defaultImage: string | null };

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return (await res.json()) as T;
}

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", ntilde: "ñ", uuml: "ü",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú", Ntilde: "Ñ", Uuml: "Ü",
  iexcl: "¡", iquest: "¿", ndash: "–", mdash: "—", hellip: "…", laquo: "«", raquo: "»",
  ldquo: "“", rdquo: "”", lsquo: "‘", rsquo: "’", bull: "•", deg: "°",
};

export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|tr|blockquote|ul|ol)>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-zA-Z]+);/g, (whole, name: string) => NAMED_ENTITIES[name] ?? whole)
    .replace(/ /g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const SMALL_WORDS = new Set([
  "de", "del", "la", "las", "el", "los", "y", "e", "o", "u", "a", "en", "con", "por", "para", "al", "un", "una", "su", "sus", "se", "que",
]);

/** Los títulos del portal vienen en MAYÚSCULAS sostenidas; los pasamos a formato título. */
export function normalizeTitle(title: string): string {
  const clean = title.trim().replace(/\.+$/, "");
  if (clean !== clean.toUpperCase()) return clean;
  return clean
    .toLowerCase()
    .split(/(\s+)/)
    .map((token, i) => {
      if (/^\s+$/.test(token) || (i > 0 && SMALL_WORDS.has(token))) return token;
      return token.replace(/[a-záéíóúñü]/, (c) => c.toUpperCase());
    })
    .join("");
}

export function classifyNews(title: string): "NEWS" | "BULLETIN" | "OFFICIAL" | "ALERT" | "EVENT" {
  const t = title.toLowerCase();
  if (/\b(comunicado|decreto|resoluci[oó]n|circular|aviso oficial)\b/.test(t)) return "OFFICIAL";
  if (/\b(alerta|emergencia|calamidad|cierre vial|corte (programado )?de (agua|energ[ií]a)|suspensi[oó]n del servicio)\b/.test(t))
    return "ALERT";
  if (/\bbolet[ií]n\b/.test(t)) return "BULLETIN";
  if (/\b(evento|festival|feria|concierto|convocatoria|invitaci[oó]n|taller|inscripciones|carrera)\b/.test(t))
    return "EVENT";
  return "NEWS";
}

/** El portal entrega fechas sin zona horaria: son hora de Colombia (UTC-5). */
function parseBogotaDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(`${value}-05:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toHttps(url: string | null | undefined) {
  return url ? url.replace(/^http:\/\//i, "https://") : null;
}

/** Sincroniza las noticias recientes de la alcaldía de `municipality` (máximo 20 por consulta del portal). */
export async function syncMunicipalityNews(municipality: string, { limit = 20 }: { limit?: number } = {}) {
  const source = newsSourceFor(municipality);
  if (!source) throw new UnsupportedPortal(`Sin sitio registrado para ${municipality}`);
  const origin = new URL(source.site).origin;

  let list: { results: ListItem[] };
  try {
    list = await getJson<{ results: ListItem[] }>(
      `${origin}/api/v1/contents?tags=${NEWS_TAG_ID}&orderBy=recent&pageSize=${Math.min(limit, 20)}`,
    );
  } catch (error) {
    // 404 o una página HTML: ese portal no expone la API de noticias.
    if (error instanceof SyntaxError || (error instanceof Error && /HTTP 40[34]/.test(error.message))) {
      throw new UnsupportedPortal(`${origin} no tiene API de noticias`);
    }
    throw error;
  }
  if (!Array.isArray(list?.results)) throw new UnsupportedPortal(`${origin} no tiene API de noticias`);

  const items = list.results.filter((i) => i.friendlyName && i.name);
  const urlOf = (item: ListItem) => `${origin}/noticias/${item.friendlyName}`;

  const known = new Set(
    (
      await prisma.news.findMany({
        where: { sourceUrl: { in: items.map(urlOf) } },
        select: { sourceUrl: true },
      })
    ).map((n) => n.sourceUrl),
  );

  const pending = items.filter((item) => !known.has(urlOf(item)));

  // Los detalles se piden de a varios a la vez: la primera carga de un municipio trae ~20 noticias.
  const details = new Map<number, Detail | null>();
  const queue = [...pending];
  const worker = async () => {
    for (let item = queue.shift(); item; item = queue.shift()) {
      try {
        details.set(item.contentID, await getJson<Detail>(`${origin}/api/v1/contents/${item.contentID}`));
      } catch {
        details.set(item.contentID, null); // sin detalle publicamos igual con el resumen de la lista
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(DETAIL_CONCURRENCY, queue.length) }, worker));

  const rows = pending.map((item) => {
    const detail = details.get(item.contentID) ?? null;
    const title = normalizeTitle(item.name);
    const body = htmlToText(detail?.body ?? "") || htmlToText(item.metaDescription ?? "") || title;
    return {
      title,
      body,
      type: classifyNews(title),
      imageUrl: toHttps(item.defaultImage ?? detail?.defaultImage),
      municipality,
      publishedAt:
        parseBogotaDate(detail?.creationDate) ?? parseBogotaDate(item.modifiedDate) ?? new Date(),
      sourceUrl: urlOf(item),
    };
  });

  if (rows.length) await prisma.news.createMany({ data: rows, skipDuplicates: true });
  return { checked: items.length, created: rows.length };
}

type SyncState = { last: number; running: Promise<void> | null; supported: boolean };
const state = globalThis as unknown as { __newsSyncByMunicipality?: Map<string, SyncState> };

/** Indica si la alcaldía tiene noticias sincronizables (false tras comprobar que su portal no tiene la API). */
export function newsSyncSupported(municipality: string) {
  return state.__newsSyncByMunicipality?.get(municipality)?.supported ?? true;
}

/**
 * Sincroniza en segundo plano las noticias del municipio como máximo cada 30 minutos.
 * Devuelve una promesa que termina cuando acaba la sincronización en curso (útil para esperar
 * la primera carga de un municipio que aún no tiene noticias).
 */
export function ensureFreshNews(municipality: string = PILOT_MUNICIPALITY): Promise<void> {
  const map = (state.__newsSyncByMunicipality ??= new Map());
  const s = map.get(municipality) ?? { last: 0, running: null, supported: true };
  map.set(municipality, s);

  if (s.running) return s.running;
  const wait = s.supported ? SYNC_INTERVAL_MS : UNSUPPORTED_RETRY_MS;
  if (Date.now() - s.last < wait) return Promise.resolve();

  s.last = Date.now();
  s.running = syncMunicipalityNews(municipality)
    .then(() => {
      s.supported = true;
    })
    .catch((error) => {
      if (error instanceof UnsupportedPortal) {
        s.supported = false;
        return;
      }
      console.error(`[news-sync] ${municipality}`, error);
      s.last = Date.now() - SYNC_INTERVAL_MS + 5 * 60 * 1000; // reintenta en 5 minutos
    })
    .finally(() => {
      s.running = null;
    });
  return s.running;
}

/**
 * Noticias de un municipio. Si aún no hay ninguna guardada, espera (hasta 8 s) la primera
 * sincronización; si ya hay, responde de inmediato y refresca en segundo plano.
 * `source` es la sección de noticias oficial de la alcaldía (para enlazarla).
 */
export async function municipalityNews(municipality: string, take = 50) {
  const existing = await prisma.news.count({ where: { municipality } });
  if (existing === 0) await ensureFreshNewsWithin(municipality, 8000);
  else void ensureFreshNews(municipality);

  const news = await prisma.news.findMany({ where: { municipality }, orderBy: { publishedAt: "desc" }, take });
  // `syncing`: la primera descarga sigue en curso; el cliente puede volver a consultar en unos segundos.
  const syncing = !!state.__newsSyncByMunicipality?.get(municipality)?.running;
  return { municipality, news, source: newsSourceFor(municipality), syncing };
}

/** Espera la sincronización como máximo `ms` (para no demorar la respuesta si el portal es lento). */
export async function ensureFreshNewsWithin(municipality: string, ms: number) {
  await Promise.race([ensureFreshNews(municipality), new Promise((resolve) => setTimeout(resolve, ms))]);
}
