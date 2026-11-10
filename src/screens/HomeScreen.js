// AI-assisted: see docs/AI_LOG.md #7
// Inicio del conductor: mapa con su ubicación actual e interruptor Disponible / No disponible
// (sección 3). La ubicación y la disponibilidad vienen de AvailabilityContext (HomeStack).
// AI-assisted: see docs/AI_LOG.md #21
// Rediseño "Damero audaz": mapa oscuro, óvalo amarillo con la ganancia neta de hoy arriba al
// centro (abre Ganancias) y, abajo, el acceso al viaje activo y la tarjeta del interruptor.
// Se eliminó la franja plegable de ganancias. La lógica no cambió.
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Linking, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EarningsPill from '../components/EarningsPill';
import LeafletMap from '../components/LeafletMap';
import { Button, Card, Screen } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useAvailability } from '../context/AvailabilityContext';
import { useTrip } from '../context/TripContext';
import { colors, mapColors, radius, spacing, typography } from '../theme';

export default function HomeScreen({ navigation }) {
  const { driver } = useAuth();
  const insets = useSafeAreaInsets();
  // AI-assisted: see docs/AI_LOG.md #10
  // viaje activo: si existe, se muestra un acceso directo a "Viaje en curso"
  // AI-assisted: see docs/AI_LOG.md #13 — o al resumen, si el viaje ya terminó y no se cerró
  const { currentTrip, activeTrip } = useTrip();
  // AI-assisted: see docs/AI_LOG.md #14 — el resumen puede estar completed o ya paid
  const tripCompleted = Boolean(currentTrip) && !activeTrip;
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
      <CenterState>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.message}>Cargando…</Text>
      </CenterState>
    );
  }

  // permiso negado: mensaje en pantalla (no un Alert) con opciones para resolverlo
  if (permissionStatus === 'denied') {
    return (
      <CenterState icon="location-outline">
        <Text style={styles.title}>Necesitamos tu ubicación</Text>
        <Text style={styles.message}>
          BoliTax usa tu ubicación para mostrarte en el mapa y recibir solicitudes cercanas.
          {canAskAgain
            ? ' Toca Reintentar y elige "Mientras la app está en uso".'
            : ' Activa el permiso de ubicación en los ajustes de la app y luego toca Reintentar.'}
        </Text>
        <View style={styles.actions}>
          <Button title="Reintentar" icon="refresh" onPress={retry} />
          <Button
            title="Abrir ajustes"
            icon="settings-outline"
            variant="secondary"
            onPress={() => Linking.openSettings()}
          />
        </View>
      </CenterState>
    );
  }

  if (error) {
    return (
      <CenterState icon="alert-circle-outline" iconColor={colors.danger}>
        <Text style={styles.message}>{error}</Text>
        <View style={styles.actions}>
          <Button title="Reintentar" icon="refresh" onPress={retry} />
        </View>
      </CenterState>
    );
  }

  if (permissionStatus === 'checking' || !location) {
    return (
      <CenterState>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.message}>Obteniendo tu ubicación…</Text>
      </CenterState>
    );
  }

  const driverMarker = {
    id: 'driver',
    ...location,
    label: 'Tú',
    // AI-assisted: see docs/AI_LOG.md #8
    // AI-assisted: see docs/AI_LOG.md #21 — amarillo con aro si está Disponible, gris si no
    color: isAvailable ? mapColors.driver : mapColors.driverOffline,
    radius: 10,
    halo: isAvailable,
  };

  return (
    <Screen statusBar="light">
      <LeafletMap center={location} markers={[driverMarker]} />

      {/* AI-assisted: see docs/AI_LOG.md #21
          óvalo de ganancias arriba al centro; box-none deja tocar el mapa a los lados */}
      <View style={styles.topArea} pointerEvents="box-none">
        <EarningsPill onPress={() => navigation.navigate('Earnings')} />
      </View>

      {/* AI-assisted: see docs/AI_LOG.md #21 — abajo: viaje activo y disponibilidad */}
      <View
        style={[styles.bottomArea, { bottom: insets.bottom + spacing.lg }]}
        pointerEvents="box-none"
      >
        {/* AI-assisted: see docs/AI_LOG.md #10 — acceso al viaje activo */}
        {currentTrip ? (
          <Card highlight style={styles.floatingCard}>
            <View style={styles.tripRow}>
              <View style={styles.tripIcon}>
                <Ionicons
                  name={tripCompleted ? 'checkmark-done' : 'car-sport'}
                  size={20}
                  color={colors.onPrimary}
                />
              </View>
              <Text style={styles.tripText}>
                {tripCompleted
                  ? `Terminaste el viaje con ${currentTrip.passengerName}.`
                  : `Tienes un viaje en curso con ${currentTrip.passengerName}.`}
              </Text>
            </View>
            <Button
              title={tripCompleted ? 'Ver resumen del viaje' : 'Ver viaje en curso'}
              icon={tripCompleted ? 'receipt-outline' : 'navigate'}
              onPress={() => navigation.navigate(tripCompleted ? 'TripSummary' : 'TripInProgress')}
            />
          </Card>
        ) : null}

        {/* AI-assisted: see docs/AI_LOG.md #8 */}
        <Card style={styles.floatingCard}>
          <View style={styles.switchRow}>
            <View style={styles.statusInfo}>
              <View style={styles.statusLine}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isAvailable ? colors.success : colors.textMuted },
                  ]}
                />
                <Text style={[styles.statusText, isAvailable && styles.statusAvailable]}>
                  {isAvailable ? 'Disponible' : 'No disponible'}
                </Text>
              </View>
              <Text style={styles.hint}>
                {isAvailable
                  ? 'Tu ubicación se comparte mientras estés Disponible.'
                  : 'Activa el interruptor para recibir solicitudes.'}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={setAvailable}
              // solo una cuenta aprobada puede ponerse Disponible
              disabled={!isApproved}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isAvailable ? colors.onPrimary : colors.textMuted}
              accessibilityLabel="Disponible"
            />
          </View>
          {!isApproved ? (
            <View style={styles.notice}>
              <Ionicons name="time-outline" size={20} color={colors.warning} />
              <View style={styles.noticeBody}>
                <Text style={styles.noticeTitle}>
                  {driver.status === 'pending'
                    ? 'Cuenta pendiente de aprobación'
                    : 'Tu cuenta no está habilitada'}
                </Text>
                <Text style={styles.noticeText}>
                  Podrás ponerte Disponible cuando tu cuenta sea aprobada.
                </Text>
              </View>
            </View>
          ) : null}
          {trackingError ? <Text style={styles.errorText}>{trackingError}</Text> : null}
        </Card>
      </View>
    </Screen>
  );
}

