// AI-assisted: see docs/AI_LOG.md #19
// AI-assisted: see docs/AI_LOG.md #20
// Taxi moderno (vista lateral, mirando a la derecha) hecho con Views, para la animación de inicio:
// carrocería amarilla, techo con letrero, ventanas oscuras, franja de damero, luces y ruedas
// con el mismo centro de damero del logo. Se puede cambiar por <Image> con el mismo tamaño.
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../theme';

export const TAXI_WIDTH = 168;
const CHECKS = 12;

function Wheel({ style }) {
  return (
    <View style={[styles.wheel, style]}>
      <View style={styles.rim}>
        {/* centro de la rueda: damero de 2 x 2, como el logo */}
        <View style={styles.hubRow}>
          <View style={[styles.hubCell, styles.hubDark]} />
          <View style={styles.hubCell} />
        </View>
        <View style={styles.hubRow}>
          <View style={styles.hubCell} />
          <View style={[styles.hubCell, styles.hubDark]} />
        </View>
      </View>
    </View>
  );
}

export default function TaxiIcon() {
  return (
    <View style={styles.container} accessibilityLabel="Taxi">
      {/* letrero TAXI */}
      <View style={styles.sign}>
        <Text style={styles.signText}>TAXI</Text>
      </View>
      {/* cabina: techo inclinado con dos ventanas */}
      <View style={styles.cabin}>
        <View style={[styles.window, styles.windowBack]} />
        <View style={[styles.window, styles.windowFront]} />
      </View>
      {/* carrocería */}
      <View style={styles.body}>
        <View style={styles.checkers}>
          {Array.from({ length: CHECKS }, (_, index) => (
            <View key={index} style={styles.checkColumn}>
              <View style={[styles.check, index % 2 === 0 && styles.checkDark]} />
              <View style={[styles.check, index % 2 === 1 && styles.checkDark]} />
            </View>
          ))}
        </View>
        <View style={styles.headlight} />
        <View style={styles.taillight} />
      </View>
      <Wheel style={styles.wheelBack} />
      <Wheel style={styles.wheelFront} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: TAXI_WIDTH, height: 92 },
  sign: {
    position: 'absolute',
    top: 0,
    left: 66,
    width: 40,
    height: 13,
    borderRadius: 4,
    backgroundColor: colors.onPrimary,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signText: { color: colors.primary, fontSize: 8, fontFamily: fonts.extraBold, letterSpacing: 1 },
  cabin: {
    position: 'absolute',
    top: 13,
    left: 34,
    width: 100,
    height: 30,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 4,
  },
  window: { height: 18, backgroundColor: '#2B2F3A', marginRight: 6 },
  windowBack: { width: 34, borderTopLeftRadius: 12 },
  windowFront: { width: 40, borderTopRightRadius: 16 },
  body: {
    position: 'absolute',
    top: 42,
    left: 0,
    width: TAXI_WIDTH,
    height: 32,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: 'center',
  },
  checkers: { flexDirection: 'row', alignSelf: 'center' },
  checkColumn: { flexDirection: 'column' },
  check: { width: 7, height: 5, backgroundColor: colors.primary },
  checkDark: { backgroundColor: colors.onPrimary },
  headlight: {
    position: 'absolute',
    right: 2,
    top: 7,
    width: 10,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFF6D5',
  },
  taillight: {
    position: 'absolute',
    left: 2,
    top: 8,
    width: 6,
    height: 6,
    borderRadius: 2,
    backgroundColor: colors.danger,
  },
  wheel: {
    position: 'absolute',
    top: 60,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelBack: { left: 24 },
  wheelFront: { right: 24 },
  rim: {
    width: 16,
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  hubRow: { flexDirection: 'row', flex: 1 },
  hubCell: { flex: 1, backgroundColor: colors.primary },
  hubDark: { backgroundColor: colors.onPrimary },
});
