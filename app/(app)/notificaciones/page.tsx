import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listNotifications } from "@/lib/notifications";
import { BackBar } from "@/components/nav";
import { Card, EmptyState } from "@/components/ui";
import { MarkNotificationsRead } from "@/components/mark-notifications-read";
import { cn, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notificaciones · CundiMarket" };

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/notificaciones");
  const notifications = await listNotifications(session.id);

  return (
    <div>
      <BackBar title="Notificaciones" />
      <div className="p-4 space-y-2">
        {notifications.length ? (
          notifications.map((n) => (
            <Link key={n.id} href={n.href} className="block">
              <Card className={cn("p-3.5 flex items-start gap-3", !n.readAt && "border-brand/40 bg-brand/5")}>
                <span className="text-2xl">{n.type === "JOB_APPLICATION" ? "💼" : "🔔"}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{n.title}</p>
                  <p className="text-sm text-ink-soft">{n.body}</p>
                  <p className="text-xs text-ink-faint mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.readAt && <span className="h-2.5 w-2.5 rounded-full bg-brand-strong mt-1.5 shrink-0" aria-label="Sin leer" />}
              </Card>
            </Link>
          ))
        ) : (
          <EmptyState icon="🔔" title="Sin notificaciones" subtitle="Aquí verás, por ejemplo, cuando alguien se postule a tus vacantes." />
        )}
      </div>
      {notifications.some((n) => !n.readAt) && <MarkNotificationsRead />}
    </div>
  );
}
