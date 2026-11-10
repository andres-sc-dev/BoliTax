// AI-assisted: see docs/AI_LOG.md #20
// Tipografía: Montserrat (@expo-google-fonts/montserrat), gruesa para títulos y montos.
// Las fuentes se cargan en App.js con useFonts; los nombres de familia son los del paquete.
import {
  Montserrat_400Regular,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat';

// archivos que App.js le pasa a useFonts
export const FONT_FILES = {
  Montserrat_400Regular,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
};

export const fonts = {
  regular: 'Montserrat_400Regular',
  semibold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
  extraBold: 'Montserrat_800ExtraBold',
};

// estilos de texto listos para usar: { ...typography.title, color: colors.text }
export const typography = {
  display: { fontFamily: fonts.extraBold, fontSize: 34, lineHeight: 40 },
  title: { fontFamily: fonts.extraBold, fontSize: 24, lineHeight: 30 },
  subtitle: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21 },
  label: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
  button: { fontFamily: fonts.bold, fontSize: 16 },
  // montos en COP: grandes y gruesos
  amount: { fontFamily: fonts.extraBold, fontSize: 22 },
  amountLarge: { fontFamily: fonts.extraBold, fontSize: 32 },
};
