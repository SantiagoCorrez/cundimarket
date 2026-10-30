import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LEGAL, LEGAL_LINKS } from "@/lib/legal";
import { ContactEmail, LegalPage } from "@/components/legal";
import { Card } from "@/components/ui";

export const metadata = { title: "Políticas · CundiMarket" };

export default function PoliticasPage() {
  return (
    <LegalPage title="Políticas" backFallback="/home">
      <p>
        Aquí encuentras las políticas que rigen el uso de {LEGAL.brand}. Si tienes dudas, escríbenos a{" "}
        <ContactEmail />.
      </p>
      <div className="space-y-2">
        {LEGAL_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="block">
            <Card className="p-3.5 flex items-center gap-3">
              <span className="flex-1 min-w-0">
                <span className="block font-semibold text-ink">{l.label}</span>
                <span className="block text-xs text-ink-soft mt-0.5">{l.text}</span>
              </span>
              <ChevronRight size={18} className="text-ink-faint shrink-0" />
            </Card>
          </Link>
        ))}
      </div>
    </LegalPage>
  );
}
