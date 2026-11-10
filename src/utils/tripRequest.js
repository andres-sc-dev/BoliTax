// AI-assisted: see docs/AI_LOG.md #10
// Reglas puras sobre las solicitudes de viaje (se prueban con Jest).

// segundos que tiene el conductor para aceptar (sección 3 del PDF)
export const REQUEST_TIMEOUT_SECONDS = 15;
// una solicitud más vieja que esto (ej: llegó con la app cerrada) ya no se muestra
export const STALE_REQUEST_MS = 2 * 60 * 1000;

// milisegundos de createdAt; puede ser un Timestamp de Firestore, un Date o null
// (null mientras el serverTimestamp todavía no se confirma)
export function toMillis(createdAt) {
  if (!createdAt) return null;
  if (typeof createdAt.toMillis === 'function') return createdAt.toMillis();
  if (createdAt instanceof Date) return createdAt.getTime();
  return null;
}

// true si la solicitud es demasiado vieja para mostrarla
export function isRequestStale(request, now, staleMs = STALE_REQUEST_MS) {
  const created = toMillis(request.createdAt);
  if (created === null) return false;
  return now - created > staleMs;
}

// la solicitud que se muestra: la más antigua que no esté vencida
export function pickNextRequest(requests, now, staleMs = STALE_REQUEST_MS) {
  const fresh = requests.filter((request) => !isRequestStale(request, now, staleMs));
  fresh.sort(
    (a, b) => (toMillis(a.createdAt) ?? Infinity) - (toMillis(b.createdAt) ?? Infinity),
  );
  return fresh[0] ?? null;
}

// segundos restantes del temporizador (nunca negativos)
export function secondsLeft(shownAt, now, timeoutSeconds = REQUEST_TIMEOUT_SECONDS) {
  const elapsed = Math.floor((now - shownAt) / 1000);
  return Math.max(0, timeoutSeconds - elapsed);
}
