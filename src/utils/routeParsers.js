// AI-assisted: see docs/AI_LOG.md #9
// Funciones puras que transforman las respuestas de OSRM y Nominatim al formato de la app.
// No llaman a la red, así que se prueban con Jest usando respuestas de ejemplo.

// error con código propio para que las pantallas sepan qué mensaje mostrar
export function routingError(code, message, cause) {
  const error = new Error(message);
  error.code = code;
  error.cause = cause;
  return error;
}

// coordenada válida: números finitos dentro de los rangos de latitud y longitud
export function isValidLatLng(point) {
  return (
    point !== null &&
    typeof point === 'object' &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    Math.abs(point.lat) <= 90 &&
    Math.abs(point.lng) <= 180
  );
}

// ---------- OSRM ----------

// convierte la respuesta de /route/v1/driving a { distanceKm, durationMin, coordinates }.
// OSRM entrega la distancia en metros, la duración en segundos y la geometría GeoJSON
// con puntos [lng, lat] (al revés de lo que usa la app).
export function parseOsrmRoute(json) {
  if (!json || json.code !== 'Ok' || !Array.isArray(json.routes) || json.routes.length === 0) {
    throw routingError('routing/no-route', 'No se encontró una ruta entre esos dos puntos.');
  }
  const route = json.routes[0];
  const points = route.geometry?.coordinates;
  if (!Array.isArray(points) || points.length < 2) {
    throw routingError('routing/no-route', 'La ruta no tiene una geometría válida.');
  }
  return {
    // metros -> km con 1 decimal
    distanceKm: Math.round(route.distance / 100) / 10,
    // segundos -> minutos enteros
    durationMin: Math.round(route.duration / 60),
    coordinates: points.map(([lng, lat]) => ({ lat, lng })),
  };
}

// ---------- Nominatim ----------

// arma una dirección corta: "calle número, barrio, ciudad" con los datos que existan
export function formatShortAddress(json) {
  const address = json?.address;
  if (address) {
    const street = [address.road, address.house_number].filter(Boolean).join(' ');
    const area = address.neighbourhood || address.suburb || address.quarter;
    // en Colombia Nominatim puede devolver "Perímetro Urbano Medellín": se deja solo "Medellín"
    const city = (address.city || address.town || address.village || address.municipality)
      ?.replace(/^Perímetro Urbano\s+/i, '');
    const parts = [street, area, city].filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
  }
  // respaldo: las 3 primeras partes del nombre completo
  if (typeof json?.display_name === 'string' && json.display_name.trim() !== '') {
    return json.display_name.split(',').slice(0, 3).map((part) => part.trim()).join(', ');
  }
  throw routingError('routing/no-address', 'No se encontró una dirección para esa ubicación.');
}

// Nominatim permite máximo 1 petición por segundo: cuánto hay que esperar antes de la siguiente
export const NOMINATIM_MIN_INTERVAL_MS = 1000;

export function getNominatimWait(lastRequestAt, now, minIntervalMs = NOMINATIM_MIN_INTERVAL_MS) {
  if (lastRequestAt === null || lastRequestAt === undefined) return 0;
  return Math.max(0, minIntervalMs - (now - lastRequestAt));
}
