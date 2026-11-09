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
- Verificacion: `npm test` con 15 tests pasando (3 suites), `npx expo-doctor` sin problemas (20/20) y `npx expo export --platform android` genera el bundle sin errores. [PENDIENTE: prueba en el emulador Pixel_7a]
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
- Verificacion: `npm test` con 48 tests pasando (3 suites) y `npx expo export --platform android` sin errores. [PENDIENTE: prueba en el emulador Pixel_7a]
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
- Verificacion: `npm test` con 53 tests pasando (4 suites) y `npx expo export --platform android` sin errores. [PENDIENTE: registro completo en el emulador Pixel_7a]
- Aprendizaje: Aprendí que el orden en que se hacen las cosas importa mucho. Primero se suben las fotos, después se crea la cuenta y al final se guardan los datos, y si algo falla a la mitad se borra la cuenta para que no quede un conductor a medias y se pueda volver a intentar con el mismo correo. También entendí que cuando se crea la cuenta, Firebase inicia sesión de una, y sin un control la app se saltaba al menú antes de guardar los datos; por eso se usa una bandera que la deja quieta hasta que termine. Con Cloudinary aprendí que se puede subir fotos desde la app sin poner ninguna clave secreta, usando un "upload preset" sin firma. Y algo práctico: cuando uno crea o cambia el archivo .env, hay que reiniciar Metro con -c para que la app lea las variables nuevas.
- Correccion posterior:
  - Sintoma: al tocar "Enviar registro" aparecia "No hay conexion a internet", aunque el emulador si tenia internet.
  - Prompts: (1) pedir un diagnostico con logs temporales `[DIAG]` (paso que fallaba, si las variables de Cloudinary estaban definidas, respuesta del servidor) y revisar el FormData y la traduccion de errores; (2) "Encontramos la causa: el fetch de Expo (expo/build/winter/fetch) lanza "Unsupported FormDataPart implementation" en convertFormData.js porque no acepta el objeto de React Native { uri, type, name } dentro de FormData. No es un problema de red." y pedir corregir `uploadImage`, corregir el catch y quitar los logs.
  - Causa real: en Expo SDK 58 el `fetch` global es el de Expo, y su `convertFormData` solo acepta strings, Blob u objetos con `bytes()`; el objeto `{ uri, type, name }` de React Native no es compatible. Ademas, el `catch` de `cloudinary.js` convertia cualquier excepcion de `fetch` en `auth/network-request-failed`, y por eso el error real quedaba oculto detras de "sin conexion".
  - Arreglo: la foto se envia como `new File(uri)` de `expo-file-system` dentro del FormData (el `fetch` de Expo lee sus bytes con `file.bytes()`). Se descarto enviar la imagen en base64 (data URI) porque guarda todas las fotos como texto en el estado del formulario y usa mas memoria.
  - Dependencia: `expo-file-system` solo existia dentro de `node_modules/expo/node_modules` y no se podia importar desde `src/`. Con aprobacion se declaro con `npx expo install expo-file-system` (~58.0.13, la misma version que ya trae expo; sin codigo nativo nuevo ni recompilar).
  - Manejo de errores: solo los errores reales de red (el `FetchError` del fetch de Expo, cuyo mensaje empieza por "fetch failed:") muestran "sin conexion". Cualquier otro fallo de la subida muestra "No se pudo subir una de las fotos. Intentalo de nuevo." y el detalle tecnico queda en `error.cause` y en la consola. Tambien se valida que el archivo de la foto exista antes de subirlo.
  - Se quitaron todos los logs temporales `[DIAG]`.
  - Archivos y commit: src/services/cloudinary.js, src/services/driverRegistration.js, src/screens/register/DocumentsTab.js, package.json, package-lock.json — [PENDIENTE]
  - Verificacion: `npm test` (53 tests), `npx expo export --platform android` y `npx expo-doctor` (20/20) sin errores. [PENDIENTE: registro completo en el emulador Pixel_7a]
