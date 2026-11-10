// AI-assisted: see docs/AI_LOG.md #20
// Wordmark "BoliTAX": "Boli" en peso normal y "TAX" en mayúscula y extra grueso.
// variant 'onYellow': todo en negro. variant 'onDark': "Boli" blanco y "TAX" amarillo.
import { StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../../theme';

export default function Wordmark({ variant = 'onDark', size = 40, style }) {
  const onYellow = variant === 'onYellow';
  return (
    <Text
      style={[styles.base, { fontSize: size, lineHeight: size * 1.15 }, style]}
      accessibilityRole="header"
      accessibilityLabel="BoliTax"
    >
      <Text style={[styles.boli, { color: onYellow ? colors.onPrimary : colors.text }]}>Boli</Text>
      <Text style={[styles.tax, { color: onYellow ? colors.onPrimary : colors.primary }]}>TAX</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  base: { letterSpacing: 0.5 },
  boli: { fontFamily: fonts.regular },
  tax: { fontFamily: fonts.extraBold },
});
