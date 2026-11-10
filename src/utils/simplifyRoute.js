// AI-assisted: see docs/AI_LOG.md #13
// Reduce la cantidad de puntos de una ruta antes de guardarla en el viaje.
// OSRM puede devolver miles de puntos y un documento de Firestore no puede pasar de 1 MB;
// para dibujar el recorrido en el historial bastan unos cientos.
// Función pura: conserva el primer y el último punto y toma puntos a intervalos regulares.

export const MAX_ROUTE_POINTS = 300;

export function simplifyRoute(coordinates, maxPoints = MAX_ROUTE_POINTS) {
  if (!Array.isArray(coordinates)) return [];
  // se copian solo lat y lng, por si los puntos traen otros campos
  const clean = coordinates.map(({ lat, lng }) => ({ lat, lng }));
  const limit = Math.max(2, maxPoints);
  if (clean.length <= limit) return clean;

  const step = (clean.length - 1) / (limit - 1);
  const result = [];
  for (let i = 0; i < limit; i += 1) {
    result.push(clean[Math.round(i * step)]);
  }
  return result;
}
