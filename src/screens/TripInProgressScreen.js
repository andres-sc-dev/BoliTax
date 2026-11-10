// AI-assisted: see docs/AI_LOG.md #10
// Placeholder de "Viaje en curso": la ruta, "Pasajero a bordo" y finalizar se implementan
// en el módulo 5. Por ahora muestra el viaje activo para comprobar que se aceptó.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTrip } from '../context/TripContext';
import { formatCOP } from '../utils/formatCurrency';

const STATUS_LABELS = {
  accepted: 'Aceptado',
  driver_arriving: 'Vas hacia el punto de recogida',
  in_progress: 'Pasajero a bordo',
};

export default function TripInProgressScreen({ navigation }) {
  const { activeTrip } = useTrip();

  if (!activeTrip) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No tienes un viaje activo</Text>
        <Pressable style={styles.button} onPress={() => navigation.navigate('HomeMain')}>
          <Text style={styles.buttonText}>Volver a Inicio</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Viaje en curso</Text>
      <Text style={styles.status}>{STATUS_LABELS[activeTrip.status] ?? activeTrip.status}</Text>
      <Text style={styles.line}>Pasajero: {activeTrip.passengerName}</Text>
      <Text style={styles.line}>Recogida: {activeTrip.origin?.address}</Text>
      <Text style={styles.line}>Destino: {activeTrip.destination?.address}</Text>
      <Text style={styles.line}>
        {activeTrip.distanceKm} km · {activeTrip.durationMin} min · {formatCOP(activeTrip.fare)}
      </Text>
      <Text style={styles.note}>La navegación del viaje se implementa en el módulo 5.</Text>
      <Pressable style={styles.secondary} onPress={() => navigation.navigate('HomeMain')}>
        <Text style={styles.secondaryText}>Ir al mapa</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  status: { fontSize: 16, color: '#1565c0', fontWeight: '600', marginBottom: 16 },
  line: { fontSize: 15, color: '#222', marginBottom: 6 },
  note: { marginTop: 20, color: '#777' },
  button: {
    marginTop: 20,
    backgroundColor: '#111',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  secondary: { marginTop: 16, paddingVertical: 12, alignItems: 'center' },
  secondaryText: { color: '#1565c0', fontWeight: '600' },
});
