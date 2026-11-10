// AI-assisted: see docs/AI_LOG.md #20
// Botón del sistema de diseño.
// variant: 'primary' (amarillo, texto negro) | 'secondary' (contorno claro) |
//          'danger' (rojo) | 'success' (verde) | 'info' (azul, Wompi) | 'ghost' (solo texto)
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

const VARIANTS = {
  primary: { background: colors.primary, text: colors.onPrimary, border: colors.primary },
  secondary: { background: 'transparent', text: colors.text, border: colors.border },
  danger: { background: colors.danger, text: '#FFFFFF', border: colors.danger },
  success: { background: colors.success, text: colors.onPrimary, border: colors.success },
  info: { background: colors.info, text: '#FFFFFF', border: colors.info },
  dangerOutline: { background: 'transparent', text: colors.danger, border: colors.danger },
  ghost: { background: 'transparent', text: colors.textMuted, border: 'transparent' },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  compact = false,
  style,
  textStyle,
}) {
  const palette = VARIANTS[variant] ?? VARIANTS.primary;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        { backgroundColor: palette.background, borderColor: palette.border },
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={compact ? 16 : 20} color={palette.text} style={styles.icon} /> : null}
          <Text style={[styles.text, compact && styles.compactText, { color: palette.text }, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // sin flex: 1: en columnas ocuparía alto 0 (ver corrección de la entrada #12)
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  compact: { minHeight: 40, paddingHorizontal: spacing.md, marginTop: spacing.sm },
  content: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: spacing.sm },
  text: { ...typography.button },
  compactText: { fontSize: 14 },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
