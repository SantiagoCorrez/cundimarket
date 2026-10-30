"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

/** Vuelve a la pantalla anterior; si se abrió el enlace directo, va a `fallback`. */
export function LegalBack({ fallback }: { fallback: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="Volver"
      onClick={() => (window.history.length > 1 ? router.back() : router.push(fallback))}
      className="h-10 w-10 grid place-items-center rounded-full hover:bg-bg active:scale-95 transition"
    >
      <ChevronLeft size={24} />
    </button>
  );
}
