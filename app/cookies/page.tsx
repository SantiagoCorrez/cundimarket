import Link from "next/link";
import { LEGAL } from "@/lib/legal";
import { ContactEmail, LegalList, LegalPage, LegalSection } from "@/components/legal";

export const metadata = { title: "Política de cookies · CundiMarket" };

export default function CookiesPage() {
  return (
    <LegalPage title="Política de cookies">
      <p>
        Las cookies y el almacenamiento local son pequeños datos que el navegador o la app guardan en
        tu dispositivo. {LEGAL.brand} usa únicamente los que son <b>necesarios</b> para que el
        servicio funcione.
      </p>

      <LegalSection title="1. Qué guardamos">
        <LegalList>
          <li>
            <b>Cookie <code>cundi_session</code></b> (sitio web): mantiene tu sesión iniciada. Es
            necesaria, solo se envía a nuestro servidor (<i>httpOnly</i>), usa <i>SameSite=Lax</i> y{" "}
            <i>Secure</i> en producción, y dura hasta 30 días o hasta que cierres sesión.
          </li>
          <li>
            <b>Almacenamiento local <code>cundi_onboarded</code></b> (sitio web): recuerda que ya
            viste la pantalla de bienvenida. Permanece hasta que borres los datos del navegador.
          </li>
          <li>
            <b>App móvil:</b> el token de sesión se guarda en el almacenamiento seguro del
            dispositivo (Keychain en iOS, Keystore en Android) y se borra al cerrar sesión o
            eliminar la cuenta. Además, la app guarda una copia de lo que consultas para poder usarse
            sin conexión (ver la política de privacidad); también se borra al cerrar sesión.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="2. Lo que no usamos">
        <p>
          No usamos cookies publicitarias, de analítica de terceros ni de redes sociales, y no
          creamos perfiles de seguimiento sobre ti.
        </p>
      </LegalSection>

      <LegalSection title="3. Contenido de terceros">
        <p>
          Algunas fichas incrustan un mapa de OpenStreetMap. Al cargarlo, ese proveedor puede
          recibir datos técnicos de tu solicitud (como tu IP) y aplican sus propias políticas. Los
          enlaces a Google Maps, WhatsApp o teléfono solo se abren cuando los pulsas.
        </p>
      </LegalSection>

      <LegalSection title="4. Cómo controlarlas">
        <p>
          Puedes borrar o bloquear cookies desde la configuración de tu navegador. Si eliminas{" "}
          <code>cundi_session</code> se cerrará tu sesión, y si bloqueas las cookies necesarias no
          podrás iniciar sesión en el sitio web. En la app, cerrar sesión borra el token guardado.
        </p>
      </LegalSection>

      <LegalSection title="5. Más información">
        <p>
          Consulta cómo tratamos tus datos en la{" "}
          <Link href="/privacidad" className="font-semibold text-ink underline">
            política de privacidad
          </Link>{" "}
          o escríbenos a <ContactEmail />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
