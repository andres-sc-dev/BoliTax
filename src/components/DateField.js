// AI-assisted: see docs/AI_LOG.md #5
// Selector de fecha. En Android abre el diálogo nativo con DateTimePickerAndroid.open;
// en iOS muestra el selector en línea debajo del campo.
// AI-assisted: see docs/AI_LOG.md #20 — estilo "Damero audaz" (misma API y lógica)
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

// formato dd/mm/aaaa
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

export default function DateField({
  label,
  value,
  onChange,
  error,
  minimumDate,
  maximumDate,
  initialDate,
}) {
  const [showIos, setShowIos] = useState(false);
  // fecha con la que abre el selector si todavía no hay valor
  const pickerValue = value ?? initialDate ?? new Date();

  const openPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: pickerValue,
        mode: 'date',
        minimumDate,
        maximumDate,
        onValueChange: (_event, date) => onChange(date),
      });
    } else {
      setShowIos((prev) => !prev);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={[styles.field, error && styles.fieldError]} onPress={openPicker}>
        <Text style={value ? styles.value : styles.placeholder}>
          {value ? formatDate(value) : 'dd/mm/aaaa'}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={colors.primary} />
      </Pressable>
      {Platform.OS === 'ios' && showIos ? (
        <DateTimePicker
          value={pickerValue}
          mode="date"
          display="inline"
          themeVariant="dark"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onValueChange={(_event, date) => onChange(date)}
        />
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
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
});
