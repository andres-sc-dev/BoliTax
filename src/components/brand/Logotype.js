// AI-assisted: see docs/AI_LOG.md #22
// Logotipo horizontal "BoliTAX" con la franja de damero debajo (PNG generados con
// `npm run brand:assets` desde los .ttf de Montserrat; no se usa react-native-svg).
// Reemplaza al Wordmark de texto de la entrada #20.
// variant 'onDark'   -> "B" y "TAX" amarillos, "oli" blanco (fondos oscuros)
//         'onYellow' -> todo negro (encabezados amarillos)
// `width` fija el ancho; el alto sale de la proporción real de la imagen.
import { Image } from 'react-native';

const SOURCES = {
  onDark: require('../../../assets/brand/logotype-on-dark.png'),
  onYellow: require('../../../assets/brand/logotype-on-yellow.png'),
};

export default function Logotype({ variant = 'onDark', width = 240, style }) {
  const source = SOURCES[variant] ?? SOURCES.onDark;
  // tamaño en píxeles del PNG: sirve para mantener la proporción
  const { width: imageWidth, height: imageHeight } = Image.resolveAssetSource(source);
  return (
    <Image
      source={source}
      style={[{ width, height: (width * imageHeight) / imageWidth }, style]}
      resizeMode="contain"
      accessibilityRole="header"
      accessibilityLabel="BoliTax"
    />
  );
}
