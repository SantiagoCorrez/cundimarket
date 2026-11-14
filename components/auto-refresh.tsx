"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Vuelve a pedir la página al servidor tras `ms` (p. ej. mientras llegan las noticias de una alcaldía). */
export function AutoRefresh({ ms = 4000 }: { ms?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setTimeout(() => router.refresh(), ms);
    return () => clearTimeout(id);
  }, [router, ms]);
  return null;
}
