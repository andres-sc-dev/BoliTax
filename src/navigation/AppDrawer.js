// AI-assisted: see docs/AI_LOG.md #4
// Drawer principal: se muestra cuando el conductor tiene sesión.
// AI-assisted: see docs/AI_LOG.md #22
// Rediseño "Damero audaz": encabezado amarillo con el logotipo, la foto y el nombre del
// conductor y el estado de la cuenta, franja de damero, ítems con íconos (el activo en
// amarillo) y Cerrar sesión. Ganancias, Historial y Perfil ocultan el encabezado del Drawer
// porque llevan su propio encabezado amarillo con el botón de menú (como el registro).
import { Ionicons } from '@expo/vector-icons';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  getDrawerStatusFromState,
} from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, Text, View } from 'react-native';
import Logotype from '../components/brand/Logotype';
import { Badge, YellowHeader } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { EarningsProvider } from '../context/EarningsContext';
import { useLanguage } from '../context/LanguageContext';
import { usePushToken } from '../hooks/usePushToken';
import EarningsScreen from '../screens/EarningsScreen';
// AI-assisted: see docs/AI_LOG.md #17 — Historial ahora es un Stack (lista y detalle)
import HistoryStack from './HistoryStack';
import ProfileScreen from '../screens/ProfileScreen';
import HomeStack from './HomeStack';
import { colors, fonts, radius, spacing, typography } from '../theme';

const Drawer = createDrawerNavigator();

// AI-assisted: see docs/AI_LOG.md #22 — color del Badge según el estado de la cuenta
const ACCOUNT_STATUS_COLORS = {
  approved: colors.success,
  pending: colors.warning,
  other: colors.danger,
};

// ícono de un ítem del menú (toma el color activo o inactivo que le pasa el Drawer)
const drawerIcon = (name) => ({ color }) => <Ionicons name={name} size={22} color={color} />;

// contenido del menú lateral: datos del conductor, las secciones y el botón de cerrar sesión
function DrawerContent(props) {
  const { user, driver, signOut } = useAuth();
  // AI-assisted: see docs/AI_LOG.md #18 — textos traducidos con el diccionario propio
  const { t } = useLanguage();

  const handleSignOut = () => {
    // al cerrar sesión, AuthContext pone user en null y RootNavigator vuelve al Login
    signOut().catch((error) => console.log('Error al cerrar sesión:', error));
  };

  // AI-assisted: see docs/AI_LOG.md #22
  const statusKey =
    driver?.status === 'approved' || driver?.status === 'pending' ? driver.status : 'other';

  // AI-assisted: see docs/AI_LOG.md #22
  // con el menú abierto, íconos oscuros en la barra de estado (van sobre el amarillo).
  // Al cerrarse, este StatusBar se desmonta y vuelve el estilo de la pantalla visible.
  const drawerOpen = getDrawerStatusFromState(props.state) === 'open';

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.scroll}>
      {drawerOpen ? <StatusBar style="dark" /> : null}
      {/* encabezado amarillo hasta arriba (cubre la barra de estado) */}
      <YellowHeader safeTop contentStyle={styles.header}>
        <Logotype variant="onYellow" width={168} />
        <View style={styles.driverRow}>
          {driver?.profilePhotoUrl ? (
            <Image source={{ uri: driver.profilePhotoUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarEmpty]}>
              <Ionicons name="person" size={26} color={colors.primary} />
            </View>
          )}
          <View style={styles.driverInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {driver?.fullName ?? t('drawer.driver')}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {user?.email}
            </Text>
            {driver ? (
              <Badge
                label={t(`profile.status.${statusKey}`)}
                color={ACCOUNT_STATUS_COLORS[statusKey]}
                // fondo negro: el Badge se lee sobre el amarillo
                style={styles.badge}
              />
            ) : null}
          </View>
        </View>
      </YellowHeader>

      <View style={styles.items}>
        <DrawerItemList {...props} />
      </View>

      <View style={styles.footer}>
        <DrawerItem
          label={t('drawer.signOut')}
          onPress={handleSignOut}
          icon={drawerIcon('log-out-outline')}
          inactiveTintColor={colors.danger}
          labelStyle={styles.label}
          style={styles.item}
        />
      </View>
    </DrawerContentScrollView>
  );
}

export default function AppDrawer() {
  // AI-assisted: see docs/AI_LOG.md #11
  // registra el token FCM con cualquier sesión abierta; espera a que cargue el documento
  // del conductor para comparar con el token ya guardado y no escribir de más
  const { user, driver } = useAuth();
  usePushToken({ uid: driver ? user?.uid : null, savedToken: driver?.fcmToken });
  // AI-assisted: see docs/AI_LOG.md #18 — títulos del menú en el idioma elegido
  const { t } = useLanguage();

  return (
    // AI-assisted: see docs/AI_LOG.md #16
    // useEarnings se ejecuta una sola vez aquí y lo comparten Ganancias e Inicio
    <EarningsProvider>
      <Drawer.Navigator
        drawerContent={(props) => <DrawerContent {...props} />}
        // AI-assisted: see docs/AI_LOG.md #22 — estilo del menú y del encabezado de Inicio
        screenOptions={{
          drawerStyle: styles.drawer,
          drawerActiveBackgroundColor: colors.primary,
          drawerActiveTintColor: colors.onPrimary,
          drawerInactiveTintColor: colors.text,
          drawerLabelStyle: styles.label,
          drawerItemStyle: styles.item,
          headerStyle: styles.headerBar,
          headerTintColor: colors.primary,
          headerTitleStyle: styles.headerTitle,
        }}
      >
        <Drawer.Screen
          name="Home"
          component={HomeStack}
          options={{ title: t('drawer.home'), drawerIcon: drawerIcon('map') }}
        />
        <Drawer.Screen
          name="History"
          component={HistoryStack}
          options={{
            title: t('drawer.history'),
            drawerIcon: drawerIcon('time'),
            headerShown: false,
          }}
        />
        <Drawer.Screen
          name="Earnings"
          component={EarningsScreen}
          options={{
            title: t('drawer.earnings'),
            drawerIcon: drawerIcon('wallet'),
            headerShown: false,
          }}
        />
        <Drawer.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: t('drawer.profile'),
            drawerIcon: drawerIcon('person-circle'),
            headerShown: false,
          }}
        />
      </Drawer.Navigator>
    </EarningsProvider>
  );
}

const styles = StyleSheet.create({
  drawer: { backgroundColor: colors.background, width: 300 },
  // sin el margen superior por defecto: el amarillo llega hasta arriba
  scroll: { paddingTop: 0, paddingStart: 0, paddingEnd: 0, flexGrow: 1 },
  header: { paddingBottom: spacing.xl },
  driverRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg },
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: colors.onPrimary },
  avatarEmpty: { backgroundColor: colors.onPrimary, alignItems: 'center', justifyContent: 'center' },
  driverInfo: { flex: 1, marginLeft: spacing.md },
  name: { ...typography.subtitle, color: colors.onPrimary },
  email: { ...typography.caption, color: colors.onPrimaryMuted },
  badge: { backgroundColor: colors.onPrimary, marginTop: spacing.sm },
  items: { paddingHorizontal: spacing.sm, paddingTop: spacing.md },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  item: { borderRadius: radius.md },
  label: { fontFamily: fonts.semibold, fontSize: 15 },
  headerBar: { backgroundColor: colors.background },
  headerTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
});
