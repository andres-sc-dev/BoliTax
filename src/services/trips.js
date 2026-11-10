// AI-assisted: see docs/AI_LOG.md #10
// Cambios de estado de un viaje desde la app del conductor (sección 3: estados del viaje).
import { canTransition } from '../utils/tripStatus';
import { db, doc, runTransaction, serverTimestamp } from './firebase';

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
