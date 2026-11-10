// AI-assisted: see docs/AI_LOG.md #12
// Modo demo (solo en desarrollo): posición sobre una ruta según el avance del recorrido.
// Función pura: recibe la polilínea y un avance de 0 a 1 y devuelve { lat, lng }.
// Interpola por DISTANCIA (no por número de puntos), así la velocidad es pareja aunque
// OSRM entregue puntos muy juntos en unos tramos y muy separados en otros.

const EARTH_RADIUS_KM = 6371;
const toRadians = (degrees) => (degrees * Math.PI) / 180;

// distancia en km entre dos puntos (fórmula de haversine)
export function distanceKm(a, b) {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

// progress: 0 = inicio de la ruta, 1 = final. Fuera de rango se recorta.
export function pointAtProgress(coordinates, progress) {
  if (!Array.isArray(coordinates) || coordinates.length === 0) return null;
  if (coordinates.length === 1) return { lat: coordinates[0].lat, lng: coordinates[0].lng };

  const clamped = Math.min(Math.max(progress, 0), 1);
  const last = coordinates[coordinates.length - 1];
  if (clamped === 1) return { lat: last.lat, lng: last.lng };

  // largo de cada tramo y largo total
  const segments = [];
  let total = 0;
  for (let i = 0; i < coordinates.length - 1; i += 1) {
    const length = distanceKm(coordinates[i], coordinates[i + 1]);
    segments.push(length);
    total += length;
  }
  if (total === 0) return { lat: coordinates[0].lat, lng: coordinates[0].lng };

  // se recorre la ruta hasta llegar a la distancia objetivo y se interpola dentro del tramo
  const target = clamped * total;
  let travelled = 0;
  for (let i = 0; i < segments.length; i += 1) {
    if (travelled + segments[i] >= target) {
      const ratio = segments[i] === 0 ? 0 : (target - travelled) / segments[i];
      const from = coordinates[i];
      const to = coordinates[i + 1];
      return {
        lat: from.lat + (to.lat - from.lat) * ratio,
        lng: from.lng + (to.lng - from.lng) * ratio,
      };
    }
    travelled += segments[i];
  }
  return { lat: last.lat, lng: last.lng };
}
