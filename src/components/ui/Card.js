// AI-assisted: see docs/AI_LOG.md #20
// Tarjeta sobre el fondo oscuro. `highlight` agrega el borde amarillo de 1,5 px
// (solicitud entrante, saldo, viaje activo); las demás tarjetas van sin borde.
import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';

export default function Card({ children, highlight = false, alt = false, style, ...rest }) {
  return (
    <View
      style={[
        styles.card,
        alt && styles.alt,
        highlight && styles.highlight,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  alt: { backgroundColor: colors.surfaceAlt },
  highlight: { borderWidth: 1.5, borderColor: colors.primary },
});
