// AI-assisted: see docs/AI_LOG.md #13
// Cobro y resumen del viaje (sección 3 del PDF): tarifa final, comisión, propina, ganancia neta,
// método de pago y estado del pago. El cobro (Mercado Pago o efectivo) se conecta en el
// módulo siguiente; por ahora el pago queda "Pendiente".
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTrip } from '../context/TripContext';
import { formatCOP } from '../utils/formatCurrency';

const PAYMENT_METHOD_LABELS = { mercadopago: 'Mercado Pago', cash: 'Efectivo', stripe: 'Stripe' };
// estados de pago que nombra la sección 3 del PDF
const PAYMENT_STATUS_LABELS = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  cash: 'Efectivo',
};

export default function TripSummaryScreen({ navigation }) {
  const { summaryTrip: trip, closeSummary } = useTrip();
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState(null);

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

  // "Volver al inicio": marca el resumen como visto y el conductor sigue Disponible
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

      <View style={styles.card}>
        <Row
          label="Método de pago"
          value={PAYMENT_METHOD_LABELS[trip.paymentMethod] ?? trip.paymentMethod}
        />
        <Row
          label="Estado del pago"
          value={PAYMENT_STATUS_LABELS[trip.paymentStatus] ?? trip.paymentStatus}
        />
        <Text style={styles.note}>El cobro se registra en el siguiente módulo.</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={handleClose} disabled={closing}>
        {closing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Volver al inicio</Text>
        )}
      </Pressable>
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
  note: { fontSize: 13, color: '#777', marginTop: 6 },
  error: { color: '#c62828', textAlign: 'center', marginTop: 12 },
  // sin flex: 1 (el botón está en una columna; ver corrección de la entrada #12)
  button: {
    backgroundColor: '#111',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkButton: { marginTop: 20, padding: 8 },
  link: { color: '#1565c0', fontWeight: '600' },
});
