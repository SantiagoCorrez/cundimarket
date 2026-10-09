# CundiMarket — App móvil (Expo)

App nativa (iOS + Android) construida con **Expo Router**. Es un proyecto
independiente del sitio web (`../`): no comparte build ni deploy, solo
consume la API JSON en `../app/api/mobile/*` sobre HTTP.

## Arquitectura

- **UI y navegación**: React Native + Expo Router (`src/app`), sin librerías de
  navegación adicionales.
- **Datos**: la API del sitio web expone endpoints JSON dedicados bajo
  `/api/mobile/*` (ver `../app/api/mobile/`). Las Server Actions del sitio
  (`../lib/actions/*`) no son accesibles desde la app nativa; por eso existen
  estos endpoints paralelos con autenticación por **token bearer** (JWT) en
  vez de la cookie httpOnly que usa la web.
- **Auth**: el token se guarda con `expo-secure-store` (Keychain/Keystore) en
  nativo, y con `localStorage` en la build web — ver `src/utils/secure-storage.ts`.
- **Sin backend propio**: esta app nunca habla directo con Prisma/Postgres,
  siempre a través de la API del sitio.

## Funcionalidad cubierta

Inicio, **módulo Comercios** (categoría → subcategoría; búsqueda por nombre,
categoría, producto, barrio o municipio; filtros *abierto ahora*, *mejor
calificados*, *promociones activas* y *más cercanos*), ficha de negocio
(galería de 2 fotos, promos, menú, calificar, favorito, **dirección → Google
Maps**, llamar/WhatsApp **solo para usuarios registrados**), noticias reales
de la Alcaldía de Mosquera, CundiEspacios, CundiServicios, CundiEmpleo
(listado + detalle + guardar/aplicar), canales de emergencia, perfil,
login/registro (con repetir contraseña y ver contraseña) y selector de
municipio con aviso "Próximamente" para los municipios aún no habilitados.

**Flujos que abren el sitio web en el navegador in-app** (no reescritos de
forma nativa todavía): panel de comerciante, panel administrativo, publicar
inmueble/servicio/vacante, perfil laboral. Son botones "Publicar" / enlaces
en la app que abren `https://cundimarket.online/...` con `expo-web-browser`.
Portarlos a pantallas nativas es el siguiente paso lógico cuando se quiera
pulir la experiencia de comerciantes.

**No incluido todavía**: CundiBot (asistente), reportes ciudadanos, mapa de
búsqueda.

## Desarrollo local

```bash
npm install
npx expo start
```

Por defecto la app apunta a `https://cundimarket.online` (ver `.env`). Para
probar contra tu servidor local (`npm run dev` en `../`), crea
`mobile/.env.development.local` (no se versiona) con:

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

> ⚠️ Usa **`.env.development.local`**, no `.env.local`: este último también lo leen
> los builds de release y el APK quedaría apuntando a `localhost` (no conecta con nada).
> `EXPO_PUBLIC_*` se incrusta en el bundle al compilar; cambiarlo exige recompilar.

En un dispositivo físico usa la IP de tu máquina en la red local en vez de
`localhost` (Expo la imprime al arrancar `expo start`).

## Compilar el APK en Windows (sin EAS)

```bash
npx expo prebuild --platform android --no-install   # regenera android/ con ícono, splash y permisos
# prebuild borra y recrea android/: vuelve a crear android/gradle/gradle-daemon-jvm.properties con
#   toolchainVersion=17
cd android && ./gradlew assembleRelease              # APK autocontenido (lleva el JS adentro)
```

* Requiere **JDK 17** para Gradle: con JDK 22+ el plugin de Android falla con
  *"A restricted method in java.lang.System has been called"*.
* `prebuild` también borra `android/local.properties`: si Gradle dice *"SDK location not
  found"*, créalo con `sdk.dir=C:/Users/<usuario>/AppData/Local/Android/Sdk` (o define `ANDROID_HOME`).
* `assembleDebug` genera un APK que **no** lleva el JavaScript y necesita Metro
  (`expo start`) corriendo; para probar en un teléfono usa `assembleRelease`.
* El release usa la firma de debug: sirve para pruebas, no para Google Play
  (para la tienda se necesita un keystore propio o `eas build`).

## Publicar en las tiendas (EAS Build, sin Mac)

Este proyecto no tiene carpetas `ios/`/`android/` (Continuous Native
Generation): Expo las genera al momento de compilar. Para publicar:

```bash
npm install -g eas-cli
eas login
eas build:configure         # solo la primera vez
eas build --platform ios       # compila en la nube de Expo, no requiere Mac
eas build --platform android
eas submit --platform ios      # sube a App Store Connect (requiere cuenta Apple Developer, USD 99/año)
eas submit --platform android  # sube a Google Play Console (requiere cuenta, USD 25 único pago)
```

El ícono, el splash y el favicon ya usan el logo de CundiMarket
(`assets/images/`); revisa `app.json` (bundle id `co.cundimarket.app`, nombre,
versión) antes de publicar.
