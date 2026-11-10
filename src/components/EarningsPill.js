// AI-assisted: see docs/AI_LOG.md #21
// Óvalo de ganancias de Inicio (estilo Uber): flota arriba al centro del mapa, amarillo con
// texto negro, y muestra SOLO la ganancia neta de hoy. Al tocarlo abre la pantalla Ganancias.
// Reemplaza a la franja plegable de abajo (EarningsStrip, entrada #16).
// Los datos son los de useEarnings, compartidos por EarningsContext (el hook corre una sola
// vez en AppDrawer): aquí no se repite ningún cálculo.
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useEarningsData } from '../context/EarningsContext';
// AI-assisted: see docs/AI_LOG.md #22 — textos traducidos
import { useLanguage } from '../context/LanguageContext';
import { colors, radius, spacing, typography } from '../theme';
import { formatCOP } from '../utils/formatCurrency';

export default function EarningsPill({ onPress, style }) {
  const { loading, periods } = useEarningsData();
  const { t } = useLanguage();
  const net = periods.today.net;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        loading ? t('home.earningsLoading') : t('home.earningsA11y', { amount: formatCOP(net) })
      }
      hitSlop={8}
      style={({ pressed }) => [styles.pill, pressed && styles.pressed, style]}
    >
      {loading ? (
        <ActivityIndicator color={colors.onPrimary} />
      ) : (
        <Text style={styles.amount}>{formatCOP(net)}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'center',
    minWidth: 128,
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    // sombra para que "flote" sobre el mapa
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  amount: { ...typography.amount, color: colors.onPrimary },
});