// AI-assisted: see docs/AI_LOG.md #21
// estados sin mapa (cargando, permiso negado, error): centrados sobre el fondo oscuro
function CenterState({ icon, iconColor = colors.primary, children }) {
  return (
    <Screen statusBar="light" style={styles.center}>
      {icon ? (
        <View style={styles.centerIcon}>
          <Ionicons name={icon} size={36} color={iconColor} />
        </View>
      ) : null}
      {children}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  centerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: { ...typography.title, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  message: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
  actions: { alignSelf: 'stretch', marginTop: spacing.lg },
  // top: xl deja libre la línea de atribución del mapa (arriba a la derecha)
  topArea: { position: 'absolute', top: spacing.xl, left: 0, right: 0, alignItems: 'center' },
  bottomArea: { position: 'absolute', left: spacing.md, right: spacing.md },
  // sombra para las tarjetas que flotan sobre el mapa
  floatingCard: {
    marginTop: spacing.sm,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  tripRow: { flexDirection: 'row', alignItems: 'center' },
  tripIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  tripText: { ...typography.bodyStrong, color: colors.text, flex: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusInfo: { flex: 1, marginRight: spacing.md },
  statusLine: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  statusText: { ...typography.subtitle, color: colors.textMuted },
  statusAvailable: { color: colors.text },
  hint: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  notice: {
    flexDirection: 'row',
    marginTop: spacing.md,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  noticeBody: { flex: 1, marginLeft: spacing.sm },
  noticeTitle: { ...typography.bodyStrong, color: colors.warning, marginBottom: 2 },
  noticeText: { ...typography.caption, color: colors.text },
  errorText: { ...typography.caption, color: colors.danger, marginTop: spacing.sm },
});
