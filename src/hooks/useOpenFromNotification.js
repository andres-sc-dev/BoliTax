// AI-assisted: see docs/AI_LOG.md #11
// Ejecuta `onOpen` cuando el conductor abre la app tocando una notificación:
// - getInitialNotification: la app estaba cerrada y la notificación la abrió.
// - onNotificationOpenedApp: la app estaba en segundo plano.
// La limpieza del useEffect cancela la suscripción.
import { useEffect } from 'react';
import { getInitialNotification, messaging, onNotificationOpenedApp } from '../services/firebase';

export function useOpenFromNotification(onOpen) {
  useEffect(() => {
    let active = true;
    getInitialNotification(messaging)
      .then((message) => {
        if (active && message) onOpen(message);
      })
      .catch((error) => console.log('No se pudo leer la notificación inicial:', error));

    const unsubscribe = onNotificationOpenedApp(messaging, onOpen);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [onOpen]);
}
