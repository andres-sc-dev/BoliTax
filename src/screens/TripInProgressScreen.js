// AI-assisted: see docs/AI_LOG.md #12
// Viaje en curso (sección 3 del PDF): la pantalla depende del campo status del viaje.
// - driver_arriving: ruta del conductor al punto de recogida y botón "Pasajero a bordo".
// - in_progress: ruta de la recogida al destino y botón "Finalizar viaje" (entrada #13).
// Cancelar solo es posible antes de in_progress, con confirmación dentro de la pantalla.
// AI-assisted: see docs/AI_LOG.md #21
// Rediseño "Damero audaz": mapa oscuro con la ruta amarilla y un panel inferior tipo hoja
// (pasajero, dirección, km/min y botones). El modo demo se ve discreto. La lógica no cambió.
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LeafletMap from '../components/LeafletMap';
import { Badge, Button, Screen } from '../components/ui';
import { useAvailability } from '../context/AvailabilityContext';
import { useTrip } from '../context/TripContext';
import { useRouteSimulation } from '../hooks/useRouteSimulation';
import { useTripRoute } from '../hooks/useTripRoute';
import { cancelTrip, finishTrip, startTrip } from '../services/trips';
import { colors, mapColors, radius, spacing, typography } from '../theme';
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
  // AI-assisted: see docs/AI_LOG.md #21 — margen inferior para la barra de navegación
  const insets = useSafeAreaInsets();

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
  // AI-assisted: see docs/AI_LOG.md #21 — colores del mapa oscuro (theme/mapColors)
  const markers = [];
  if (location) {
    markers.push({
      id: 'driver',
      ...location,
      label: 'Tú',
      color: mapColors.driver,
      radius: 10,
      halo: true,
    });
  }
  markers.push({
    id: 'pickup',
    lat: trip.origin.lat,
    lng: trip.origin.lng,
    label: 'Recogida',
    color: mapColors.pickup,
  });
  if (!onPickupLeg) {
    markers.push({
      id: 'destination',
      lat: trip.destination.lat,
      lng: trip.destination.lng,
      label: 'Destino',
      color: mapColors.destination,
    });
  }

  const busyAny = busy !== null;

  return (
    <Screen statusBar="light">
      <LeafletMap
        center={location ?? { lat: trip.origin.lat, lng: trip.origin.lng }}
        markers={markers}
        polyline={route?.coordinates ?? []}
        fitToContent
      />

      {/* AI-assisted: see docs/AI_LOG.md #21 — panel inferior tipo hoja */}
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.handle} />

        <Badge
          label={onPickupLeg ? 'Rumbo a la recogida' : 'Pasajero a bordo'}
          color={onPickupLeg ? colors.primary : colors.success}
        />

        {/* pasajero */}
        <View style={styles.passengerRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={22} color={colors.onPrimary} />
          </View>
          <Text style={styles.stage} numberOfLines={2}>
            {onPickupLeg ? `Recoge a ${trip.passengerName}` : `Llevando a ${trip.passengerName}`}
          </Text>
        </View>

        {/* dirección del tramo actual, con el color del punto en el mapa */}
        <View style={styles.addressRow}>
          <View
            style={[
              styles.addressDot,
              { backgroundColor: onPickupLeg ? mapColors.pickup : mapColors.destination },
            ]}
          />
          <View style={styles.addressText}>
            <Text style={styles.label}>{onPickupLeg ? 'Punto de recogida' : 'Destino'}</Text>
            <Text style={styles.address}>
              {onPickupLeg ? trip.origin.address : trip.destination.address}
            </Text>
          </View>
        </View>

        {/* distancia y tiempo de la ruta del estado actual */}
        {routeLoading ? (
          <ActivityIndicator style={styles.routeLoading} color={colors.primary} />
        ) : route ? (
          <View style={styles.stats}>
            <Stat icon="speedometer-outline" value={route.distanceKm} unit="km" />
            <Stat icon="time-outline" value={route.durationMin} unit="min" />
          </View>
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
              <Button
                title="No"
                variant="secondary"
                onPress={() => setConfirmingCancel(false)}
                disabled={busyAny}
                style={[styles.rowButton, styles.rowButtonLeft]}
              />
              <Button
                title="Sí, cancelar"
                variant="danger"
                onPress={handleConfirmCancel}
                loading={busy === 'cancel'}
                disabled={busyAny}
                style={styles.rowButton}
              />
            </View>
          </View>
        ) : (
          <>
            {onPickupLeg ? (
              <Button
                title="Pasajero a bordo"
                icon="person-add"
                onPress={handlePickedUp}
                loading={busy === 'start'}
                disabled={busyAny}
              />
            ) : (
              // AI-assisted: see docs/AI_LOG.md #13 — solo en in_progress
              <Button
                title="Finalizar viaje"
                icon="flag"
                onPress={handleFinish}
                loading={busy === 'finish'}
                disabled={busyAny}
              />
            )}
            {canCancel(status) ? (
              <Button
                title="Cancelar viaje"
                variant="ghost"
                compact
                onPress={() => setConfirmingCancel(true)}
                disabled={busyAny}
                textStyle={styles.cancelText}
              />
            ) : null}
          </>
        )}

        {/* pie: acceso al mapa de inicio y, solo en desarrollo, el modo demo */}
        <View style={styles.footer}>
          <Pressable
            style={styles.footerLink}
            onPress={() => navigation.navigate('HomeMain')}
            hitSlop={6}
          >
            <Ionicons name="map-outline" size={16} color={colors.textMuted} />
            <Text style={styles.footerText}>Ir al mapa de inicio</Text>
          </Pressable>

          {/* AI-assisted: see docs/AI_LOG.md #12 — modo demo, solo en desarrollo (__DEV__) */}
          {__DEV__ && route ? (
            <Pressable
              style={[styles.demoButton, simulation.running && styles.demoRunning]}
              onPress={simulation.start}
              disabled={simulation.running}
              hitSlop={6}
            >
              <Ionicons name="flask-outline" size={14} color={colors.textMuted} />
              <Text style={styles.demoText}>
                {simulation.running
                  ? 'Simulando recorrido…'
                  : simulation.finished
                    ? 'Repetir recorrido (demo)'
                    : 'Simular recorrido (demo)'}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

// AI-assisted: see docs/AI_LOG.md #21 — dato grande de la ruta (km o min)
function Stat({ icon, value, unit }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    // borde amarillo arriba: es el viaje activo
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: colors.primary,
    elevation: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  passengerRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stage: { ...typography.subtitle, color: colors.text, flex: 1 },
  addressRow: { flexDirection: 'row', marginTop: spacing.lg },
  addressDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4, marginRight: spacing.md },
  addressText: { flex: 1 },
  label: { ...typography.caption, color: colors.textMuted, textTransform: 'uppercase' },
  address: { ...typography.bodyStrong, color: colors.text },
  routeLoading: { marginVertical: spacing.md },
  stats: { flexDirection: 'row', marginTop: spacing.md },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  statValue: { ...typography.amount, color: colors.text, marginLeft: spacing.sm },
  statUnit: { ...typography.label, color: colors.textMuted, marginLeft: 4, marginTop: 4 },
  hint: { ...typography.body, color: colors.textMuted, marginVertical: spacing.sm },
  error: { ...typography.body, color: colors.danger, marginVertical: spacing.sm },
  confirmBox: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  confirmText: { ...typography.bodyStrong, color: colors.text },
  row: { flexDirection: 'row' },
  // flex solo en los botones que comparten fila (ver corrección de la entrada #12)
  rowButton: { flex: 1 },
  rowButtonLeft: { marginRight: spacing.sm },
  cancelText: { color: colors.danger },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerLink: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  footerText: { ...typography.label, color: colors.textMuted, marginLeft: 6 },
  // AI-assisted: see docs/AI_LOG.md #12 — modo demo (estilo discreto, entrada #21)
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  demoRunning: { opacity: 0.6 },
  demoText: { ...typography.caption, color: colors.textMuted, marginLeft: 6 },
});
