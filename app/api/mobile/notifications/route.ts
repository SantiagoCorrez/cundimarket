import { listNotifications, markNotificationsRead, unreadNotifications } from "@/lib/notifications";
import { requireUser, isErrorResponse, json } from "@/lib/api";

export async function GET(req: Request) {
  const session = await requireUser(req);
  if (isErrorResponse(session)) return session;
  const [notifications, unread] = await Promise.all([listNotifications(session.id), unreadNotifications(session.id)]);
  return json({ notifications, unread });
}

/** Marca como leídos todos los avisos, o solo { id }. */
export async function POST(req: Request) {
  const session = await requireUser(req);
  if (isErrorResponse(session)) return session;
  const body = await req.json().catch(() => null);
  await markNotificationsRead(session.id, typeof body?.id === "string" ? body.id : undefined);
  return json({ ok: true });
}
