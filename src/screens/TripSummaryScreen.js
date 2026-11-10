// AI-assisted: see docs/AI_LOG.md #13
// Cobro y resumen del viaje (sección 3 del PDF): tarifa final, comisión, propina, ganancia neta,
// método de pago y estado del pago.
// AI-assisted: see docs/AI_LOG.md #17
// El cobro (Wompi, efectivo, cambio a efectivo y saldo; entradas #14 y #15) se movió al
// componente TripPaymentPanel para reutilizarlo en el detalle del historial.
// Aquí queda la salida: "Volver al inicio" (pagado) o "Volver sin cobrar" (con confirmación).
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import TripPaymentPanel from '../components/TripPaymentPanel';
import { useTrip } from '../context/TripContext';
import { formatCOP } from '../utils/formatCurrency';

export default function TripSummaryScreen({ navigation }) {
  const { summaryTrip: trip, closeSummary } = useTrip();
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState(null);
  // AI-assisted: see docs/AI_LOG.md #15 — confirmación de "Volver sin cobrar"
  const [confirmingLeave, setConfirmingLeave] = useState(false);

  const goHome = () => navigation.navigate('HomeMain');

  // el resumen llega por onSnapshot unos instantes después de finalizar
  if (!trip) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Cargando resumen del viaje…</Text>
        <Pressable style={styles.linkButton} onPress={goHome}>
          <Text style={styles.link}>Volver al inicio</Text>
        </Pressable>
      </View>
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Viaje finalizado</Text>
      <Text style={styles.subtitle}>{trip.passengerName}</Text>
      <Text style={styles.route}>
        {trip.origin?.address} → {trip.destination?.address}
      </Text>
      <Text style={styles.muted}>
        {trip.distanceKm} km · {trip.durationMin} min
      </Text>

      <View style={styles.card}>
        <Row label="Tarifa final" value={formatCOP(trip.fare)} strong />
        <Row label={`Comisión de la plataforma (${commissionPercent} %)`} value={`- ${formatCOP(trip.commission)}`} />
        <Row label="Propina" value={formatCOP(trip.tip ?? 0)} />
        <View style={styles.divider} />
        <Row label="Tu ganancia neta" value={formatCOP(trip.driverEarnings)} highlight />
      </View>

      {/* AI-assisted: see docs/AI_LOG.md #17 — cobro reutilizable */}
      <TripPaymentPanel trip={trip} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* AI-assisted: see docs/AI_LOG.md #15
          Con el pago resuelto se vuelve directo; sin pagar se puede salir dejando el cobro
          pendiente (con confirmación), para no bloquear al conductor si Wompi o el backend fallan. */}
      {isPaid ? (
        <Pressable style={[styles.button, styles.homeButton]} onPress={handleClose} disabled={closing}>
          {closing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Volver al inicio</Text>
          )}
        </Pressable>
      ) : confirmingLeave ? (
        <View style={styles.confirmBox}>
          <Text style={styles.confirmText}>
            El pago quedará pendiente y podrás cobrarlo más tarde desde el historial. Mientras tanto
            seguirás recibiendo solicitudes.
          </Text>
          <Pressable
            style={[styles.button, styles.confirmButton]}
            onPress={handleClose}
            disabled={closing}
          >
            {closing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Volver sin cobrar</Text>
            )}
          </Pressable>
          <Pressable
            style={styles.linkButton}
            onPress={() => setConfirmingLeave(false)}
            disabled={closing}
          >
            <Text style={styles.link}>Cancelar</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.linkButton} onPress={() => setConfirmingLeave(true)}>
          <Text style={styles.leaveText}>Volver sin cobrar</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

function Row({ label, value, strong, highlight }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.strong, highlight && styles.highlight]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 32, backgroundColor: '#fff', flexGrow: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 18, fontWeight: '600', marginTop: 4 },
  route: { fontSize: 15, color: '#333', marginTop: 8 },
  muted: { color: '#666', marginTop: 4 },
  card: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 14, marginTop: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 5 },
  rowLabel: { fontSize: 15, color: '#444', flexShrink: 1, marginRight: 8 },
  rowValue: { fontSize: 16, color: '#222' },
  strong: { fontWeight: '700' },
  highlight: { fontWeight: '700', fontSize: 20, color: '#2e7d32' },
  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 6 },
  confirmBox: { backgroundColor: '#fff4e5', borderRadius: 10, padding: 12, marginTop: 20 },
  confirmText: { color: '#5c3b00', fontWeight: '600' },
  error: { color: '#c62828', textAlign: 'center', marginTop: 12 },
  // sin flex: 1 (los botones están en una columna; ver corrección de la entrada #12)
  button: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  confirmButton: { backgroundColor: '#8a5300' },
  homeButton: { backgroundColor: '#111', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkButton: { marginTop: 16, padding: 8, alignItems: 'center' },
  link: { color: '#1565c0', fontWeight: '600' },
  leaveText: { color: '#555', fontWeight: '600', textDecorationLine: 'underline' },
});
