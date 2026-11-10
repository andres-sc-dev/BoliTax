// AI-assisted: see docs/AI_LOG.md #12
// Estados de un viaje y transiciones permitidas (sección 3 del PDF).
// Los servicios validan con canTransition antes de actualizar Firestore, así un viaje
// no puede saltar estados (por ejemplo, finalizar uno que nunca recogió al pasajero).

export const TRIP_TRANSITIONS = {
  requested: ['accepted', 'rejected'],
  accepted: ['driver_arriving', 'cancelled'],
  driver_arriving: ['in_progress', 'cancelled'],
  // con el pasajero a bordo ya no se puede cancelar (sección 3: "antes de in_progress")
  in_progress: ['completed'],
  completed: ['paid'],
  // estados finales: no tienen salida
  paid: [],
  rejected: [],
  cancelled: [],
};

export function canTransition(from, to) {
  return Boolean(TRIP_TRANSITIONS[from]?.includes(to));
}

// el conductor puede cancelar mientras va hacia el punto de recogida
export function canCancel(status) {
  return canTransition(status, 'cancelled');
}
