// AI-assisted: see docs/AI_LOG.md #6
// Inicio del conductor. Por ahora muestra el estado de la cuenta;
// el mapa y el interruptor Disponible / No disponible se agregan después (sección 3).
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import PlaceholderScreen from '../components/PlaceholderScreen';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { driver } = useAuth();

  // el documento del conductor llega por onSnapshot desde AuthContext
  if (!driver) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loading}>Cargando…</Text>
      </View>
    );
  }

  if (driver.status === 'pending') {
    return (
      <View style={styles.center}>
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Cuenta pendiente de aprobación</Text>
          <Text style={styles.noticeText}>
            Hola, {driver.fullName}. Recibimos tu registro y estamos revisando tus documentos.
            Podrás ponerte Disponible cuando tu cuenta sea aprobada.
          </Text>
        </View>
      </View>
    );
  }

  return <PlaceholderScreen title="Inicio" />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  loading: { marginTop: 12, color: '#555' },
  notice: {
    backgroundColor: '#fff4e5',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f0c27b',
  },
  noticeTitle: { fontSize: 18, fontWeight: '700', color: '#8a5300', marginBottom: 8 },
  noticeText: { fontSize: 15, color: '#5c3b00', lineHeight: 21 },
});
