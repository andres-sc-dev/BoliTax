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
 - Prompt 1 (conectar Firebase):
  ```
  ## Objetivo
  Conectar la app a Firebase usando Authentication, Firestore y Cloud Messaging.
  Esta tarea es solo de configuración: no crees pantallas ni componentes de interfaz.

  ## Referencia
  Sección 7 del PDF de especificaciones, que exige usar `@react-native-firebase/messaging`
  para las notificaciones. Léela antes de proponer nada y respeta esa exigencia.

  ## Requisitos

  1. Decisión de librería: antes de instalar nada, compara usar `@react-native-firebase`
     contra el SDK web de Firebase (`firebase`) en este proyecto con Expo. Cubre como mínimo
     soporte de Authentication, Firestore y Cloud Messaging en cada opción, compatibilidad con
     Expo (Expo Go vs. development build) y esfuerzo de configuración. Recomiéndame una opción
     y justifica tu recomendación con razones concretas. Si tu recomendación contradice la
     sección 7 del PDF, dímelo explícitamente y explica por qué.

  2. Paquete Android: el identificador es `com.andressc.bolitax` y debe quedar
     configurado en `app.json` (`android.package`), junto con cualquier plugin que
     la opción elegida necesite.

  3. Archivo `google-services.json`: ya está en la raíz del proyecto. Referéncialo
     únicamente por su ruta (`./google-services.json`) en la configuración.
     NO lo abras, NO lo leas y NO copies su contenido en ningún archivo ni en tu respuesta.

  4. Punto de acceso único: crea un archivo en `src/services/` (por ejemplo
     `src/services/firebase.js`) desde el cual el resto de la app importe Firebase.
     Ningún otro archivo debe inicializar ni importar Firebase directamente.

  5. Pasos manuales: en la consola de Firebase YA hice esto: habilité Authentication con
     correo/contraseña, creé Firestore (modo prueba, ubicación nam5) y registré la app
     Android con el paquete com.andressc.bolitax. Lista aparte SOLO lo que falte y me toque
     hacer a mí.

  6. Entorno: antes del plan, verifica si mi equipo tiene lo necesario para compilar
     localmente (JDK, Android SDK, variable ANDROID_HOME, emulador) y dime si falta algo.

  7. El código generado lleva el comentario `// AI-assisted: see docs/AI_LOG.md #3`.

  ## Criterios de aceptación
  - `npx expo run:android` compila sin errores.
  - La app abre en el emulador sin cerrarse.
  - Una escritura de prueba en Firestore (un documento simple, por ejemplo en una colección
    `test`) se ejecuta al arrancar o mediante una función de prueba, y puedo ver ese
    documento en la consola de Firebase.
  - La escritura de prueba está claramente marcada como temporal para poder
    quitarla después.

  ## Cierre
  No escribas código todavía. Primero muéstrame:
  1. El resultado de la verificación de mi entorno (punto 6).
  2. Tu comparación y recomendación (punto 1).
  3. El plan paso a paso.
  4. La lista de dependencias que instalarías, con su propósito.
  5. Los pasos manuales que aún me tocan en la consola de Firebase.

  Espera mi aprobación antes de instalar o modificar cualquier archivo.
  ```
  ```
