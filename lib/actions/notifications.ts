"use server";

import { getSession } from "@/lib/auth";
import { markNotificationsRead } from "@/lib/notifications";

export async function markAllNotificationsRead() {
  const session = await getSession();
  if (session) await markNotificationsRead(session.id);
}
