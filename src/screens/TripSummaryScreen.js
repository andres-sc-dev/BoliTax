// AI-assisted: see docs/AI_LOG.md #13
// Cobro y resumen del viaje (sección 3 del PDF): tarifa final, comisión, propina, ganancia neta,
// método de pago y estado del pago.
// AI-assisted: see docs/AI_LOG.md #17
// El cobro (Wompi, efectivo, cambio a efectivo y saldo; entradas #14 y #15) se movió al
// componente TripPaymentPanel para reutilizarlo en el detalle del historial.
// Aquí queda la salida: "Volver al inicio" (pagado) o "Volver sin cobrar" (con confirmación).
// AI-assisted: see docs/AI_LOG.md #21
// Rediseño "Damero audaz": encabezado amarillo con damero y la ganancia neta en grande,
// recorrido, desglose de la tarifa y el panel de cobro. La lógica no cambió.
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TripPaymentPanel from '../components/TripPaymentPanel';
import { Button, Card, Screen, YellowHeader } from '../components/ui';
import { useTrip } from '../context/TripContext';
import { colors, mapColors, radius, spacing, typography } from '../theme';
import { formatCOP } from '../utils/formatCurrency';

export default function TripSummaryScreen({ navigation }) {
  const { summaryTrip: trip, closeSummary } = useTrip();
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState(null);
  // AI-assisted: see docs/AI_LOG.md #15 — confirmación de "Volver sin cobrar"
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  // AI-assisted: see docs/AI_LOG.md #21 — margen inferior para la barra de navegación
  const insets = useSafeAreaInsets();

  const goHome = () => navigation.navigate('HomeMain');

  // el resumen llega por onSnapshot unos instantes después de finalizar
  if (!trip) {
    return (
      <Screen statusBar="light" style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>Cargando resumen del viaje…</Text>
        <Button title="Volver al inicio" variant="ghost" onPress={goHome} />
      </Screen>
    );
  }

  // cierra el resumen (con o sin pago) y vuelve a Inicio; el conductor sigue Disponible
  const handleClose = async () => {
    setClosing(true);
    setError(null);
    try {
      await closeSummary(trip.id);
      goHome();
    } catch (closeError) {
      setError(closeError.message ?? 'No se pudo cerrar el resumen.');
      setClosing(false);
    }
  };

  const commissionPercent = Math.round((trip.commissionRate ?? 0) * 100);
  const isPaid = trip.status === 'paid';

  return (
    // el encabezado del Drawer (oscuro) queda arriba: íconos claros en la barra de estado
    <Screen statusBar="light">
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xxl }]}
      >
        {/* AI-assisted: see docs/AI_LOG.md #21 — encabezado con la ganancia neta en grande */}
        <YellowHeader title="Viaje finalizado" subtitle={trip.passengerName}>
          <View style={styles.hero}>
            <Text style={styles.heroLabel}>Tu ganancia neta</Text>
            <Text style={styles.heroAmount}>{formatCOP(trip.driverEarnings)}</Text>
          </View>
        </YellowHeader>

        <View style={styles.content}>
          {/* recorrido con los mismos colores del mapa */}
          <Card>
            <RoutePoint color={mapColors.pickup} value={trip.origin?.address} showLine />
            <RoutePoint color={mapColors.destination} value={trip.destination?.address} />
            <Text style={styles.muted}>
              {trip.distanceKm} km · {trip.durationMin} min
            </Text>
          </Card>

          <Card>
            <Text style={styles.cardTitle}>Detalle de la tarifa</Text>
            <Row label="Tarifa final" value={formatCOP(trip.fare)} strong />
            <Row
              label={`Comisión de la plataforma (${commissionPercent} %)`}
              value={`- ${formatCOP(trip.commission)}`}
            />
            <Row label="Propina" value={formatCOP(trip.tip ?? 0)} />
            <View style={styles.divider} />
            <Row label="Tu ganancia neta" value={formatCOP(trip.driverEarnings)} highlight />
          </Card>

          {/* AI-assisted: see docs/AI_LOG.md #17 — cobro reutilizable */}
          <TripPaymentPanel trip={trip} />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* AI-assisted: see docs/AI_LOG.md #15
              Con el pago resuelto se vuelve directo; sin pagar se puede salir dejando el cobro
              pendiente (con confirmación), para no bloquear al conductor si Wompi o el backend fallan. */}
          {isPaid ? (
            <Button
              title="Volver al inicio"
              icon="home"
              onPress={handleClose}
              loading={closing}
              style={styles.homeButton}
            />
          ) : confirmingLeave ? (
            <View style={styles.confirmBox}>
              <Text style={styles.confirmText}>
                El pago quedará pendiente y podrás cobrarlo más tarde desde el historial. Mientras
                tanto seguirás recibiendo solicitudes.
              </Text>
              <Button
                title="Volver sin cobrar"
                variant="secondary"
                onPress={handleClose}
                loading={closing}
              />
              <Button
                title="Cancelar"
                variant="ghost"
                compact
                onPress={() => setConfirmingLeave(false)}
                disabled={closing}
              />
            </View>
          ) : (
            <Button
              title="Volver sin cobrar"
              variant="ghost"
              onPress={() => setConfirmingLeave(true)}
              style={styles.leaveButton}
              textStyle={styles.leaveText}
            />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value, strong, highlight }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, highlight && styles.rowLabelHighlight]}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.strong, highlight && styles.highlight]}>
        {value}
      </Text>
    </View>
  );
}

// AI-assisted: see docs/AI_LOG.md #21 — punto del recorrido (origen o destino)
function RoutePoint({ color, value, showLine = false }) {
  return (
    <View style={styles.point}>
      <View style={styles.pointMarker}>
        <View style={[styles.pointDot, { backgroundColor: color }]} />
        {showLine ? <View style={styles.pointLine} /> : null}
      </View>
      <Text style={styles.pointValue}>{value ?? '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  scroll: { flexGrow: 1 },
  hero: { marginTop: spacing.lg },
  heroLabel: { ...typography.label, color: colors.onPrimaryMuted, textTransform: 'uppercase' },
  heroAmount: { ...typography.display, color: colors.onPrimary },
  content: { paddingHorizontal: spacing.lg },
  cardTitle: { ...typography.subtitle, color: colors.text, marginBottom: spacing.sm },
  muted: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs },
  point: { flexDirection: 'row' },
  pointMarker: { width: 20, alignItems: 'center' },
  pointDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  pointLine: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 4 },
  pointValue: {
    ...typography.bodyStrong,
    color: colors.text,
    flex: 1,
    marginLeft: spacing.sm,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  rowLabel: { ...typography.body, color: colors.textMuted, flexShrink: 1, marginRight: spacing.sm },
  rowLabelHighlight: { ...typography.bodyStrong, color: colors.text },
  rowValue: { ...typography.bodyStrong, color: colors.text },
  strong: { fontFamily: typography.amount.fontFamily, fontSize: 17 },
  highlight: { ...typography.amount, color: colors.success },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  confirmBox: {
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  confirmText: { ...typography.bodyStrong, color: colors.text },
  error: { ...typography.body, color: colors.danger, textAlign: 'center', marginTop: spacing.md },
  homeButton: { marginTop: spacing.xl },
  leaveButton: { marginTop: spacing.lg },
  leaveText: { textDecorationLine: 'underline' },
});