- Prompt 2 (error de compilacion):
  ```
  - Prompt 2 (error de compilacion):
  ```
  La compilacion con `npx expo run:android` fallo. Este es el error real (el resto son advertencias):

  Execution failed for task ':react-native-firebase_auth:compileDebugKotlin'.
  e: firebase-auth-25.0.0-api.jar ... Module was compiled with an incompatible version of Kotlin. The binary version of its metadata is 2.4.0, expected version is 2.2.0.

  Contexto del build: Gradle 9.4.1, Kotlin 2.2.10, KSP 2.2.10-2.0.2, firebase.bom 35.0.2 (valor por defecto de RNFirebase 27.1), compileSdk 37, JDK 17.

  Diagnostica la causa y proponme la solucion mas estable. Considera al menos:
  1. Subir la version de Kotlin con expo-build-properties (revisa si KSP y Expo SDK 58 lo soportan).
  2. Fijar un firebase BoM anterior compatible con Kotlin 2.2.
  Consulta la documentacion de Expo y de React Native Firebase antes de decidir.

  Restricciones: la carpeta android/ se genera sola (CNG), asi que la solucion debe ir en app.json, plugins o archivos de configuracion, nunca editando android/ a mano.

  Muestrame la causa, la opcion que recomiendas y por que. No apliques nada hasta que apruebe.
  ```
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

---

### Entrada #4
- Fecha: 2026-11-09
- Integrante: Andrés Salazar Castrillón
- Herramienta: Claude Code
- Objetivo: Fase A del registro y la sesion: navegacion base (Stack de autenticacion, Drawer y Stack de Inicio), sesion del conductor con useContext, login con correo y contraseña, y cierre de sesion (secciones 2 y 3 del documento)
- Prompt:
  ```
  ## Objetivo
  Implementar la navegacion base, la sesion del conductor, el login y el registro completo en 3 pestañas. Referencia: secciones 2 y 3 de docs/requisitos-bolitax.pdf (registro, navegacion combinada y hooks obligatorios).

  ## Trabajo por fases
  Trabaja en 3 fases. Al terminar CADA fase: detente, dime como verificarla en el emulador, sugiere un mensaje de commit en español con prefijo en ingles (feat:, fix:, etc.), agrega la entrada a docs/AI_LOG.md y espera a que yo escriba "continua". No avances de fase sin mi confirmacion.

  ### Fase A: navegacion y sesion
  - Estructura con React Navigation:
    - Si no hay sesion: Stack de autenticacion con Login y Registro.
    - Si hay sesion: Drawer con Inicio, Historial, Ganancias y Perfil/Configuracion. Inicio es un Stack que despues tendra el flujo del viaje.
    - Las pantallas que aun no existen quedan como placeholders simples con su titulo.
  - AuthContext con useContext: usuario de Firebase Auth + documento del conductor en Firestore (`drivers/{uid}`), escuchado con onSnapshot y con limpieza en useEffect.
  - Pantalla de Login con correo y contraseña. Errores debajo de cada campo, no en Alert. Mensajes de error de Firebase traducidos al español.
  - Cerrar sesion desde el Drawer.
  - AsyncStorage solo para preferencias (idioma). Nada sensible.

  ### Fase B: formulario de registro (sin envio)
  - Registro con navegacion Tab: Datos personales, Vehiculo, Documentos y pagos, con TODOS los campos y validaciones de la seccion 2 del PDF.
  - Agregar en Datos personales: contraseña y confirmar contraseña (minimo 6 caracteres), necesarias para Firebase Auth.
  - Agregar en Documentos: tarjeta amarilla (foto obligatoria, simulada). Todas las fotos de documentos son simuladas: se acepta cualquier imagen, pero las validaciones de formulario (fechas de vencimiento posteriores a hoy, formatos, obligatorios) SI se implementan.
  - Revision tecnico-mecanica: obligatoria solo si el vehiculo tiene 2 años o mas (taxi, servicio publico en Colombia); si no aplica, ocultar los campos.
  - El checkbox de terminos muestra el porcentaje de comision leido de src/config/pricing.js.
  - El estado del formulario se comparte entre las 3 pestañas (context del registro) para no perder datos al cambiar de pestaña.
  - Errores debajo de cada campo, no en Alert. El boton "Enviar registro" solo se habilita cuando las 3 pestañas son validas, y cada pestaña muestra un indicador si tiene errores.
  - Las validaciones van como funciones puras en src/utils/validators.js con tests en Jest (placa ABC123 con mayusculas, documento 6-10 digitos, celular 10 digitos, mayor de 18, año <= actual, XL capacidad minima 6, correo, fechas posteriores a hoy).
  - Fotos con camara o galeria. Por ahora solo se guarda la URI local.

  ### Fase C: envio del registro
  - Subida de fotos a Cloudinary con upload preset unsigned (sin API secret en la app). Variables EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME y EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET, agregalas a .env.example. Dime que debo crear yo en Cloudinary.
  - Al enviar: crear el usuario en Firebase Auth, subir las fotos y guardar `drivers/{uid}` con los datos (campos en ingles), las URLs de las fotos y `status: "pending"`.
  - Mostrar estado de carga mientras envia y manejar errores.
  - Despues del registro, el conductor entra al Drawer y ve en Inicio un aviso "Cuenta pendiente de aprobacion".

  ## Reglas
  - Todo Firebase se importa solo desde src/services/firebase.js.
  - Dependencias nuevas solo con `npx expo install`, explicando para que sirve cada una.
  - Estilos simples y funcionales; el diseño se hace despues.
  - Comentario `// AI-assisted: see docs/AI_LOG.md #N` usando el numero de la entrada de cada fase (#4, #5, #6).

  ## Cierre
  Muestrame primero el plan de las 3 fases, las dependencias y los pasos manuales que me tocan. Espera mi aprobacion.
  ```
- Resumen de la respuesta: El agente leyo las secciones 2 y 3 del PDF, pregunto tres decisiones (idioma, selectores, regla de la tecnico-mecanica) y presento el plan de las 3 fases. En la Fase A creo AuthContext (onAuthStateChanged + onSnapshot de `drivers/{uid}`, ambos con limpieza en useEffect), RootNavigator que elige entre el Stack de autenticacion y el Drawer, el Drawer con boton "Cerrar sesion", el Stack de Inicio, la pantalla de Login con errores debajo de cada campo y traduccion de errores de Firebase, el servicio de preferencias de idioma en AsyncStorage y placeholders para las demas pantallas.
- Que se uso / modifico / descarto:
  - Decisiones tomadas antes del plan: el idioma solo se guarda y la interfaz sigue en español (la traduccion queda para otra tarea); los selectores y el checkbox seran componentes propios, sin librerias; la tecnico-mecanica se exige si año actual - año del vehiculo >= 2.
  - Ajustes al aprobar el plan: se instalaron TODAS las dependencias nativas en esta fase (incluidas `@react-native-community/datetimepicker` y `expo-image-picker` con su plugin y textos de permisos en `app.json`) para recompilar una sola vez; el proveedor Correo/Contraseña ya estaba activo en Firebase; las reglas de Firestore se dejan para el modulo final.
  - Dependencias instaladas con `npx expo install`: `@react-navigation/native`, `native-stack`, `drawer`, `bottom-tabs`, `react-native-screens`, `react-native-safe-area-context`, `react-native-gesture-handler`, `react-native-reanimated`, `react-native-worklets`, `@react-native-async-storage/async-storage`, `@react-native-community/datetimepicker` y `expo-image-picker`. Reanimated no necesita configurar Babel: `babel-preset-expo` lo hace solo en SDK 58.
  - `validateEmail` y `validateRequired` se crearon en esta fase porque el Login los necesita; el resto de validadores llegan en la Fase B.
  - `src/services/preferences.js` queda listo pero todavia no se usa: se conecta en la Fase B con el campo Idioma del registro.
- Archivos y commit: App.js, app.json, package.json, package-lock.json, src/services/firebase.js, src/services/preferences.js, src/context/AuthContext.js, src/navigation/(RootNavigator, AuthStack, AppDrawer, HomeStack).js, src/screens/auth/(LoginScreen, RegisterScreen).js, src/screens/(Home, History, Earnings, Profile)Screen.js, src/components/(FormField, PlaceholderScreen).js, src/utils/(authErrors, validators).js y sus tests — 48c2d4e
- Verificacion: `npm test` con 15 tests pasando (3 suites), `npx expo-doctor` sin problemas (20/20) y `npx expo export --platform android` genera el bundle sin errores. 
- Aprendizaje: Aprendí que la app decide qué mostrar según si hay alguien con sesión iniciada: si no hay, muestra el login, y si hay, muestra el menú lateral. Mientras Firebase revisa si ya había una sesión guardada, sale una pantallita de carga para que no se vea el login un segundo y luego cambie. También entendí que cuando uno "escucha" cambios de Firebase hay que apagar esa escucha cuando ya no se necesita, porque si no se quedan corriendo por detrás. Lo que más me costó fue que la app no compilaba porque Windows no acepta rutas de archivos muy largas; tocó activar una opción de Windows y actualizar una herramienta del SDK de Android para que funcionara. Y me di cuenta de que si le pido al agente que instale todo lo que necesita de una sola vez, me ahorro tener que compilar varias veces.

---

### Entrada #5
- Fecha: 2026-11-09
- Integrante: Andrés Salazar Castrillón
- Herramienta: Claude Code
- Objetivo: Fase B del registro: formulario completo en 3 pestañas (Datos personales, Vehiculo, Documentos y pagos) con todas las validaciones de la seccion 2 del documento, sin envio
- Prompt: "continua" (el detalle de la Fase B esta en el prompt de la Entrada #4)
- Resumen de la respuesta: El agente creo los validadores puros de la seccion 2 en `src/utils/validators.js` con sus tests, un RegisterContext que comparte el estado del formulario entre las 3 pestañas y calcula los errores con useMemo, la navegacion Tab del registro con un indicador rojo en las pestañas con errores, componentes propios (SelectField, Checkbox, DateField, PhotoField) y las 3 pantallas del formulario. El boton "Enviar registro" solo se habilita cuando las 3 pestañas son validas.
- Que se uso / modifico / descarto:
  - Los errores solo se muestran en campos que el usuario ya toco (al salir de un campo de texto, o al elegir una opcion, fecha o foto). Al salir de una pestaña se marcan todos sus campos como tocados, para que se vean sus errores y el indicador.
  - Los validadores que dependen de la fecha reciben `today` como parametro, para que los tests no cambien segun el dia.
  - La placa se convierte a mayusculas mientras se escribe y otra vez antes de validar; el formato de moto (ABC12D) se rechaza porque el documento pide formato de carro.
  - La tecnico-mecanica se exige si año actual - año del vehiculo >= 2. Si no aplica, sus campos se ocultan y no generan errores.
  - El campo Idioma toma su valor inicial de AsyncStorage y guarda alli el cambio (solo preferencia; la interfaz sigue en español).
  - El texto de terminos calcula el porcentaje desde `PRICING.commissionRate` ("20 %").
  - Decision del agente pendiente de confirmar: el numero de licencia se valida como obligatorio y solo numeros (en Colombia coincide con la cedula), porque el documento no da un formato.
  - Las fechas de vencimiento no tienen fecha minima en el selector, para que la validacion "posterior a hoy" sea visible al probar.
  - En esta fase el boton "Enviar registro" solo muestra un mensaje; el envio real es la Fase C.
- Archivos y commit: src/utils/validators.js, src/utils/__tests__/validators.test.js, src/config/registerOptions.js, src/context/RegisterContext.js, src/navigation/RegisterTabs.js, src/screens/auth/RegisterScreen.js, src/screens/register/(PersonalDataTab, VehicleTab, DocumentsTab).js, src/components/(SelectField, Checkbox, DateField, PhotoField).js — 68f407a
- Verificacion: `npm test` con 48 tests pasando (3 suites) y `npx expo export --platform android` sin errores. 
- Aprendizaje: Aprendí que es mejor tener las validaciones como funciones aparte del formulario, porque así se pueden probar con tests sin abrir la app, y que las que dependen de la fecha reciben "hoy" como parámetro para que los tests no fallen según el día en que se corran. También entendí que si el formulario está dividido en pestañas, los datos tienen que vivir en un contexto compartido; si no, se pierden al cambiar de pestaña. Me gustó que el botón de enviar solo se active cuando las 3 pestañas están bien y que cada pestaña muestre un punto si tiene errores, porque así el usuario sabe dónde está el problema sin que le salten alertas. Y aprendí que hacer componentes propios (listas, checkbox) en vez de instalar librerías evita tener que recompilar la app y después es más fácil darles el diseño que yo quiera.

---

### Entrada #6
- Fecha: 2026-11-09
- Integrante: Andrés Salazar Castrillón
- Herramienta: Claude Code
- Objetivo: Fase C del registro: enviar el formulario (fotos a Cloudinary, cuenta en Firebase Auth y documento `drivers/{uid}` con `status: "pending"`) y mostrar en Inicio el aviso de cuenta pendiente
- Prompt: "Fase B probada y con commit (68f407a). Confirmo tus 3 decisiones (licencia numerica, opciones de listas y fechas sin bloqueo). Ya cree el .env con EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME y EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET (preset unsigned). Continua con la Fase C." (el detalle de la Fase C esta en el prompt de la Entrada #4)
- Resumen de la respuesta: El agente presento un plan de la Fase C y, tras la aprobacion, creo el servicio de subida a Cloudinary (preset unsigned, sin API secret), el servicio `registerDriver`, la funcion pura `buildDriverDocument` con sus tests, un flag `registering` en AuthContext para que la app no salte al Drawer a mitad del envio, el manejo de errores del envio debajo de cada campo o como mensaje general, y el aviso "Cuenta pendiente de aprobacion" en Inicio.
- Que se uso / modifico / descarto:
  - Orden del envio distinto al del prompt: primero se suben las fotos, luego se crea la cuenta y al final se guarda el documento. Asi, si fallan las fotos no queda una cuenta de Auth sin datos. Si falla el guardado del documento, se borra la cuenta recien creada (`deleteUser`) para poder reintentar con el mismo correo.
  - Al crear la cuenta, Firebase inicia sesion de inmediato; el flag `registering` mantiene el formulario en pantalla hasta terminar.
  - Un correo ya registrado se muestra en el campo correo y la app navega a la pestaña Datos personales; los errores de red o de Cloudinary se muestran como mensaje general encima del boton (nunca en Alert).
  - Las fotos se guardan en la carpeta `bolitax/drivers/<documento>` de Cloudinary.
  - El documento guarda `commissionRateAccepted` con la comision aceptada al registrarse; la contraseña nunca se guarda (hay un test que lo comprueba).
  - No se cambiaron las reglas de Firestore (se dejan para el modulo final) ni se agregaron dependencias. `.env.example` ya tenia las variables de Cloudinary.
- Archivos y commit: src/services/cloudinary.js, src/services/driverRegistration.js, src/services/firebase.js, src/utils/buildDriverDocument.js, src/utils/__tests__/buildDriverDocument.test.js, src/context/AuthContext.js, src/context/RegisterContext.js, src/navigation/RootNavigator.js, src/screens/register/DocumentsTab.js, src/screens/HomeScreen.js — 8c9e073
- Verificacion: `npm test` con 53 tests pasando (4 suites) y `npx expo export --platform android` sin errores. Probado en el emulador: registro completo, fotos en Cloudinary y documento en Firestore con status pending.
- Aprendizaje: Aprendí que el orden en que se hacen las cosas importa mucho. Primero se suben las fotos, después se crea la cuenta y al final se guardan los datos, y si algo falla a la mitad se borra la cuenta para que no quede un conductor a medias y se pueda volver a intentar con el mismo correo. También entendí que cuando se crea la cuenta, Firebase inicia sesión de una, y sin un control la app se saltaba al menú antes de guardar los datos; por eso se usa una bandera que la deja quieta hasta que termine. Con Cloudinary aprendí que se puede subir fotos desde la app sin poner ninguna clave secreta, usando un "upload preset" sin firma. Y algo práctico: cuando uno crea o cambia el archivo .env, hay que reiniciar Metro con -c para que la app lea las variables nuevas.
- Correccion posterior:
  - Sintoma: al tocar "Enviar registro" aparecia "No hay conexion a internet", aunque el emulador si tenia internet.
  - Prompts: (1) pedir un diagnostico con logs temporales `[DIAG]` (paso que fallaba, si las variables de Cloudinary estaban definidas, respuesta del servidor) y revisar el FormData y la traduccion de errores; (2) "Encontramos la causa: el fetch de Expo (expo/build/winter/fetch) lanza "Unsupported FormDataPart implementation" en convertFormData.js porque no acepta el objeto de React Native { uri, type, name } dentro de FormData. No es un problema de red." y pedir corregir `uploadImage`, corregir el catch y quitar los logs.
  - Causa real: en Expo SDK 58 el `fetch` global es el de Expo, y su `convertFormData` solo acepta strings, Blob u objetos con `bytes()`; el objeto `{ uri, type, name }` de React Native no es compatible. Ademas, el `catch` de `cloudinary.js` convertia cualquier excepcion de `fetch` en `auth/network-request-failed`, y por eso el error real quedaba oculto detras de "sin conexion".
  - Arreglo: la foto se envia como `new File(uri)` de `expo-file-system` dentro del FormData (el `fetch` de Expo lee sus bytes con `file.bytes()`). Se descarto enviar la imagen en base64 (data URI) porque guarda todas las fotos como texto en el estado del formulario y usa mas memoria.
  - Dependencia: `expo-file-system` solo existia dentro de `node_modules/expo/node_modules` y no se podia importar desde `src/`. Con aprobacion se declaro con `npx expo install expo-file-system` (~58.0.13, la misma version que ya trae expo; sin codigo nativo nuevo ni recompilar).
  - Manejo de errores: solo los errores reales de red (el `FetchError` del fetch de Expo, cuyo mensaje empieza por "fetch failed:") muestran "sin conexion". Cualquier otro fallo de la subida muestra "No se pudo subir una de las fotos. Intentalo de nuevo." y el detalle tecnico queda en `error.cause` y en la consola. Tambien se valida que el archivo de la foto exista antes de subirlo.
  - Se quitaron todos los logs temporales `[DIAG]`.
  - Archivos y commit: src/services/cloudinary.js, src/services/driverRegistration.js, src/screens/register/DocumentsTab.js, package.json, package-lock.json — 3a85997
  - Verificacion: `npm test` (53 tests), `npx expo export --platform android` y `npx expo-doctor` (20/20) sin errores. Probado en el emulador: registro completo, fotos en Cloudinary y documento en Firestore con status pending.
---

### Entrada #7
- Fecha: 2026-11-09
- Integrante: Andrés Salazar Castrillón
- Herramienta: Claude Code
- Objetivo: Modulo 3, Fase A: mapa en la pantalla de Inicio con la ubicacion actual del conductor, sin Google Maps (servicios gratuitos de OpenStreetMap, seccion 7 del documento), y componente de mapa reutilizable
- Prompt:
  ```
  ## Objetivo
  Implementar la pantalla de Inicio del conductor: mapa con su ubicacion actual, interruptor Disponible / No disponible y envio de la ubicacion en tiempo real a Firestore. Ademas, dejar listo el servicio de rutas que usaran los modulos siguientes. Referencia: seccion 3 (pantalla Inicio, hooks obligatorios) y seccion 7 (APIs) de docs/requisitos-bolitax.pdf.

  ## Decision tomada: sin Google Maps
  No vamos a usar Google Cloud (no hay API key ni facturacion). Usaremos servicios gratuitos de OpenStreetMap, que el PDF permite en la seccion 7:
  - Mapa: tiles de OpenStreetMap. Como react-native-maps en Android depende de Google Maps, compara brevemente MapLibre (@maplibre/maplibre-react-native) contra Leaflet dentro de react-native-webview y recomienda una. Criterios: compatibilidad con Expo SDK 58 y nuestro build (Kotlin 2.3.21), riesgo de errores de compilacion nativa, soporte para marcadores y polilineas, y facilidad de explicarlo. Ten en cuenta que react-native-webview tambien lo necesitaremos para Mercado Pago.
  - Rutas, distancia y duracion: OSRM (servidor publico router.project-osrm.org), en lugar de Directions / Distance Matrix.
  - Coordenadas a direccion: Nominatim, respetando su limite de 1 peticion por segundo y enviando un User-Agent "BoliTax-app-universitaria".
  - Actualiza la seccion Stack de CLAUDE.md con esta decision.

  ## Trabajo por fases
  Al terminar CADA fase: detente, dime como verificarla en el emulador, sugiere el commit (español con prefijo en ingles), agrega la entrada a docs/AI_LOG.md y espera "continua".

  ### Fase A: mapa y ubicacion actual (entrada #7)
  - Instala TODAS las dependencias nativas del modulo en esta fase (libreria de mapa elegida, expo-location si falta), para recompilar una sola vez.
  - Permiso de ubicacion en primer plano con textos en español. Si el usuario lo niega, mostrar un mensaje claro con boton para reintentar, no un Alert.
  - HomeScreen muestra el mapa centrado en la ubicacion actual con un marcador del conductor.
  - Componente de mapa reutilizable en src/components/ (lo usaran viaje en curso e historial), que acepte marcadores y una polilinea.

  ### Fase B: disponibilidad y ubicacion en tiempo real (entrada #8)
  - Interruptor Disponible / No disponible en Inicio, con useState.
  - Solo se puede poner Disponible si driver.status === "approved". Si esta "pending", el interruptor se ve deshabilitado con el aviso "Cuenta pendiente de aprobacion".
  - Hook personalizado useDriverLocation: mientras esta Disponible usa watchPositionAsync y actualiza `drivers/{uid}` con `location: { lat, lng }`, `isAvailable: true` y `locationUpdatedAt` cada pocos segundos (no en cada movimiento minimo; usa distanceInterval/timeInterval razonables). Al pasar a No disponible o salir de la pantalla, detiene el seguimiento en la limpieza del useEffect y guarda `isAvailable: false`.
  - Guardar el ultimo estado de disponibilidad en AsyncStorage (permitido por el PDF) y restaurarlo al abrir.
  - Al cerrar sesion, poner isAvailable en false.

  ### Fase C: servicio de rutas (entrada #9)
  - src/services/routing.js:
    - getRoute(origin, destination) con OSRM: devuelve { distanceKm, durationMin, coordinates } (coordinates listo para dibujar la polilinea). Redondear distanceKm a 1 decimal y durationMin a entero.
    - reverseGeocode({ lat, lng }) con Nominatim: devuelve una direccion corta legible.
    - Manejo de errores y timeout.
  - Funciones puras de transformacion de la respuesta con tests en Jest (sin llamar a la red en los tests).
  - Pantalla temporal o boton de prueba en Inicio (marcado TEMPORAL) que dibuje una ruta entre dos puntos de Medellin para verificar visualmente.

  ## Reglas
  - Todo Firebase solo desde src/services/firebase.js.
  - Dependencias con `npx expo install`, explicando cada una.
  - Estilos simples; el diseño va despues.
  - Comentario `// AI-assisted: see docs/AI_LOG.md #N` segun la fase.

  ## Cierre
  Muestrame primero: tu comparacion y recomendacion de libreria de mapa, el plan de las 3 fases, las dependencias y lo que me toca hacer manualmente. Espera mi aprobacion.
  ```
- Resumen de la respuesta: El agente comparo MapLibre contra Leaflet en react-native-webview y recomendo Leaflet: `react-native-webview` esta versionado por Expo para el SDK 58, no agrega un SDK nativo grande que compilar (riesgo bajo con Kotlin 2.3.21 y CMake) y se reutiliza para Mercado Pago. Presento el plan de las 3 fases. En la Fase A instalo `expo-location` y `react-native-webview`, creo el componente `LeafletMap`, el hook `useDriverLocation` (permiso y posicion actual) y la nueva pantalla de Inicio con el mapa, el marcador del conductor, el manejo del permiso negado y el aviso de cuenta pendiente como franja encima del mapa.
- Que se uso / modifico / descarto:
  - Se descarto MapLibre: no esta en el SDK de Expo, su documentacion de Expo no indica compatibilidad con SDK 58 ni con la nueva arquitectura, y compila un SDK nativo grande en C++ (ya hubo problemas de Kotlin y de CMake en este proyecto).
  - Leaflet 1.9.4 se carga desde unpkg con version fija y hash de integridad (SRI); se verificaron los hashes descargando los archivos. Se usan `circleMarker` para no depender de imagenes de iconos.
  - El WebView envia el User-Agent `BoliTax-app-universitaria`, como pide la politica de tiles de OpenStreetMap, y el mapa muestra la atribucion "© OpenStreetMap contributors".
  - La app no dibuja el mapa: le envia los datos con `injectJavaScript` cuando la pagina avisa con `postMessage` que esta lista. El efecto solo se repite cuando cambian los datos serializados.
  - Si se niega el permiso, la pantalla muestra un mensaje con "Reintentar" y "Abrir ajustes" (cuando Android ya no deja volver a preguntar, solo se puede desde ajustes). En Android el texto del dialogo de permiso lo pone el sistema; `locationWhenInUsePermission` en `app.json` aplica en iOS.
  - Se quito `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` de `.env.example` y se actualizo la seccion Stack de CLAUDE.md.
  - Ajuste al aprobar el plan: en la Fase B el seguimiento no debe detenerse al navegar dentro del Stack de Inicio (ahi iran la solicitud entrante y el viaje en curso); se movera al nivel de `HomeStack` con un contexto de disponibilidad.
  - Ajuste tras probar en el emulador (prompt: "En el emulador a veces sale "Current location is unavailable" porque aun no hay una posicion lista. Haz useDriverLocation mas robusto: si getCurrentPositionAsync falla, intenta getLastKnownPositionAsync como respaldo, y reintenta automaticamente un par de veces con una espera corta antes de mostrar el error. El mensaje de error y el boton Reintentar se mantienen como ultimo recurso."): cada intento pide la posicion actual y, si falla, usa la ultima conocida; se hacen hasta 3 intentos con 2 s de espera entre ellos y solo despues se muestra el error con "Reintentar". Los reintentos se cortan si la pantalla se desmonta. La logica de reintento quedo en la funcion `retryAsync` (src/utils/retryAsync.js), con 4 tests en Jest que usan una espera falsa.
- Archivos y commit: app.json, package.json, package-lock.json, CLAUDE.md, .env.example, src/components/LeafletMap.js, src/hooks/useDriverLocation.js, src/screens/HomeScreen.js, src/utils/retryAsync.js, src/utils/__tests__/retryAsync.test.js — 1fde8d0
- Verificacion: `npm test` (57 tests), `npx expo export --platform android` y `npx expo-doctor` (20/20) sin errores. Probado en el emulador Pixel_7a: tras activar la ubicacion del emulador y enviar un punto de Medellin desde Extended controls, el mapa de OpenStreetMap aparece centrado en el conductor con su marcador. Al principio salia "Current location is unavailable" porque el emulador no tenia ubicacion enviada; se agrego reintento automatico con respaldo en la ultima ubicacion conocida (retryAsync).
- Archivos y commit: app.json, package.json, package-lock.json, CLAUDE.md, .env.example, src/components/LeafletMap.js, src/hooks/useDriverLocation.js, src/screens/HomeScreen.js, src/utils/retryAsync.js, src/utils/__tests__/retryAsync.test.js — 1fde8d0
- Verificacion: `npm test` (57 tests), `npx expo export --platform android` y `npx expo-doctor` (20/20) sin errores. Probado en el emulador Pixel_7a: tras activar la ubicacion del emulador y enviar un punto de Medellin desde Extended controls, el mapa de OpenStreetMap aparece centrado en el conductor con su marcador. Al principio salia "Current location is unavailable" porque el emulador no tenia ubicacion enviada; se agrego reintento automatico con respaldo en la ultima ubicacion conocida (retryAsync).
- Archivos y commit: app.json, package.json, package-lock.json, CLAUDE.md, .env.example, src/components/LeafletMap.js, src/hooks/useDriverLocation.js, src/screens/HomeScreen.js, src/utils/retryAsync.js, src/utils/__tests__/retryAsync.test.js — 1fde8d0
- Verificacion: `npm test` (57 tests), `npx expo export --platform android` y `npx expo-doctor` (20/20) sin errores. Probado en el emulador Pixel_7a: tras activar la ubicacion del emulador y enviar un punto de Medellin desde Extended controls, el mapa de OpenStreetMap aparece centrado en el conductor con su marcador. Al principio salia "Current location is unavailable" porque el emulador no tenia ubicacion enviada; se agrego reintento automatico con respaldo en la ultima ubicacion conocida (retryAsync).
- Archivos y commit: app.json, package.json, package-lock.json, CLAUDE.md, .env.example, src/components/LeafletMap.js, src/hooks/useDriverLocation.js, src/screens/HomeScreen.js, src/utils/retryAsync.js, src/utils/__tests__/retryAsync.test.js — 1fde8d0
- Verificacion: `npm test` (57 tests), `npx expo export --platform android` y `npx expo-doctor` (20/20) sin errores. Probado en el emulador Pixel_7a: tras activar la ubicacion del emulador y enviar un punto de Medellin desde Extended controls, el mapa de OpenStreetMap aparece centrado en el conductor con su marcador. Al principio salia "Current location is unavailable" porque el emulador no tenia ubicacion enviada; se agrego reintento automatico con respaldo en la ultima ubicacion conocida (retryAsync).
- Aprendizaje: Aprendí que no siempre la librería más "pro" es la mejor opción: MapLibre es nativa y más fluida, pero nos podía dar los mismos problemas de compilación que ya habíamos tenido, así que con Leaflet dentro de un WebView el mapa funciona sin pelear con Gradle y además ese mismo WebView me sirve después para Mercado Pago. También entendí que no necesito Google Maps ni dar una tarjeta para tener mapas, porque OpenStreetMap es gratis. Con el emulador aprendí que hay que encenderle la ubicación y enviarle un punto a mano, y que la app tiene que aguantar cuando la ubicación no está lista, por eso se agregaron reintentos en vez de mostrar el error de una.
---

### Entrada #8
- Fecha: 2026-11-09
- Integrante: Andrés Salazar Castrillón
- Herramienta: Claude Code
- Objetivo: Modulo 3, Fase B: interruptor Disponible / No disponible en Inicio y envio de la ubicacion del conductor en tiempo real a Firestore mientras esta Disponible (seccion 3 del documento)
- Prompt: "continua" (el detalle de la Fase B esta en el prompt de la Entrada #7, con el ajuste dado al aprobar el plan: "El seguimiento NO debe detenerse al navegar dentro del Stack de Inicio, porque ahi iran las pantallas de solicitud entrante y viaje en curso (modulos 4 y 5), y el conductor debe seguir enviando su ubicacion durante el viaje. "Salir de la pantalla" significa salir de la seccion Inicio del Drawer (ir a Historial, Ganancias o Perfil). Usa el foco del HomeStack completo (por ejemplo, el estado de navegacion del Drawer) en lugar de useIsFocused de HomeScreen, o mueve el seguimiento a un nivel que cubra todo el Stack de Inicio. Explicame la opcion que elijas.")
- Resumen de la respuesta: El agente creo `AvailabilityContext` dentro de `HomeStack` (estado del interruptor con useState, restauracion desde AsyncStorage y regla de cuenta aprobada), extendio `useDriverLocation` con `watchPositionAsync` y escritura en `drivers/{uid}` (limpieza en useEffect que detiene el seguimiento y guarda `isAvailable: false`), agrego el servicio `driverStatus`, la funcion pura `shouldSendLocation` con tests, el interruptor en Inicio y la escritura de No disponible al cerrar sesion.
- Que se uso / modifico / descarto:
  - Opcion elegida para "salir de la pantalla": `useIsFocused()` llamado dentro de `HomeStack`. Como `HomeStack` es la pantalla "Inicio" del Drawer, es true mientras se vea cualquier pantalla del Stack de Inicio y false al ir a Historial, Ganancias o Perfil. Se descarto leer el estado de navegacion del Drawer porque obliga a comparar nombres de rutas a mano. El contexto permite que las pantallas del viaje (modulos 4 y 5) lean la disponibilidad y la ubicacion sin duplicar el seguimiento.
  - El seguimiento esta activo solo si: el conductor eligio Disponible, la cuenta esta `approved` y la seccion Inicio tiene el foco. Al volver a Inicio se reanuda solo, porque el interruptor conserva lo que eligio el conductor.
  - `watchPositionAsync` con `timeInterval: 5000` y `distanceInterval: 10`, mas un limite propio de una escritura cada 5 s (`shouldSendLocation`). Al activarse se envia de inmediato la ultima ubicacion conocida. Si el conductor esta quieto no se escribe de nuevo hasta que se mueva 10 m.
  - Al cerrar sesion se guarda `isAvailable: false` esperando maximo 3 s (sin conexion Firestore no resuelve la escritura hasta sincronizar) y se borra la disponibilidad guardada, para que el cierre de sesion nunca se quede colgado.
  - La disponibilidad se guarda en AsyncStorage con una clave por usuario (`preferences:lastAvailability:<uid>`), como permite el PDF.
  - El marcador del conductor se ve verde cuando esta Disponible.
  - Pendiente para modulos siguientes: `watchPositionAsync` solo funciona con la app en primer plano; si la app pasa a segundo plano, `isAvailable` sigue en true pero la ubicacion deja de actualizarse.
  - Ajuste tras probar en el emulador (prompt: "Al cambiar la ubicacion desde Extended controls del emulador, la app no recibe la nueva posicion: ni el marcador ni Firestore se actualizan. Cambia watchPositionAsync a Accuracy.High (el emulador simula la ubicacion por GPS) y verifica que el watcher realmente reciba las actualizaciones. Agrega un console.log temporal [DIAG location] cada vez que llegue una posicion nueva para comprobarlo."): el seguimiento paso de `Accuracy.Balanced` a `Accuracy.High`, que pide el proveedor GPS. Con logs temporales `[DIAG location]` se comprobo que el watcher recibe las posiciones nuevas y que Firestore se actualiza; despues se quitaron los logs. Se mantuvo `distanceInterval: 10` y se acepto la limitacion de segundo plano.
- Archivos y commit: src/context/AvailabilityContext.js, src/navigation/HomeStack.js, src/hooks/useDriverLocation.js, src/screens/HomeScreen.js, src/services/driverStatus.js, src/services/firebase.js, src/services/preferences.js, src/context/AuthContext.js, src/utils/locationThrottle.js, src/utils/__tests__/locationThrottle.test.js — b85ee49
- Verificacion: npm test (61 tests, 6 suites), npx expo export --platform android y npx expo-doctor (20/20) sin errores. Probado en el emulador Pixel_7a con la cuenta aprobada: al activar Disponible el marcador se pone verde y en Firestore aparecen isAvailable true, location y locationUpdatedAt. Al cambiar el punto desde Extended controls, location se actualiza en Firestore. Al pasar a No disponible queda isAvailable false.
- Aprendizaje: Aprendí que la ubicación en tiempo real no es mandar datos a cada rato, sino controlar cada cuánto se escribe en la base de datos para no gastar el cupo gratis de Firestore, por eso se limita a una escritura cada 5 segundos y solo si el conductor se movió. También entendí que el seguimiento tiene que apagarse solo cuando el conductor se pone No disponible, cierra sesión o sale de la sección de Inicio, y que si lo amarraba solo a la pantalla de Inicio se iba a apagar en pleno viaje. Y con el emulador aprendí que el botón Set Location es el que realmente manda la ubicación, y que a veces la consola de Firestore no se refresca sola.

---

### Entrada #9
- Fecha: 2026-11-09
- Integrante: Andrés Salazar Castrillón
- Herramienta: Claude Code
- Objetivo: Modulo 3, Fase C: servicio de rutas con OSRM (ruta, distancia y duracion) y Nominatim (coordenadas a direccion), con funciones puras probadas en Jest y un boton temporal para ver una ruta en el mapa
- Prompt: "Fase B probada y con commit (b85ee49): la ubicacion se actualiza en Firestore al cambiar el punto del emulador. Mantengo distanceInterval en 10 y acepto la limitacion de segundo plano. Si quedaron logs [DIAG location], quitalos. Continua con la Fase C." (el detalle de la Fase C esta en el prompt de la Entrada #7)
- Resumen de la respuesta: El agente quito los logs `[DIAG location]`, creo `src/utils/routeParsers.js` (parseOsrmRoute, formatShortAddress, getNominatimWait e isValidLatLng) con 14 tests sin red, el servicio `src/services/routing.js` (getRoute con OSRM y reverseGeocode con Nominatim, timeout de 10 s y errores con codigo) y un boton TEMPORAL en Inicio que dibuja la ruta del Parque Berrio al Parque Lleras con su distancia, duracion y direccion de origen.
- Que se uso / modifico / descarto:
  - Antes de conectar la pantalla, el agente consulto una vez OSRM y Nominatim con los puntos de prueba para confirmar la forma real de las respuestas. Nominatim devolvio la ciudad como "Perimetro Urbano Medellin"; el parser la limpia a "Medellin" y hay un test con esa respuesta real.
  - OSRM entrega la geometria GeoJSON como `[lng, lat]`; el parser la convierte a `{ lat, lng }` para la polilinea. Distancia en km con 1 decimal y duracion en minutos enteros.
  - Nominatim: una cola garantiza maximo 1 peticion por segundo (`getNominatimWait`), se envia el User-Agent `BoliTax-app-universitaria` y un cache en memoria (maximo 100 direcciones) evita repetir consultas del mismo punto.
  - Errores con codigo: `routing/timeout` (AbortController a los 10 s), `routing/network`, `routing/no-route`, `routing/no-address`, `routing/http-error`, `routing/invalid-input` y `routing/unknown`, todos con mensaje en español.
  - La deteccion de error de red ("fetch failed:") se copio de `cloudinary.js` en vez de moverla a un archivo compartido, para no modificar archivos fuera del plan.
  - En un test, un `try/catch` que habria pasado en silencio si no se lanzaba el error se cambio por una verificacion estricta.
  - La ruta real Berrio -> Lleras da 6,2 km y 10 min (no es el ejemplo de 8,5 km de la seccion 5).
- Archivos y commit: src/utils/routeParsers.js, src/utils/__tests__/routeParsers.test.js, src/services/routing.js, src/screens/HomeScreen.js, src/hooks/useDriverLocation.js (sin logs DIAG), docs/AI_LOG.md (ajuste de la Entrada #8) — 6d059ff
- Verificacion: npm test (75 tests, 7 suites), npx expo export --platform android y npx expo-doctor (20/20) sin errores. Probado en el emulador Pixel_7a: el boton TEMPORAL "Probar ruta" dibuja la linea entre el Parque Berrio y el Parque Lleras, ajusta el zoom para mostrar la ruta completa y muestra la distancia, la duracion y la direccion de origen. "Quitar ruta" borra la linea.
- Aprendizaje: Aprendí que para calcular rutas, distancias y tiempos no necesito pagar Google, porque OSRM y Nominatim hacen lo mismo gratis, pero hay que respetar sus reglas, como mandar máximo una petición por segundo a Nominatim e identificar la app. También entendí que las respuestas de una API casi nunca vienen como uno las necesita: OSRM manda las coordenadas al revés (primero longitud y luego latitud) y Nominatim devuelve la ciudad con un nombre largo, entonces es mejor tener funciones que limpien esos datos y probarlas con tests sin depender de internet. Y aprendí que toda llamada a internet necesita un tiempo límite y mensajes de error claros, para que la app no se quede colgada si algo falla.

---

### Entrada #10
- Fecha: 2026-11-09
- Integrante: Andrés Salazar Castrillón
- Herramienta: Claude Code
- Objetivo: Modulo 4, Fase A: backend (Node + Express + firebase-admin), simulador de pasajeros que crea viajes en `trips`, y recepcion de solicitudes en la app con temporizador de 15 s, aceptar y rechazar (secciones 3, 6 y 7 del documento)
- Prompt:
  ```
  ## Objetivo
  Crear el backend, un simulador de pasajeros y la recepcion de solicitudes de viaje en la app del conductor, con temporizador de 15 segundos, notificacion push y sonido. Referencia: seccion 3 (solicitud entrante, estados del viaje, hook useTripRequests), seccion 6 (modelo de datos trips) y seccion 7 (FCM, Firestore en tiempo real) de docs/requisitos-bolitax.pdf.

  ## Contexto
  - Rutas y distancias: src/services/routing.js (OSRM) ya existe. El backend puede reutilizar la logica o llamar a OSRM directamente.
  - Tarifas: calculateFare de src/utils/calculateFare.js. Debe ser la MISMA funcion en app y backend; resuelve como compartirla sin duplicar codigo.
  - Llave de servicio de Firebase: backend/serviceAccountKey.json. NO la leas; solo referenciala por su ruta.
  - Sonido: assets/sounds/new_request.wav.
  - El seguimiento de ubicacion y la disponibilidad viven en AvailabilityContext dentro de HomeStack. Las pantallas nuevas de este modulo van dentro de HomeStack.

  ## Trabajo por fases (2 fases)
  Al terminar CADA fase: detente, dime como verificarla, sugiere el commit (español con prefijo en ingles), agrega la entrada a docs/AI_LOG.md y espera "continua".

  ### Fase A: backend, simulador y solicitud entrante (entrada #10)
  - Instala en esta fase TODAS las dependencias nativas del modulo completo (sonido y canal de notificaciones incluidos) para recompilar una sola vez.
  - backend/ con su propio package.json: Node + Express + firebase-admin. backend/.env.example con nombres de variables. Script "npm run dev" y endpoint GET /health.
  - backend/scripts/simulatePassenger.js (script "npm run simulate"): busca un conductor con isAvailable true y status "approved", genera origen y destino aleatorios dentro de Medellin cerca del conductor, calcula distancia y duracion con OSRM, calcula la tarifa con calculateFare y crea un documento en trips con status "requested" y todos los campos de la seccion 6 del PDF (driverId, passengerId simulado, passengerName, origin y destination con lat/lng/address, distanceKm, durationMin, category, paymentMethod, fare, commission, tip 0, driverEarnings, commissionRate, paymentStatus "pending", createdAt). Argumentos opcionales para categoria y metodo de pago (mercadopago o cash).
  - App: TripContext con useContext para el viaje activo (lo exige el PDF).
  - Hook useTripRequests: con onSnapshot escucha trips donde driverId == uid y status == "requested", con limpieza en useEffect. Solo escucha si el conductor esta Disponible.
  - Pantalla o modal de solicitud entrante con: nombre del pasajero, origen, destino, distancia, duracion, categoria, metodo de pago, tarifa estimada y ganancia neta estimada. Temporizador visible de 15 segundos con limpieza en useEffect; al llegar a 0 se rechaza sola.
  - Aceptar y Rechazar con useCallback. Aceptar: status "accepted" y luego "driver_arriving", guarda acceptedAt y navega a una pantalla placeholder "Viaje en curso" (se implementa en el modulo 5). Rechazar o vencer: status "rejected".
  - Mientras haya un viaje activo, no mostrar nuevas solicitudes.
  - Quita el boton TEMPORAL "Probar ruta" de HomeScreen.

  ### Fase B: notificacion push y sonido (entrada #11)
  - La app pide permiso de notificaciones (Android 13+), obtiene el token FCM y lo guarda en drivers/{uid}.fcmToken; si cambia, lo actualiza.
  - Canal de notificaciones de Android con el sonido new_request.wav.
  - El simulador, al crear el viaje, envia una notificacion FCM al token del conductor usando ese canal.
  - App abierta: suena new_request.wav al llegar la solicitud. App en segundo plano o cerrada: llega la notificacion con ese sonido y al tocarla abre la app en la solicitud.

  ## Reglas
  - Todo Firebase en la app solo desde src/services/firebase.js.
  - Dependencias con npx expo install en la app; en backend/ con npm install.
  - Secretos solo en backend y nunca en Git.
  - Comentario // AI-assisted: see docs/AI_LOG.md #N segun la fase.

  ## Cierre
  Muestrame primero el plan de las 2 fases, las dependencias y lo que me toca hacer manualmente. Espera mi aprobacion.
  ```
- Resumen de la respuesta: El agente presento el plan de las 2 fases. En la Fase A creo el backend (Express con `GET /health`, `firebaseAdmin.js` que solo pasa la ruta de la llave al SDK, y el simulador `npm run simulate`), el servicio `trips.js` (aceptar con transaccion, rechazar), el hook `useTripRequests`, `TripContext` (viaje activo y solicitud pendiente), el modal de solicitud entrante con temporizador de 15 s, el placeholder "Viaje en curso" y funciones puras con tests (`formatCOP`, `pickNextRequest`, `isRequestStale`, `secondsLeft`). Quito el boton TEMPORAL "Probar ruta".
- Que se uso / modifico / descarto:
  - `calculateFare` compartida sin duplicar: el backend es ESM (`"type": "module"`) e importa directamente `src/utils/calculateFare.js`, `src/config/pricing.js` y `src/utils/routeParsers.js`. El unico cambio en la app fue poner la extension `.js` al import de `pricing` en `calculateFare.js` (Node ESM la exige; Metro y Jest la aceptan). Se comprobo desde Node que el ejemplo XL de la seccion 5 da 26.900 / 5.380 / 21.520. Node 24 detecta solo que esos archivos son ESM; el aviso se oculta con `--disable-warning=MODULE_TYPELESS_PACKAGE_JSON`.
  - El backend usa `--env-file` de Node en lugar de instalar `dotenv`. `backend/.env` se creo copiando `backend/.env.example` (solo PORT y la ruta de la llave, sin secretos).
  - Sonido: el archivo entregado es `assets/sounds/new_request.mp3` (un MP3 real), no `.wav`. Se decidio usar el `.mp3`, que Android acepta para notificaciones y expo-audio reproduce.
  - Dependencias de la app instaladas en esta fase para recompilar una sola vez: `expo-notifications` (canal con sonido y permiso de Android 13+; plugin con `sounds` y `defaultChannel: "trip_requests"`), `expo-audio` (sonido con la app abierta; plugin con microfono desactivado) y, con aprobacion, `expo-asset`, que `expo-doctor` pidio como dependencia directa de expo-audio. Backend: `express` y `firebase-admin`.
  - Aceptar usa una transaccion de Firestore que verifica que el viaje siga en `requested`, para no aceptar una solicitud que ya vencio. Luego pasa a `driver_arriving`.
  - Rechazar guarda `rejectReason` (`driver` o `timeout`) y `rejectedAt`. Las solicitudes con mas de 2 minutos (por ejemplo, de cuando la app estuvo cerrada) se rechazan solas por `timeout` y no se muestran.
  - El temporizador cuenta 15 s desde que aparece la solicitud en pantalla (no desde `createdAt`), para no depender del reloj del emulador. El modal se monta con `key={request.id}`, asi cada solicitud tiene su propio temporizador.
  - El modal vive en `HomeStack`, fuera del Stack, para mostrarse sobre cualquier pantalla de la seccion Inicio. Las consultas usan solo filtros de igualdad (`==` e `in`) y ordenan en el cliente, para no requerir indices compuestos.
  - El simulador busca el conductor Disponible y aprobado con la ubicacion mas reciente; por defecto usa la categoria del vehiculo del conductor y un metodo de pago aleatorio.
- Archivos y commit: backend/package.json, backend/package-lock.json, backend/.env.example, backend/src/server.js, backend/src/firebaseAdmin.js, backend/src/geo.js, backend/scripts/simulatePassenger.js, src/utils/calculateFare.js, src/services/firebase.js, src/services/trips.js, src/hooks/useTripRequests.js, src/context/TripContext.js, src/components/IncomingRequestModal.js, src/screens/TripInProgressScreen.js, src/screens/HomeScreen.js, src/navigation/HomeStack.js, src/utils/tripRequest.js, src/utils/formatCurrency.js, src/utils/__tests__/tripRequest.test.js, app.json, package.json, package-lock.json — 681d03f
- Verificacion: npm test (84 tests), bundle de Android y npx expo-doctor (20/20) sin errores. GET /health responde ok. Probado en el emulador Pixel_7a con el conductor aprobado y Disponible: npm run simulate crea el viaje y en 1 a 2 segundos aparece el modal con todos los datos y la cuenta regresiva de 15 s. Sin tocar nada queda rejected por timeout, Rechazar deja rejected por driver y Aceptar deja driver_arriving con acceptedAt y abre Viaje en curso. Con un viaje activo no aparecen solicitudes nuevas.
- Aprendizaje: Aprendí que sin app de pasajero se puede simular todo con un script en el backend que crea viajes en Firestore, y la app los recibe al instante porque está escuchando en tiempo real. También entendí que la misma función de tarifas sirve para la app y para el backend sin copiarla, así si cambio un precio cambia en los dos lados. Me pareció clave que aceptar un viaje se haga con una transacción, porque así no se puede aceptar una solicitud que ya venció. Y aprendí que el temporizador tiene que limpiarse bien en el useEffect, si no se quedan contadores corriendo por detrás.

---

### Entrada #11
- Fecha: 2026-11-09
- Integrante: Andrés Salazar Castrillón
- Herramienta: Claude Code
- Objetivo: Modulo 4, Fase B: notificacion push (FCM) y sonido cuando llega una solicitud de viaje, con la app abierta, en segundo plano o cerrada (secciones 3 y 7 del documento)
- Prompt: "Fase A probada: el modal aparece, el temporizador rechaza por timeout, Rechazar y Aceptar funcionan. Continua con la Fase B." (el detalle de la Fase B esta en el prompt de la Entrada #10)
- Resumen de la respuesta: El agente creo el servicio `notifications.js` (canal de Android `trip_requests` con el sonido y permiso de notificaciones), el hook `usePushToken` (token FCM en `drivers/{uid}.fcmToken`, solo si cambio, y renovacion con `onTokenRefresh`), el hook `useOpenFromNotification` (abrir la seccion Inicio al tocar la notificacion), el sonido con expo-audio en `TripContext` cuando aparece una solicitud nueva, el manejador de mensajes en segundo plano en `index.js` y el envio de la notificacion desde el simulador.
- Que se uso / modifico / descarto:
  - Reparto de librerias: `expo-notifications` solo crea el canal y pide el permiso de Android 13+; `@react-native-firebase/messaging` da el token y detecta la apertura desde la notificacion. Con la app abierta no se usa FCM: la solicitud llega por Firestore y el sonido lo reproduce expo-audio, asi no suena dos veces.
  - En Android 8+ el sonido se define en el canal, no en cada notificacion. El canal usa `new_request.mp3`, que el plugin de expo-notifications copio a `res/raw` en la recompilacion de la Fase A. Android no permite cambiar el sonido de un canal ya creado.
  - El orden importa: primero se crea el canal y despues se pide el permiso, porque en Android 13+ el dialogo no aparece si no existe ningun canal.
  - El token se registra en `AppDrawer` (con cualquier sesion abierta) y espera a que cargue el documento del conductor, para compararlo con el guardado y no escribir de mas.
  - El sonido con la app abierta suena una sola vez por solicitud (se recuerda el id de la ultima que sono).
  - Al tocar la notificacion la app va a la seccion Inicio; la solicitud aparece por Firestore, porque el modal se muestra sobre cualquier pantalla de Inicio. Con la app cerrada, la disponibilidad se restaura desde AsyncStorage y el listener se reactiva.
  - El simulador envia la notificacion con `channelId: 'trip_requests'`, prioridad alta y `ttl` igual al tiempo despues del cual la app ya no muestra la solicitud (2 min, `STALE_REQUEST_MS`, importado de la app). Si el envio falla, el viaje queda creado igual. Reutiliza `formatCOP` de la app para el texto.
  - `index.js` registra `setBackgroundMessageHandler` vacio antes de montar la app, como exige RNFirebase.
  - No se agregaron dependencias en esta fase: se instalaron todas en la Fase A.
  - Correccion de compilacion (prompt: "La compilacion fallo por un conflicto en el AndroidManifest: el meta-data com.google.firebase.messaging.default_notification_channel_id lo definen a la vez expo-notifications (defaultChannel "trip_requests" en app.json) y @react-native-firebase/messaging (valor vacio). Quita "defaultChannel" del plugin de expo-notifications en app.json; el simulador ya envia channelId 'trip_requests' en cada mensaje. No edites android/ a mano. Luego regenera con npx expo prebuild --clean --platform android."): se quito `defaultChannel` del plugin de expo-notifications en `app.json` (decision del agente en la Fase A que causo el conflicto). No hace falta, porque cada mensaje del simulador lleva `channelId: 'trip_requests'`. Se regenero `android/` con `npx expo prebuild --clean --platform android` sin editarlo a mano, y se comprobo que el manifiesto de la app ya no declara ese meta-data y que `new_request.mp3` quedo en `res/raw`.
- Archivos y commit: index.js, src/services/firebase.js, src/services/notifications.js, src/services/driverStatus.js, src/hooks/usePushToken.js, src/hooks/useOpenFromNotification.js, src/context/TripContext.js, src/navigation/AppDrawer.js, src/navigation/HomeStack.js, backend/scripts/simulatePassenger.js — e79871d
- Verificacion: npm test (84 tests), bundle de Android y npx expo-doctor (20/20) sin errores. Probado en el emulador Pixel_7a: al entrar se acepta el permiso de notificaciones y el fcmToken queda guardado en Firestore. Con npm run simulate llega la notificacion "Nueva solicitud de viaje" con el sonido personalizado new_request.mp3. Hubo que regenerar la carpeta android porque los cambios de app.json no se aplicaban, y quitar defaultChannel de expo-notifications por un conflicto en el AndroidManifest con React Native Firebase.
- Aprendizaje: Aprendí que cuando cambio plugins en app.json la carpeta android no se actualiza sola si ya existe, entonces hay que regenerarla, y que Android no deja cambiar el sonido de un canal de notificaciones ya creado, por eso tocó desinstalar la app. También entendí que dos librerías pueden chocar si configuran la misma cosa, como pasó con el canal por defecto, y que la solución fue quitar lo que sobraba. Y me quedó claro cómo funcionan las notificaciones: con la app abierta el sonido lo pone la app, y en segundo plano lo pone el canal de Android que manda el backend.

---

### Entrada #12
- Fecha: 2026-11-09
- Integrante: Andrés Salazar Castrillón
- Herramienta: Claude Code
- Objetivo: Modulo 5, Fase A: pantalla "Viaje en curso" con la ruta al punto de recogida, "Pasajero a bordo", la ruta al destino y la cancelacion antes de recoger al pasajero (seccion 3 del documento)
- Prompt:
  ```
  ## Objetivo
  Implementar el flujo del viaje despues de aceptar: ruta al punto de recogida, pasajero a bordo, ruta al destino, finalizar y resumen del viaje. Referencia: seccion 3 (pantallas Viaje en curso y Cobro y resumen, estados del viaje) y seccion 5 (calculo de tarifa) de docs/requisitos-bolitax.pdf.

  ## Contexto
  - Rutas con src/services/routing.js (OSRM) y el componente src/components/LeafletMap.js (marcadores y polilinea).
  - Tarifa con calculateFare (la misma funcion usada en la estimacion).
  - El viaje activo vive en TripContext (activeTrip por onSnapshot). La pantalla depende del campo status del viaje.
  - La ubicacion del conductor viene de AvailabilityContext (useDriverLocation), que sigue activo en todo el HomeStack.
  - Los pagos (Mercado Pago y efectivo) se hacen en el modulo siguiente: aqui el viaje termina en status "completed" con paymentStatus "pending".

  ## Trabajo por fases (2 fases)
  Al terminar CADA fase: detente, dime como verificarla, sugiere el commit (español con prefijo en ingles), agrega la entrada a docs/AI_LOG.md y espera "continua".

  ### Fase A: viaje en curso (entrada #12)
  - Reemplaza el placeholder de TripInProgressScreen.
  - Con status "driver_arriving": mapa con la ubicacion del conductor, el punto de recogida y la ruta OSRM entre ambos. Muestra nombre del pasajero, direccion de recogida, distancia y tiempo estimados.
  - Boton "Pasajero a bordo": pasa a status "in_progress" con pickedUpAt.
  - Con status "in_progress": la ruta cambia hacia el destino (marcadores de recogida y destino), con direccion de destino, distancia y tiempo.
  - Las rutas se calculan una vez al entrar a cada estado, no en cada movimiento (recomendacion del PDF).
  - Boton "Cancelar viaje" visible solo antes de in_progress: pide confirmacion dentro de la pantalla (no Alert) y pasa a status "cancelled" con cancelledBy "driver" y cancelledAt; vuelve a Inicio.
  - Si el conductor cierra y abre la app en medio del viaje, debe volver a la pantalla correcta segun el status (TripContext ya recupera el viaje activo; asegura la navegacion).
  - Funcion pura con tests en Jest para las transiciones de estado permitidas (por ejemplo canTransition(from, to)), usada por los servicios antes de actualizar.

  ### Fase B: finalizar y resumen (entrada #13)
  - Boton "Finalizar viaje" (solo en in_progress): recalcula la tarifa final con calculateFare usando distanceKm y durationMin del viaje, y guarda fare, commission, driverEarnings, commissionRate (de pricing.js), tip (0), route (coordenadas de la polilinea para dibujarla en el historial) y completedAt, con status "completed" y paymentStatus "pending".
  - Pantalla TripSummaryScreen (Cobro y resumen): tarifa final, comision, ganancia neta, propina, metodo de pago y estado del pago ("Pendiente" por ahora; el cobro se conecta en el modulo siguiente). Montos en COP con formatCOP.
  - Boton "Volver al inicio" que regresa a Inicio, el conductor sigue Disponible y puede recibir nuevas solicitudes.
  - Ajusta TripContext para que un viaje "completed" sin pagar se considere aun activo (para no perder el resumen), pero no bloquee nuevas solicitudes una vez el conductor vuelve al inicio. Explica la decision.

  ## Reglas
  - Todo Firebase solo desde src/services/firebase.js.
  - Sin dependencias nuevas salvo que sean indispensables (pregunta primero).
  - Estilos simples; el diseño va despues.
  - Comentario // AI-assisted: see docs/AI_LOG.md #N segun la fase.

  ## Cierre
  Muestrame primero el plan de las 2 fases. Espera mi aprobacion.
  ```
- Resumen de la respuesta: El agente presento el plan de las 2 fases. En la Fase A creo la funcion pura `canTransition`/`canCancel` (src/utils/tripStatus.js) con tests, un helper `transitionTrip` en `trips.js` que valida cada cambio de estado dentro de una transaccion, `startTrip` y `cancelTrip`, el hook `useTripRoute` (ruta OSRM una vez por estado), la pantalla "Viaje en curso" con mapa, ruta, datos del pasajero, "Pasajero a bordo" y cancelacion con confirmacion en pantalla, y el componente `ActiveTripRedirect` que lleva a la pantalla correcta segun el estado.
- Que se uso / modifico / descarto:
  - Transiciones: `requested -> accepted | rejected`, `accepted -> driver_arriving | cancelled`, `driver_arriving -> in_progress | cancelled`, `in_progress -> completed`, `completed -> paid`; `paid`, `rejected` y `cancelled` son finales. Cancelar solo es posible antes de `in_progress`, como dice la seccion 3.
  - Todas las acciones (aceptar, rechazar, pasajero a bordo, cancelar) pasan por `transitionTrip`: una transaccion lee el estado actual en Firestore y solo actualiza si `canTransition` lo permite. `acceptTrip` y `rejectTrip` (de la Entrada #10) se pasaron a este helper.
  - `useTripRoute` lee la ubicacion del conductor desde una ref: el efecto solo depende del id y el estado del viaje (y de si ya hay ubicacion), asi moverse no vuelve a llamar a OSRM.
  - Navegacion: `ActiveTripRedirect` recuerda `id:estado` del viaje activo y navega a "Viaje en curso" cuando ese valor cambia (viaje recuperado al reabrir la app o cambio de estado). Como solo reacciona a cambios, no obliga a volver si el conductor fue al mapa de inicio. Por eso se quito la navegacion del boton Aceptar: la pantalla se abre cuando Firestore confirma el estado, nunca sin el viaje cargado.
  - "Finalizar viaje" aparece deshabilitado en `in_progress`; se conecta en la Fase B.
  - Correccion tras probar en el emulador (prompt: "Bug en TripInProgressScreen: los botones "Pasajero a bordo" (verde) y "Finalizar viaje" (gris) se ven sin texto, solo el color. Revisa el componente del boton (color del texto, que el Text este dentro del Pressable, estilos que lo oculten) y corrigelo para que el texto se vea en todos los botones de la pantalla. Revisa tambien los botones del modal de solicitud y del resumen por si tienen el mismo problema."): la causa era `flex: 1` en el estilo base de los botones. Ese valor solo sirve dentro de una fila (`flexDirection: 'row'`, como la confirmacion de cancelar); en el panel, que es una columna con alto automatico, `flex: 1` deja el alto base del boton en 0, solo se ve el relleno de color y el texto se recorta. Se quito `flex: 1` del estilo base y se agrego `rowButton` solo para los dos botones que comparten fila. En el modal de solicitud los botones y recuadros con `flex: 1` estan dentro de filas, asi que se ven bien; la pantalla de resumen aun no existe (Fase B) y se hara sin ese problema.
  - Modo demo agregado a esta fase (prompt: "Agrega un modo demo para simular el recorrido del viaje, solo visible en desarrollo (__DEV__): En TripInProgressScreen, un boton "Simular recorrido (demo)" que mueve la ubicacion del conductor a lo largo de la polilinea de la ruta actual (a la recogida en driver_arriving, al destino en in_progress) en unos 10-15 segundos, avanzando por los puntos de la ruta con un intervalo con limpieza en useEffect. La ubicacion simulada debe reemplazar temporalmente la del GPS en AvailabilityContext, para que el marcador se mueva en el mapa y la ubicacion se guarde en Firestore respetando el limite de escrituras existente. Al terminar el recorrido, se detiene en el ultimo punto; el conductor sigue tocando "Pasajero a bordo" o "Finalizar viaje" manualmente. Si se sale de la pantalla o cambia el estado del viaje, la simulacion se detiene y vuelve el GPS real. Usa una funcion pura con tests para calcular la posicion en cada paso. Incluyelo en la Fase A (misma entrada #12)."):
    - Funcion pura `pointAtProgress(coordinates, progress)` (src/utils/routeSimulation.js) con 6 tests: interpola por distancia (haversine) y no por numero de puntos, para que la velocidad sea pareja aunque OSRM entregue puntos muy juntos en unos tramos y muy separados en otros.
    - Hook `useRouteSimulation`: recorre la ruta en 12 s con un `setInterval` cada 400 ms, con limpieza en `useEffect`. Al terminar se queda en el ultimo punto. Si cambia el estado del viaje, la pantalla pierde el foco o se desmonta, la limpieza borra la ubicacion simulada y vuelve el GPS real.
    - `AvailabilityContext` guarda `simulatedLocation` y se la pasa a `useDriverLocation` como `overrideLocation`. El hook la devuelve en lugar de la del GPS y la envia a Firestore por el mismo `sendLocation`. Para eso la ultima escritura paso a una ref compartida (`lastSentAtRef`), asi GPS y simulacion respetan el mismo limite de una escritura cada 5 s. Durante la simulacion el GPS se sigue leyendo pero no se envia.
    - El boton solo aparece con `__DEV__` (development build) y cuando ya hay ruta; en una build de produccion no existe.
- Archivos y commit: src/utils/tripStatus.js, src/utils/__tests__/tripStatus.test.js, src/services/trips.js, src/hooks/useTripRoute.js, src/screens/TripInProgressScreen.js, src/navigation/HomeStack.js, src/utils/routeSimulation.js, src/utils/__tests__/routeSimulation.test.js, src/hooks/useRouteSimulation.js, src/hooks/useDriverLocation.js, src/context/AvailabilityContext.js — [PENDIENTE]
- Verificacion: `npm test` (98 tests), `npx expo export --platform android` y `npx expo-doctor` (20/20) sin errores. [PENDIENTE: prueba en el emulador Pixel_7a]
- Aprendizaje: [PENDIENTE]
