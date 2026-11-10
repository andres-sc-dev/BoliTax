// AI-assisted: see docs/AI_LOG.md #4
// Decide qué navegación mostrar según la sesión del conductor.
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AppDrawer from './AppDrawer';
import AuthStack from './AuthStack';
// AI-assisted: see docs/AI_LOG.md #22 — fondo oscuro mientras se restaura la sesión
import { colors } from '../theme';

export default function RootNavigator() {
  const { user, initializing, registering } = useAuth();

  // mientras Firebase restaura la sesión guardada no se sabe si mostrar Login o Drawer
  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // AI-assisted: see docs/AI_LOG.md #6
  // durante el envío del registro se sigue mostrando el formulario aunque ya exista el usuario
  return user && !registering ? <AppDrawer /> : <AuthStack />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
