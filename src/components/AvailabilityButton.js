// AI-assisted: see docs/AI_LOG.md #22
// Botón principal de Inicio: Disponible / No disponible. Reemplaza al Switch (entrada #8) con
// la MISMA lógica: llama a onToggle(nuevoValor) como lo hacía onValueChange, y queda bloqueado
// si la cuenta no está aprobada.
// Animaciones con la API Animated de React Native (sin librerías):
// - colores de fondo, borde y texto: transición suave al cambiar de estado (JS driver, porque
//   los colores no se pueden animar en el hilo nativo);
// - escala al presionar y "latido" del punto verde mientras está Disponible (useNativeDriver).
// Se usan dos vistas animadas separadas para no mezclar los dos drivers en la misma vista.
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { colors, fonts, radius, spacing, typography } from '../theme';

const TRANSITION_MS = 280;
const PULSE_MS = 1400;

export default function AvailabilityButton({ isAvailable, disabled, onToggle, title, hint }) {
  // 0 = No disponible, 1 = Disponible
  const progress = useRef(new Animated.Value(isAvailable ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  // transición de colores al cambiar el estado
  useEffect(() => {
    Animated.timing(progress, {
      toValue: isAvailable ? 1 : 0,
      duration: TRANSITION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isAvailable, progress]);

  // latido del punto verde: solo mientras está Disponible; la limpieza detiene el bucle
  useEffect(() => {
    if (!isAvailable) {
      pulse.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: PULSE_MS,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [isAvailable, pulse]);

  const pressTo = (value) =>
    Animated.spring(scale, { toValue: value, friction: 6, tension: 160, useNativeDriver: true }).start();

  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surface, colors.primary],
  });
  const borderColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });
  const titleColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.text, colors.onPrimary],
  });
  const hintColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textMuted, colors.onPrimaryMuted],
  });
  const iconBackground = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surfaceAlt, colors.onPrimary],
  });
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  return (
    <Animated.View style={[styles.shadow, disabled && styles.disabled, { transform: [{ scale }] }]}>
      <Pressable
        onPress={() => onToggle(!isAvailable)}
        onPressIn={() => pressTo(0.97)}
        onPressOut={() => pressTo(1)}
        disabled={disabled}
        accessibilityRole="switch"
        accessibilityState={{ checked: isAvailable, disabled }}
        accessibilityLabel={title}
        accessibilityHint={hint}
      >
        <Animated.View style={[styles.button, { backgroundColor, borderColor }]}>
          {/* ícono de encendido */}
          <Animated.View style={[styles.iconCircle, { backgroundColor: iconBackground }]}>
            <Ionicons
              name="power"
              size={26}
              color={isAvailable ? colors.primary : colors.textMuted}
            />
          </Animated.View>

          <View style={styles.texts}>
            <Animated.Text style={[styles.title, { color: titleColor }]}>{title}</Animated.Text>
            <Animated.Text style={[styles.hint, { color: hintColor }]} numberOfLines={1}>
              {hint}
            </Animated.Text>
          </View>

          {/* punto de estado: verde y latiendo si está Disponible, gris si no */}
          <View style={styles.dotArea}>
            {isAvailable ? (
              <Animated.View
                style={[styles.ring, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]}
              />
            ) : null}
            <View style={[styles.dot, { backgroundColor: isAvailable ? colors.success : colors.textMuted }]} />
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // sombra suave para que se vea como el botón principal sobre el mapa
  shadow: {
    borderRadius: radius.pill,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  disabled: { opacity: 0.55 },
  button: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingLeft: spacing.md,
    paddingRight: spacing.xl,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1, marginLeft: spacing.md, marginRight: spacing.sm },
  title: { fontFamily: fonts.extraBold, fontSize: 20, lineHeight: 26 },
  hint: { ...typography.caption },
  dotArea: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: colors.success },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'rgba(11, 11, 15, 0.35)',
  },
});
