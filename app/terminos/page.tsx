import Link from "next/link";
import { LEGAL } from "@/lib/legal";
import { ContactEmail, LegalList, LegalPage, LegalSection } from "@/components/legal";

export const metadata = { title: "Términos y condiciones · CundiMarket" };

export default function TerminosPage() {
  return (
    <LegalPage title="Términos y condiciones" backFallback="/register">
      <LegalSection title="1. Aceptación">
        <p>
          Al crear una cuenta en CundiMarket aceptas estos términos y autorizas el tratamiento de tus
          datos personales de acuerdo con la <b>Ley 1581 de 2012</b> y sus decretos reglamentarios.
          Si no estás de acuerdo, no uses la plataforma.
        </p>
      </LegalSection>

      <LegalSection title="2. Datos que recolectamos">
        <p>
          Nombre, correo electrónico, teléfono/WhatsApp y municipio. Para negocios, además
          recolectamos la información y evidencias del establecimiento con fines de verificación. El
          detalle completo está en nuestra{" "}
          <Link href="/privacidad" className="font-semibold text-ink underline">
            política de privacidad
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="3. Finalidad">
        <p>
          Usamos tus datos para conectarte con negocios, servicios, inmuebles, empleo y noticias de
          tu municipio, y para gestionar tu cuenta. No los vendemos a terceros.
        </p>
      </LegalSection>

      <LegalSection title="4. Tus derechos">
        <p>
          Puedes conocer, actualizar o rectificar tus datos en cualquier momento desde tu perfil.
          También puedes <b>eliminar tu cuenta y tus datos</b> directamente desde la app o la web en{" "}
          <b>Perfil → Eliminar mi cuenta</b> (
          <Link href="/eliminar-cuenta" className="font-semibold text-ink underline">
            cundimarket.online/eliminar-cuenta
          </Link>
          ), o escribiendo a <ContactEmail />.
        </p>
      </LegalSection>

      <LegalSection title="5. Publicaciones">
        <p>
          Solo los usuarios con perfil <b>🏪 Tengo un negocio</b> pueden publicar negocios,
          inmuebles, servicios o vacantes. Los usuarios <b>🛍️ Quiero descubrir</b> pueden explorar,
          guardar favoritos y calificar.
        </p>
      </LegalSection>

      <LegalSection title="6. Naturaleza de la plataforma y responsabilidad">
        <p>
          CundiMarket es un canal de conexión entre personas, comercios y prestadores de servicios.
          La plataforma facilita la publicación y consulta de productos, servicios, inmuebles,
          empleos y demás contenidos, pero no participa ni se hace responsable de las negociaciones,
          pagos, acuerdos, calidad, cumplimiento o entrega de los productos y servicios ofrecidos por
          terceros. Te recomendamos verificar la información antes de realizar cualquier
          transacción, actuar con precaución y hacer un uso responsable de la plataforma. Al
          continuar, declaras conocer y aceptar estas condiciones.
        </p>
      </LegalSection>

      <LegalSection title="7. Edad y cuenta">
        <LegalList>
          <li>
            Debes ser mayor de 18 años, o contar con la autorización de tus padres o representante
            legal, para crear una cuenta.
          </li>
          <li>La información que registres debe ser veraz y mantenerse actualizada.</li>
          <li>
            Eres responsable de la confidencialidad de tu contraseña y de lo que ocurra en tu cuenta.
            Avísanos si sospechas un uso no autorizado.
          </li>
          <li>Cada persona o negocio debe usar su propia cuenta; no puedes suplantar a otros.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="8. Contenido y normas de la comunidad">
        <p>
          Eres el único responsable del contenido que publicas (textos, fotos, precios, datos de
          contacto) y declaras tener derecho a publicarlo. Debe cumplir la ley y nuestras{" "}
          <Link href="/contenido" className="font-semibold text-ink underline">
            normas de la comunidad
          </Link>
          , que explican qué no está permitido y cómo reportar contenido. Nos otorgas una licencia
          gratuita, no exclusiva y limitada para mostrar ese contenido dentro de CundiMarket mientras
          esté publicado.
        </p>
      </LegalSection>

      <LegalSection title="9. Contacto entre usuarios y calificaciones">
        <LegalList>
          <li>
            Las acciones de llamar o escribir por WhatsApp a negocios, prestadores, anunciantes o
            empleadores están disponibles solo para usuarios registrados. Úsalas únicamente para el
            fin de la publicación y sin enviar mensajes no deseados.
          </li>
          <li>
            Las calificaciones y comentarios deben reflejar una experiencia real. Podemos retirar los
            que sean falsos, ofensivos o manipulados.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="10. Noticias y contenido de terceros">
        <p>
          Las noticias provienen de fuentes públicas, como el portal de la Alcaldía de Mosquera, y se
          muestran con un enlace a la fuente. CundiMarket no es un medio oficial de ninguna entidad
          pública ni garantiza la exactitud de contenidos de terceros. Los enlaces a sitios externos
          (mapas, redes sociales, WhatsApp) se rigen por los términos de esos servicios.
        </p>
      </LegalSection>

      <LegalSection title="11. Emergencias">
        <p>
          La información de canales de emergencia es solo orientativa. CundiMarket no atiende ni
          gestiona emergencias: ante una situación de riesgo comunícate de inmediato con la línea{" "}
          <b>123</b>.
        </p>
      </LegalSection>

      <LegalSection title="12. Propiedad intelectual">
        <p>
          El nombre, el logo, el diseño y el software de {LEGAL.brand} son propiedad de su titular y
          están protegidos por la ley. No puedes copiarlos, modificarlos ni usarlos con fines
          comerciales sin autorización. El contenido que publiques sigue siendo tuyo.
        </p>
      </LegalSection>

      <LegalSection title="13. Suspensión y terminación">
        <p>
          Podemos retirar contenido, suspender o eliminar cuentas que incumplan estos términos o las
          normas de la comunidad, o cuando lo exija la ley. Tú puedes dejar de usar la plataforma y
          eliminar tu cuenta cuando quieras, como se explica en la sección 4.
        </p>
      </LegalSection>

      <LegalSection title="14. Disponibilidad del servicio">
        <p>
          Trabajamos para que la plataforma esté disponible, pero se ofrece “tal cual” y puede tener
          interrupciones por mantenimiento o fallas ajenas a nuestro control. En la medida permitida
          por la ley, {LEGAL.brand} no responde por daños indirectos derivados del uso de la
          plataforma ni de las relaciones entre usuarios.
        </p>
      </LegalSection>

      <LegalSection title="15. Cambios a estos términos">
        <p>
          Podemos actualizar estos términos. Publicaremos la versión vigente con su fecha y, si el
          cambio es importante, te lo avisaremos. Si sigues usando CundiMarket después del cambio,
          entendemos que lo aceptas.
        </p>
      </LegalSection>

      <LegalSection title="16. Ley aplicable y contacto">
        <p>
          Estos términos se rigen por las leyes de la República de Colombia. Para dudas, reclamos o
          reportes escribe a <ContactEmail />. Consulta también la{" "}
          <Link href="/privacidad" className="font-semibold text-ink underline">
            política de privacidad
          </Link>{" "}
          y la{" "}
          <Link href="/cookies" className="font-semibold text-ink underline">
            política de cookies
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
