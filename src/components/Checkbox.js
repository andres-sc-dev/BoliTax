// AI-assisted: see docs/AI_LOG.md #5
// Checkbox propio hecho con Pressable; el texto puede incluir otros componentes.
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
          {checked ? <Text style={styles.check}>✓</Text> : null}
        </View>
        <Text style={styles.label}>{children}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  box: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#555',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  boxChecked: { backgroundColor: '#111', borderColor: '#111' },
  boxError: { borderColor: '#c62828' },
  check: { color: '#fff', fontWeight: '700' },
  label: { flex: 1, fontSize: 15, color: '#222' },
  error: { color: '#c62828', fontSize: 13, marginTop: 4 },
});
