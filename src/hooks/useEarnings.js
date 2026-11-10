// AI-assisted: see docs/AI_LOG.md #16
// Hook personalizado obligatorio (sección 3 del PDF): ganancias del conductor.
// - Escucha en tiempo real (onSnapshot) los viajes realizados del conductor; la limpieza del
//   useEffect cancela la suscripción.
// - Calcula con useMemo los totales de hoy, la semana y el mes, y el saldo (sección 5).
import { useEffect, useMemo, useState } from 'react';
import { collection, db, onSnapshot, query, where } from '../services/firebase';
import { calculateDriverBalance } from '../utils/driverBalance';
import { EARNING_STATUSES, getPeriodRange, summarizeTrips } from '../utils/earnings';

export function useEarnings(uid) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) {
      setTrips([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    // solo filtros de igualdad (== e in): no necesita índice compuesto
    const earningsQuery = query(
      collection(db, 'trips'),
      where('driverId', '==', uid),
      where('status', 'in', EARNING_STATUSES),
    );
    const unsubscribe = onSnapshot(
      earningsQuery,
      (snapshot) => {
        setTrips(snapshot.docs.map((tripDoc) => ({ id: tripDoc.id, ...tripDoc.data() })));
        setError(null);
        setLoading(false);
      },
      (snapshotError) => {
        console.log('Error escuchando las ganancias:', snapshotError);
        setError('No se pudieron cargar tus ganancias.');
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [uid]);

  // totales por periodo: solo se recalculan cuando cambian los viajes (useMemo, sección 5).
  // Los rangos usan la hora del momento del cálculo; un viaje nuevo vuelve a calcularlos.
  const periods = useMemo(() => {
    const now = Date.now();
    return {
      today: summarizeTrips(trips, getPeriodRange('today', now)),
      week: summarizeTrips(trips, getPeriodRange('week', now)),
      month: summarizeTrips(trips, getPeriodRange('month', now)),
    };
  }, [trips]);

  // saldo: ganancias de viajes pagados por Wompi menos comisiones de viajes en efectivo
  const balance = useMemo(() => calculateDriverBalance(trips), [trips]);

  // el objeto se memoriza para que quien lo comparta por contexto no re-renderice de más
  return useMemo(() => ({ loading, error, periods, balance }), [loading, error, periods, balance]);
}
