// AI-assisted: see docs/AI_LOG.md #11
// Registra el dispositivo para notificaciones push:
// 1. crea el canal de Android con el sonido de solicitudes,
// 2. pide el permiso de notificaciones (Android 13+),
// 3. obtiene el token FCM y lo guarda en drivers/{uid}.fcmToken solo si cambió,
// 4. escucha si FCM renueva el token (limpieza en el useEffect).
import { useEffect } from 'react';
import { saveFcmToken } from '../services/driverStatus';
import { getToken, messaging, onTokenRefresh } from '../services/firebase';
import { requestNotificationPermission, setupTripRequestChannel } from '../services/notifications';

export function usePushToken({ uid, savedToken }) {
  useEffect(() => {
    if (!uid) return undefined;
    let active = true;

    const saveIfChanged = (token) => {
      if (!token || token === savedToken) return;
      saveFcmToken(uid, token).catch((error) =>
        console.log('No se pudo guardar el token de notificaciones:', error),
      );
    };

    async function register() {
      try {
        await setupTripRequestChannel();
        const granted = await requestNotificationPermission();
        if (!granted) {
          // sin permiso igual llegan las solicitudes con la app abierta (Firestore + sonido)
          console.log('Permiso de notificaciones negado: no llegarán avisos en segundo plano.');
        }
        const token = await getToken(messaging);
        if (active) saveIfChanged(token);
      } catch (error) {
        console.log('No se pudo registrar el dispositivo para notificaciones:', error);
      }
    }

    register();
    const unsubscribe = onTokenRefresh(messaging, saveIfChanged);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [uid, savedToken]);
}
