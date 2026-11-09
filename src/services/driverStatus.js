// AI-assisted: see docs/AI_LOG.md #8
// Escrituras de disponibilidad y ubicación en drivers/{uid}.
import { db, doc, serverTimestamp, updateDoc } from './firebase';

// marca al conductor como Disponible o No disponible
export function setDriverAvailability(uid, isAvailable) {
  return updateDoc(doc(db, 'drivers', uid), { isAvailable });
}

// guarda la ubicación actual; solo se llama mientras el conductor está Disponible
export function updateDriverLocation(uid, { lat, lng }) {
  return updateDoc(doc(db, 'drivers', uid), {
    location: { lat, lng },
    isAvailable: true,
    locationUpdatedAt: serverTimestamp(),
  });
}
