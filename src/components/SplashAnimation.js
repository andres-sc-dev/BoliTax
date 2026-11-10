// AI-assisted: see docs/AI_LOG.md #19
// Animación de inicio (extra propio, no está en el PDF), con la API Animated de React Native:
// 1. aparece el logo BoliTax (opacidad y escala),
// 2. el taxi entra desde la izquierda y frena justo debajo del logo,
// 3. al frenar se pasa un poco y vuelve con un rebote (spring), inclinándose hacia adelante,
// 4. la capa se desvanece y queda la app (Login o Inicio, según la sesión).
// Si el teléfono tiene activado "reducir movimiento", se omite el recorrido.
// Todas las animaciones usan useNativeDriver: corren en el hilo nativo, sin trabarse.
// AI-assisted: see docs/AI_LOG.md #20
// Rediseño "Damero audaz": logo "B", wordmark BoliTAX y taxi nuevo, todo CENTRADO en vertical y
// horizontal sobre el fondo oscuro, con una franja de damero como "calle". Al terminar el
// recorrido la composición queda quieta 1,7 s antes de desvanecerse.
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import { spacing } from '../theme';
import BrandLogo from './brand/BrandLogo';
import { SPLASH_BACKGROUND } from './brand/brandColors';
import TaxiIcon, { TAXI_WIDTH } from './brand/TaxiIcon';
import Wordmark from './brand/Wordmark';
import CheckerStrip from './ui/CheckerStrip';

// cuánto se pasa el taxi al frenar antes de rebotar (en puntos)
const BRAKE_OVERSHOOT = 16;
// tiempo que la composición completa queda quieta y visible (entre 1,5 y 2 s)
const HOLD_MS = 1700;

export default function SplashAnimation({ onReady, onFinish }) {
  const { width } = useWindowDimensions();

  // valores animados (useRef: se crean una sola vez)
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  // el taxi empieza fuera de la pantalla, a la izquierda
  const taxiX = useRef(new Animated.Value(-(width / 2 + TAXI_WIDTH))).current;
  const taxiTilt = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  // siempre se llama la versión más reciente de onFinish sin reiniciar la animación
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const readyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let animation = null;

    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduceMotion) => {
        if (cancelled) return;
        if (reduceMotion) {
          // sin movimiento: logo y taxi ya en su sitio, una pausa corta y se desvanece
          logoOpacity.setValue(1);
          logoScale.setValue(1);
          taxiX.setValue(0);
          animation = Animated.sequence([
            Animated.delay(800),
            Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          ]);
        } else {
          animation = Animated.sequence([
            // 1. logo y wordmark
            Animated.parallel([
              Animated.timing(logoOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
              Animated.spring(logoScale, { toValue: 1, friction: 6, useNativeDriver: true }),
            ]),
            // 2. el taxi avanza y desacelera (easing out) pasándose un poco del centro
            Animated.timing(taxiX, {
              toValue: BRAKE_OVERSHOOT,
              duration: 950,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            // 3. frenada: vuelve al centro con rebote y se inclina hacia adelante
            Animated.parallel([
              Animated.spring(taxiX, { toValue: 0, friction: 4, tension: 90, useNativeDriver: true }),
              Animated.sequence([
                Animated.timing(taxiTilt, { toValue: 1, duration: 110, useNativeDriver: true }),
                Animated.spring(taxiTilt, { toValue: 0, friction: 3, tension: 120, useNativeDriver: true }),
              ]),
            ]),
            // 4. la composición queda quieta y visible, y luego se desvanece
            Animated.delay(HOLD_MS),
            Animated.timing(overlayOpacity, { toValue: 0, duration: 320, useNativeDriver: true }),
          ]);
        }
        animation.start(({ finished }) => {
          if (finished) onFinishRef.current?.();
        });
      });

    // limpieza: si la pantalla se desmonta, se detiene la animación
    return () => {
      cancelled = true;
      animation?.stop();
    };
    // la animación corre una sola vez al montar
  }, []);

  // cuando la capa ya está dibujada se avisa para ocultar la splash nativa (mismo fondo)
  const handleLayout = () => {
    if (readyRef.current) return;
    readyRef.current = true;
    onReady?.();
  };

  // inclinación al frenar: la trompa baja unos grados
  const tilt = taxiTilt.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '4deg'] });

  return (
    <Animated.View
      style={[styles.overlay, { opacity: overlayOpacity }]}
      onLayout={handleLayout}
      pointerEvents="none"
    >
      {/* bloque centrado: logo + wordmark arriba, taxi y "calle" de damero debajo */}
      <View style={styles.composition}>
        <Animated.View
          style={[styles.brand, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
        >
          <BrandLogo variant="onDark" size={112} />
          <Wordmark variant="onDark" size={42} style={styles.wordmark} />
        </Animated.View>
        <Animated.View style={[styles.taxi, { transform: [{ translateX: taxiX }, { rotate: tilt }] }]}>
          <TaxiIcon />
        </Animated.View>
        <View style={styles.road}>
          <CheckerStrip rows={2} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SPLASH_BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  composition: { alignItems: 'center' },
  brand: { alignItems: 'center' },
  wordmark: { marginTop: spacing.md },
  taxi: { marginTop: spacing.xxl },
  road: { width: 240, borderRadius: 2, overflow: 'hidden', marginTop: 2 },
});
