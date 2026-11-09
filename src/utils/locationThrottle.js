// AI-assisted: see docs/AI_LOG.md #8
// Limita las escrituras de ubicación en Firestore: como máximo una cada `minIntervalMs`.
// Es una función pura (recibe los tiempos como parámetros) para poder probarla con Jest.

// intervalo mínimo entre escrituras de ubicación
export const MIN_LOCATION_WRITE_INTERVAL_MS = 5000;

export function shouldSendLocation(lastSentAt, now, minIntervalMs = MIN_LOCATION_WRITE_INTERVAL_MS) {
  // la primera ubicación siempre se envía
  if (lastSentAt === null || lastSentAt === undefined) return true;
  return now - lastSentAt >= minIntervalMs;
}
