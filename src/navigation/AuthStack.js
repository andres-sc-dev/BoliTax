// AI-assisted: see docs/AI_LOG.md #4
// Stack de autenticación: se muestra cuando no hay sesión.
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      {/* AI-assisted: see docs/AI_LOG.md #20 — el registro tiene su propio encabezado amarillo */}
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
