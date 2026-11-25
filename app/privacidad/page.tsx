import Link from "next/link";
import { LEGAL } from "@/lib/legal";
import { ContactEmail, LegalList, LegalPage, LegalSection } from "@/components/legal";

export const metadata = { title: "Política de privacidad · CundiMarket" };

export default function PrivacidadPage() {
  return (
    <LegalPage title="Política de privacidad">
      <p>
        Esta política explica cómo {LEGAL.brand} trata tus datos personales cuando usas el sitio{" "}
        <b>cundimarket.online</b> y las aplicaciones móviles para iOS y Android. Aplica la{" "}
        <b>Ley 1581 de 2012</b> (protección de datos personales), el <b>Decreto 1074 de 2015</b>{" "}
        (que compila el Decreto 1377 de 2013) y los artículos 15 y 20 de la Constitución Política
        de Colombia.
      </p>

      <LegalSection title="1. Responsable del tratamiento">
        <p>
          {LEGAL.brand} es una plataforma digital de conexión local, hoy en piloto en Mosquera
          (Cundinamarca, Colombia), y es la responsable del tratamiento de los datos que recolecta
          por estos canales. Para consultas, reclamos o ejercer tus derechos escribe a{" "}
          <ContactEmail />.
        </p>
      </LegalSection>

      <LegalSection title="2. Datos que recolectamos">
        <LegalList>
          <li>
            <b>Datos de tu cuenta:</b> nombre, correo electrónico, municipio, tipo de perfil
            (“Quiero descubrir” o “Tengo un negocio”), teléfono/WhatsApp (opcional), foto de perfil
            (opcional) y tu contraseña, que guardamos <b>cifrada</b>, nunca en texto plano.
          </li>
          <li>
            <b>Si entras con Google o Apple:</b> recibimos de ese servicio tu nombre, tu correo y un
            identificador de tu cuenta (y tu foto de perfil, en el caso de Google). Con Apple puedes
            ocultar tu correo real; en ese caso recibimos una dirección de reenvío de Apple. No
            recibimos tu contraseña de Google ni de Apple. Al eliminar tu cuenta revocamos el acceso
            de CundiMarket a tu cuenta de Apple.
          </li>
          <li>
            <b>Contenido que publicas:</b> información de tus negocios, inmuebles, servicios o
            vacantes (nombre, descripción, precios, horarios, dirección, datos de contacto, redes
            sociales y fotos).
          </li>
          <li>
            <b>Tu actividad:</b> favoritos, calificaciones y comentarios, vacantes guardadas o a las
            que aplicas, y reportes de contenido que envías.
          </li>
          <li>
            <b>Perfil laboral (opcional):</b> experiencia, habilidades, educación y enlace a tu hoja
            de vida.
          </li>
          <li>
            <b>Ubicación del dispositivo (opcional):</b> solo si das el permiso en la app móvil. La
            usamos mientras la app está abierta para ordenar los comercios más cercanos. Se envía al
            servidor únicamente para calcular las distancias de esa consulta; no la guardamos en tu
            perfil ni en nuestra base de datos.
          </li>
          <li>
            <b>Copia en tu dispositivo (app móvil):</b> para que la app funcione sin internet,
            guardamos en tu teléfono una copia de lo que consultas (comercios, noticias, tus favoritos)
            y de tu usuario, además de los cambios que hagas sin conexión hasta que se envíen. Esta
            copia no sale del dispositivo y se borra al cerrar sesión o eliminar tu cuenta.
          </li>
          <li>
            <b>Datos técnicos:</b> dirección IP, tipo de dispositivo o navegador y fecha y hora de las
            solicitudes, que los servidores registran por seguridad y para detectar abusos.
          </li>
        </LegalList>
        <p>
          <b>No</b> recolectamos datos sensibles (salud, origen étnico, orientación sexual, datos
          biométricos, etc.), no procesamos pagos ni pedimos datos de tarjetas, y no accedemos a tu
          lista de contactos ni a tu micrófono.
        </p>
      </LegalSection>

      <LegalSection title="3. Para qué usamos tus datos">
        <LegalList>
          <li>Crear y administrar tu cuenta y mantener tu sesión iniciada.</li>
          <li>
            Mostrar tus publicaciones y conectar a las personas con los negocios, servicios,
            inmuebles y vacantes de su municipio.
          </li>
          <li>Permitir favoritos, calificaciones, postulaciones y reportes.</li>
          <li>Ordenar resultados por cercanía y mostrar si un comercio está abierto.</li>
          <li>Mostrar noticias y canales de atención de tu municipio.</li>
          <li>
            Prevenir fraude, abusos y contenido ilícito, y hacer cumplir los{" "}
            <Link href="/terminos" className="font-semibold text-ink underline">
              términos
            </Link>{" "}
            y las{" "}
            <Link href="/contenido" className="font-semibold text-ink underline">
              normas de la comunidad
            </Link>
            .
          </li>
          <li>Atender tus consultas, solicitudes y reclamos, y cumplir obligaciones legales.</li>
        </LegalList>
        <p>
          <b>No vendemos tus datos</b>, no los usamos para publicidad de terceros y no incluimos
          herramientas de seguimiento publicitario ni de analítica de terceros.
        </p>
      </LegalSection>

      <LegalSection title="4. Autorización">
        <p>
          Al crear tu cuenta y marcar la casilla de aceptación nos das tu autorización previa,
          expresa e informada para tratar tus datos con las finalidades de esta política. Puedes
          revocarla en cualquier momento eliminando tu cuenta o escribiéndonos; la revocatoria no
          aplica cuando exista un deber legal o contractual de conservar la información.
        </p>
      </LegalSection>

      <LegalSection title="5. Menores de edad">
        <p>
          {LEGAL.brand} está dirigida a personas mayores de 18 años. Si eres menor de edad solo
          puedes usarla con autorización de tus padres o representante legal. Si detectamos datos
          de un menor recolectados sin esa autorización, los eliminaremos.
        </p>
      </LegalSection>

      <LegalSection title="6. Quién puede ver tus datos">
        <LegalList>
          <li>
            <b>Otros usuarios:</b> lo que publiques es visible (nombre del negocio, descripción,
            fotos, dirección y los datos de contacto que decidas incluir). Tus calificaciones
            muestran tu nombre. Las acciones de llamar o escribir por WhatsApp requieren tener una
            cuenta e iniciar sesión.
          </li>
          <li>
            <b>Administradores de {LEGAL.brand}:</b> acceden a la información necesaria para
            verificar negocios, atender reportes y brindar soporte.
          </li>
          <li>
            <b>Autoridades:</b> solo cuando una norma o una orden de autoridad competente lo exija.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="7. Proveedores y servicios de terceros">
        <LegalList>
          <li>
            <b>Infraestructura:</b> el sitio, la API y la base de datos funcionan en servidores de un
            proveedor de alojamiento (VPS) contratado por {LEGAL.brand}, que actúa como encargado
            del tratamiento.
          </li>
          <li>
            <b>Mapas:</b> algunas fichas incrustan un mapa de OpenStreetMap, que puede recibir tu
            IP y los datos técnicos de la solicitud. “Cómo llegar” abre Google Maps solo cuando lo
            pulsas, y se rige por las políticas de Google.
          </li>
          <li>
            <b>Llamadas y WhatsApp:</b> al pulsar esas opciones se abre la aplicación
            correspondiente y aplican sus propias políticas.
          </li>
          <li>
            <b>Noticias:</b> leemos contenido público del portal de la Alcaldía de Mosquera; no le
            enviamos datos personales.
          </li>
          <li>
            <b>Inicio de sesión con Google y Apple:</b> si eliges esta opción, Google o Apple verifican
            tu identidad y se rigen por sus propias políticas de privacidad.
          </li>
          <li>
            <b>Tiendas de aplicaciones:</b> Apple App Store y Google Play distribuyen la app y
            tratan sus propios datos conforme a sus políticas.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="8. Transferencias internacionales">
        <p>
          Es posible que los servidores de nuestro proveedor estén ubicados fuera de Colombia. En
          ese caso, la transferencia se realiza con garantías de seguridad y confidencialidad
          equivalentes a las exigidas por la Ley 1581 de 2012.
        </p>
      </LegalSection>

      <LegalSection title="9. Tus derechos">
        <p>Como titular de los datos puedes, de forma gratuita:</p>
        <LegalList>
          <li>Conocer, actualizar y rectificar tus datos personales.</li>
          <li>Solicitar prueba de la autorización que nos diste.</li>
          <li>Ser informado sobre el uso que damos a tus datos.</li>
          <li>Revocar la autorización y/o solicitar la supresión de tus datos.</li>
          <li>Acceder a tus datos personales que hayan sido objeto de tratamiento.</li>
          <li>
            Presentar quejas ante la <b>Superintendencia de Industria y Comercio</b> (
            <a
              href="https://www.sic.gov.co"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ink underline"
            >
              sic.gov.co
            </a>
            ) cuando hayas agotado el trámite ante nosotros.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="10. Cómo ejercer tus derechos">
        <p>
          Puedes actualizar tu municipio y tus datos desde tu <b>Perfil</b>, y eliminar tu cuenta en{" "}
          <b>Perfil → Eliminar mi cuenta</b> o en{" "}
          <Link href="/eliminar-cuenta" className="font-semibold text-ink underline">
            cundimarket.online/eliminar-cuenta
          </Link>
          . Para cualquier otra consulta o reclamo escribe a <ContactEmail /> indicando tu nombre, el
          correo de tu cuenta y qué solicitas.
        </p>
        <LegalList>
          <li>
            <b>Consultas:</b> las respondemos en máximo <b>10 días hábiles</b>, prorrogables por 5
            días hábiles más si te informamos el motivo.
          </li>
          <li>
            <b>Reclamos</b> (corrección, actualización, supresión o incumplimiento): los resolvemos
            en máximo <b>15 días hábiles</b>, prorrogables por 8 días hábiles más si te informamos el
            motivo.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="11. Conservación y eliminación">
        <p>
          Conservamos tus datos mientras tu cuenta esté activa. Cuando la eliminas se borran de forma
          definitiva tus datos personales, tus favoritos, calificaciones, reportes, perfil laboral y
          postulaciones, y los negocios, inmuebles, servicios y vacantes que hayas publicado con sus
          fotos. Solo conservaremos información que una norma nos obligue a mantener.
        </p>
      </LegalSection>

      <LegalSection title="12. Seguridad">
        <p>
          Protegemos tu información con conexiones cifradas (HTTPS), contraseñas almacenadas con
          cifrado, sesiones con tokens firmados y acceso restringido a los administradores. Ningún
          sistema es infalible; si crees que tu cuenta fue comprometida, cambia tu contraseña y
          avísanos.
        </p>
      </LegalSection>

      <LegalSection title="13. Cookies">
        <p>
          Usamos únicamente lo necesario para mantener tu sesión. Consulta los detalles en la{" "}
          <Link href="/cookies" className="font-semibold text-ink underline">
            política de cookies
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="14. Cambios a esta política">
        <p>
          Podemos actualizar esta política. Publicaremos la versión vigente en esta página con su
          fecha de actualización y, si el cambio es importante, te lo avisaremos en la plataforma.
          Seguir usando {LEGAL.brand} después del cambio implica que lo conoces.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
