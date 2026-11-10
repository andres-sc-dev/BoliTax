// AI-assisted: see docs/AI_LOG.md #5
// Lista desplegable propia: un campo que abre un Modal con las opciones.
// AI-assisted: see docs/AI_LOG.md #20 — estilo "Damero audaz" (misma API y lógica)
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export default function SelectField({
  label,
  value,
  options,
  onChange,
  error,
  placeholder = 'Selecciona una opción',
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={[styles.field, error && styles.fieldError]} onPress={() => setOpen(true)}>
        <Text style={selected ? styles.value : styles.placeholder}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.primary} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        {/* tocar fuera de la lista cierra el modal */}
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable style={styles.option} onPress={() => handleSelect(item.value)}>
                    <Text style={[styles.optionText, isSelected && styles.optionSelected]}>
                      {item.label}
                    </Text>
                    {isSelected ? <Ionicons name="checkmark" size={20} color={colors.primary} /> : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: { ...typography.label, color: colors.textMuted, marginBottom: 6 },
  field: {
    minHeight: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  fieldError: { borderColor: colors.danger },
  value: { ...typography.body, color: colors.text, fontSize: 16 },
  placeholder: { ...typography.body, color: colors.textMuted, fontSize: 16 },
  error: { ...typography.caption, color: colors.danger, marginTop: 6 },
  backdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  sheet: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm,
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  sheetTitle: {
    ...typography.subtitle,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  optionText: { ...typography.body, color: colors.text, fontSize: 16 },
  optionSelected: { fontFamily: typography.bodyStrong.fontFamily, color: colors.primary },
});
