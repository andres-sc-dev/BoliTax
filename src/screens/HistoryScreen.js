// AI-assisted: see docs/AI_LOG.md #17
// Historial de carreras (sección 6 del PDF): FlatList del viaje más reciente al más antiguo,
// filtros Hoy / Semana / Mes / Rango de fechas y por método de pago, 20 viajes por carga y
// mensaje vacío si no hay viajes. Al tocar un viaje se abre su detalle.
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import DateField from '../components/DateField';
import {
  CATEGORY_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
} from '../config/tripLabels';
import { useAuth } from '../context/AuthContext';
import { useTripHistory } from '../hooks/useTripHistory';
import { getTripDateMs } from '../utils/earnings';
import { formatCOP } from '../utils/formatCurrency';
import { formatTripDateTime, getHistoryRange } from '../utils/historyFilters';

const PERIOD_FILTERS = [
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
  { key: 'range', label: 'Rango' },
];

const METHOD_FILTERS = [
  { key: null, label: 'Todos' },
  { key: 'wompi', label: 'Wompi' },
  { key: 'cash', label: 'Efectivo' },
];

export default function HistoryScreen({ navigation }) {
  const { user } = useAuth();
  const [period, setPeriod] = useState('week');
  const [paymentMethod, setPaymentMethod] = useState(null);
  // rango de fechas personalizado: por defecto, los últimos 7 días
  const [fromDate, setFromDate] = useState(() => new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));
  const [toDate, setToDate] = useState(() => new Date());

  // rango del filtro en hora de Colombia (null si el rango personalizado no es válido)
  const range = useMemo(
    () => getHistoryRange(period, Date.now(), { from: fromDate, to: toDate }),
    [period, fromDate, toDate],
  );

  const { trips, loading, loadingMore, hasMore, error, loadMore, refresh } = useTripHistory({
    uid: user?.uid,
    range,
    paymentMethod,
  });

  // al volver del detalle (por ejemplo, tras cobrar un viaje) se recarga la lista;
  // se salta el primer foco porque la carga inicial ya la hace el hook
  const firstFocusRef = useRef(true);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (firstFocusRef.current) {
        firstFocusRef.current = false;
        return;
      }
      refresh();
    });
    return unsubscribe;
  }, [navigation, refresh]);

  const emptyMessage = !range
    ? 'La fecha "desde" debe ser anterior o igual a la fecha "hasta".'
    : error ?? 'No tienes viajes en este periodo con el filtro elegido.';

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <ChipRow options={PERIOD_FILTERS} value={period} onChange={setPeriod} />
        <ChipRow options={METHOD_FILTERS} value={paymentMethod} onChange={setPaymentMethod} />
        {period === 'range' ? (
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <DateField label="Desde" value={fromDate} onChange={setFromDate} maximumDate={new Date()} />
            </View>
            <View style={styles.dateField}>
              <DateField label="Hasta" value={toDate} onChange={setToDate} maximumDate={new Date()} />
            </View>
          </View>
        ) : null}
      </View>

      <FlatList
        data={trips}
        keyExtractor={(trip) => trip.id}
        renderItem={({ item }) => (
          <TripRow trip={item} onPress={() => navigation.navigate('TripDetail', { tripId: item.id })} />
        )}
        contentContainerStyle={trips.length === 0 ? styles.emptyContainer : styles.listContent}
        // paginación: al acercarse al final se carga la siguiente página de 20
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshing={loading && trips.length > 0}
        onRefresh={refresh}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <Text style={[styles.empty, error && styles.error]}>{emptyMessage}</Text>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={styles.footer} />
          ) : !hasMore && trips.length > 0 ? (
            <Text style={styles.footerText}>No hay más viajes en este periodo.</Text>
          ) : null
        }
      />
    </View>
  );
}

function ChipRow({ options, value, onChange }) {
  return (
    <View style={styles.chipRow}>
      {options.map((option) => (
        <Pressable
          key={String(option.key)}
          style={[styles.chip, value === option.key && styles.chipActive]}
          onPress={() => onChange(option.key)}
        >
          <Text style={[styles.chipText, value === option.key && styles.chipTextActive]}>
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// un viaje del historial: fecha y hora, origen -> destino, categoría, tarifa, ganancia y pago
function TripRow({ trip, onPress }) {
  const paymentStatus = trip.paymentStatus ?? 'pending';
  return (
    <Pressable style={styles.item} onPress={onPress}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemDate}>{formatTripDateTime(getTripDateMs(trip))}</Text>
        <Text style={[styles.itemStatus, { color: PAYMENT_STATUS_COLORS[paymentStatus] ?? '#222' }]}>
          {PAYMENT_STATUS_LABELS[paymentStatus] ?? paymentStatus}
        </Text>
      </View>
      <Text style={styles.itemRoute} numberOfLines={2}>
        {trip.origin?.address} → {trip.destination?.address}
      </Text>
      <View style={styles.itemFooter}>
        <Text style={styles.itemCategory}>{CATEGORY_LABELS[trip.category] ?? trip.category}</Text>
        <Text style={styles.itemFare}>Tarifa {formatCOP(trip.fare)}</Text>
        <Text style={styles.itemEarnings}>Ganancia {formatCOP(trip.driverEarnings)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  filters: { paddingHorizontal: 12, paddingTop: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 4,
  },
  chipActive: { backgroundColor: '#111' },
  chipText: { fontWeight: '600', color: '#444' },
  chipTextActive: { color: '#fff' },
  dateRow: { flexDirection: 'row' },
  dateField: { flex: 1, marginRight: 8 },
  listContent: { padding: 12 },
  emptyContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  empty: { color: '#666', textAlign: 'center', fontSize: 15 },
  error: { color: '#c62828' },
  footer: { marginVertical: 16 },
  footerText: { textAlign: 'center', color: '#999', marginVertical: 16 },
  item: { backgroundColor: '#f7f7f7', borderRadius: 12, padding: 12, marginBottom: 10 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  itemDate: { fontWeight: '700', color: '#222' },
  itemStatus: { fontWeight: '700' },
  itemRoute: { color: '#333', marginTop: 6 },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  itemCategory: { color: '#666' },
  itemFare: { color: '#222' },
  itemEarnings: { color: '#2e7d32', fontWeight: '700' },
});
