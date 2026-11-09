// AI-assisted: see docs/AI_LOG.md #4
// Stack de Inicio: aquí se agregarán las pantallas del flujo del viaje
// (solicitud entrante, viaje en curso, cobro y resumen).
import { useIsFocused } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AvailabilityProvider } from '../context/AvailabilityContext';
import HomeScreen from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  // AI-assisted: see docs/AI_LOG.md #8
  // HomeStack es la pantalla "Inicio" del Drawer: useIsFocused aquí es true mientras se vea
  // cualquier pantalla de este Stack, y false al ir a Historial, Ganancias o Perfil
  const sectionFocused = useIsFocused();

  return (
    <AvailabilityProvider sectionFocused={sectionFocused}>
      <Stack.Navigator>
        {/* el Drawer ya muestra su encabezado, por eso se oculta el del Stack en la pantalla principal */}
        <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </AvailabilityProvider>
  );
}
