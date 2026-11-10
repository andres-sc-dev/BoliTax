// AI-assisted: see docs/AI_LOG.md #11
// Canal de notificaciones de Android y permiso de notificaciones (Android 13+).
// expo-notifications se usa solo para esto; el token FCM y la apertura desde la notificación
// van con @react-native-firebase/messaging (services/firebase.js).
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// el backend envía las solicitudes a este canal (android.notification.channelId)
export const TRIP_REQUEST_CHANNEL_ID = 'trip_requests';

// En Android 8+ el sonido se define en el CANAL, no en cada notificación.
// El archivo se copia a res/raw con el plugin de expo-notifications (app.json > sounds).
// Ojo: Android no deja cambiar el sonido de un canal ya creado (habría que reinstalar la app).
export async function setupTripRequestChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(TRIP_REQUEST_CHANNEL_ID, {
    name: 'Solicitudes de viaje',
    description: 'Avisa cuando llega una nueva solicitud de viaje',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'new_request.mp3',
    vibrationPattern: [0, 400, 200, 400],
  });
}

// pide el permiso de notificaciones; en Android 13+ muestra el diálogo del sistema
// (el canal debe existir antes, si no el diálogo no aparece)
export async function requestNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}
