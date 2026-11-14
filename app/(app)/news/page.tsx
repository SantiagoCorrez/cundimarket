import { ExternalLink } from "lucide-react";
import { BackBar } from "@/components/nav";
import { NewsCard } from "@/components/cards";
import { EmptyState } from "@/components/ui";
import { MunicipalitySwitcher } from "@/components/municipality-switcher";
import { AutoRefresh } from "@/components/auto-refresh";
import { getSession } from "@/lib/auth";
import { municipalityNews } from "@/lib/news-sync";
import { normalizeMunicipality } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ municipio?: string }> }) {
  const { municipio } = await searchParams;
  const session = await getSession();
  const municipality = normalizeMunicipality(municipio, session?.municipality);
  const { news, source, syncing } = await municipalityNews(municipality);

  return (
    <div>
      <BackBar title="Noticias del municipio" />
      <div className="p-4 space-y-3">
        <MunicipalitySwitcher basePath="/news" current={municipality} />
        {news.length ? (
          news.map((n) => <NewsCard key={n.id} n={n} />)
        ) : syncing ? (
          <>
            <EmptyState icon="⏳" title={`Trayendo las noticias de ${municipality}…`} subtitle="Esto toma unos segundos la primera vez." />
            <AutoRefresh />
          </>
        ) : (
          <EmptyState
            icon="📰"
            title={`Sin noticias de ${municipality} por ahora`}
            subtitle="Puedes consultarlas directamente en el sitio oficial de la alcaldía."
          />
        )}
        {source && (
          <a
            href={source.news}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-brand-strong"
          >
            Ver más en el sitio de la Alcaldía de {municipality} <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
}
