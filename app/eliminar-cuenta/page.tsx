import Link from "next/link";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buttonClass } from "@/components/ui";
import { DeleteAccountForm } from "@/components/delete-account-form";

export const metadata = { title: "Eliminar mi cuenta · CundiMarket" };
export const dynamic = "force-dynamic";

export default async function EliminarCuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ listo?: string }>;
}) {
  const { listo } = await searchParams;
  const session = await getSession();
  const account = session
    ? await prisma.user.findUnique({ where: { id: session.id }, select: { passwordHash: true } })
    : null;

  return (
    <main className="min-h-dvh mx-auto max-w-md bg-surface">
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur border-b border-line">
        <div className="h-14 flex items-center gap-2 px-3">
          <Link
            href={session ? "/profile" : "/home"}
            aria-label="Volver"
            className="h-10 w-10 grid place-items-center rounded-full hover:bg-bg active:scale-95 transition"
          >
            <ChevronLeft size={24} />
          </Link>
          <h1 className="font-bold text-[17px] truncate flex-1">Eliminar mi cuenta</h1>
        </div>
      </header>

      <article className="px-5 py-6 space-y-5 text-sm text-ink-soft leading-relaxed">
        {listo ? (
          <div className="flex flex-col items-center text-center gap-3 py-10">
            <CheckCircle2 size={48} className="text-success" />
            <h2 className="text-xl font-extrabold text-ink">Tu cuenta fue eliminada</h2>
            <p>
              Eliminamos tu cuenta y los datos asociados a ella. Gracias por haber sido parte de
              CundiMarket; si quieres volver, siempre podrás crear una cuenta nueva.
            </p>
            <Link href="/home" className={buttonClass("primary", "lg", "w-full mt-2")}>
              Ir al inicio
            </Link>
          </div>
        ) : (
          <>
            <p>
              Puedes eliminar tu cuenta de CundiMarket en cualquier momento. Al hacerlo se borran de
              forma definitiva:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Tus datos personales (nombre, correo, teléfono, municipio).</li>
              <li>Tus favoritos, calificaciones y reportes.</li>
              <li>Tu perfil laboral y tus postulaciones guardadas.</li>
              <li>
                Los negocios, inmuebles, servicios y vacantes que hayas publicado, con sus fotos,
                promociones y menú.
              </li>
            </ul>
            <p>
              Más detalles en la{" "}
              <Link href="/privacidad" className="font-semibold text-ink underline">
                política de privacidad
              </Link>
              .
            </p>

            {session ? (
              <>
                <p className="text-ink">
                  Sesión iniciada como <b>{session.email}</b>.
                </p>
                <DeleteAccountForm hasPassword={!!account?.passwordHash} />
              </>
            ) : (
              <>
                <p>Para continuar, inicia sesión con la cuenta que quieres eliminar.</p>
                <Link
                  href="/login?next=/eliminar-cuenta"
                  className={buttonClass("primary", "lg", "w-full")}
                >
                  Iniciar sesión
                </Link>
              </>
            )}
          </>
        )}
      </article>
    </main>
  );
}
