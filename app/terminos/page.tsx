import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Términos y tratamiento de datos · CundiMarket" };

export default function TerminosPage() {
  return (
    <main className="min-h-dvh mx-auto max-w-md bg-surface">
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur border-b border-line">
        <div className="h-14 flex items-center gap-2 px-3">
          <Link
            href="/register"
            aria-label="Volver"
            className="h-10 w-10 grid place-items-center rounded-full hover:bg-bg active:scale-95 transition"
          >
            <ChevronLeft size={24} />
          </Link>
          <h1 className="font-bold text-[17px] truncate flex-1">Términos y datos</h1>
        </div>
      </header>

      <article className="px-5 py-6 space-y-5 text-sm text-ink-soft leading-relaxed">
        <div>
          <h2 className="text-base font-bold text-ink mb-1">1. Aceptación</h2>
          <p>
            Al crear una cuenta en CundiMarket aceptas estos términos y autorizas el
            tratamiento de tus datos personales de acuerdo con la{" "}
            <b>Ley 1581 de 2012</b> y sus decretos reglamentarios.
          </p>
        </div>
        <div>
          <h2 className="text-base font-bold text-ink mb-1">2. Datos que recolectamos</h2>
          <p>
            Nombre, correo electrónico, teléfono/WhatsApp y municipio. Para negocios,
            además recolectamos la información y evidencias del establecimiento con fines
            de verificación.
          </p>
        </div>
        <div>
          <h2 className="text-base font-bold text-ink mb-1">3. Finalidad</h2>
          <p>
            Usamos tus datos para conectarte con negocios, servicios, inmuebles, empleo y
            noticias de tu municipio, y para gestionar tu cuenta. No los vendemos a terceros.
          </p>
        </div>
        <div>
          <h2 className="text-base font-bold text-ink mb-1">4. Tus derechos</h2>
          <p>
            Puedes conocer, actualizar, rectificar o solicitar la eliminación de tus datos
            en cualquier momento desde tu perfil o escribiendo a los canales de atención
            de CundiMarket.
          </p>
        </div>
        <div>
          <h2 className="text-base font-bold text-ink mb-1">5. Publicaciones</h2>
          <p>
            Solo los usuarios con perfil <b>🏪 Tengo un negocio</b> pueden publicar negocios,
            inmuebles, servicios o vacantes. Los usuarios <b>🛍️ Quiero descubrir</b> pueden
            explorar, guardar favoritos y calificar.
          </p>
        </div>
        <p className="text-xs text-ink-faint pt-2">
          Piloto en Mosquera · Cundinamarca, Colombia.
        </p>
      </article>
    </main>
  );
}
