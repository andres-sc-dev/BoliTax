// AI-assisted: see docs/AI_LOG.md #3
// Punto de acceso único a Firebase: ningún otro archivo debe importar @react-native-firebase/*.
// No se llama a initializeApp: React Native Firebase se inicializa solo en el lado nativo
// con la configuración de google-services.json (referenciado en app.json).
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getMessaging } from '@react-native-firebase/messaging';

// instancias compartidas por toda la app (API modular de RNFirebase v27)
export const auth = getAuth();
export const db = getFirestore();
export const messaging = getMessaging();

// funciones de Firestore re-exportadas para que el resto de la app no importe la librería;
// se agregan aquí a medida que se necesiten
export { collection, addDoc, serverTimestamp } from '@react-native-firebase/firestore';
