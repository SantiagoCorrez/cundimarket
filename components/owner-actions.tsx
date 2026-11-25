import Link from "next/link";
import { Pencil } from "lucide-react";
import { Card, buttonClass } from "@/components/ui";
import { DeleteListingButton } from "@/components/delete-listing-button";

/**
 * Panel "Tu publicación" para el dueño: editar y eliminar.
 * Con `admin` (un administrador viendo una publicación) se muestra como "Administrar publicación".
 */
export function OwnerActions({
  kind,
  id,
  title,
  admin = false,
}: {
  kind: "job" | "service" | "property";
  id: string;
  title: string;
  admin?: boolean;
}) {
  const base = { job: "/empleo", service: "/servicios", property: "/espacios" }[kind];
  return (
    <Card className="mx-4 mt-5 p-3.5 space-y-2.5">
      <p className="text-sm font-semibold">{admin ? "Administrar publicación" : "Tu publicación"}</p>
      <div className="flex flex-wrap gap-2">
        <Link href={`${base}/${id}/editar`} className={buttonClass("outline", "md")}>
          <Pencil size={16} /> Editar
        </Link>
        <DeleteListingButton kind={kind} id={id} title={title} from={admin ? "admin" : undefined} />
      </div>
    </Card>
  );
}
