// AI-assisted: see docs/AI_LOG.md #22
// Botón de ícono para los encabezados amarillos (menú del Drawer o volver): ícono negro,
// área táctil generosa. Lo usan Ganancias, Historial, Detalle y Perfil.
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { colors, radius } from '../../theme';

export default function HeaderIconButton({ icon, onPress, label }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={26} color={colors.onPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { padding: 4, borderRadius: radius.sm },
  pressed: { backgroundColor: 'rgba(11, 11, 15, 0.12)' },
});
