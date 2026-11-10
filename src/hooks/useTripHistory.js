// AI-assisted: see docs/AI_LOG.md #17
// Historial de carreras paginado (sección 6 del PDF): 20 viajes por carga, del más reciente al
// más antiguo, filtrados por rango de fechas y (opcional) método de pago.
// "Cargar más" usa startAfter con el último documento de la página anterior.
// Es una consulta de una sola vez (getDocs), no en tiempo real: así se puede paginar.
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  collection,
  db,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from '../services/firebase';
import { EARNING_STATUSES } from '../utils/earnings';

export const HISTORY_PAGE_SIZE = 20;

// Firestore responde "failed-precondition" cuando la consulta necesita un índice compuesto;
// el mensaje original (con el enlace para crearlo) queda en la consola de Metro
function historyErrorMessage(error) {
  const text = `${error?.code ?? ''} ${error?.message ?? ''}`;
  if (text.includes('failed-precondition') || text.includes('index')) {
    return 'Firestore necesita un índice para este filtro. Revisa la terminal de Metro: ahí está el enlace para crearlo.';
  }
  return 'No se pudo cargar el historial. Inténtalo de nuevo.';
}

export function useTripHistory({ uid, range, paymentMethod }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(null);
  // último documento cargado: cursor para la siguiente página
  const lastDocRef = useRef(null);
  // número de la consulta actual: descarta respuestas viejas si el filtro cambió mientras tanto
  const requestIdRef = useRef(0);

  const rangeStart = range?.start ?? null;
  const rangeEnd = range?.end ?? null;

  // consulta: conductor + viajes realizados + rango + método (opcional), del más reciente al más antiguo
  const buildQuery = useCallback(
    (cursor) => {
      const constraints = [
        where('driverId', '==', uid),
        where('status', 'in', EARNING_STATUSES),
      ];
      if (paymentMethod) constraints.push(where('paymentMethod', '==', paymentMethod));
      constraints.push(
        where('completedAt', '>=', new Date(rangeStart)),
        where('completedAt', '<=', new Date(rangeEnd)),
        orderBy('completedAt', 'desc'),
      );
      if (cursor) constraints.push(startAfter(cursor));
      constraints.push(limit(HISTORY_PAGE_SIZE));
      return query(collection(db, 'trips'), ...constraints);
    },
    [uid, paymentMethod, rangeStart, rangeEnd],
  );

  const toTrips = (snapshot) => snapshot.docs.map((tripDoc) => ({ id: tripDoc.id, ...tripDoc.data() }));

  // primera página (también sirve para recargar)
  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    lastDocRef.current = null;
    if (!uid || rangeStart === null) {
      setTrips([]);
      setHasMore(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const snapshot = await getDocs(buildQuery(null));
      if (requestId !== requestIdRef.current) return;
      setTrips(toTrips(snapshot));
      lastDocRef.current = snapshot.docs[snapshot.docs.length - 1] ?? null;
      setHasMore(snapshot.docs.length === HISTORY_PAGE_SIZE);
    } catch (historyError) {
      if (requestId !== requestIdRef.current) return;
      console.log('Error cargando el historial:', historyError);
      setTrips([]);
      setHasMore(false);
      setError(historyErrorMessage(historyError));
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [uid, rangeStart, buildQuery]);

  // al cambiar un filtro se vuelve a la primera página
  useEffect(() => {
    refresh();
  }, [refresh]);

  // siguiente página, al llegar al final de la lista
  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore || !lastDocRef.current) return;
    const requestId = requestIdRef.current;
    setLoadingMore(true);
    try {
      const snapshot = await getDocs(buildQuery(lastDocRef.current));
      if (requestId !== requestIdRef.current) return;
      const page = toTrips(snapshot);
      // se evitan duplicados por si una página se pidió dos veces
      setTrips((previous) => {
        const known = new Set(previous.map((trip) => trip.id));
        return [...previous, ...page.filter((trip) => !known.has(trip.id))];
      });
      lastDocRef.current = snapshot.docs[snapshot.docs.length - 1] ?? lastDocRef.current;
      setHasMore(snapshot.docs.length === HISTORY_PAGE_SIZE);
    } catch (historyError) {
      console.log('Error cargando más viajes:', historyError);
      setError(historyErrorMessage(historyError));
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, buildQuery]);

  return { trips, loading, loadingMore, hasMore, error, loadMore, refresh };
}
