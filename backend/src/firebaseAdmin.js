// AI-assisted: see docs/AI_LOG.md #10
// Inicializa firebase-admin con la llave de servicio. Este código no lee la llave:
// solo le pasa la RUTA al SDK. La llave nunca se sube a Git (.gitignore).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

// carpeta backend/ (la ruta del .env es relativa a ella)
const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const keyPath = path.resolve(
  backendRoot,
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? './serviceAccountKey.json',
);

const app = initializeApp({ credential: cert(keyPath) });

export const db = getFirestore(app);
export const messaging = getMessaging(app);
