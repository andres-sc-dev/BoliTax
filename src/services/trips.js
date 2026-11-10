// AI-assisted: see docs/AI_LOG.md #10
// Cambios de estado de un viaje desde la app del conductor (sección 3: estados del viaje).
import { db, doc, runTransaction, serverTimestamp, updateDoc } from './firebase';

function tripError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

// Acepta la solicitud. La transacción verifica que siga en "requested": así no se acepta
// una solicitud que ya venció o que se rechazó en otro lado.
export async function acceptTrip(tripId) {
  const tripRef = doc(db, 'trips', tripId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(tripRef);
    if (!snapshot.exists() || snapshot.data().status !== 'requested') {
      throw tripError('trip/not-available', 'Esta solicitud ya no está disponible.');
    }
    transaction.update(tripRef, { status: 'accepted', acceptedAt: serverTimestamp() });
  });
  // el conductor sale de inmediato hacia el punto de recogida
  await updateDoc(tripRef, { status: 'driver_arriving' });
}

// Rechaza la solicitud; reason es 'driver' (tocó Rechazar) o 'timeout' (se venció el tiempo)
export function rejectTrip(tripId, reason) {
  return updateDoc(doc(db, 'trips', tripId), {
    status: 'rejected',
    rejectReason: reason,
    rejectedAt: serverTimestamp(),
  });
}
