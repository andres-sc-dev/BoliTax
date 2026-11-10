// AI-assisted: see docs/AI_LOG.md #12
// Ruta OSRM del estado actual del viaje. Se calcula UNA vez al entrar a cada estado
// (recomendación del PDF: no llamar al servicio de rutas en cada movimiento):
// - driver_arriving / accepted: de la ubicación del conductor al punto de recogida.
// - in_progress: de la recogida al destino.
import { useCallback, useEffect, useRef, useState } from 'react';
import { getRoute } from '../services/routing';

const ARRIVING_STATUSES = ['accepted', 'driver_arriving'];

export function useTripRoute(trip, driverLocation) {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  // la ubicación se lee de una ref: así moverse NO vuelve a ejecutar el efecto
  const locationRef = useRef(driverLocation);
  useEffect(() => {
    locationRef.current = driverLocation;
  }, [driverLocation]);
  // solo importa si ya hay ubicación (para la ruta hacia la recogida)
  const hasLocation = Boolean(driverLocation);

  const tripId = trip?.id;
  const status = trip?.status;
  const origin = trip?.origin;
  const destination = trip?.destination;

  useEffect(() => {
    if (!tripId) return undefined;

    let from;
    let to;
    if (ARRIVING_STATUSES.includes(status)) {
      if (!hasLocation) return undefined; // se reintenta cuando llegue la ubicación
      from = locationRef.current;
      to = origin;
    } else if (status === 'in_progress') {
      from = origin;
      to = destination;
    } else {
      return undefined;
    }

    // evita guardar una ruta vieja si el estado cambia mientras se espera la respuesta
    let active = true;
    setLoading(true);
    setError(null);
    setRoute(null);
    getRoute({ lat: from.lat, lng: from.lng }, { lat: to.lat, lng: to.lng })
      .then((result) => {
        if (active) setRoute(result);
      })
      .catch((routeError) => {
        console.log('Error calculando la ruta del viaje:', routeError.code, routeError.cause);
        if (active) setError(routeError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // origin y destination no cambian durante un viaje; basta con id y estado
  }, [tripId, status, hasLocation, attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return { route, loading, error, retry };
}
