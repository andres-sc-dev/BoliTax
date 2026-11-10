// AI-assisted: see docs/AI_LOG.md #19
// Logo de BoliTax. Por ahora es texto; cuando se haga el diseño se reemplaza por
// <Image source={require('../../../assets/logo.png')} /> sin tocar la animación.
import { StyleSheet, Text, View } from 'react-native';
import { TAXI_YELLOW } from './brandColors';

export default function BrandLogo() {
  return (
    <View style={styles.container} accessibilityRole="header" accessibilityLabel="BoliTax">
      <Text style={styles.text}>
        Boli<Text style={styles.accent}>Tax</Text>
      </Text>
      <Text style={styles.tagline}>Conductores</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  text: { fontSize: 46, fontWeight: '800', color: '#ffffff', letterSpacing: 1 },
  accent: { color: TAXI_YELLOW },
  tagline: { fontSize: 14, color: '#bbbbbb', letterSpacing: 4, marginTop: 2 },
});
