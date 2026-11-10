// AI-assisted: see docs/AI_LOG.md #5
// Checkbox propio hecho con Pressable; el texto puede incluir otros componentes.
// AI-assisted: see docs/AI_LOG.md #20 — estilo "Damero audaz" (misma API y lógica)
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export default function Checkbox({ checked, onChange, children, error }) {
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.row}
        onPress={() => onChange(!checked)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
      >
        <View style={[styles.box, checked && styles.boxChecked, error && styles.boxError]}>
          {checked ? <Ionicons name="checkmark" size={18} color={colors.onPrimary} /> : null}
        </View>
        <Text style={styles.label}>{children}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  box: {
    width: 26,
    height: 26,
    borderWidth: 2,
    borderColor: colors.textMuted,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 1,
  },
  boxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  boxError: { borderColor: colors.danger },
  label: { ...typography.body, flex: 1, color: colors.text },
  error: { ...typography.caption, color: colors.danger, marginTop: 6 },
});
