// AI-assisted: see docs/AI_LOG.md #4
// Drawer principal: se muestra cuando el conductor tiene sesión.
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { EarningsProvider } from '../context/EarningsContext';
import { usePushToken } from '../hooks/usePushToken';
import EarningsScreen from '../screens/EarningsScreen';
// AI-assisted: see docs/AI_LOG.md #17 — Historial ahora es un Stack (lista y detalle)
import HistoryStack from './HistoryStack';
import ProfileScreen from '../screens/ProfileScreen';
import HomeStack from './HomeStack';

const Drawer = createDrawerNavigator();

// contenido del menú lateral: correo del conductor, las secciones y el botón de cerrar sesión
function DrawerContent(props) {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    // al cerrar sesión, AuthContext pone user en null y RootNavigator vuelve al Login
    signOut().catch((error) => console.log('Error al cerrar sesión:', error));
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Text style={styles.appName}>BoliTax</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>
      <DrawerItemList {...props} />
      <DrawerItem label="Cerrar sesión" onPress={handleSignOut} labelStyle={styles.signOut} />
    </DrawerContentScrollView>
  );
}

export default function AppDrawer() {
  // AI-assisted: see docs/AI_LOG.md #11
  // registra el token FCM con cualquier sesión abierta; espera a que cargue el documento
  // del conductor para comparar con el token ya guardado y no escribir de más
  const { user, driver } = useAuth();
  usePushToken({ uid: driver ? user?.uid : null, savedToken: driver?.fcmToken });

  return (
    // AI-assisted: see docs/AI_LOG.md #16
    // useEarnings se ejecuta una sola vez aquí y lo comparten Ganancias e Inicio
    <EarningsProvider>
      <Drawer.Navigator drawerContent={(props) => <DrawerContent {...props} />}>
        <Drawer.Screen name="Home" component={HomeStack} options={{ title: 'Inicio' }} />
        <Drawer.Screen name="History" component={HistoryStack} options={{ title: 'Historial' }} />
        <Drawer.Screen name="Earnings" component={EarningsScreen} options={{ title: 'Ganancias' }} />
        <Drawer.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Perfil y configuración' }}
        />
      </Drawer.Navigator>
    </EarningsProvider>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 8 },
  appName: { fontSize: 20, fontWeight: '700' },
  email: { color: '#555', marginTop: 4 },
  signOut: { color: '#c62828' },
});
