// AI-assisted: see docs/AI_LOG.md #10
// Simulador de pasajero: crea una solicitud de viaje en `trips` con status "requested"
// para un conductor Disponible y aprobado (no existe app de pasajero).
//
// Uso:  npm run simulate
//       npm run simulate -- --category=xl --payment=cash
//
// Reutiliza el código de la app (una sola fuente de verdad):
// - calculateFare y PRICING: la MISMA tarifa que calcula la app.
// - parseOsrmRoute y formatShortAddress: los mismos parsers probados con Jest.
import { FieldValue } from 'firebase-admin/firestore';
import { PRICING } from '../../src/config/pricing.js';
import { calculateFare } from '../../src/utils/calculateFare.js';
import { formatCOP } from '../../src/utils/formatCurrency.js';
import { formatShortAddress, parseOsrmRoute } from '../../src/utils/routeParsers.js';
import { STALE_REQUEST_MS } from '../../src/utils/tripRequest.js';
import { db, messaging } from '../src/firebaseAdmin.js';
import { MEDELLIN_CENTER, randomPointNear } from '../src/geo.js';

const USER_AGENT = 'BoliTax-app-universitaria';
const CATEGORIES = Object.keys(PRICING.categoryMultipliers);
const PAYMENT_METHODS = ['mercadopago', 'cash'];
const PASSENGER_NAMES = [
  'Laura Gómez',
  'Santiago Restrepo',
  'Valentina Ríos',
  'Mateo Cardona',
  'Camila Zapata',
  'Juan Pablo Arango',
  'Sofía Londoño',
  'Andrés Mejía',
];

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// lee argumentos con formato --clave=valor
function parseArgs(argv) {
  const args = {};
  for (const arg of argv) {
    const match = /^--([^=]+)=(.*)$/.exec(arg);
    if (match) args[match[1]] = match[2];
  }
  return args;
}

// conductor Disponible y aprobado; si hay varios, el de ubicación más reciente
async function findAvailableDriver() {
  const snapshot = await db
    .collection('drivers')
    .where('isAvailable', '==', true)
    .where('status', '==', 'approved')
    .get();
  if (snapshot.empty) return null;
  const drivers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  drivers.sort(
    (a, b) => (b.locationUpdatedAt?.toMillis?.() ?? 0) - (a.locationUpdatedAt?.toMillis?.() ?? 0),
  );
  return drivers[0];
}

async function getRoute(origin, destination) {
  const points = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${points}?overview=full&geometries=geojson`,
    { signal: AbortSignal.timeout(10000) },
  );
  return parseOsrmRoute(await response.json());
}

// dirección corta con Nominatim; si falla, se usan las coordenadas como texto
async function getAddress(point) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${point.lat}&lon=${point.lng}&zoom=18&accept-language=es`;
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(10000),
    });
    return formatShortAddress(await response.json());
  } catch (error) {
    console.warn(`No se obtuvo la dirección (${error.message}); se usan las coordenadas.`);
    return `${point.lat}, ${point.lng}`;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.category && !CATEGORIES.includes(args.category)) {
    throw new Error(`Categoría inválida "${args.category}". Usa: ${CATEGORIES.join(', ')}.`);
  }
  if (args.payment && !PAYMENT_METHODS.includes(args.payment)) {
    throw new Error(`Método de pago inválido "${args.payment}". Usa: ${PAYMENT_METHODS.join(', ')}.`);
  }

  const driver = await findAvailableDriver();
  if (!driver) {
    console.log('No hay conductores Disponibles con la cuenta aprobada. Activa Disponible en la app.');
    return;
  }

  // por defecto, la categoría del vehículo del conductor
  const category = args.category ?? driver.vehicle?.category ?? 'economy';
  const paymentMethod = args.payment ?? pick(PAYMENT_METHODS);

  // origen cerca del conductor y destino a unos km del origen
  const center = driver.location ?? MEDELLIN_CENTER;
  const originPoint = randomPointNear(center, 0.3, 1.5);
  const destinationPoint = randomPointNear(originPoint, 2, 6);

  const route = await getRoute(originPoint, destinationPoint);
  const originAddress = await getAddress(originPoint);
  // Nominatim permite máximo 1 petición por segundo
  await wait(1100);
  const destinationAddress = await getAddress(destinationPoint);

  const { fare, commission, driverEarnings } = calculateFare({
    distanceKm: route.distanceKm,
    durationMin: route.durationMin,
    category,
    tip: 0,
  });

  // campos de la sección 6 del PDF (modelo de datos de trips)
  const trip = {
    driverId: driver.id,
    passengerId: `sim-passenger-${Math.random().toString(36).slice(2, 8)}`,
    passengerName: pick(PASSENGER_NAMES),
    origin: { ...originPoint, address: originAddress },
    destination: { ...destinationPoint, address: destinationAddress },
    distanceKm: route.distanceKm,
    durationMin: route.durationMin,
    category,
    paymentMethod,
    fare,
    commission,
    tip: 0,
    driverEarnings,
    // se guarda la comisión aplicada para que un cambio futuro no altere el historial
    commissionRate: PRICING.commissionRate,
    paymentStatus: 'pending',
    status: 'requested',
    createdAt: FieldValue.serverTimestamp(),
  };

  const ref = await db.collection('trips').add(trip);

  console.log('Solicitud creada:');
  console.log(`  Viaje:      ${ref.id}`);
  console.log(`  Conductor:  ${driver.fullName ?? driver.id}`);
  console.log(`  Pasajero:   ${trip.passengerName}`);
  console.log(`  Origen:     ${originAddress}`);
  console.log(`  Destino:    ${destinationAddress}`);
  console.log(`  Ruta:       ${route.distanceKm} km · ${route.durationMin} min`);
  console.log(`  Categoría:  ${category} · Pago: ${paymentMethod}`);
  console.log(`  Tarifa:     $${fare} · Comisión: $${commission} · Ganancia: $${driverEarnings}`);

  // AI-assisted: see docs/AI_LOG.md #11
  await sendTripNotification(driver, ref.id, trip);
}

// AI-assisted: see docs/AI_LOG.md #11
// Notificación push al conductor. Usa el canal "trip_requests" que crea la app: en Android 8+
// el sonido (new_request.mp3) lo define ese canal. Si falla, el viaje igual queda creado
// y la app lo recibe por Firestore.
async function sendTripNotification(driver, tripId, trip) {
  if (!driver.fcmToken) {
    console.log('  Push:       el conductor no tiene fcmToken; no se envió notificación.');
    return;
  }
  try {
    await messaging.send({
      token: driver.fcmToken,
      notification: {
        title: 'Nueva solicitud de viaje',
        body: `${trip.origin.address} → ${trip.destination.address} · ${formatCOP(trip.fare)}`,
      },
      android: {
        priority: 'high',
        // pasado este tiempo la solicitud ya no se muestra en la app; no tiene sentido entregarla
        ttl: STALE_REQUEST_MS,
        notification: { channelId: 'trip_requests', sound: 'new_request' },
      },
      data: { type: 'trip_request', tripId },
    });
    console.log('  Push:       notificación enviada.');
  } catch (error) {
    console.warn(`  Push:       no se pudo enviar (${error.code ?? error.message}).`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error en el simulador:', error.message);
    process.exit(1);
  });
