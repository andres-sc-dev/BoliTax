// AI-assisted: see docs/AI_LOG.md #7
// Hook de ubicación del conductor (hook personalizado obligatorio según el PDF).
// Fase A: pide el permiso en primer plano y obtiene la posición actual.
// Fase B: agregará el seguimiento en tiempo real mientras esté Disponible.
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
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

export function useDriverLocation() {
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

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return { permissionStatus, canAskAgain, location, error, retry };
}
