// AI-assisted: see docs/AI_LOG.md #18
// Estado de un documento del conductor según su fecha de vencimiento (pantalla Perfil).
// Se compara por DÍA en hora de Colombia, sin depender de la zona horaria del teléfono.
import { toMillis } from './tripRequest';

const BOGOTA_OFFSET_MS = -5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
// a partir de cuántos días antes del vencimiento se avisa en rojo
export const EXPIRING_SOON_DAYS = 30;

// número de día (en Colombia) de un instante: sirve para restar fechas por días completos
function bogotaDayNumber(ms) {
  return Math.floor((ms + BOGOTA_OFFSET_MS) / DAY_MS);
}

// 'expired' (ya venció), 'expiring' (vence en los próximos 30 días, incluido hoy),
// 'valid' (vigente) o 'none' (sin fecha). Acepta Timestamp de Firestore, Date o milisegundos.
export function getDocumentStatus(expiry, now = Date.now()) {
  const expiryMs = typeof expiry === 'number' ? expiry : toMillis(expiry);
  if (expiryMs === null || expiryMs === undefined || Number.isNaN(expiryMs)) return 'none';
  const daysLeft = bogotaDayNumber(expiryMs) - bogotaDayNumber(now);
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= EXPIRING_SOON_DAYS) return 'expiring';
  return 'valid';
}
