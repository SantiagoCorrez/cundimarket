import Link from "next/link";
import { LEGAL } from "@/lib/legal";
import { ContactEmail, LegalList, LegalPage, LegalSection } from "@/components/legal";

export const metadata = { title: "Normas de la comunidad · CundiMarket" };

export default function ContenidoPage() {
  return (
    <LegalPage title="Normas de la comunidad">
      <p>
        {LEGAL.brand} funciona gracias a personas y negocios reales de tu municipio. Estas normas
        explican qué se puede publicar, cómo reportar contenido y qué hacemos cuando algo las
        incumple. Complementan los{" "}
        <Link href="/terminos" className="font-semibold text-ink underline">
          términos y condiciones
        </Link>
        .
      </p>

      <LegalSection title="1. Qué esperamos de lo que publicas">
        <LegalList>
          <li>Información veraz, actualizada y que puedas respaldar (precios, horarios, estado).</li>
          <li>Fotos y textos propios, o con autorización de quien tenga los derechos.</li>
          <li>Datos de contacto reales, para que otras personas puedan comunicarse contigo.</li>
          <li>Calificaciones basadas en tu experiencia real con el negocio o servicio.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="2. Lo que no está permitido">
        <LegalList>
          <li>Contenido ilegal o que promueva actividades ilegales.</li>
          <li>Estafas, fraudes, suplantación de personas o negocios, y ofertas engañosas.</li>
          <li>
            Productos o servicios prohibidos o regulados sin autorización: armas, drogas, fauna
            silvestre, medicamentos de venta controlada, juegos de azar no autorizados, entre otros.
          </li>
          <li>
            Contenido sexual explícito, y cualquier forma de explotación o abuso de menores, que
            denunciaremos ante las autoridades.
          </li>
          <li>Acoso, amenazas, discriminación, discurso de odio o contenido violento.</li>
          <li>Publicar datos personales de otras personas sin su autorización.</li>
          <li>Reseñas falsas, compradas o manipuladas, y spam o publicaciones repetidas.</li>
          <li>Material que infrinja derechos de autor, marcas u otros derechos de terceros.</li>
          <li>Virus, enlaces maliciosos o intentos de manipular o vulnerar la plataforma.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="3. Reglas para empleo e inmuebles">
        <LegalList>
          <li>
            Las vacantes no pueden cobrar dinero a los candidatos, pedir datos que no sean necesarios
            para el cargo, ni discriminar por motivos prohibidos por la ley.
          </li>
          <li>
            Los inmuebles deben existir, estar disponibles y corresponder a las fotos y condiciones
            publicadas. No publiques inmuebles de terceros sin su autorización.
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection title="4. Cómo reportar contenido">
        <p>
          Cada ficha de comercio, espacio, servicio y vacante tiene un botón <b>“Reportar”</b>. Indica
          el motivo y, si quieres, un detalle. También puedes escribir a <ContactEmail />. Para
          reportar contenido necesitas tener una cuenta.
        </p>
      </LegalSection>

      <LegalSection title="5. Qué hacemos con los reportes">
        <p>
          Procuramos revisar cada reporte dentro de las <b>24 horas</b> siguientes. Según el caso,
          podemos retirar o suspender la publicación, pedir correcciones, advertir al usuario,
          suspender o eliminar su cuenta y, cuando corresponda, informar a las autoridades.
          El contenido manifiestamente ilegal se retira de inmediato.
        </p>
      </LegalSection>

      <LegalSection title="6. Si crees que nos equivocamos">
        <p>
          Si retiramos contenido o suspendimos tu cuenta y no estás de acuerdo, escríbenos a{" "}
          <ContactEmail /> explicando tu caso. Revisaremos la decisión.
        </p>
      </LegalSection>

      <LegalSection title="7. Cuida tu seguridad">
        <LegalList>
          <li>No envíes dinero por adelantado a personas que no conozcas ni verificaste.</li>
          <li>Reúnete en lugares públicos y, de ser posible, acompañado.</li>
          <li>Verifica el estado de inmuebles, productos y servicios antes de pagar o firmar.</li>
          <li>Desconfía de precios demasiado bajos o de quien presiona para decidir rápido.</li>
        </LegalList>
        <p>
          {LEGAL.brand} no es un canal de emergencias. Ante una emergencia llama a la línea{" "}
          <b>123</b>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
