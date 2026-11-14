"use client";

import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { MUNICIPALITIES } from "@/lib/taxonomy";

/** Selector de municipio que cambia el parámetro `?municipio=` de la página actual. */
export function MunicipalitySwitcher({ basePath, current }: { basePath: string; current: string }) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-3 h-11">
      <MapPin size={16} className="text-brand-strong shrink-0" />
      <span className="sr-only">Municipio</span>
      <select
        value={current}
        onChange={(e) => router.push(`${basePath}?municipio=${encodeURIComponent(e.target.value)}`)}
        className="flex-1 bg-transparent text-[15px] font-semibold text-ink focus:outline-none"
      >
        {MUNICIPALITIES.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </label>
  );
}
