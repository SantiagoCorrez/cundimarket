# CundiMarket 🏪

Marketplace local de Cundinamarca — **piloto Mosquera**. Conecta comercios, inmuebles, servicios, empleo y noticias del municipio en una sola plataforma móvil (PWA) con panel administrativo web.

Diseño inspirado en el estilo visual de inDrive (lima vibrante + negro, tarjetas redondeadas, mobile-first).

## Stack

- **Next.js 16** (App Router, Server Actions, Turbopack) + **React 19**
- **TypeScript** + **Tailwind CSS v4**
- **Prisma 6** + **PostgreSQL**
- Autenticación propia con **JWT** (jose) en cookie httpOnly + **bcrypt**
- Iconos **lucide-react**, PWA con manifest

## Puesta en marcha

```bash
npm install
npx prisma migrate dev      # crea la base de datos (dev.db)
npm run db:seed             # carga datos de ejemplo (Mosquera)
npm run dev                 # http://localhost:3000
```

> Si agregas rutas con el servidor corriendo y ves 404 inesperados, reinicia `npm run dev` (Turbopack reconstruye el árbol de rutas).

## Despliegue / actualización en el servidor

Un `git push` **no** actualiza el servidor; después de hacer `git pull` ahí:

```bash
npm install            # ejecuta prisma generate
npm run build          # prisma generate + prisma migrate deploy + next build
# reiniciar el proceso (pm2 / Node project de aaPanel)
npm run news:sync      # opcional: primera carga inmediata de las noticias de la alcaldía
```

> ⚠️ **No ejecutes `npm run db:seed` en producción**: el seed borra todas las tablas
> (usuarios, comercios, reportes…) antes de cargar los datos de ejemplo.

## Noticias de la Alcaldía de Mosquera

La sección de noticias se alimenta del portal oficial
(<https://www.mosquera-cundinamarca.gov.co/tema/noticias>) a través de su API pública
(`lib/news-sync.ts`). Se sincroniza sola en segundo plano, como máximo cada 30 minutos,
cuando alguien abre el inicio o las noticias (web o app), y se puede forzar con
`npm run news:sync`. Cada noticia queda con enlace a la página original (`News.sourceUrl`).
Las noticias de ejemplo del seed se pueden borrar desde el panel de administración.

## Usuarios de prueba (contraseña: `123456`)

| Rol           | Correo                       |
|---------------|------------------------------|
| Administrador | `admin@cundimarket.co`       |
| Comerciante   | `comerciante@cundimarket.co` |
| Ciudadano     | `ciudadano@cundimarket.co`   |

## Funcionalidades implementadas

**App ciudadana (móvil/PWA)**
- Splash, onboarding, registro/login (ciudadano y comerciante), perfil.
- Home: buscador, categorías, módulos, comercios destacados, promociones, noticias.
- Búsqueda con filtros (categoría, mejor calificados, promociones, verificados, nuevos).
- Ficha de comercio: galería, horario, descripción, promociones, menú/catálogo,
  calificaciones, favoritos, contacto por **llamada** y **WhatsApp**, reporte ciudadano.
- Noticias municipales (noticia, alerta, comunicado, evento), detalle.
- Canales de atención municipal con llamada directa.
- Asistente **CundiBot** (búsqueda guiada por intención sobre la base real).
- Favoritos del usuario.

**Comerciante**
- Registro de negocio con **evidencias** para verificación (fachada, aviso, interior).
- Estados: pendiente → en verificación → verificado / rechazado / suspendido.
- Gestión: editar info, publicar promociones, administrar menú/catálogo, sello verificado.

**Módulos**
- 🏠 **CundiEspacios** — inmuebles (arriendo/venta/permuta): listado, filtros, detalle, publicar.
- 🛠️ **CundiServicios** — prestadores: categorías, perfil, calificación, publicar.
- 💼 **CundiEmpleo** — vacantes: filtros, detalle, postulación, guardados, perfil del candidato.

**Panel administrativo web** (`/admin`, solo ADMIN)
- Dashboard de analítica (comercios, usuarios, módulos, categorías top, más visitados, municipios).
- Verificación de comercios: aprobar, rechazar (con motivo), suspender, destacar.
- Gestión de noticias, categorías, reportes ciudadanos y canales de atención.

**App móvil nativa** (`mobile/`, Expo + React Native — iOS y Android)
- Proyecto independiente, ver [`mobile/README.md`](mobile/README.md).
- Consume `app/api/mobile/*` (API JSON con auth por token bearer, separada de
  las Server Actions que usa la web).
- Cubre: inicio, búsqueda, ficha de negocio, favoritos, calificar, noticias,
  CundiEspacios/Servicios/Empleo, canales de emergencia, login/registro.
- Publicar/gestionar negocio y panel admin todavía abren la web en un
  navegador in-app; portarlos a pantallas nativas queda como siguiente paso.

## Notas de seguridad y datos

- Contraseñas con hash bcrypt; sesión JWT en cookie httpOnly (web) o bearer token (móvil); control de acceso por rol.
- Las imágenes se suben comprimidas como data URL (suficiente para el piloto;
  en producción conviene un almacenamiento de objetos como S3/Cloudinary).
- Tratamiento de datos conforme a la **Ley 1581 de 2012** (texto en el registro).

## Próximos pasos sugeridos

- Migrar el resto de imágenes a almacenamiento en la nube.
- Integración real de Google Maps (ubicación/rutas/alertas de tráfico) y Firebase Cloud Messaging (push).
- Portar a pantallas nativas los flujos que hoy la app móvil abre en el navegador (publicar negocio/inmueble/servicio/vacante, panel admin).
- Reemplazar íconos/splash placeholder de la app móvil por el branding real y publicarla en App Store / Google Play (ver `mobile/README.md`).
- Búsqueda full-text e insensible a mayúsculas (Postgres / Meilisearch).
