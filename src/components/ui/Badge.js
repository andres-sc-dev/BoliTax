// AI-assisted: see docs/AI_LOG.md #20
// Etiqueta de estado (pago, documento, cuenta): punto de color + texto, sobre un fondo suave.
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

// color en formato '#RRGGBB' -> fondo translúcido del mismo color
function softBackground(hex) {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, 0.16)`;
}

export default function Badge({ label, color = colors.textMuted, style }) {
  return (
    <View style={[styles.badge, { backgroundColor: softBackground(color) }, style]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  text: { ...typography.label },
});
