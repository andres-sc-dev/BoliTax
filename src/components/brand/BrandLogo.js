// AI-assisted: see docs/AI_LOG.md #19
// AI-assisted: see docs/AI_LOG.md #20
// Logo "B" de BoliTax como imagen (PNG generados desde assets/brand/*.svg con
// `npm run brand:assets`; no se usa react-native-svg).
// variant: 'onDark'   -> B negra sobre cuadrado amarillo (para fondos oscuros)
//          'onYellow' -> B amarilla sobre cuadrado negro (para fondos amarillos)
import { Image } from 'react-native';

const SOURCES = {
  onDark: require('../../../assets/brand/logo-b-light.png'),
  onYellow: require('../../../assets/brand/logo-b-dark.png'),
};

export default function BrandLogo({ variant = 'onDark', size = 96, style }) {
  return (
    <Image
      source={SOURCES[variant] ?? SOURCES.onDark}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="Logo de BoliTax"
    />
  );
}
