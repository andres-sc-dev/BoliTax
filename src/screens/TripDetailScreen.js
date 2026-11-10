// AI-assisted: see docs/AI_LOG.md #17
// Detalle de un viaje del historial (sección 6 del PDF): ruta guardada dibujada con la
// polilínea (SIN volver a pedirla a OSRM), duración, distancia, montos, pago y calificación.
// Si el viaje quedó finalizado con el pago pendiente, se puede cobrar aquí (TripPaymentPanel).
// AI-assisted: see docs/AI_LOG.md #22
// Rediseño "Damero audaz" (mismo estilo del registro): encabezado amarillo con el botón para
// volver, mapa oscuro, recorrido, montos y cobro en tarjetas oscuras. Textos traducidos.
// La lógica (escucha del viaje en tiempo real) no cambió.
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LeafletMap from '../components/LeafletMap';
import TripPaymentPanel from '../components/TripPaymentPanel';
import { Card, HeaderIconButton, Screen, YellowHeader } from '../components/ui';
import { getCategoryLabel } from '../config/tripLabels';
import { useLanguage } from '../context/LanguageContext';
import { db, doc, onSnapshot } from '../services/firebase';
import { colors, mapColors, radius, spacing, typography } from '../theme';
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
  // AI-assisted: see docs/AI_LOG.md #22
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

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

  // AI-assisted: see docs/AI_LOG.md #22 — botón para volver dentro del encabezado amarillo
  const backButton = <HeaderIconButton icon="arrow-back" label={t('detail.back')} onPress={goBack} />;

  if (loading || !trip) {
    return (
      <Screen statusBar="dark">
        <YellowHeader safeTop title={t('history.title')} left={backButton} />
        <View style={styles.center}>
          {loading ? <ActivityIndicator size="large" color={colors.primary} /> : null}
          {!loading ? (
            <Text style={styles.muted}>{error ? t('detail.loadError') : t('detail.notFound')}</Text>
          ) : null}
        </View>
      </Screen>
    );
  }

  const origin = { lat: trip.origin.lat, lng: trip.origin.lng };
  const destination = { lat: trip.destination.lat, lng: trip.destination.lng };
  const commissionPercent = Math.round((trip.commissionRate ?? 0) * 100);
  // viajes guardados antes de existir `route`: se dibuja la línea recta origen-destino
  const polyline = Array.isArray(trip.route) && trip.route.length > 1 ? trip.route : [origin, destination];

  return (
    <Screen statusBar="dark">
      <YellowHeader
        safeTop
        title={formatTripDateTime(getTripDateMs(trip))}
        subtitle={`${trip.passengerName} · ${getCategoryLabel(t, trip.category)}`}
        left={backButton}
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      >
        {/* ruta guardada al finalizar el viaje: no se vuelve a pedir a OSRM */}
        <View style={styles.mapWrap}>
          <LeafletMap
            style={styles.map}
            center={origin}
            markers={[
              { id: 'origin', ...origin, label: t('map.origin'), color: mapColors.pickup },
              { id: 'destination', ...destination, label: t('map.destination'), color: mapColors.destination },
            ]}
            polyline={polyline}
            fitToContent
          />
        </View>

        <Card>
          <Text style={styles.cardTitle}>{t('detail.route')}</Text>
          <RoutePoint color={mapColors.pickup} value={trip.origin?.address} showLine />
          <RoutePoint color={mapColors.destination} value={trip.destination?.address} />
          <View style={styles.stats}>
            <Stat icon="speedometer-outline" value={trip.distanceKm} unit="km" />
            <Stat icon="time-outline" value={trip.durationMin} unit="min" />
          </View>
          <Text style={[styles.label, styles.spaced]}>{t('detail.rating')}</Text>
          {typeof trip.rating === 'number' ? (
            <Text style={styles.stars}>
              {stars(trip.rating)}
              <Text style={styles.ratingNumber}>  {trip.rating}/5</Text>
            </Text>
          ) : (
            <Text style={styles.muted}>{t('detail.noRating')}</Text>
          )}
        </Card>

        <Card>
          <Text style={styles.cardTitle}>{t('detail.amounts')}</Text>
          <Row label={t('detail.fare')} value={formatCOP(trip.fare)} />
          <Row
            label={t('detail.commission', { percent: commissionPercent })}
            value={`- ${formatCOP(trip.commission)}`}
          />
          <Row label={t('detail.tip')} value={formatCOP(trip.tip ?? 0)} />
          <View style={styles.divider} />
          <Row label={t('detail.net')} value={formatCOP(trip.driverEarnings)} highlight />
        </Card>

        {/* método y estado del pago; si quedó pendiente, aquí se puede cobrar */}
        <TripPaymentPanel trip={trip} />
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value, highlight }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, highlight && styles.rowLabelHighlight]}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.highlight]}>{value}</Text>
    </View>
  );
}

// AI-assisted: see docs/AI_LOG.md #22 — punto del recorrido (origen o destino)
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

// AI-assisted: see docs/AI_LOG.md #22 — dato grande (km o min)
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  content: { paddingHorizontal: spacing.lg },
  mapWrap: { marginTop: spacing.lg, borderRadius: radius.lg, overflow: 'hidden' },
  // alto fijo: dentro de un ScrollView el mapa no puede usar flex: 1
  map: { flex: 0, height: 240 },
  cardTitle: { ...typography.subtitle, color: colors.text, marginBottom: spacing.md },
  label: { ...typography.caption, color: colors.textMuted, textTransform: 'uppercase' },
  spaced: { marginTop: spacing.lg },
  muted: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' },
  stars: { fontSize: 20, color: colors.primary, marginTop: spacing.xs },
  ratingNumber: { ...typography.bodyStrong, color: colors.text },
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
  stats: { flexDirection: 'row' },
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
  rowLabel: { ...typography.body, color: colors.textMuted, flexShrink: 1, marginRight: spacing.sm },
  rowLabelHighlight: { ...typography.bodyStrong, color: colors.text },
  rowValue: { ...typography.bodyStrong, color: colors.text },
  highlight: { ...typography.amount, color: colors.success },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
});
