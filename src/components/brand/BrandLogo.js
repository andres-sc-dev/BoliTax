// AI-assisted: see docs/AI_LOG.md #19
// AI-assisted: see docs/AI_LOG.md #20
// Logo de BoliTax como imagen (PNG generado con `npm run brand:assets`; no se usa react-native-svg).
// AI-assisted: see docs/AI_LOG.md #22
// Marca final: cuadrado redondeado amarillo con la "B" de Montserrat ExtraBold en negro y la
// franja de damero debajo. Es el mismo dibujo del ícono de la app y de la splash nativa.
// Para fondos amarillos se usa el logotipo horizontal (Logotype, variant 'onYellow').
import { Image } from 'react-native';

const SOURCE = require('../../../assets/brand/logo-icon.png');

export default function BrandLogo({ size = 96, style }) {
  return (
    <Image
      source={SOURCE}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="Logo de BoliTax"
    />
  );
}
