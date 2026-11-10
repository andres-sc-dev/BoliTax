// AI-assisted: see docs/AI_LOG.md #4
// Stack de Inicio: aquí se agregarán las pantallas del flujo del viaje
// (solicitud entrante, viaje en curso, cobro y resumen).
import { useIsFocused } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef } from 'react';
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
function IncomingRequestHost() {
  const { pendingRequest, acceptRequest, rejectRequest } = useTrip();

  // AI-assisted: see docs/AI_LOG.md #12
  // al aceptar ya no se navega aquí: ActiveTripRedirect abre "Viaje en curso" cuando
  // Firestore confirma el nuevo estado (así la pantalla nunca se abre sin el viaje cargado)
  if (!pendingRequest) return null;
  return (
    <IncomingRequestModal
      // key: cada solicitud nueva empieza con su propio temporizador de 15 s
      key={pendingRequest.id}
      request={pendingRequest}
      onAccept={acceptRequest}
      onReject={rejectRequest}
    />
  );
}

// AI-assisted: see docs/AI_LOG.md #12
// Lleva a la pantalla que corresponde al estado del viaje activo. Se ejecuta cuando aparece
// un viaje (por ejemplo, al reabrir la app en medio de un viaje) o cuando cambia su estado.
// Como solo reacciona a CAMBIOS, no obliga al conductor a volver si fue al mapa de inicio.
function ActiveTripRedirect({ navigation }) {
  const { activeTrip } = useTrip();
  const lastKeyRef = useRef(null);
  const tripKey = activeTrip ? `${activeTrip.id}:${activeTrip.status}` : null;

  useEffect(() => {
    if (tripKey === lastKeyRef.current) return;
    lastKeyRef.current = tripKey;
    if (tripKey) navigation.navigate('Home', { screen: 'TripInProgress' });
  }, [tripKey, navigation]);

  return null;
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
        <IncomingRequestHost />
        {/* AI-assisted: see docs/AI_LOG.md #12 */}
        <ActiveTripRedirect navigation={navigation} />
      </TripProvider>
    </AvailabilityProvider>
  );
}
