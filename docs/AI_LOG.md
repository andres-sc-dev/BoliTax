# Bitacora de uso de IA — BoliTax

Herramientas usadas:
- Claude (chat en claude.ai): planeacion, explicaciones y revision de prompts.
- Claude Code (agente en VSCode): generacion de codigo.

---

### Entrada #1
- Fecha: 2026-11-06
- Integrante: Andrés Salazar Castrillón
- Herramienta: Claude (chat)
- Objetivo: Planear el proyecto y definir la metodologia de trabajo con un agente de IA
- Prompt: "tengo este taller para desarrollo movil, nos permitieron IA generativa por ende quiero que esto sea un inicio formativo a como desarrollar con IA, como saber guiar a la IA correctamente, no simplemente copie y pegue sino conectarlo con el agente de VSCode. tu me vas a orientar en como orientar correctamente al agente, que no sea simplemente copy page. ojo, ya no esta dividido el proyecto en 2 sino que ya toca hacerlo completo. el proyecto se llama bolitax, es lo unico que modificaremos del documento, el nombre del proyecto. adicional al documento quiero meterle un plus que es que un taxi se mueva hasta debajo del logo bolitax (despues lo crearemos) en el inicio al abrir la app, sonido al salir el servicio, osea, cuando salga un servicio debe de sonar y tambien la funcionalidad que pide el documento y ya, por ahora eso seria todo. despues cuando lleguemos a la parte de diseño del front hablamos que tipo de diseño quiero. por ahora iniciemos. ahh tambien necesito que me guies en todo lo relacionado con conexiones de apis y de bd y todo en general. que mas necesitas saber para que iniciemos?"
- Resumen de la respuesta: Se definio el flujo de trabajo con el agente (contexto fijo, plan antes de codigo, tareas pequeñas, revision del diff, verificacion, commit y bitacora) y se identifico la informacion necesaria para iniciar.
- Que se uso / modifico / descarto: Se uso la metodologia propuesta. Se descarto la integracion de Claude via Copilot y se uso la extension oficial Claude Code.
- Archivos y commit: CLAUDE.md, AGENTS.md — 4f73d04 (HEAD -> main, origin/main, origin/HEAD) Merge pull request #1 from andres-sc-dev/setup/agent-context 39e506a (origin/setup/agent-context, setup/agent-context) docs: Se agrega CLAUDE.md,se ajusta AGENTS.md y requisitos del proyecto e8b6a37 feat: agrega funcion calculateFare con comision y ganancia neta
- Verificacion: Revision manual del CLAUDE.md antes del commit; PR #1 revisado y mergeado.
- Aprendizaje: se comprendio que no solo es poner un buen prompt sino tambien saber configurarlo desde los archivos.

---

### Entrada #2
- Fecha: 2026-11-08
- Integrante: Andrés Salazar Castrillón
- Herramienta: Claude Code
- Objetivo: Implementar el calculo de tarifas de BoliTax (seccion 5 del documento) con su configuracion y pruebas en Jest
- Prompt:
  ```
  Objetivo: implementar el calculo de tarifas de BoliTax.

  Referencia: seccion 5 de docs/requisitos-bolitax.pdf (parametros, formulas, redondeo y tabla de ejemplo).

  Requisitos:
  1. Crear src/config/pricing.js con todos los parametros de la seccion 5 (tarifa base, valor por km, valor por minuto, tarifa minima, multiplicadores por categoria economy/xl/premium y commissionRate 0.20).
  2. Crear src/utils/calculateFare.js con una funcion pura calculateFare({ distanceKm, durationMin, category, tip }) que devuelva { fare, commission, driverEarnings }. Debe leer los valores de pricing.js, no tener numeros escritos a mano.
  3. La tarifa se redondea al multiplo de 100 COP mas cercano antes de calcular la comision. Todo en pesos enteros.
  4. Configurar Jest y crear los tests.

  Criterios de aceptacion (tests):
  - El ejemplo de la seccion 5: 8.5 km, 22 min, sin propina, economy y xl, debe dar exactamente los valores de la tabla.
  - Un viaje corto donde aplique la tarifa minima.
  - Un viaje con propina: la propina va completa al conductor.
  - Una categoria invalida debe lanzar un error.

  Primero muestrame el plan: archivos, dependencias que necesitas instalar y por que. No escribas codigo hasta que lo apruebe.
  ```
