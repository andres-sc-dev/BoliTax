// AI-assisted: see docs/AI_LOG.md #5
// Selector de fecha. En Android abre el diálogo nativo con DateTimePickerAndroid.open;
// en iOS muestra el selector en línea debajo del campo.
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

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
      </Pressable>
      {Platform.OS === 'ios' && showIos ? (
        <DateTimePicker
          value={pickerValue}
          mode="date"
          display="inline"
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
  container: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#222' },
  field: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  fieldError: { borderColor: '#c62828' },
  value: { fontSize: 16, color: '#111' },
  placeholder: { fontSize: 16, color: '#999' },
  error: { color: '#c62828', fontSize: 13, marginTop: 4 },
});
