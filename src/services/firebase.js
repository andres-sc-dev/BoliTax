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

// AI-assisted: see docs/AI_LOG.md #4
// funciones de sesión y lectura del conductor usadas por AuthContext
export {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';
export { doc, onSnapshot } from '@react-native-firebase/firestore';

// AI-assisted: see docs/AI_LOG.md #6
// funciones usadas al enviar el registro del conductor
export { createUserWithEmailAndPassword, deleteUser } from '@react-native-firebase/auth';
export { setDoc } from '@react-native-firebase/firestore';

// AI-assisted: see docs/AI_LOG.md #8
// actualización parcial del documento del conductor (ubicación y disponibilidad)
export { updateDoc } from '@react-native-firebase/firestore';
