// AI-assisted: see docs/AI_LOG.md #9
// Servicio de rutas con servicios gratuitos de OpenStreetMap (sin Google):
// - OSRM (router.project-osrm.org): ruta, distancia y duración entre dos puntos.
// - Nominatim: convierte coordenadas en una dirección corta.
// La transformación de las respuestas está en utils/routeParsers.js (funciones puras con tests).
import {
  formatShortAddress,
  getNominatimWait,
  isValidLatLng,
  parseOsrmRoute,
  routingError,
} from '../utils/routeParsers';
import { wait } from '../utils/retryAsync';

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';
// la política de uso de Nominatim exige un User-Agent que identifique la app
const USER_AGENT = 'BoliTax-app-universitaria';
// tiempo máximo de espera de cada petición
const TIMEOUT_MS = 10000;
// máximo de direcciones guardadas en memoria
const ADDRESS_CACHE_LIMIT = 100;

// el fetch de Expo lanza un FetchError ("fetch failed: ...") solo cuando falla la conexión
// (mismo criterio que en services/cloudinary.js)
function isNetworkError(error) {
  return typeof error?.message === 'string' && error.message.startsWith('fetch failed:');
}

// GET con timeout (AbortController) que devuelve el JSON de la respuesta
async function fetchJson(url, headers = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    let data = null;
    try {
      data = await response.json();
    } catch (parseError) {
      throw routingError(
        'routing/http-error',
        `El servicio respondió con un error (HTTP ${response.status}).`,
        parseError,
      );
    }
    // OSRM responde 400 con { code: 'NoRoute' }: ese JSON lo interpreta el parser
    return data;
  } catch (error) {
    if (error.code?.startsWith('routing/')) throw error;
    if (controller.signal.aborted) {
      throw routingError('routing/timeout', 'El servicio de rutas tardó demasiado en responder.', error);
    }
    if (isNetworkError(error)) {
      throw routingError('routing/network', 'No hay conexión a internet.', error);
    }
    throw routingError('routing/unknown', 'No se pudo consultar el servicio de rutas.', error);
  } finally {
    clearTimeout(timer);
  }
}

// ---------- rutas (OSRM) ----------

// devuelve { distanceKm, durationMin, coordinates } entre dos puntos { lat, lng }
export async function getRoute(origin, destination) {
  if (!isValidLatLng(origin) || !isValidLatLng(destination)) {
    throw routingError('routing/invalid-input', 'Las coordenadas de la ruta no son válidas.');
  }
  // OSRM recibe las coordenadas como lng,lat
  const points = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const data = await fetchJson(`${OSRM_URL}/${points}?overview=full&geometries=geojson`);
  return parseOsrmRoute(data);
}

// ---------- dirección (Nominatim) ----------

let lastNominatimAt = null;
// cola de peticiones: cada una espera a que termine la anterior (máximo 1 por segundo)
let nominatimQueue = Promise.resolve();
const addressCache = new Map();

// devuelve una dirección corta legible para { lat, lng }
export function reverseGeocode(point) {
  if (!isValidLatLng(point)) {
    return Promise.reject(
      routingError('routing/invalid-input', 'Las coordenadas de la dirección no son válidas.'),
    );
  }
  // ~1 m de precisión: puntos casi iguales reutilizan la misma dirección sin volver a pedirla
  const key = `${point.lat.toFixed(5)},${point.lng.toFixed(5)}`;
  if (addressCache.has(key)) return Promise.resolve(addressCache.get(key));

  const task = nominatimQueue.then(async () => {
    const waitMs = getNominatimWait(lastNominatimAt, Date.now());
    if (waitMs > 0) await wait(waitMs);
    lastNominatimAt = Date.now();

    const url = `${NOMINATIM_URL}?format=jsonv2&lat=${point.lat}&lon=${point.lng}&zoom=18&accept-language=es`;
    const data = await fetchJson(url, { 'User-Agent': USER_AGENT });
    const address = formatShortAddress(data);

    // caché limitado: si se llena, se borra la dirección más antigua
    if (addressCache.size >= ADDRESS_CACHE_LIMIT) {
      addressCache.delete(addressCache.keys().next().value);
    }
    addressCache.set(key, address);
    return address;
  });
  // un error no debe bloquear las peticiones siguientes de la cola
  nominatimQueue = task.catch(() => {});
  return task;
}
