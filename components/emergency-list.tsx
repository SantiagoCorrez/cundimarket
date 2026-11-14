import { Phone } from "lucide-react";
import { Card } from "@/components/ui";
import { splitPhones, telLink } from "@/lib/utils";

type Contact = { id: string; name: string; detail: string | null; phone: string; icon: string };

/** Lista de líneas de atención: cada número es un botón para llamar. */
export function EmergencyList({ contacts }: { contacts: Contact[] }) {
  return (
    <div className="space-y-2.5">
      {contacts.map((c) => {
        const phones = splitPhones(c.phone);
        return (
          <Card key={c.id} className="p-3 flex items-start gap-3">
            <span className="h-11 w-11 shrink-0 rounded-2xl bg-danger/12 grid place-items-center text-2xl">{c.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink leading-snug">{c.name}</p>
              {c.detail && <p className="text-xs text-ink-soft mt-0.5">{c.detail}</p>}
              {phones.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {phones.map((p) => (
                    <a
                      key={p}
                      href={telLink(p)}
                      className="h-9 px-3 rounded-xl bg-ink text-white text-sm font-semibold inline-flex items-center gap-1.5"
                    >
                      <Phone size={14} /> {p}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
