// AI-assisted: see docs/AI_LOG.md #16
// Ganancias (sección 5 del PDF): para hoy, la semana y el mes muestra número de viajes,
// total facturado, comisiones, propinas, ganancia neta y promedio por viaje, más el saldo.
// Los datos vienen de useEarnings (compartido por EarningsContext).
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEarningsData } from '../context/EarningsContext';
import { formatCOP } from '../utils/formatCurrency';

const PERIODS = [
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
];

export default function EarningsScreen() {
  const { loading, error, periods, balance } = useEarningsData();
  const [period, setPeriod] = useState('today');

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Cargando tus ganancias…</Text>
      </View>
    );
  }

  const totals = periods[period];
  const balanceNegative = balance < 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* saldo del conductor (sección 5): verde si es positivo, rojo si es negativo */}
      <View style={[styles.balanceCard, balanceNegative ? styles.balanceRed : styles.balanceGreen]}>
        <Text style={styles.balanceLabel}>Tu saldo</Text>
        <Text style={styles.balanceValue}>{formatCOP(balance)}</Text>
        <Text style={styles.balanceNote}>
          Suma tu ganancia neta de los viajes pagados con Wompi y resta la comisión de los viajes
          pagados en efectivo, porque ese dinero ya lo recibiste directamente. Puede quedar en
          negativo si cobras mucho en efectivo.
        </Text>
      </View>

      {/* selector de periodo */}
      <View style={styles.tabs}>
        {PERIODS.map((item) => (
          <Pressable
            key={item.key}
            style={[styles.tab, period === item.key && styles.tabActive]}
            onPress={() => setPeriod(item.key)}
          >
            <Text style={[styles.tabText, period === item.key && styles.tabTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.grid}>
        <StatCard label="Viajes" value={String(totals.count)} />
        <StatCard label="Ganancia neta" value={formatCOP(totals.net)} highlight />
        <StatCard label="Total facturado" value={formatCOP(totals.billed)} />
        <StatCard label="Comisiones" value={`- ${formatCOP(totals.commissions)}`} />
        <StatCard label="Propinas" value={formatCOP(totals.tips)} />
        <StatCard label="Promedio por viaje" value={formatCOP(totals.average)} />
      </View>

      <Text style={styles.note}>
        Se cuentan los viajes finalizados, aunque su pago siga pendiente. El saldo solo cuenta
        los viajes ya pagados.
      </Text>
    </ScrollView>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.cardValue, highlight && styles.cardHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32, backgroundColor: '#fff', flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  muted: { color: '#666', marginTop: 8 },
  balanceCard: { borderRadius: 14, padding: 16 },
  balanceGreen: { backgroundColor: '#e8f5e9' },
  balanceRed: { backgroundColor: '#fdecea' },
  balanceLabel: { fontSize: 14, color: '#444' },
  balanceValue: { fontSize: 32, fontWeight: '700', marginVertical: 4, color: '#111' },
  balanceNote: { fontSize: 13, color: '#555', lineHeight: 18 },
  tabs: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 10, marginTop: 20, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#111' },
  tabText: { fontWeight: '600', color: '#444' },
  tabTextActive: { color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16 },
  card: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardLabel: { fontSize: 13, color: '#666' },
  cardValue: { fontSize: 20, fontWeight: '700', marginTop: 4, color: '#111' },
  cardHighlight: { color: '#2e7d32' },
  note: { fontSize: 13, color: '#777', marginTop: 4 },
  error: { color: '#c62828', marginTop: 12, textAlign: 'center' },
});
