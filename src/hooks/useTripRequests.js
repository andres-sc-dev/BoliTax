// AI-assisted: see docs/AI_LOG.md #10
// Hook personalizado obligatorio (sección 3 del PDF): escucha en tiempo real las solicitudes
// de viaje dirigidas al conductor. Solo escucha mientras `enabled` sea true (Disponible y sin
// viaje activo); la limpieza del useEffect cancela la suscripción.
import { useEffect, useState } from 'react';
import { collection, db, onSnapshot, query, where } from '../services/firebase';
import { rejectTrip } from '../services/trips';
import { isRequestStale } from '../utils/tripRequest';

export function useTripRequests({ uid, enabled }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!uid || !enabled) {
      setRequests([]);
      return undefined;
    }

    // dos filtros de igualdad: Firestore no necesita índice compuesto; el orden se hace en el cliente
    const requestsQuery = query(
      collection(db, 'trips'),
      where('driverId', '==', uid),
      where('status', '==', 'requested'),
    );

    const unsubscribe = onSnapshot(
      requestsQuery,
      (snapshot) => {
        const now = Date.now();
        const list = snapshot.docs.map((tripDoc) => ({ id: tripDoc.id, ...tripDoc.data() }));
        // las solicitudes demasiado viejas (ej: llegaron con la app cerrada) se rechazan solas
        list
          .filter((request) => isRequestStale(request, now))
          .forEach((request) =>
            rejectTrip(request.id, 'timeout').catch((error) =>
              console.log('No se pudo vencer la solicitud vieja:', error),
            ),
          );
        setRequests(list.filter((request) => !isRequestStale(request, now)));
      },
      (error) => console.log('Error escuchando solicitudes de viaje:', error),
    );

    return unsubscribe;
  }, [uid, enabled]);

  return requests;
}
