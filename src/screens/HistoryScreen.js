// AI-assisted: see docs/AI_LOG.md #17
// Historial de carreras (sección 6 del PDF): FlatList del viaje más reciente al más antiguo,
// filtros Hoy / Semana / Mes / Rango de fechas y por método de pago, 20 viajes por carga y
// mensaje vacío si no hay viajes. Al tocar un viaje se abre su detalle.
// AI-assisted: see docs/AI_LOG.md #22
// Rediseño "Damero audaz" (mismo estilo del registro): encabezado amarillo con el botón de
// menú, chips de filtro con el activo en amarillo, viajes en tarjetas oscuras con el estado
// del pago en un Badge y estado vacío con ícono. Textos traducidos. La lógica no cambió.
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateField from '../components/DateField';
import { Badge, Chip, HeaderIconButton, Screen, YellowHeader } from '../components/ui';
import { getCategoryLabel, getPaymentStatusLabel } from '../config/tripLabels';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTripHistory } from '../hooks/useTripHistory';
import { colors, mapColors, paymentStatusColors, radius, spacing, typography } from '../theme';
import { getTripDateMs } from '../utils/earnings';
import { formatCOP } from '../utils/formatCurrency';
import { formatTripDateTime, getHistoryRange } from '../utils/historyFilters';

// AI-assisted: see docs/AI_LOG.md #22 — las etiquetas salen del diccionario (history.*)
const PERIOD_FILTERS = [
  { key: 'today', labelKey: 'history.period.today' },
  { key: 'week', labelKey: 'history.period.week' },
  { key: 'month', labelKey: 'history.period.month' },
  { key: 'range', labelKey: 'history.period.range' },
];

const METHOD_FILTERS = [
  { key: null, labelKey: 'history.method.all' },
  { key: 'wompi', labelKey: 'history.method.wompi' },
  { key: 'cash', labelKey: 'history.method.cash' },
];

export default function HistoryScreen({ navigation }) {
  const { user } = useAuth();
  // AI-assisted: see docs/AI_LOG.md #22
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
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

  // AI-assisted: see docs/AI_LOG.md #22 — mismos casos de antes, con textos traducidos
  const emptyMessage = !range
    ? t('history.invalidRange')
    : error
      ? t('history.loadError')
      : t('history.empty');

  return (
    <Screen statusBar="dark">
      <YellowHeader
        safeTop
        title={t('history.title')}
        subtitle={t('history.subtitle')}
        left={
          <HeaderIconButton
            icon="menu"
            label={t('common.openMenu')}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          />
        }
      />

      <View style={styles.filters}>
        <ChipRow t={t} options={PERIOD_FILTERS} value={period} onChange={setPeriod} />
        <ChipRow t={t} options={METHOD_FILTERS} value={paymentMethod} onChange={setPaymentMethod} />
        {period === 'range' ? (
          <View style={styles.dateRow}>
            <View style={[styles.dateField, styles.dateFieldLeft]}>
              <DateField label={t('history.from')} value={fromDate} onChange={setFromDate} maximumDate={new Date()} />
            </View>
            <View style={styles.dateField}>
              <DateField label={t('history.to')} value={toDate} onChange={setToDate} maximumDate={new Date()} />
            </View>
          </View>
        ) : null}
      </View>

      <FlatList
        data={trips}
        keyExtractor={(trip) => trip.id}
        renderItem={({ item }) => (
          <TripRow t={t} trip={item} onPress={() => navigation.navigate('TripDetail', { tripId: item.id })} />
        )}
        contentContainerStyle={[
          trips.length === 0 ? styles.emptyContainer : styles.listContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        // paginación: al acercarse al final se carga la siguiente página de 20
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshing={loading && trips.length > 0}
        onRefresh={refresh}
        // AI-assisted: see docs/AI_LOG.md #22 — indicador amarillo al deslizar para recargar
        progressBackgroundColor={colors.surface}
        colors={[colors.primary]}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name={error || !range ? 'alert-circle-outline' : 'car-outline'}
                  size={36}
                  color={error || !range ? colors.danger : colors.primary}
                />
              </View>
              <Text style={[styles.emptyText, (error || !range) && styles.error]}>{emptyMessage}</Text>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={styles.footer} color={colors.primary} />
          ) : !hasMore && trips.length > 0 ? (
            <Text style={styles.footerText}>{t('history.noMore')}</Text>
          ) : null
        }
      />
    </Screen>
  );
}

function ChipRow({ t, options, value, onChange }) {
  return (
    <View style={styles.chipRow}>
      {options.map((option) => (
        <Chip
          key={String(option.key)}
          label={t(option.labelKey)}
          active={value === option.key}
          onPress={() => onChange(option.key)}
        />
      ))}
    </View>
  );
}

// un viaje del historial: fecha y hora, origen -> destino, categoría, tarifa, ganancia y pago
function TripRow({ t, trip, onPress }) {
  const paymentStatus = trip.paymentStatus ?? 'pending';
  return (
    <Pressable style={({ pressed }) => [styles.item, pressed && styles.itemPressed]} onPress={onPress}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemDate}>{formatTripDateTime(getTripDateMs(trip))}</Text>
        <Badge
          label={getPaymentStatusLabel(t, paymentStatus)}
          color={paymentStatusColors[paymentStatus] ?? colors.textMuted}
        />
      </View>

      {/* recorrido con los colores del mapa */}
      <View style={styles.routeLine}>
        <View style={[styles.dot, { backgroundColor: mapColors.pickup }]} />
        <Text style={styles.address} numberOfLines={1}>
          {trip.origin?.address}
        </Text>
      </View>
      <View style={styles.routeLine}>
        <View style={[styles.dot, { backgroundColor: mapColors.destination }]} />
        <Text style={styles.address} numberOfLines={1}>
          {trip.destination?.address}
        </Text>
      </View>

      <View style={styles.itemFooter}>
        <Text style={styles.itemCategory}>{getCategoryLabel(t, trip.category)}</Text>
        <Text style={styles.itemFare}>
          {t('history.fare')} {formatCOP(trip.fare)}
        </Text>
        <Text style={styles.itemEarnings}>
          <Text style={styles.itemEarningsLabel}>{t('history.earnings')} </Text>
          {formatCOP(trip.driverEarnings)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filters: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  dateRow: { flexDirection: 'row', marginTop: spacing.xs },
  dateField: { flex: 1 },
  dateFieldLeft: { marginRight: spacing.sm },
  listContent: { padding: spacing.lg },
  emptyContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  empty: { alignItems: 'center' },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  error: { color: colors.danger },
  footer: { marginVertical: spacing.lg },
  footerText: { ...typography.caption, textAlign: 'center', color: colors.textMuted, marginVertical: spacing.lg },
  item: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  itemPressed: { backgroundColor: colors.surfaceAlt },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemDate: { ...typography.bodyStrong, color: colors.text },
  routeLine: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  address: { ...typography.body, color: colors.text, flex: 1 },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  itemCategory: { ...typography.label, color: colors.textMuted },
  itemFare: { ...typography.label, color: colors.text },
  itemEarnings: { ...typography.amount, fontSize: 18, color: colors.success },
  itemEarningsLabel: { ...typography.label, color: colors.success },
});
