// AI-assisted: see docs/AI_LOG.md #7
// Inicio del conductor: mapa con su ubicación actual (sección 3).
// El interruptor Disponible / No disponible se agrega en la Fase B.
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import LeafletMap from '../components/LeafletMap';
import { useAuth } from '../context/AuthContext';
import { useDriverLocation } from '../hooks/useDriverLocation';

export default function HomeScreen() {
  const { driver } = useAuth();
  const { permissionStatus, canAskAgain, location, error, retry } = useDriverLocation();

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
        markers={[{ id: 'driver', ...location, label: 'Tú', color: '#111111' }]}
      />
      {driver.status === 'pending' ? (
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Cuenta pendiente de aprobación</Text>
          <Text style={styles.bannerText}>
            Estamos revisando tus documentos. Podrás ponerte Disponible cuando tu cuenta sea
            aprobada.
          </Text>
        </View>
      ) : null}
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
  banner: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: '#fff4e5',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#f0c27b',
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: '#8a5300', marginBottom: 4 },
  bannerText: { fontSize: 14, color: '#5c3b00' },
});
