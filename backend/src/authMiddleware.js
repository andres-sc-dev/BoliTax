// AI-assisted: see docs/AI_LOG.md #14
// Exige que la petición venga de un conductor con sesión: la app envía su ID token de Firebase
// en "Authorization: Bearer <token>" y aquí se verifica con firebase-admin.
// Así nadie puede crear cobros ni verificar pagos de viajes ajenos.
import { auth } from './firebaseAdmin.js';

export async function requireDriver(req, res, next) {
  const header = req.get('Authorization') ?? '';
  const match = /^Bearer (.+)$/.exec(header);
  if (!match) {
    res.status(401).json({ error: 'Falta el token de sesión.' });
    return;
  }
  try {
    const decoded = await auth.verifyIdToken(match[1]);
    req.uid = decoded.uid;
    next();
  } catch {
    res.status(401).json({ error: 'La sesión no es válida. Vuelve a iniciar sesión.' });
  }
}
