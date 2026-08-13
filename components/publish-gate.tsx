import { Store } from "lucide-react";
import { BackBar } from "@/components/nav";
import { Card, Button } from "@/components/ui";
import { switchUserTypeAction } from "@/lib/actions/auth";

/**
 * Pantalla que se muestra cuando un usuario "🛍️ Quiero descubrir" intenta
 * publicar. Solo los usuarios "🏪 Tengo un negocio" pueden publicar.
 */
export function PublishGate({ title }: { title: string }) {
  return (
    <div>
      <BackBar title={title} />
      <div className="p-6 pt-10 flex flex-col items-center text-center">
        <div className="h-20 w-20 rounded-full bg-brand/15 grid place-items-center mb-4">
          <Store size={34} className="text-brand-ink" />
        </div>
        <h1 className="text-xl font-extrabold">Solo para negocios</h1>
        <p className="text-sm text-ink-soft mt-2 max-w-xs">
          Para publicar necesitas activar el modo{" "}
          <b className="text-ink">🏪 Tengo un negocio</b>. Los usuarios{" "}
          <b className="text-ink">🛍️ Quiero descubrir</b> pueden explorar, guardar
          favoritos y comentar.
        </p>

        <Card className="mt-6 p-4 w-full max-w-xs text-left space-y-3">
          <p className="text-sm text-ink-soft">
            Cambia tu tipo de usuario para empezar a publicar. Podrás volver a
            “Quiero descubrir” cuando quieras desde tu perfil.
          </p>
          <form action={switchUserTypeAction}>
            <input type="hidden" name="role" value="MERCHANT" />
            <Button size="lg" className="w-full">
              🏪 Activar “Tengo un negocio”
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
