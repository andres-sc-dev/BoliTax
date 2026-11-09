// AI-assisted: see docs/AI_LOG.md #4
// Pantalla provisional para las secciones que aún no se implementan.
import { StyleSheet, Text, View } from 'react-native';

export default function PlaceholderScreen({ title, children }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {children ?? <Text style={styles.note}>Pantalla en construcción</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  note: { color: '#777' },
});
