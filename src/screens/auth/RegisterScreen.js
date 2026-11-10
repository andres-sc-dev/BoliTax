// AI-assisted: see docs/AI_LOG.md #5
// Pantalla de registro: comparte el estado del formulario entre las 3 pestañas.
// AI-assisted: see docs/AI_LOG.md #20
// Encabezado amarillo con damero y botón para volver al login (reemplaza el encabezado del Stack).
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { Screen, YellowHeader } from '../../components/ui';
import { RegisterProvider } from '../../context/RegisterContext';
import RegisterTabs from '../../navigation/RegisterTabs';
import { colors } from '../../theme';

export default function RegisterScreen({ navigation }) {
  return (
    <Screen statusBar="dark">
      <YellowHeader
        safeTop
        title="Crea tu cuenta"
        subtitle="Completa las 3 pestañas para registrarte como conductor."
        left={
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.back}
            accessibilityRole="button"
            accessibilityLabel="Volver al inicio de sesión"
          >
            <Ionicons name="arrow-back" size={24} color={colors.onPrimary} />
          </Pressable>
        }
      />
      <RegisterProvider>
        <RegisterTabs />
      </RegisterProvider>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { padding: 4 },
});
