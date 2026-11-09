// AI-assisted: see docs/AI_LOG.md #4
// Campo de texto reutilizable con etiqueta y mensaje de error debajo (nunca en un Alert).
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function FormField({ label, error, style, ...inputProps }) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor="#999"
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#222' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111',
    backgroundColor: '#fff',
  },
  inputError: { borderColor: '#c62828' },
  error: { color: '#c62828', fontSize: 13, marginTop: 4 },
});
