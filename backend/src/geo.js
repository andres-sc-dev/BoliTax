// AI-assisted: see docs/AI_LOG.md #10
// Utilidades geográficas del simulador (funciones puras).

// límites aproximados del área urbana de Medellín
export const MEDELLIN_BOUNDS = { minLat: 6.15, maxLat: 6.36, minLng: -75.66, maxLng: -75.52 };
export const MEDELLIN_CENTER = { lat: 6.2442, lng: -75.5812 };

const KM_PER_DEGREE_LAT = 111.32;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// punto aleatorio entre minKm y maxKm de `center`, recortado a los límites de Medellín.
// `random` se recibe como parámetro para poder hacer pruebas deterministas.
export function randomPointNear(center, minKm, maxKm, random = Math.random) {
  const distanceKm = minKm + (maxKm - minKm) * random();
  const angle = 2 * Math.PI * random();
  const dLat = (distanceKm * Math.cos(angle)) / KM_PER_DEGREE_LAT;
  // un grado de longitud mide menos km a medida que se aleja del ecuador
  const dLng =
    (distanceKm * Math.sin(angle)) / (KM_PER_DEGREE_LAT * Math.cos((center.lat * Math.PI) / 180));
  return {
    lat: Number(clamp(center.lat + dLat, MEDELLIN_BOUNDS.minLat, MEDELLIN_BOUNDS.maxLat).toFixed(6)),
    lng: Number(clamp(center.lng + dLng, MEDELLIN_BOUNDS.minLng, MEDELLIN_BOUNDS.maxLng).toFixed(6)),
  };
}
