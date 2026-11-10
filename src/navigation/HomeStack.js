// AI-assisted: see docs/AI_LOG.md #4
// Stack de Inicio: aquí se agregarán las pantallas del flujo del viaje
// (solicitud entrante, viaje en curso, cobro y resumen).
import { useIsFocused } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import IncomingRequestModal from '../components/IncomingRequestModal';
import { AvailabilityProvider } from '../context/AvailabilityContext';
import { TripProvider, useTrip } from '../context/TripContext';
import { useOpenFromNotification } from '../hooks/useOpenFromNotification';
import HomeScreen from '../screens/HomeScreen';
import TripInProgressScreen from '../screens/TripInProgressScreen';

const Stack = createNativeStackNavigator();

// AI-assisted: see docs/AI_LOG.md #10
// Muestra la solicitud entrante encima de cualquier pantalla de la sección Inicio.
// `navigation` es la del Drawer (HomeStack es la pantalla "Home" del Drawer).
function IncomingRequestHost({ navigation }) {
  const { pendingRequest, acceptRequest, rejectRequest } = useTrip();

  // al aceptar se abre la pantalla del viaje dentro de este Stack
  const handleAccept = useCallback(
    async (tripId) => {
      await acceptRequest(tripId);
      navigation.navigate('Home', { screen: 'TripInProgress' });
    },
    [acceptRequest, navigation],
  );

  if (!pendingRequest) return null;
  return (
    <IncomingRequestModal
      // key: cada solicitud nueva empieza con su propio temporizador de 15 s
      key={pendingRequest.id}
      request={pendingRequest}
      onAccept={handleAccept}
      onReject={rejectRequest}
    />
  );
}

export default function HomeStack({ navigation }) {
  // AI-assisted: see docs/AI_LOG.md #8
  // HomeStack es la pantalla "Inicio" del Drawer: useIsFocused aquí es true mientras se vea
  // cualquier pantalla de este Stack, y false al ir a Historial, Ganancias o Perfil
  const sectionFocused = useIsFocused();

  // AI-assisted: see docs/AI_LOG.md #11
  // al abrir la app desde la notificación se lleva al conductor a la sección Inicio,
  // donde la solicitud aparece por Firestore (el modal se muestra sobre cualquier pantalla de Inicio)
  const openHomeSection = useCallback(() => navigation.navigate('Home'), [navigation]);
  useOpenFromNotification(openHomeSection);

  return (
    <AvailabilityProvider sectionFocused={sectionFocused}>
      {/* AI-assisted: see docs/AI_LOG.md #10 — viaje activo y solicitudes (useContext) */}
      <TripProvider>
        <Stack.Navigator>
          {/* el Drawer ya muestra su encabezado, por eso se oculta el del Stack */}
          <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="TripInProgress"
            component={TripInProgressScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
        <IncomingRequestHost navigation={navigation} />
      </TripProvider>
    </AvailabilityProvider>
  );
}
