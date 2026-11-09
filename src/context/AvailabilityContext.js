// AI-assisted: see docs/AI_LOG.md #8
// Disponibilidad del conductor y ubicación en tiempo real, compartidas por TODO el Stack de Inicio.
// Vive en HomeStack (no en HomeScreen) para que el seguimiento continúe en las pantallas
// del viaje (solicitud entrante, viaje en curso) y solo se detenga al salir de la sección Inicio.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useDriverLocation } from '../hooks/useDriverLocation';
import { getLastAvailability, setLastAvailability } from '../services/preferences';
import { useAuth } from './AuthContext';

const AvailabilityContext = createContext(null);

// sectionFocused: true mientras alguna pantalla del Stack de Inicio esté visible
export function AvailabilityProvider({ sectionFocused, children }) {
  const { user, driver } = useAuth();
  const uid = user?.uid ?? null;
  // lo que el conductor eligió en el interruptor
  const [wantsAvailable, setWantsAvailable] = useState(false);

  // solo una cuenta aprobada puede ponerse Disponible
  const isApproved = driver?.status === 'approved';
  const isAvailable = wantsAvailable && isApproved;

  // al abrir, se restaura el último estado guardado en AsyncStorage
  useEffect(() => {
    if (!uid) return undefined;
    let active = true;
    getLastAvailability(uid).then((saved) => {
      if (active) setWantsAvailable(saved);
    });
    return () => {
      active = false;
    };
  }, [uid]);

  // el seguimiento solo corre si está Disponible y en la sección Inicio
  const { permissionStatus, canAskAgain, location, error, trackingError, retry } =
    useDriverLocation({ uid, active: isAvailable && sectionFocused });

  const setAvailable = useCallback(
    (value) => {
      if (value && !isApproved) return;
      setWantsAvailable(value);
      if (uid) setLastAvailability(uid, value);
    },
    [isApproved, uid],
  );

  const value = useMemo(
    () => ({
      permissionStatus,
      canAskAgain,
      location,
      error,
      trackingError,
      retry,
      isAvailable,
      isApproved,
      setAvailable,
    }),
    [
      permissionStatus,
      canAskAgain,
      location,
      error,
      trackingError,
      retry,
      isAvailable,
      isApproved,
      setAvailable,
    ],
  );

  return <AvailabilityContext.Provider value={value}>{children}</AvailabilityContext.Provider>;
}

export function useAvailability() {
  const context = useContext(AvailabilityContext);
  if (!context) {
    throw new Error('useAvailability debe usarse dentro de AvailabilityProvider');
  }
  return context;
}