- Resumen de la respuesta: El agente leyo la seccion 5 del PDF y presento un plan (archivos, dependencias jest y jest-expo y el motivo de cada una). Como la parte de "Formulas" del PDF es una imagen y no se pudo leer, pregunto donde se aplica la tarifa minima; se decidio aplicarla despues del multiplicador de categoria. Tras la aprobacion creo pricing.js, calculateFare.js (funcion pura con validacion de entradas y de categoria, minima, redondeo a 100 COP antes de la comision y propina completa al conductor) y 6 tests.
- Que se uso / modifico / descarto: Se uso el plan propuesto. Se aprobo usar #2 como numero de entrada. Se modifico la instalacion: en PowerShell el `--` de `npx expo install jest-expo jest -- --dev` no llego a npm y las librerias quedaron en `dependencies`; se movieron a `devDependencies` y se sincronizo `package-lock.json`. Se uso `"test": "jest"` en lugar de `jest --watchAll` para que los tests corran una vez. Se descarto agregar ESLint en esta tarea, y tambien `@types/jest` y Testing Library porque no hacen falta por ahora.
- Archivos y commit: src/config/pricing.js, src/utils/calculateFare.js, src/utils/__tests__/calculateFare.test.js, package.json, package-lock.json — ed1058a
- Verificacion: npm test, 6 tests pasando, incluido el ejemplo de 8,5 km y 22 min de la seccion 5.
- Aprendizaje: aprendi a revisar un plan y comprendi mejor el manejo y funcionamiento de las ramas y los Pull Request

---

### Entrada #3
- Fecha: 2026-11-09
- Integrante: Andrés Salazar Castrillón
- Herramienta: Claude Code
- Objetivo: Conectar la app con Firebase (Auth, Firestore y Cloud Messaging), comprobar la conexion con una escritura de prueba en Firestore y lograr que compilara el development build en Android
- Prompt 1 (conectar Firebase):
  ```
  [PENDIENTE: pegar prompt literal de Firebase]
  ```
- Prompt 2 (error de compilacion):
  ```
  [PENDIENTE: pegar prompt literal del error de Kotlin]
  ```
- Resumen de la respuesta: El agente propuso usar React Native Firebase en lugar del SDK web y creo `src/services/firebase.js` como punto de acceso unico (instancias de auth, db y messaging, y re-exporta las funciones de Firestore que se necesitan). Configuro `app.json` con el paquete Android `com.andressc.bolitax`, la ruta a `google-services.json` y los config plugins de Firebase; agrego `google-services.json` al `.gitignore` y quito del `.env.example` las variables `EXPO_PUBLIC_FIREBASE_*` del SDK web, que ya no se usan. Agrego una escritura de prueba TEMPORAL (`src/services/firestoreTestWrite.js` y un `useEffect` en `App.js`) para comprobar la conexion. Ante el error de compilacion de Kotlin, subio la version de Kotlin con `expo-build-properties`. Confirmada la conexion, se borro la escritura de prueba.
- Que se uso / modifico / descarto:
  - Se eligio `@react-native-firebase` (app, auth, firestore, messaging) en lugar del SDK web de Firebase, porque Cloud Messaging (obligatorio segun el documento) necesita modulos nativos en Android; por eso la app usa development build con `expo-dev-client`.
  - Se subio Kotlin a 2.3.21 con el plugin `expo-build-properties` en `app.json`, porque la version que trae el proyecto por defecto no era compatible con firebase-auth 25 y la compilacion fallaba.
  - Se movio el proyecto a `C:\dev\bolitax` por el limite de longitud de rutas de Windows: ninja/CMake fallaba al crear carpetas con rutas muy largas.
  - Se revirtio una instalacion no aprobada de ESLint: `npx expo lint` instalo `eslint` y `eslint-config-expo`, creo `eslint.config.js` y agrego un script `lint` sin preguntar. Se desinstalo todo y se agrego a CLAUDE.md la regla de no ejecutar `npx expo lint`.
  - Se descarto la escritura de prueba una vez verificada la conexion.
- Archivos y commit: src/services/firebase.js, App.js, app.json, package.json, package-lock.json, .env.example, .gitignore, AGENTS.md, CLAUDE.md
- Verificacion: compilo con `npx expo run:android` en el emulador Pixel_7a y se crearon 2 documentos en la coleccion `test` de Firestore. Para que compilara hubo que mover el proyecto a `C:\dev\bolitax` por el limite de longitud de rutas de Windows (error de ninja/CMake al crear carpetas).

