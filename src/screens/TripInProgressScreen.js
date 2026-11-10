// AI-assisted: see docs/AI_LOG.md #12
// Viaje en curso (sección 3 del PDF): la pantalla depende del campo status del viaje.
// - driver_arriving: ruta del conductor al punto de recogida y botón "Pasajero a bordo".
// - in_progress: ruta de la recogida al destino y botón "Finalizar viaje" (entrada #13).
// Cancelar solo es posible antes de in_progress, con confirmación dentro de la pantalla.
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import LeafletMap from '../components/LeafletMap';
import { useAvailability } from '../context/AvailabilityContext';
import { useTrip } from '../context/TripContext';
import { useRouteSimulation } from '../hooks/useRouteSimulation';
import { useTripRoute } from '../hooks/useTripRoute';
import { cancelTrip, finishTrip, startTrip } from '../services/trips';
import { canCancel } from '../utils/tripStatus';

export default function TripInProgressScreen({ navigation }) {
  const { activeTrip: trip, summaryTrip } = useTrip();
  const { location } = useAvailability();
  const { route, loading: routeLoading, error: routeError, retry } = useTripRoute(trip, location);
  // acción en curso: 'start' | 'cancel' | 'finish' | null (bloquea los botones)
  const [busy, setBusy] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const isFocused = useIsFocused();

  // sin viaje activo (cancelado, o ya no existe) se vuelve a Inicio.
  // AI-assisted: see docs/AI_LOG.md #13
  // Solo si esta pantalla tiene el foco y no hay un resumen abierto: al finalizar, el viaje
  // deja de estar "activo" y la navegación al resumen la hace "Finalizar" / ActiveTripRedirect.
  const hasSummary = Boolean(summaryTrip);
  useEffect(() => {
    if (!trip && !hasSummary && isFocused) navigation.navigate('HomeMain');
  }, [trip, hasSummary, isFocused, navigation]);

  // al cambiar de estado se cierra la confirmación de cancelar y se limpia el error
  const status = trip?.status;

  // AI-assisted: see docs/AI_LOG.md #12
  // modo demo: recorre la ruta actual; se reinicia (y vuelve el GPS) si cambia el estado
  // del viaje o la pantalla pierde el foco
  const simulation = useRouteSimulation({
    coordinates: route?.coordinates,
    resetKey: `${trip?.id}:${status}:${isFocused}`,
  });
  useEffect(() => {
    setConfirmingCancel(false);
    setActionError(null);
  }, [status]);

  if (!trip) return null;

  const onPickupLeg = status === 'accepted' || status === 'driver_arriving';

  // ejecuta una acción del viaje mostrando el error dentro de la pantalla (no Alert)
  const runAction = async (name, action) => {
    setBusy(name);
    setActionError(null);
    try {
      await action();
      return true;
    } catch (error) {
      setActionError(error.message ?? 'No se pudo completar la acción.');
      return false;
    } finally {
      setBusy(null);
    }
  };

  const handlePickedUp = () => runAction('start', () => startTrip(trip.id));

  // AI-assisted: see docs/AI_LOG.md #13
  // "Finalizar viaje": guarda tarifa final y ruta, y abre el resumen
  const handleFinish = async () => {
    const finished = await runAction('finish', () => finishTrip(trip, route?.coordinates));
    if (finished) navigation.navigate('TripSummary');
  };

  const handleConfirmCancel = async () => {
    const cancelled = await runAction('cancel', () => cancelTrip(trip.id));
    if (cancelled) navigation.navigate('HomeMain');
  };

  // marcadores según el estado: conductor en vivo + recogida (+ destino a bordo)
  const markers = [];
  if (location) markers.push({ id: 'driver', ...location, label: 'Tú', color: '#2e7d32' });
  markers.push({
    id: 'pickup',
    lat: trip.origin.lat,
    lng: trip.origin.lng,
    label: 'Recogida',
    color: '#1565c0',
  });
  if (!onPickupLeg) {
    markers.push({
      id: 'destination',
      lat: trip.destination.lat,
      lng: trip.destination.lng,
      label: 'Destino',
      color: '#c62828',
    });
  }

  return (
    <View style={styles.container}>
      <LeafletMap
        center={location ?? { lat: trip.origin.lat, lng: trip.origin.lng }}
        markers={markers}
        polyline={route?.coordinates ?? []}
        fitToContent
      />

      <View style={styles.panel}>
        <Text style={styles.stage}>
          {onPickupLeg ? `Recoge a ${trip.passengerName}` : `Llevando a ${trip.passengerName}`}
        </Text>
        <Text style={styles.label}>{onPickupLeg ? 'Punto de recogida' : 'Destino'}</Text>
        <Text style={styles.address}>
          {onPickupLeg ? trip.origin.address : trip.destination.address}
        </Text>

        {/* distancia y tiempo de la ruta del estado actual */}
        {routeLoading ? (
          <ActivityIndicator style={styles.routeInfo} />
        ) : route ? (
          <Text style={styles.routeInfo}>
            {route.distanceKm} km · {route.durationMin} min
          </Text>
        ) : null}
        {routeError ? (
          <Pressable onPress={retry}>
            <Text style={styles.error}>{routeError} Toca para reintentar.</Text>
          </Pressable>
        ) : null}
        {onPickupLeg && !location && !routeLoading ? (
          <Text style={styles.hint}>Esperando tu ubicación para calcular la ruta…</Text>
        ) : null}

        {actionError ? <Text style={styles.error}>{actionError}</Text> : null}

        {confirmingCancel ? (
          // confirmación dentro de la pantalla, no en un Alert
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>¿Seguro que quieres cancelar este viaje?</Text>
            <View style={styles.row}>
              <Pressable
                style={[styles.button, styles.rowButton, styles.outlineButton]}
                onPress={() => setConfirmingCancel(false)}
                disabled={busy !== null}
              >
                <Text style={styles.outlineText}>No</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.rowButton, styles.dangerButton]}
                onPress={handleConfirmCancel}
                disabled={busy !== null}
              >
                {busy === 'cancel' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sí, cancelar</Text>
                )}
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            {onPickupLeg ? (
              <Pressable
                style={[styles.button, styles.primaryButton]}
                onPress={handlePickedUp}
                disabled={busy !== null}
              >
                {busy === 'start' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Pasajero a bordo</Text>
                )}
              </Pressable>
            ) : (
              // AI-assisted: see docs/AI_LOG.md #13 — solo en in_progress
              <Pressable
                style={[styles.button, styles.finishButton]}
                onPress={handleFinish}
                disabled={busy !== null}
              >
                {busy === 'finish' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Finalizar viaje</Text>
                )}
              </Pressable>
            )}
            {canCancel(status) ? (
              <Pressable
                style={styles.linkButton}
                onPress={() => setConfirmingCancel(true)}
                disabled={busy !== null}
              >
                <Text style={styles.linkText}>Cancelar viaje</Text>
              </Pressable>
            ) : null}
          </>
        )}

        {/* AI-assisted: see docs/AI_LOG.md #12 — modo demo, solo en desarrollo (__DEV__) */}
        {__DEV__ && route ? (
          <Pressable
            style={[styles.button, styles.demoButton]}
            onPress={simulation.start}
            disabled={simulation.running}
          >
            <Text style={styles.demoText}>
              {simulation.running
                ? 'Simulando recorrido…'
                : simulation.finished
                  ? 'Repetir recorrido (demo)'
                  : 'Simular recorrido (demo)'}
            </Text>
          </Pressable>
        ) : null}

        <Pressable style={styles.linkButton} onPress={() => navigation.navigate('HomeMain')}>
          <Text style={styles.mapLink}>Ir al mapa de inicio</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  panel: {
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 8,
  },
  stage: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  label: { fontSize: 12, color: '#777', textTransform: 'uppercase' },
  address: { fontSize: 16, color: '#222', marginBottom: 4 },
  routeInfo: { fontSize: 15, color: '#1565c0', fontWeight: '600', marginVertical: 6 },
  hint: { color: '#777', marginVertical: 6 },
  error: { color: '#c62828', marginVertical: 6 },
  row: { flexDirection: 'row', gap: 8 },
  // sin flex: 1 aquí: en el panel (columna de alto automático) flex: 1 deja el botón con
  // alto 0 y el texto se recorta; solo los botones que comparten fila usan rowButton
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  rowButton: { flex: 1 },
  primaryButton: { backgroundColor: '#2e7d32' },
  dangerButton: { backgroundColor: '#c62828' },
  finishButton: { backgroundColor: '#111' },
  outlineButton: { borderWidth: 2, borderColor: '#555' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  outlineText: { color: '#333', fontWeight: '700', fontSize: 16 },
  confirmBox: { backgroundColor: '#fdecea', borderRadius: 10, padding: 12, marginTop: 8 },
  confirmText: { color: '#7f1d1d', fontWeight: '600' },
  linkButton: { alignItems: 'center', paddingVertical: 10 },
  linkText: { color: '#c62828', fontWeight: '600' },
  mapLink: { color: '#1565c0', fontWeight: '600' },
  // AI-assisted: see docs/AI_LOG.md #12 — modo demo
  demoButton: { borderWidth: 1, borderColor: '#6a1b9a', borderStyle: 'dashed' },
  demoText: { color: '#6a1b9a', fontWeight: '600' },
});
