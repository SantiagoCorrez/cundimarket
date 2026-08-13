import { Info } from "lucide-react";
import { Card } from "@/components/ui";

/**
 * Tarjeta informativa que resume qué información pide un formulario de
 * publicación, para que el usuario sepa qué tener a la mano antes de empezar.
 */
export function PublishInfo({ items }: { items: string[] }) {
  return (
    <Card className="p-4 bg-brand/10 border-brand/20 space-y-2">
      <p className="flex items-center gap-2 font-semibold text-ink text-sm">
        <Info size={16} className="text-brand-ink" /> Qué información vas a necesitar
      </p>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it} className="flex gap-2 text-sm text-ink-soft">
            <span className="text-brand-ink">•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
