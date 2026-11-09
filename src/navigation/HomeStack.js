// AI-assisted: see docs/AI_LOG.md #4
// Stack de Inicio: aquí se agregarán las pantallas del flujo del viaje
// (solicitud entrante, viaje en curso, cobro y resumen).
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator>
      {/* el Drawer ya muestra su encabezado, por eso se oculta el del Stack en la pantalla principal */}
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
