// AI-assisted: see docs/AI_LOG.md #10
// Viaje activo y solicitud pendiente del conductor (useContext, como exige la sección 3 del PDF).
// Vive en HomeStack, dentro de AvailabilityProvider, para que todas las pantallas del viaje
// compartan el mismo estado.
import { useAudioPlayer } from 'expo-audio';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTripRequests } from '../hooks/useTripRequests';
import { collection, db, onSnapshot, query, where } from '../services/firebase';
import { acceptTrip, rejectTrip } from '../services/trips';
import { pickNextRequest } from '../utils/tripRequest';
import { useAuth } from './AuthContext';
import { useAvailability } from './AvailabilityContext';

// estados en los que el viaje está en curso (sección 3 del PDF)
export const ACTIVE_TRIP_STATUSES = ['accepted', 'driver_arriving', 'in_progress'];

const TripContext = createContext(null);

export function TripProvider({ children }) {
  const { user } = useAuth();
  const { isAvailable } = useAvailability();
  const uid = user?.uid ?? null;
  const [activeTrip, setActiveTrip] = useState(null);

  // viaje activo en tiempo real; la limpieza cancela la suscripción
  useEffect(() => {
    if (!uid) {
      setActiveTrip(null);
      return undefined;
    }
    const activeQuery = query(
      collection(db, 'trips'),
      where('driverId', '==', uid),
      where('status', 'in', ACTIVE_TRIP_STATUSES),
    );
    const unsubscribe = onSnapshot(
      activeQuery,
      (snapshot) => {
        const trips = snapshot.docs.map((tripDoc) => ({ id: tripDoc.id, ...tripDoc.data() }));
        setActiveTrip(trips[0] ?? null);
      },
      (error) => console.log('Error escuchando el viaje activo:', error),
    );
    return unsubscribe;
  }, [uid]);

  // solo se escuchan solicitudes si está Disponible y no tiene un viaje activo
  const requests = useTripRequests({ uid, enabled: isAvailable && !activeTrip });

  // mientras haya un viaje activo no se muestran solicitudes nuevas
  const pendingRequest = useMemo(
    () => (activeTrip ? null : pickNextRequest(requests, Date.now())),
    [requests, activeTrip],
  );

  // AI-assisted: see docs/AI_LOG.md #11
  // sonido con la app abierta: suena una vez por cada solicitud nueva que se muestra
  // (en segundo plano suena la notificación del canal "trip_requests")
  const alertPlayer = useAudioPlayer(require('../../assets/sounds/new_request.mp3'));
  const lastAlertedIdRef = useRef(null);
  useEffect(() => {
    const requestId = pendingRequest?.id;
    if (!requestId || requestId === lastAlertedIdRef.current) return;
    lastAlertedIdRef.current = requestId;
    // se vuelve al inicio del audio por si ya había sonado antes
    alertPlayer
      .seekTo(0)
      .catch(() => {})
      .finally(() => alertPlayer.play());
  }, [pendingRequest?.id, alertPlayer]);

  // manejadores con useCallback (sección 3 del PDF)
  const acceptRequest = useCallback((tripId) => acceptTrip(tripId), []);
  const rejectRequest = useCallback((tripId, reason = 'driver') => rejectTrip(tripId, reason), []);

  const value = useMemo(
    () => ({ activeTrip, pendingRequest, acceptRequest, rejectRequest }),
    [activeTrip, pendingRequest, acceptRequest, rejectRequest],
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip debe usarse dentro de TripProvider');
  }
  return context;
}
