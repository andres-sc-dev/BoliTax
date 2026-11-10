// AI-assisted: see docs/AI_LOG.md #16
// Franja plegable de ganancias en Inicio. Plegada: ganancia neta de hoy y número de viajes.
// Al tocarla se expande con el saldo y el promedio por viaje; al tocarla otra vez se pliega.
// Usa los mismos datos de useEarnings (EarningsContext): no repite cálculos.
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useEarningsData } from '../context/EarningsContext';
import { formatCOP } from '../utils/formatCurrency';

export default function EarningsStrip() {
  const { loading, periods, balance } = useEarningsData();
  const [expanded, setExpanded] = useState(false);

  const today = periods.today;
  const tripsLabel = today.count === 1 ? '1 viaje' : `${today.count} viajes`;

  return (
    <Pressable
      style={styles.strip}
      onPress={() => setExpanded((value) => !value)}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          {loading ? 'Cargando ganancias…' : `Hoy: ${formatCOP(today.net)} · ${tripsLabel}`}
        </Text>
        <Text style={styles.arrow}>{expanded ? '▴' : '▾'}</Text>
      </View>
      {expanded && !loading ? (
        <View style={styles.details}>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Saldo</Text>
            <Text style={[styles.detailValue, balance < 0 && styles.negative]}>{formatCOP(balance)}</Text>
          </View>
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Promedio por viaje hoy</Text>
            <Text style={styles.detailValue}>{formatCOP(today.average)}</Text>
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  strip: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '700', color: '#2e7d32' },
  arrow: { fontSize: 16, color: '#555', marginLeft: 8 },
  details: { flexDirection: 'row', marginTop: 8 },
  detail: { flex: 1 },
  detailLabel: { fontSize: 12, color: '#777' },
  detailValue: { fontSize: 16, fontWeight: '700', color: '#111' },
  negative: { color: '#c62828' },
});
