import { prisma } from "@/lib/prisma";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export type NotificationInput = {
  type: string;
  title: string;
  body: string;
  /** Ruta interna de la web (la app la traduce a su propia pantalla). */
  href: string;
  /** Identifica el hecho: si ya existe un aviso con esta clave, se reactiva en vez de duplicarlo. */
  dedupeKey: string;
  /** Texto del push: no debe llevar datos personales (se ve en la pantalla bloqueada). */
  pushBody: string;
};

/** Crea un aviso para el usuario y, si es nuevo, lo envía también como push a sus dispositivos. */
export async function notifyUser(userId: string, input: NotificationInput) {
  const { pushBody, dedupeKey, ...data } = input;
  const existing = await prisma.notification.findUnique({ where: { dedupeKey }, select: { id: true } });
  if (existing) {
    await prisma.notification.update({ where: { dedupeKey }, data: { ...data, readAt: null, createdAt: new Date() } });
    return;
  }
  await prisma.notification.create({ data: { userId, dedupeKey, ...data } });
  // El push no debe demorar ni hacer fallar la acción que lo originó.
  void sendPush(userId, input.title, pushBody, input.href).catch((error) => console.error("[push]", error));
}

type ExpoTicket = { status: "ok" | "error"; message?: string; details?: { error?: string } };

async function sendPush(userId: string, title: string, body: string, href: string) {
  const devices = await prisma.pushToken.findMany({ where: { userId }, select: { token: true }, take: 100 });
  if (!devices.length) return;

  const accessToken = process.env.EXPO_ACCESS_TOKEN;
  const res = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(
      devices.map(({ token }) => ({ to: token, title, body, sound: "default", channelId: "default", data: { href } })),
    ),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Expo push → HTTP ${res.status}`);

  // Los dispositivos donde se desinstaló la app se dejan de usar.
  const { data } = (await res.json()) as { data?: ExpoTicket[] };
  const gone = devices.filter((_, i) => data?.[i]?.details?.error === "DeviceNotRegistered").map((d) => d.token);
  if (gone.length) await prisma.pushToken.deleteMany({ where: { token: { in: gone } } });
  const failed = data?.find((t) => t.status === "error" && t.details?.error !== "DeviceNotRegistered");
  if (failed) console.error("[push]", failed.details?.error ?? failed.message);
}

export function unreadNotifications(userId: string) {
  return prisma.notification.count({ where: { userId, readAt: null } });
}

export function listNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, type: true, title: true, body: true, href: true, readAt: true, createdAt: true },
  });
}

/** Marca como leídos todos los avisos del usuario, o solo uno. */
export function markNotificationsRead(userId: string, id?: string) {
  return prisma.notification.updateMany({
    where: { userId, readAt: null, ...(id ? { id } : {}) },
    data: { readAt: new Date() },
  });
}
