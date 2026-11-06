@AGENTS.md

## Proyecto
- BoliTax: app movil para conductores de taxi (clon de Uber, version conductor). Proyecto universitario de Desarrollo Movil.
- Los requisitos oficiales estan en `docs/requisitos-bolitax.pdf`. Antes de implementar cualquier funcionalidad, lee la seccion correspondiente de ese documento y siguela al pie de la letra.
- Si algo de este archivo contradice el documento, pregunta antes de decidir.
- Unica diferencia con el documento: el nombre de la app es BoliTax (no UberClone).

## Stack
- Expo con JavaScript. No usar TypeScript.
- Navegacion: React Navigation (Stack para el flujo del viaje, Tabs para el registro, Drawer para perfil, historial, ganancias y configuracion). No usar Expo Router.
- Autenticacion y base de datos: Firebase Auth + Firestore.
- Mapas: `react-native-maps`. Ubicacion: `expo-location`.
- Pagos: Mercado Pago Checkout Pro en modo prueba.
- Backend: Node + Express en la carpeta `backend/`.
- Imagenes: Cloudinary.
- No agregar librerias fuera de esta lista sin preguntar primero.
- Notificaciones: Firebase Cloud Messaging (obligatorio segun el documento).

## Pruebas
- La app se prueba en el emulador Android de Android Studio.
- Se usa development build (`npx expo run:android`), no Expo Go, porque el proyecto usa librerias nativas (mapas, notificaciones, sonido).
- La logica pura (por ejemplo `calculateFare`) se prueba con Jest.
- Al terminar una tarea, indica exactamente como verificarla en el emulador o que test correr.

## Forma de trabajar
- Antes de escribir codigo, presenta un plan: que archivos vas a crear o modificar y por que. Espera mi aprobacion.
- Una tarea a la vez. No modifiques archivos que no esten en el plan aprobado.
- No instales dependencias sin preguntar y explicar para que sirven.
- Explica brevemente las decisiones importantes: yo debo sustentar este codigo ante la profesora.
- Si un requisito es ambiguo o falta informacion, pregunta en vez de suponer.
- No hagas commits ni push; los hago yo.

## Convenciones
- Nombres de variables, funciones, archivos y campos de base de datos en ingles (camelCase; componentes en PascalCase).
- Comentarios en el codigo en español.
- Textos visibles en la UI en español normal (con tildes).
- Montos en pesos colombianos enteros (sin decimales).
- Todo bloque de codigo generado por ti lleva el comentario `// AI-assisted: see docs/AI_LOG.md #N`, donde N es el numero de la entrada de la bitacora. Si no sabes el numero, pregunta.

## Seguridad
- Nunca escribas llaves, tokens ni contraseñas directamente en el codigo.
- Secretos (como el `access_token` de Mercado Pago o el API secret de Cloudinary) van SOLO en `backend/.env`. Nunca en la app.
- Llaves publicas de cliente (configuracion de Firebase, API key de Google Maps) van en el `.env` de la app como variables `EXPO_PUBLIC_*`, nunca escritas en el codigo.
- Cada vez que se agregue una variable nueva, actualiza el `.env.example` correspondiente con el nombre de la variable y sin valor.
- No leas ni muestres el contenido de ningun archivo `.env`.
- No guardar datos de tarjetas ni cuentas bancarias en la app ni en AsyncStorage.

## Decisiones del proyecto
- Documentos del conductor (licencia, SOAT, tecnico-mecanica y tarjeta amarilla): la imagen es simulada, se acepta cualquier foto sin verificar su contenido. Pero las validaciones de formulario del documento (campos obligatorios, fechas de vencimiento posteriores a hoy, formatos) si se implementan. La tarjeta amarilla es un documento extra que no esta en el PDF.
- No existe app de pasajero: las solicitudes de viaje las crea un script propio en `backend/` que escribe viajes en Firestore con `status: requested`.
- Extras que no estan en el PDF:
  - Al abrir la app, animacion de un taxi que se desplaza y se detiene debajo del logo de BoliTax.
  - Cuando llega una solicitud nueva, debe sonar un sonido (tambien con la app en segundo plano).
- El diseño visual se definira mas adelante; por ahora prioriza la funcionalidad con estilos simples.