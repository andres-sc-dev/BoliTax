// AI-assisted: see docs/AI_LOG.md #7
// Inicio del conductor: mapa con su ubicación actual e interruptor Disponible / No disponible
// (sección 3). La ubicación y la disponibilidad vienen de AvailabilityContext (HomeStack).
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import LeafletMap from '../components/LeafletMap';
import { useAuth } from '../context/AuthContext';
import { useAvailability } from '../context/AvailabilityContext';

export default function HomeScreen() {
  const { driver } = useAuth();
  const {
    permissionStatus,
    canAskAgain,
    location,
    error,
    trackingError,
    retry,
    isAvailable,
    isApproved,
    setAvailable,
  } = useAvailability();

  // el documento del conductor llega por onSnapshot desde AuthContext
  if (!driver) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>Cargando…</Text>
      </View>
    );
  }

  // permiso negado: mensaje en pantalla (no un Alert) con opciones para resolverlo
  if (permissionStatus === 'denied') {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Necesitamos tu ubicación</Text>
        <Text style={styles.message}>
          BoliTax usa tu ubicación para mostrarte en el mapa y recibir solicitudes cercanas.
          {canAskAgain
            ? ' Toca Reintentar y elige "Mientras la app está en uso".'
            : ' Activa el permiso de ubicación en los ajustes de la app y luego toca Reintentar.'}
        </Text>
        <Pressable style={styles.button} onPress={retry}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => Linking.openSettings()}>
          <Text style={styles.secondaryButtonText}>Abrir ajustes</Text>
        </Pressable>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>{error}</Text>
        <Pressable style={styles.button} onPress={retry}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  if (permissionStatus === 'checking' || !location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>Obteniendo tu ubicación…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LeafletMap
        center={location}
        markers={[
          {
            id: 'driver',
            ...location,
            label: 'Tú',
            // AI-assisted: see docs/AI_LOG.md #8
            // verde si está Disponible, negro si no
            color: isAvailable ? '#2e7d32' : '#111111',
          },
        ]}
      />

      {/* AI-assisted: see docs/AI_LOG.md #8 */}
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <Text style={[styles.statusText, isAvailable && styles.statusAvailable]}>
            {isAvailable ? 'Disponible' : 'No disponible'}
          </Text>
          <Switch
            value={isAvailable}
            onValueChange={setAvailable}
            // solo una cuenta aprobada puede ponerse Disponible
            disabled={!isApproved}
          />
        </View>
        {!isApproved ? (
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>
              {driver.status === 'pending'
                ? 'Cuenta pendiente de aprobación'
                : 'Tu cuenta no está habilitada'}
            </Text>
            <Text style={styles.noticeText}>
              Podrás ponerte Disponible cuando tu cuenta sea aprobada.
            </Text>
          </View>
        ) : null}
        {isAvailable ? (
          <Text style={styles.hint}>Tu ubicación se comparte mientras estés Disponible.</Text>
        ) : null}
        {trackingError ? <Text style={styles.errorText}>{trackingError}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  message: { marginTop: 12, color: '#444', textAlign: 'center', lineHeight: 21 },
  button: {
    backgroundColor: '#111',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  secondaryButton: { paddingVertical: 12, paddingHorizontal: 24, marginTop: 8 },
  secondaryButtonText: { color: '#1565c0', fontWeight: '600', fontSize: 16 },
  card: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusText: { fontSize: 18, fontWeight: '700', color: '#555' },
  statusAvailable: { color: '#2e7d32' },
  notice: {
    marginTop: 10,
    backgroundColor: '#fff4e5',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f0c27b',
  },
  noticeTitle: { fontSize: 15, fontWeight: '700', color: '#8a5300', marginBottom: 2 },
  noticeText: { fontSize: 13, color: '#5c3b00' },
  hint: { marginTop: 8, fontSize: 13, color: '#555' },
  errorText: { marginTop: 8, fontSize: 13, color: '#c62828' },
});
