// AI-assisted: see docs/AI_LOG.md #5
// Lista desplegable propia: un campo que abre un Modal con las opciones.
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

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
        <Text style={styles.arrow}>▾</Text>
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
              renderItem={({ item }) => (
                <Pressable style={styles.option} onPress={() => handleSelect(item.value)}>
                  <Text style={[styles.optionText, item.value === value && styles.optionSelected]}>
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#222' },
  field: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  arrow: { fontSize: 16, color: '#555' },
  error: { color: '#c62828', fontSize: 13, marginTop: 4 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 8, maxHeight: '70%' },
  sheetTitle: { fontSize: 16, fontWeight: '700', paddingHorizontal: 16, paddingVertical: 10 },
  option: { paddingHorizontal: 16, paddingVertical: 14 },
  optionText: { fontSize: 16, color: '#111' },
  optionSelected: { fontWeight: '700', color: '#1565c0' },
});
