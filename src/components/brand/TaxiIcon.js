// AI-assisted: see docs/AI_LOG.md #19
// Taxi simple hecho con Views (vista lateral, mirando a la derecha), para la animación de inicio.
// Cuando se haga el diseño se reemplaza por <Image source={...} /> con el mismo tamaño.
import { StyleSheet, Text, View } from 'react-native';
import { TAXI_DARK, TAXI_YELLOW } from './brandColors';

export const TAXI_WIDTH = 140;

export default function TaxiIcon() {
  return (
    <View style={styles.container} accessibilityLabel="Taxi">
      {/* letrero TAXI sobre el techo */}
      <View style={styles.sign}>
        <Text style={styles.signText}>TAXI</Text>
      </View>
      {/* cabina con dos ventanas */}
      <View style={styles.cabin}>
        <View style={styles.window} />
        <View style={styles.window} />
      </View>
      {/* carrocería con franja de cuadros y farola delantera */}
      <View style={styles.body}>
        <View style={styles.checkers}>
          {Array.from({ length: 8 }, (_, index) => (
            <View key={index} style={[styles.checker, index % 2 === 1 && styles.checkerDark]} />
          ))}
        </View>
        <View style={styles.headlight} />
      </View>
      {/* ruedas */}
      <View style={[styles.wheel, styles.wheelBack]}>
        <View style={styles.hub} />
      </View>
      <View style={[styles.wheel, styles.wheelFront]}>
        <View style={styles.hub} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: TAXI_WIDTH, height: 84 },
  sign: {
    position: 'absolute',
    top: 0,
    left: 52,
    width: 36,
    height: 12,
    backgroundColor: TAXI_DARK,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signText: { color: TAXI_YELLOW, fontSize: 8, fontWeight: '800' },
  cabin: {
    position: 'absolute',
    top: 12,
    left: 30,
    width: 80,
    height: 26,
    backgroundColor: TAXI_YELLOW,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  window: { width: 30, height: 16, backgroundColor: '#8ecae6', borderRadius: 4 },
  body: {
    position: 'absolute',
    top: 38,
    left: 0,
    width: TAXI_WIDTH,
    height: 30,
    backgroundColor: TAXI_YELLOW,
    borderRadius: 10,
    justifyContent: 'center',
  },
  checkers: { flexDirection: 'row', alignSelf: 'center', marginTop: 2 },
  checker: { width: 8, height: 6, backgroundColor: '#ffffff' },
  checkerDark: { backgroundColor: TAXI_DARK },
  headlight: {
    position: 'absolute',
    right: 4,
    top: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff8d6',
  },
  wheel: {
    position: 'absolute',
    top: 56,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: TAXI_DARK,
    borderWidth: 3,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelBack: { left: 18 },
  wheelFront: { right: 18 },
  hub: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#bbbbbb' },
});
