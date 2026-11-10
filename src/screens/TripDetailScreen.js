// AI-assisted: see docs/AI_LOG.md #17
// Detalle de un viaje del historial (sección 6 del PDF): ruta guardada dibujada con la
// polilínea (SIN volver a pedirla a OSRM), duración, distancia, montos, pago y calificación.
// Si el viaje quedó finalizado con el pago pendiente, se puede cobrar aquí (TripPaymentPanel).
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import LeafletMap from '../components/LeafletMap';
import TripPaymentPanel from '../components/TripPaymentPanel';
import { CATEGORY_LABELS } from '../config/tripLabels';
import { db, doc, onSnapshot } from '../services/firebase';
import { getTripDateMs } from '../utils/earnings';
import { formatCOP } from '../utils/formatCurrency';
import { formatTripDateTime } from '../utils/historyFilters';

// "★★★★☆" para una calificación de 1 a 5
function stars(rating) {
  const value = Math.max(0, Math.min(5, Math.round(rating)));
  return '★'.repeat(value) + '☆'.repeat(5 - value);
}

export default function TripDetailScreen({ navigation, route }) {
  const { tripId } = route.params;
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // el viaje se escucha en tiempo real: si se cobra desde aquí, el estado se actualiza solo
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'trips', tripId),
      (snapshot) => {
        setTrip(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
        setLoading(false);
      },
      (snapshotError) => {
        console.log('Error cargando el detalle del viaje:', snapshotError);
        setError('No se pudo cargar el viaje.');
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [tripId]);

  const goBack = () => navigation.goBack();

  if (loading || !trip) {
    return (
      <View style={styles.center}>
        {loading ? <ActivityIndicator size="large" /> : null}
        {!loading ? <Text style={styles.muted}>{error ?? 'El viaje no existe.'}</Text> : null}
        <Pressable style={styles.backButton} onPress={goBack}>
          <Text style={styles.backText}>← Volver al historial</Text>
        </Pressable>
      </View>
    );
  }

  const origin = { lat: trip.origin.lat, lng: trip.origin.lng };
  const destination = { lat: trip.destination.lat, lng: trip.destination.lng };
  const commissionPercent = Math.round((trip.commissionRate ?? 0) * 100);
  // viajes guardados antes de existir `route`: se dibuja la línea recta origen-destino
  const polyline = Array.isArray(trip.route) && trip.route.length > 1 ? trip.route : [origin, destination];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable style={styles.backButton} onPress={goBack}>
        <Text style={styles.backText}>← Volver al historial</Text>
      </Pressable>

      <Text style={styles.title}>{formatTripDateTime(getTripDateMs(trip))}</Text>
      <Text style={styles.muted}>
        {trip.passengerName} · {CATEGORY_LABELS[trip.category] ?? trip.category}
      </Text>

      {/* ruta guardada al finalizar el viaje: no se vuelve a pedir a OSRM */}
      <LeafletMap
        style={styles.map}
        center={origin}
        markers={[
          { id: 'origin', ...origin, label: 'Origen', color: '#1565c0' },
          { id: 'destination', ...destination, label: 'Destino', color: '#c62828' },
        ]}
        polyline={polyline}
        fitToContent
      />

      <View style={styles.card}>
        <Text style={styles.label}>Origen</Text>
        <Text style={styles.value}>{trip.origin?.address}</Text>
        <Text style={[styles.label, styles.spaced]}>Destino</Text>
        <Text style={styles.value}>{trip.destination?.address}</Text>
        <Text style={[styles.label, styles.spaced]}>Distancia y duración</Text>
        <Text style={styles.value}>
          {trip.distanceKm} km · {trip.durationMin} min
        </Text>
        <Text style={[styles.label, styles.spaced]}>Calificación del pasajero</Text>
        <Text style={[styles.value, styles.stars]}>
          {typeof trip.rating === 'number' ? `${stars(trip.rating)}  ${trip.rating}/5` : 'Sin calificación (se asigna al pagarse)'}
        </Text>
      </View>

      <View style={styles.card}>
        <Row label="Tarifa" value={formatCOP(trip.fare)} />
        <Row label={`Comisión (${commissionPercent} %)`} value={`- ${formatCOP(trip.commission)}`} />
        <Row label="Propina" value={formatCOP(trip.tip ?? 0)} />
        <View style={styles.divider} />
        <Row label="Ganancia neta" value={formatCOP(trip.driverEarnings)} highlight />
      </View>

      {/* método y estado del pago; si quedó pendiente, aquí se puede cobrar */}
      <TripPaymentPanel trip={trip} />
    </ScrollView>
  );
}

function Row({ label, value, highlight }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.highlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32, backgroundColor: '#fff', flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 24 },
  backButton: { paddingVertical: 6, marginBottom: 8, alignSelf: 'flex-start' },
  backText: { color: '#1565c0', fontWeight: '600', fontSize: 15 },
  title: { fontSize: 22, fontWeight: '700' },
  muted: { color: '#666', marginTop: 4 },
  // alto fijo: dentro de un ScrollView el mapa no puede usar flex: 1
  map: { flex: 0, height: 260, borderRadius: 12, marginTop: 12 },
  card: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 14, marginTop: 16 },
  label: { fontSize: 12, color: '#777', textTransform: 'uppercase' },
  spaced: { marginTop: 10 },
  value: { fontSize: 15, color: '#222', marginTop: 2 },
  stars: { color: '#f9a825', fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
  rowLabel: { fontSize: 15, color: '#444' },
  rowValue: { fontSize: 16, color: '#222' },
  highlight: { fontWeight: '700', fontSize: 18, color: '#2e7d32' },
  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 6 },
});
