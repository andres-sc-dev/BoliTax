// AI-assisted: see docs/AI_LOG.md #16
// Ganancias (sección 5 del PDF): para hoy, la semana y el mes muestra número de viajes,
// total facturado, comisiones, propinas, ganancia neta y promedio por viaje, más el saldo.
// Los datos vienen de useEarnings (compartido por EarningsContext).
// AI-assisted: see docs/AI_LOG.md #22
// Rediseño "Damero audaz" (mismo estilo del registro): encabezado amarillo con el botón de
// menú, tarjeta de saldo oscura con borde amarillo y el monto en verde o rojo, chips de
// periodo y tarjetas oscuras. Textos traducidos. La lógica no cambió.
import { DrawerActions } from '@react-navigation/native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Chip, HeaderIconButton, Screen, YellowHeader } from '../components/ui';
import { useEarningsData } from '../context/EarningsContext';
import { useLanguage } from '../context/LanguageContext';
import { colors, spacing, typography } from '../theme';
import { formatCOP } from '../utils/formatCurrency';

const PERIODS = ['today', 'week', 'month'];

export default function EarningsScreen({ navigation }) {
  const { loading, error, periods, balance } = useEarningsData();
  const [period, setPeriod] = useState('today');
  // AI-assisted: see docs/AI_LOG.md #22
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const header = (
    <YellowHeader
      safeTop
      title={t('earnings.title')}
      subtitle={t('earnings.subtitle')}
      left={
        <HeaderIconButton
          icon="menu"
          label={t('common.openMenu')}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        />
      }
    />
  );

  if (loading) {
    return (
      <Screen statusBar="dark">
        {header}
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.muted}>{t('earnings.loading')}</Text>
        </View>
      </Screen>
    );
  }

  const totals = periods[period];
  const balanceNegative = balance < 0;

  return (
    <Screen statusBar="dark">
      {header}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      >
        {/* saldo del conductor (sección 5): verde si es positivo, rojo si es negativo */}
        <Card highlight style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t('earnings.balance')}</Text>
          <Text style={[styles.balanceValue, balanceNegative ? styles.negative : styles.positive]}>
            {formatCOP(balance)}
          </Text>
          <Text style={styles.balanceNote}>{t('earnings.balanceNote')}</Text>
        </Card>

        {/* selector de periodo */}
        <View style={styles.chips}>
          {PERIODS.map((key) => (
            <Chip
              key={key}
              label={t(`earnings.period.${key}`)}
              active={period === key}
              onPress={() => setPeriod(key)}
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{t('earnings.loadError')}</Text> : null}

        <View style={styles.grid}>
          <StatCard label={t('earnings.trips')} value={String(totals.count)} />
          <StatCard label={t('earnings.net')} value={formatCOP(totals.net)} highlight />
          <StatCard label={t('earnings.billed')} value={formatCOP(totals.billed)} />
          <StatCard label={t('earnings.commissions')} value={`- ${formatCOP(totals.commissions)}`} />
          <StatCard label={t('earnings.tips')} value={formatCOP(totals.tips)} />
          <StatCard label={t('earnings.average')} value={formatCOP(totals.average)} />
        </View>

        <Text style={styles.note}>{t('earnings.note')}</Text>
      </ScrollView>
    </Screen>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.cardValue, highlight && styles.positive]}>{value}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  muted: { ...typography.body, color: colors.textMuted, marginTop: spacing.md },
  content: { paddingHorizontal: spacing.lg },
  balanceCard: { marginTop: spacing.xl },
  balanceLabel: { ...typography.label, color: colors.textMuted, textTransform: 'uppercase' },
  balanceValue: { ...typography.display, marginVertical: spacing.xs },
  positive: { color: colors.success },
  negative: { color: colors.danger },
  balanceNote: { ...typography.caption, color: colors.textMuted, lineHeight: 18 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', marginTop: spacing.md, padding: spacing.md },
  cardLabel: { ...typography.caption, color: colors.textMuted },
  cardValue: { ...typography.amount, fontSize: 20, color: colors.text, marginTop: spacing.xs },
  note: { ...typography.caption, color: colors.textMuted, marginTop: spacing.lg },
  error: { ...typography.body, color: colors.danger, textAlign: 'center', marginTop: spacing.sm },
});
