import { registerRootComponent } from 'expo';

import App from './App';
// AI-assisted: see docs/AI_LOG.md #11
import { messaging, setBackgroundMessageHandler } from './src/services/firebase';

// AI-assisted: see docs/AI_LOG.md #11
// RNFirebase exige registrar el manejador de mensajes en segundo plano ANTES de montar la app.
// No hace nada: la notificación la muestra Android con el canal "trip_requests" y la solicitud
// se lee de Firestore cuando el conductor abre la app.
setBackgroundMessageHandler(messaging, async () => {});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
