// AI-assisted: see docs/AI_LOG.md #7
// Inicio del conductor: mapa con su ubicación actual e interruptor Disponible / No disponible
// (sección 3). La ubicación y la disponibilidad vienen de AvailabilityContext (HomeStack).
import { useState } from 'react';
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
import { getRoute, reverseGeocode } from '../services/routing';

// AI-assisted: see docs/AI_LOG.md #9
// TEMPORAL: puntos de prueba en Medellín para verificar el servicio de rutas (borrar luego)
const TEST_ORIGIN = { lat: 6.2502, lng: -75.5682 }; // Parque Berrío
const TEST_DESTINATION = { lat: 6.2088, lng: -75.5675 }; // Parque Lleras

export default function HomeScreen() {
  // AI-assisted: see docs/AI_LOG.md #9
  // TEMPORAL: estado de la ruta de prueba
  const [testRoute, setTestRoute] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState(null);
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

  // AI-assisted: see docs/AI_LOG.md #9
  // TEMPORAL: pide la ruta y la dirección de origen en paralelo, o quita la ruta si ya está
  const handleTestRoute = async () => {
    if (testRoute) {
      setTestRoute(null);
      return;
    }
    setTestLoading(true);
    setTestError(null);
    try {
      const [route, originAddress] = await Promise.all([
        getRoute(TEST_ORIGIN, TEST_DESTINATION),
        reverseGeocode(TEST_ORIGIN),
      ]);
      setTestRoute({ ...route, originAddress });
    } catch (routeError) {
      console.log('Error en la ruta de prueba:', routeError.code, routeError.cause);
      setTestError(routeError.message);
    } finally {
      setTestLoading(false);
    }
  };

  const driverMarker = {
    id: 'driver',
    ...location,
    label: 'Tú',
    // AI-assisted: see docs/AI_LOG.md #8
    // verde si está Disponible, negro si no
    color: isAvailable ? '#2e7d32' : '#111111',
  };

  return (
    <View style={styles.container}>
      <LeafletMap
        center={location}
        markers={
          testRoute
            ? [
                driverMarker,
                { id: 'origin', ...TEST_ORIGIN, label: 'Origen (prueba)', color: '#1565c0' },
                { id: 'destination', ...TEST_DESTINATION, label: 'Destino (prueba)', color: '#c62828' },
              ]
            : [driverMarker]
        }
        polyline={testRoute?.coordinates ?? []}
        fitToContent={Boolean(testRoute)}
      />

      {/* AI-assisted: see docs/AI_LOG.md #9 — TEMPORAL: prueba del servicio de rutas */}
      <View style={styles.testPanel}>
        {testRoute ? (
          <Text style={styles.testText}>
            {testRoute.distanceKm} km · {testRoute.durationMin} min{'\n'}
            Origen: {testRoute.originAddress}
          </Text>
        ) : null}
        {testError ? <Text style={styles.errorText}>{testError}</Text> : null}
        <Pressable style={styles.testButton} onPress={handleTestRoute} disabled={testLoading}>
          {testLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {testRoute ? 'Quitar ruta (TEMPORAL)' : 'Probar ruta (TEMPORAL)'}
            </Text>
          )}
        </Pressable>
      </View>

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
  // AI-assisted: see docs/AI_LOG.md #9 — TEMPORAL
  testPanel: {
    position: 'absolute',
    bottom: 24,
    left: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    elevation: 4,
  },
  testText: { fontSize: 14, color: '#222', marginBottom: 8 },
  testButton: {
    backgroundColor: '#1565c0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
});
