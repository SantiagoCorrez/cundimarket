import Link from "next/link";
import type { ReactNode } from "react";
import { LEGAL, LEGAL_LINKS } from "@/lib/legal";
import { LegalBack } from "@/components/legal-back";

/** Estructura común de las páginas legales: cabecera con "volver", cuerpo y pie con las demás políticas. */
export function LegalPage({
  title,
  backFallback = "/politicas",
  children,
}: {
  title: string;
  backFallback?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-dvh mx-auto max-w-md bg-surface">
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur border-b border-line">
        <div className="h-14 flex items-center gap-2 px-3">
          <LegalBack fallback={backFallback} />
          <h1 className="font-bold text-[17px] truncate flex-1">{title}</h1>
        </div>
      </header>

      <article className="px-5 py-6 space-y-5 text-sm text-ink-soft leading-relaxed">
        {children}

        <footer className="pt-4 mt-2 border-t border-line space-y-3">
          <p className="text-xs text-ink-faint">
            Última actualización: {LEGAL.updated}. Piloto en Mosquera · Cundinamarca, Colombia.
          </p>
          <nav aria-label="Políticas" className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="font-semibold text-ink underline">
                {l.label}
              </Link>
            ))}
          </nav>
        </footer>
      </article>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="list-disc pl-5 space-y-1">{children}</ul>;
}

export function ContactEmail() {
  return (
    <a href={`mailto:${LEGAL.contactEmail}`} className="font-semibold text-ink underline break-all">
      {LEGAL.contactEmail}
    </a>
  );
}
