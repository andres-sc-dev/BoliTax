// AI-assisted: see docs/AI_LOG.md #10
// Inicializa firebase-admin con la llave de servicio. Este código no lee la llave:
// solo le pasa la RUTA al SDK. La llave nunca se sube a Git (.gitignore).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

// carpeta backend/ (la ruta del .env es relativa a ella)
const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const keyPath = path.resolve(
  backendRoot,
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? './serviceAccountKey.json',
);

// AI-assisted: see docs/AI_LOG.md #15
// Credenciales por defecto de Google (ADC): la ruta de la llave va en GOOGLE_APPLICATION_CREDENTIALS
// y el SDK la lee por su cuenta. Con cert(ruta), firebase-admin le pasaba a Firestore la opción
// `credentials`, que google-auth-library marca como obsoleta (aviso en la terminal).
process.env.GOOGLE_APPLICATION_CREDENTIALS ??= keyPath;
const app = initializeApp({ credential: applicationDefault() });

export const db = getFirestore(app);
export const messaging = getMessaging(app);
// AI-assisted: see docs/AI_LOG.md #14
// para verificar el ID token del conductor en los endpoints de pago
export const auth = getAuth(app);
