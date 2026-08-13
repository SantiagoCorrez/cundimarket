"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, List, Map } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const filters = [
  { key: "top", label: "⭐ Mejor calificados" },
  { key: "promos", label: "🔥 Con promociones" },
  { key: "verified", label: "✔ Verificados" },
  { key: "recent", label: "🆕 Nuevos" },
];

export function SearchControls({ categories }: { categories: { slug: string; name: string; icon: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const urlQ = params.get("q") || "";
  const [q, setQ] = useState(urlQ);

  // Sincroniza el input con el parámetro de la URL cuando cambia por navegación
  // (patrón de ajuste de estado en render recomendado por React, sin useEffect).
  const [prevUrlQ, setPrevUrlQ] = useState(urlQ);
  if (urlQ !== prevUrlQ) {
    setPrevUrlQ(urlQ);
    setQ(urlQ);
  }

  function update(key: string, value?: string) {
    const sp = new URLSearchParams(params.toString());
    if (!value) sp.delete(key);
    else sp.set(key, value);
    router.replace(`${pathname}?${sp.toString()}`);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    update("q", q.trim() || undefined);
  }

  const activeCat = params.get("category");
  const activeSort = params.get("sort");
  const activeView = params.get("view") === "map" ? "map" : "list";

  return (
    <div className="sticky top-0 z-30 bg-bg/95 backdrop-blur pt-3 pb-2 px-4 space-y-3">
      <form onSubmit={submit} className="flex items-center gap-2 bg-surface border border-line rounded-2xl h-12 px-4 shadow-card">
        <Search size={20} className="text-ink-faint" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nombre, producto o servicio…"
          className="flex-1 bg-transparent outline-none text-[15px]"
        />
        {q && (
          <button type="button" onClick={() => { setQ(""); update("q"); }} aria-label="Limpiar">
            <X size={18} className="text-ink-faint" />
          </button>
        )}
      </form>

      {/* Vista: lista o mapa */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-surface border border-line rounded-2xl">
        <button
          onClick={() => update("view", "list")}
          className={cn(
            "h-9 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition",
            activeView === "list" ? "bg-ink text-white" : "text-ink-soft",
          )}
        >
          <List size={16} /> Lista
        </button>
        <button
          onClick={() => update("view", "map")}
          className={cn(
            "h-9 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition",
            activeView === "map" ? "bg-ink text-white" : "text-ink-soft",
          )}
        >
          <Map size={16} /> Mapa
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => update("category")}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium border transition",
            !activeCat ? "bg-ink text-white border-ink" : "bg-surface border-line text-ink-soft",
          )}
        >
          Todas
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            onClick={() => update("category", c.slug)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium border transition whitespace-nowrap",
              activeCat === c.slug ? "bg-ink text-white border-ink" : "bg-surface border-line text-ink-soft",
            )}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => update("sort", activeSort === f.key ? undefined : f.key)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border transition",
              activeSort === f.key ? "bg-brand border-brand-strong text-brand-ink" : "bg-surface border-line text-ink-soft",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
