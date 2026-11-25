"use client";

import { useEffect } from "react";
import { markAllNotificationsRead } from "@/lib/actions/notifications";

/** Marca los avisos como leídos una vez que el usuario ve la lista. */
export function MarkNotificationsRead() {
  useEffect(() => {
    void markAllNotificationsRead();
  }, []);
  return null;
}
