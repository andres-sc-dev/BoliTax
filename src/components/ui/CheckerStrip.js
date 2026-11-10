// AI-assisted: see docs/AI_LOG.md #20
// Franja de damero (cuadros negros y amarillos): la firma visual de BoliTax.
// Se dibujan suficientes columnas para cualquier ancho de pantalla y lo que sobra se recorta.
import { StyleSheet, View } from 'react-native';
import { CHECKER_SIZE, colors } from '../../theme';

// 70 columnas x 8 px = 560 px: cubre el ancho de cualquier teléfono en vertical
const COLUMNS = 70;

export default function CheckerStrip({ rows = 2, size = CHECKER_SIZE, style }) {
  return (
    <View style={[styles.strip, { height: rows * size }, style]} accessibilityElementsHidden>
      {Array.from({ length: rows }, (_, row) => (
        <View key={row} style={styles.row}>
          {Array.from({ length: COLUMNS }, (_, column) => (
            <View
              key={column}
              style={{
                width: size,
                height: size,
                // patrón de tablero: alterna por fila y por columna
                backgroundColor: (row + column) % 2 === 0 ? colors.onPrimary : colors.primary,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: { width: '100%', overflow: 'hidden' },
  row: { flexDirection: 'row' },
});
