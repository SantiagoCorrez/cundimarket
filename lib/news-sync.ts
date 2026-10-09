/**
 * Sincroniza las noticias de la Alcaldía de Mosquera
 * (https://www.mosquera-cundinamarca.gov.co/tema/noticias) con la tabla `News`.
 *
 * El portal de la alcaldía es una SPA que consume su propia API pública:
 *  - Lista:   GET /api/v1/contents?tags=1&orderBy=recent&pageSize=N   (tag 1 = "Noticias")
 *  - Detalle: GET /api/v1/contents/{id}                               (cuerpo HTML, fecha, imágenes)
 *  - Página pública de cada noticia: /noticias/{friendlyName}
 */
import { prisma } from "./prisma";

const ORIGIN = "https://www.mosquera-cundinamarca.gov.co";
const NEWS_TAG_ID = 1;
const SYNC_INTERVAL_MS = 30 * 60 * 1000;

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

export async function syncMosqueraNews({ limit = 20 }: { limit?: number } = {}) {
  const list = await getJson<{ results: ListItem[] }>(
    `${ORIGIN}/api/v1/contents?tags=${NEWS_TAG_ID}&orderBy=recent&pageSize=${limit}`,
  );
  const items = list.results.filter((i) => i.friendlyName && i.name);
  const urlOf = (item: ListItem) => `${ORIGIN}/noticias/${item.friendlyName}`;

  const known = new Set(
    (
      await prisma.news.findMany({
        where: { sourceUrl: { in: items.map(urlOf) } },
        select: { sourceUrl: true },
      })
    ).map((n) => n.sourceUrl),
  );

  const rows = [];
  for (const item of items) {
    const sourceUrl = urlOf(item);
    if (known.has(sourceUrl)) continue;

    let detail: Detail | null = null;
    try {
      detail = await getJson<Detail>(`${ORIGIN}/api/v1/contents/${item.contentID}`);
    } catch {
      // sin detalle publicamos igual con el resumen de la lista
    }
    const title = normalizeTitle(item.name);
    const body = htmlToText(detail?.body ?? "") || htmlToText(item.metaDescription ?? "") || title;
    rows.push({
      title,
      body,
      type: classifyNews(title),
      imageUrl: toHttps(item.defaultImage ?? detail?.defaultImage),
      municipality: "Mosquera",
      publishedAt:
        parseBogotaDate(detail?.creationDate) ?? parseBogotaDate(item.modifiedDate) ?? new Date(),
      sourceUrl,
    });
  }

  if (rows.length) await prisma.news.createMany({ data: rows, skipDuplicates: true });
  return { checked: items.length, created: rows.length };
}

const state = globalThis as unknown as { __newsSync?: { last: number; running: boolean } };

/** Dispara una sincronización en segundo plano como máximo cada 30 minutos. */
export function ensureFreshNews() {
  const s = (state.__newsSync ??= { last: 0, running: false });
  if (s.running || Date.now() - s.last < SYNC_INTERVAL_MS) return;
  s.running = true;
  s.last = Date.now();
  syncMosqueraNews()
    .catch((error) => {
      console.error("[news-sync]", error);
      s.last = Date.now() - SYNC_INTERVAL_MS + 5 * 60 * 1000; // reintenta en 5 minutos
    })
    .finally(() => {
      s.running = false;
    });
}
