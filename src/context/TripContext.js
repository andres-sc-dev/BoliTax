// AI-assisted: see docs/AI_LOG.md #10
// Viaje activo y solicitud pendiente del conductor (useContext, como exige la sección 3 del PDF).
// Vive en HomeStack, dentro de AvailabilityProvider, para que todas las pantallas del viaje
// compartan el mismo estado.
import { useAudioPlayer } from 'expo-audio';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTripRequests } from '../hooks/useTripRequests';
import { collection, db, onSnapshot, query, where } from '../services/firebase';
import { acceptTrip, closeTripSummary, rejectTrip } from '../services/trips';
import { pickNextRequest, toMillis } from '../utils/tripRequest';
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

  // AI-assisted: see docs/AI_LOG.md #13
  // Viaje terminado cuyo resumen ("Cobro y resumen") el conductor todavía no cerró.
  // Decisión: se usa un campo en Firestore y no estado local, para que:
  // - si la app se cierra con el resumen abierto, al volver se siga viendo (no se pierde);
  // - al tocar "Volver al inicio" deje de bloquear solicitudes, incluso tras reiniciar la app.
  // AI-assisted: see docs/AI_LOG.md #14
  // Antes se buscaba con paymentStatus == 'pending'; con el cobro, el viaje pasa a approved,
  // rejected o paid y desaparecería de la pantalla. Por eso ahora se usa summaryOpen == true,
  // que no depende del estado del pago (y no crece con el historial).
  const [summaryTrip, setSummaryTrip] = useState(null);
  useEffect(() => {
    if (!uid) {
      setSummaryTrip(null);
      return undefined;
    }
    // solo filtros de igualdad: no necesita índice compuesto
    const summaryQuery = query(
      collection(db, 'trips'),
      where('driverId', '==', uid),
      where('summaryOpen', '==', true),
    );
    const unsubscribe = onSnapshot(
      summaryQuery,
      (snapshot) => {
        const open = snapshot.docs.map((tripDoc) => ({ id: tripDoc.id, ...tripDoc.data() }));
        // el más reciente (completedAt puede ser null un instante mientras se confirma)
        open.sort((a, b) => (toMillis(b.completedAt) ?? Infinity) - (toMillis(a.completedAt) ?? Infinity));
        setSummaryTrip(open[0] ?? null);
      },
      (error) => console.log('Error escuchando el resumen del viaje:', error),
    );
    return unsubscribe;
  }, [uid]);

  // viaje que "ocupa" al conductor: en curso o con el resumen abierto
  const currentTrip = activeTrip ?? summaryTrip;

  // solo se escuchan solicitudes si está Disponible y no tiene un viaje en curso ni un resumen abierto
  const requests = useTripRequests({ uid, enabled: isAvailable && !currentTrip });

  // mientras haya un viaje en curso o un resumen abierto no se muestran solicitudes nuevas
  const pendingRequest = useMemo(
    () => (currentTrip ? null : pickNextRequest(requests, Date.now())),
    [requests, currentTrip],
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
  // AI-assisted: see docs/AI_LOG.md #13
  const closeSummary = useCallback((tripId) => closeTripSummary(tripId), []);

  const value = useMemo(
    () => ({
      activeTrip,
      summaryTrip,
      currentTrip,
      pendingRequest,
      acceptRequest,
      rejectRequest,
      closeSummary,
    }),
    [activeTrip, summaryTrip, currentTrip, pendingRequest, acceptRequest, rejectRequest, closeSummary],
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
