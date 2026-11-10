// AI-assisted: see docs/AI_LOG.md #10
// Cambios de estado de un viaje desde la app del conductor (sección 3: estados del viaje).
import { PRICING } from '../config/pricing';
import { calculateFare } from '../utils/calculateFare';
import { simulatePassengerRating } from '../utils/passengerRating';
import { simplifyRoute } from '../utils/simplifyRoute';
import { canTransition } from '../utils/tripStatus';
import { db, doc, runTransaction, serverTimestamp, updateDoc } from './firebase';

function tripError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

// AI-assisted: see docs/AI_LOG.md #12
// Cambia el estado del viaje dentro de una transacción: lee el estado ACTUAL en Firestore
// y solo actualiza si la transición está permitida (canTransition). Así dos acciones que
// llegan casi juntas (ej: aceptar justo cuando vence el tiempo) no dejan el viaje inconsistente.
async function transitionTrip(tripId, to, extraFields = {}, invalidMessage) {
  const tripRef = doc(db, 'trips', tripId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(tripRef);
    const from = snapshot.exists() ? snapshot.data().status : null;
    if (!canTransition(from, to)) {
      throw tripError(
        'trip/invalid-transition',
        invalidMessage ?? `El viaje no puede pasar de "${from}" a "${to}".`,
      );
    }
    transaction.update(tripRef, { status: to, ...extraFields });
  });
}

// Acepta la solicitud (requested -> accepted) y sale hacia la recogida (-> driver_arriving).
// Si ya venció o se rechazó, la transición no es válida y se avisa al conductor.
export async function acceptTrip(tripId) {
  await transitionTrip(
    tripId,
    'accepted',
    { acceptedAt: serverTimestamp() },
    'Esta solicitud ya no está disponible.',
  );
  await transitionTrip(tripId, 'driver_arriving');
}

// Rechaza la solicitud; reason es 'driver' (tocó Rechazar) o 'timeout' (se venció el tiempo)
export function rejectTrip(tripId, reason) {
  return transitionTrip(tripId, 'rejected', {
    rejectReason: reason,
    rejectedAt: serverTimestamp(),
  });
}

// AI-assisted: see docs/AI_LOG.md #12
// "Pasajero a bordo": driver_arriving -> in_progress
export function startTrip(tripId) {
  return transitionTrip(tripId, 'in_progress', { pickedUpAt: serverTimestamp() });
}

// Cancelación del conductor; solo es válida antes de in_progress (ver tripStatus.js)
export function cancelTrip(tripId) {
  return transitionTrip(
    tripId,
    'cancelled',
    { cancelledBy: 'driver', cancelledAt: serverTimestamp() },
    'El viaje ya no se puede cancelar.',
  );
}

// AI-assisted: see docs/AI_LOG.md #13
// "Finalizar viaje": in_progress -> completed.
// La tarifa final se calcula con la MISMA función de la estimación (calculateFare, sección 5)
// y se guarda la comisión aplicada, para que un cambio futuro en pricing.js no altere el historial.
// El pago se registra en el módulo siguiente: por ahora queda paymentStatus "pending".
export async function finishTrip(trip, routeCoordinates) {
  const { fare, commission, driverEarnings } = calculateFare({
    distanceKm: trip.distanceKm,
    durationMin: trip.durationMin,
    category: trip.category,
    tip: 0,
  });

  // ruta para dibujar en el historial; si OSRM falló, al menos la línea recta del viaje
  const route =
    Array.isArray(routeCoordinates) && routeCoordinates.length > 1
      ? simplifyRoute(routeCoordinates)
      : [
          { lat: trip.origin.lat, lng: trip.origin.lng },
          { lat: trip.destination.lat, lng: trip.destination.lng },
        ];

  await transitionTrip(
    trip.id,
    'completed',
    {
      fare,
      commission,
      driverEarnings,
      commissionRate: PRICING.commissionRate,
      tip: 0,
      route,
      completedAt: serverTimestamp(),
      paymentStatus: 'pending',
      // AI-assisted: see docs/AI_LOG.md #14
      // el resumen (Cobro y resumen) queda abierto hasta que el conductor toque "Volver al inicio"
      summaryOpen: true,
    },
    'El viaje ya no se puede finalizar.',
  );
}

// "Volver al inicio" en el resumen: marca que el conductor ya lo vio.
// Si el pago no se resolvió, el viaje sigue completed/pending para cobrarlo después.
export function closeTripSummary(tripId) {
  return updateDoc(doc(db, 'trips', tripId), {
    // AI-assisted: see docs/AI_LOG.md #14
    summaryOpen: false,
    summaryClosedAt: serverTimestamp(),
  });
}

// AI-assisted: see docs/AI_LOG.md #15
// "Cobro recibido en efectivo": completed -> paid con paymentStatus "cash" (sección 4 del PDF).
// La plataforma no recibió el dinero, así que la comisión se descuenta del saldo
// (ver utils/driverBalance.js).
export async function markCashPaid(tripId) {
  const tripRef = doc(db, 'trips', tripId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(tripRef);
    const trip = snapshot.exists() ? snapshot.data() : null;
    if (!trip || trip.paymentMethod !== 'cash') {
      throw tripError('trip/not-cash', 'Este viaje no se cobra en efectivo.');
    }
    if (!canTransition(trip.status, 'paid')) {
      throw tripError('trip/invalid-transition', 'Este viaje ya no se puede marcar como pagado.');
    }
    transaction.update(tripRef, {
      status: 'paid',
      paymentStatus: 'cash',
      paidAt: serverTimestamp(),
      // AI-assisted: see docs/AI_LOG.md #17
      // calificación simulada del pasajero (no hay app de pasajero); no se sobrescribe si ya existe
      rating: trip.rating ?? simulatePassengerRating(),
    });
  });
}

// Cambiar el cobro de Wompi a efectivo (el pasajero decidió pagar en efectivo, o Wompi rechazó).
// Solo mientras el viaje no esté pagado ni el pago de Wompi aprobado.
export async function switchToCash(tripId) {
  const tripRef = doc(db, 'trips', tripId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(tripRef);
    const trip = snapshot.exists() ? snapshot.data() : null;
    if (!trip || trip.status !== 'completed' || trip.paymentMethod !== 'wompi') {
      throw tripError('trip/cannot-switch', 'Este viaje ya no se puede cambiar a efectivo.');
    }
    if (trip.paymentStatus === 'approved') {
      throw tripError('trip/already-approved', 'El pago con Wompi ya fue aprobado.');
    }
    transaction.update(tripRef, {
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      paymentMethodChangedAt: serverTimestamp(),
    });
  });
}
