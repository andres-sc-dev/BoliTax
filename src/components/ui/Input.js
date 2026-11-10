// AI-assisted: see docs/AI_LOG.md #20
// Campo de texto oscuro con etiqueta y error debajo (nunca en un Alert).
// Mantiene la API de FormField: { label, error, style, ...props de TextInput }.
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

export default function Input({ label, error, style, onFocus, onBlur, ...inputProps }) {
  // borde amarillo mientras el campo tiene el foco
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          error && styles.inputError,
          inputProps.editable === false && styles.inputDisabled,
        ]}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.primary}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: { ...typography.label, color: colors.textMuted, marginBottom: 6 },
  input: {
    minHeight: 50,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontFamily: typography.body.fontFamily,
    fontSize: 16,
  },
  inputFocused: { borderColor: colors.primary },
  inputError: { borderColor: colors.danger },
  inputDisabled: { opacity: 0.6 },
  error: { ...typography.caption, color: colors.danger, marginTop: 6 },
});
