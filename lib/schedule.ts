/**
 * Interpreta el horario de un comercio (texto libre, p. ej. "Lun-Dom 11:00am - 10:00pm")
 * y dice si está abierto en este momento (hora de Colombia).
 * Devuelve null cuando el texto no se puede interpretar.
 */

const DAY_INDEX: Record<string, number> = { lun: 1, mar: 2, mie: 3, jue: 4, vie: 5, sab: 6, dom: 7 };
const DAY_RE = /\b(lun(?:es)?|mar(?:tes)?|mie(?:rcoles)?|jue(?:ves)?|vie(?:rnes)?|sab(?:ados?)?|dom(?:ingos?)?)\b/g;
const RANGE_SEP_RE = /^\s*(?:-|–|—|a|al|hasta)\s*$/;
const TIME_RE =
  /(\d{1,2})(?:[:.h](\d{2}))?\s*(am|pm)?\s*(?:-|–|—|a|hasta)\s*(\d{1,2})(?:[:.h](\d{2}))?\s*(am|pm)?/g;

type Segment = { days: Set<number> | null; ranges: [number, number][]; always: boolean };

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/([ap])\s*\.\s*m\s*\.?/g, "$1m");
}

function toMinutes(hour: number, minute: number, meridiem?: string) {
  let h = hour;
  if (meridiem === "pm" && h < 12) h += 12;
  if (meridiem === "am" && h === 12) h = 0;
  return h * 60 + minute;
}

function parseDays(segment: string): Set<number> | null {
  const tokens = [...segment.matchAll(DAY_RE)];
  if (!tokens.length) return null;
  const days = new Set<number>();
  for (let k = 0; k < tokens.length; k++) {
    const current = DAY_INDEX[tokens[k][1].slice(0, 3)];
    const next = tokens[k + 1];
    if (next) {
      const between = segment.slice(tokens[k].index! + tokens[k][0].length, next.index);
      if (RANGE_SEP_RE.test(between)) {
        const end = DAY_INDEX[next[1].slice(0, 3)];
        for (let d = current; ; d = (d % 7) + 1) {
          days.add(d);
          if (d === end) break;
        }
        k++;
        continue;
      }
    }
    days.add(current);
  }
  return days;
}

function parseSegment(raw: string): Segment | null {
  const days = parseDays(raw);
  const always = /24\s*(?:h\b|hs\b|hrs\b|horas)/.test(raw);
  const ranges: [number, number][] = [];
  for (const m of raw.matchAll(TIME_RE)) {
    const h1 = Number(m[1]);
    const h2 = Number(m[4]);
    if (h1 > 24 || h2 > 24) continue;
    const m1 = Number(m[2] ?? 0);
    const m2 = Number(m[5] ?? 0);
    const start = toMinutes(h1, m1, m[3]); // "8-5pm" => 8:00 a 17:00 (sin am/pm la hora inicial queda tal cual)
    let end = toMinutes(h2, m2, m[6]);
    if (!m[3] && !m[6] && end <= start && h2 < 12) end += 12 * 60; // "8-5" => 8:00 a 17:00
    ranges.push([start, end]);
  }
  if (!ranges.length && !always) return null;
  return { days, ranges, always };
}

/** Día (1=lunes … 7=domingo) y minutos desde medianoche en Colombia. */
function bogotaNow(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(get("weekday")) + 1;
  return { day: weekday, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export function isOpenNow(schedule: string | null | undefined, now = new Date()): boolean | null {
  if (!schedule?.trim()) return null;
  const text = normalize(schedule);
  const rawSegments = text
    .split(/[;|\n]|\s\/\s|,\s*(?=(?:lun|mar|mie|jue|vie|sab|dom))/)
    .map((s) => s.trim())
    .filter(Boolean);

  const segments: Segment[] = [];
  let previousDays: Set<number> | null = null;
  for (const raw of rawSegments) {
    const seg = parseSegment(raw);
    if (!seg) continue;
    if (seg.days === null && previousDays) seg.days = previousDays;
    previousDays = seg.days;
    segments.push(seg);
  }
  if (!segments.length) return null;

  const { day, minutes } = bogotaNow(now);
  const yesterday = day === 1 ? 7 : day - 1;
  return segments.some((seg) => {
    const today = seg.days === null || seg.days.has(day);
    const prev = seg.days === null || seg.days.has(yesterday);
    if (seg.always) return today;
    return seg.ranges.some(([start, end]) =>
      start <= end
        ? today && minutes >= start && minutes < end
        : (today && minutes >= start) || (prev && minutes < end),
    );
  });
}
