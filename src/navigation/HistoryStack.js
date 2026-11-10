// AI-assisted: see docs/AI_LOG.md #17
// Sección Historial del Drawer: lista de viajes y detalle de un viaje.
// Los encabezados del Stack se ocultan porque el Drawer ya muestra "Historial";
// el detalle tiene su propio botón para volver.
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HistoryScreen from '../screens/HistoryScreen';
import TripDetailScreen from '../screens/TripDetailScreen';

const Stack = createNativeStackNavigator();

export default function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HistoryList" component={HistoryScreen} />
      <Stack.Screen name="TripDetail" component={TripDetailScreen} />
    </Stack.Navigator>
  );
}
