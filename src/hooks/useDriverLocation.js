// AI-assisted: see docs/AI_LOG.md #7
// Hook de ubicación del conductor (hook personalizado obligatorio según el PDF).
// Pide el permiso en primer plano y obtiene la posición actual; mientras `active` sea true,
// sigue la ubicación con watchPositionAsync y la envía a drivers/{uid} (Fase B, entrada #8).
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { setDriverAvailability, updateDriverLocation } from '../services/driverStatus';
import { shouldSendLocation } from '../utils/locationThrottle';
import { retryAsync } from '../utils/retryAsync';

// intentos automáticos antes de mostrar el error (1 normal + 2 reintentos)
const LOCATION_ATTEMPTS = 3;
// espera entre intentos: da tiempo a que el GPS (o el emulador) tenga una posición lista
const RETRY_DELAY_MS = 2000;

// convierte la posición de expo-location al formato { lat, lng } que usa la app
function toLatLng(position) {
  return { lat: position.coords.latitude, lng: position.coords.longitude };
}

// un intento: posición actual y, si falla, la última conocida como respaldo
async function getPositionOnce() {
  try {
    return await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  } catch (currentError) {
    // ej: "Current location is unavailable" cuando aún no hay una posición lista
    const lastKnown = await Location.getLastKnownPositionAsync();
    if (lastKnown) return lastKnown;
    throw currentError;
  }
}

// AI-assisted: see docs/AI_LOG.md #8
// opciones de seguimiento: una lectura cada 5 s como mínimo y solo si se movió 10 m o más,
// para no escribir en Firestore por cada movimiento mínimo del GPS.
// Accuracy.High pide el proveedor GPS, que es el que simula el emulador desde Extended controls
// (con Balanced Android puede preferir red/wifi y no entregar esos cambios).
const WATCH_OPTIONS = {
  accuracy: Location.Accuracy.High,
  timeInterval: 5000,
  distanceInterval: 10,
};

// AI-assisted: see docs/AI_LOG.md #7
// uid y active se usan en la Fase B: mientras active sea true, se envía la ubicación a Firestore.
// overrideLocation (modo demo, entrada #12): si no es null reemplaza al GPS en el mapa y en
// Firestore, respetando el mismo límite de escrituras; al volver a null vuelve el GPS real.
export function useDriverLocation({ uid = null, active = false, overrideLocation = null } = {}) {
  // 'checking' | 'granted' | 'denied'
  const [permissionStatus, setPermissionStatus] = useState('checking');
  // false cuando Android ya no deja volver a mostrar el diálogo (hay que ir a ajustes)
  const [canAskAgain, setCanAskAgain] = useState(true);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  // al cambiar este número se repite todo el proceso (botón Reintentar)
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // evita actualizar el estado (y corta los reintentos) si la pantalla se desmonta
    let active = true;

    async function loadLocation() {
      setPermissionStatus('checking');
      setError(null);
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!active) return;
        setCanAskAgain(permission.canAskAgain);
        if (permission.status !== 'granted') {
          setPermissionStatus('denied');
          return;
        }
        setPermissionStatus('granted');

        // se reintenta automáticamente con una espera corta antes de rendirse
        const position = await retryAsync(getPositionOnce, {
          attempts: LOCATION_ATTEMPTS,
          delayMs: RETRY_DELAY_MS,
          shouldContinue: () => active,
        });
        if (active) setLocation(toLatLng(position));
      } catch (locationError) {
        console.log('Error obteniendo la ubicación:', locationError);
        // último recurso: mensaje en pantalla con el botón Reintentar
        if (active) {
          setError('No se pudo obtener tu ubicación. Revisa que la ubicación del dispositivo esté activada.');
        }
      }
    }

    loadLocation();
    return () => {
      active = false;
    };
  }, [attempt]);

  // AI-assisted: see docs/AI_LOG.md #8
  // error del seguimiento en tiempo real (distinto del error al obtener la posición inicial)
  const [trackingError, setTrackingError] = useState(null);
  // última ubicación en una ref, para leerla al activar sin volver a ejecutar el efecto
  const locationRef = useRef(null);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  // AI-assisted: see docs/AI_LOG.md #12
  // ubicación simulada en una ref, para que el watcher del GPS sepa si debe enviar o no
  const overrideRef = useRef(overrideLocation);
  useEffect(() => {
    overrideRef.current = overrideLocation;
  }, [overrideLocation]);

  // última escritura en una ref compartida por el GPS y la simulación: así ambos respetan
  // el mismo límite de una escritura cada 5 s
  const lastSentAtRef = useRef(null);
  const trackingActive = Boolean(active && uid && permissionStatus === 'granted');

  // envía la ubicación respetando el límite de escrituras
  const sendLocation = useCallback(
    (latLng) => {
      const now = Date.now();
      if (!shouldSendLocation(lastSentAtRef.current, now)) return;
      lastSentAtRef.current = now;
      updateDriverLocation(uid, latLng).catch((writeError) =>
        console.log('No se pudo enviar la ubicación:', writeError),
      );
    },
    [uid],
  );

  // AI-assisted: see docs/AI_LOG.md #12
  // modo demo: cada posición simulada pasa por el mismo envío (y el mismo límite) que el GPS
  useEffect(() => {
    if (trackingActive && overrideLocation) sendLocation(overrideLocation);
  }, [trackingActive, overrideLocation, sendLocation]);

  // seguimiento en tiempo real: solo mientras el conductor está Disponible en la sección Inicio
  useEffect(() => {
    if (!trackingActive) return undefined;

    let subscription = null;
    let cancelled = false;
    lastSentAtRef.current = null;

    async function startTracking() {
      setTrackingError(null);
      // al activarse se envía de inmediato la última ubicación conocida (o la simulada)
      const initial = overrideRef.current ?? locationRef.current;
      if (initial) sendLocation(initial);
      try {
        const watcher = await Location.watchPositionAsync(
          WATCH_OPTIONS,
          (position) => {
            const latLng = toLatLng(position);
            setLocation(latLng);
            // durante la simulación el GPS se sigue leyendo, pero no se envía
            if (!overrideRef.current) sendLocation(latLng);
          },
          (watchError) => console.log('Error en el seguimiento de ubicación:', watchError),
        );
        // si el efecto se limpió mientras se iniciaba el seguimiento, se detiene enseguida
        if (cancelled) watcher.remove();
        else subscription = watcher;
      } catch (watchError) {
        console.log('No se pudo iniciar el seguimiento:', watchError);
        if (!cancelled) setTrackingError('No se pudo iniciar el seguimiento de tu ubicación.');
      }
    }

    startTracking();

    // limpieza: al pasar a No disponible o salir de la sección Inicio se detiene el seguimiento
    // y se guarda isAvailable: false
    return () => {
      cancelled = true;
      subscription?.remove();
      setDriverAvailability(uid, false).catch((writeError) =>
        console.log('No se pudo guardar No disponible:', writeError),
      );
    };
  }, [trackingActive, uid, sendLocation]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return {
    permissionStatus,
    canAskAgain,
    // la ubicación simulada (modo demo) tiene prioridad sobre la del GPS
    location: overrideLocation ?? location,
    error,
    trackingError,
    retry,
  };
}
