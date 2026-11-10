// AI-assisted: see docs/AI_LOG.md #20
// Contenedor de pantalla: fondo oscuro y barra de estado adaptada.
// statusBar: 'dark' (íconos oscuros, sobre encabezados amarillos) | 'light' (sobre fondo oscuro).
// La barra solo se aplica mientras la pantalla tiene el foco: las pantallas del Stack y del
// Drawer siguen montadas al salir, y no deben imponer su estilo a la pantalla visible.
import { useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme';

export default function Screen({ children, statusBar = 'light', style }) {
  const focused = useIsFocused();
  return (
    <View style={[styles.screen, style]}>
      {focused ? <StatusBar style={statusBar} /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
});
