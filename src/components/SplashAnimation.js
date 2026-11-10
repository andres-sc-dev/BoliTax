// AI-assisted: see docs/AI_LOG.md #19
// Animación de inicio (extra propio, no está en el PDF), con la API Animated de React Native:
// 1. aparece el logo BoliTax (opacidad y escala),
// 2. el taxi entra desde la izquierda y frena justo debajo del logo,
// 3. al frenar se pasa un poco y vuelve con un rebote (spring), inclinándose hacia adelante,
// 4. la capa se desvanece y queda la app (Login o Inicio, según la sesión).
// Dura unos 2,5-3 s. Si el teléfono tiene activado "reducir movimiento", se omite el recorrido.
// Todas las animaciones usan useNativeDriver: corren en el hilo nativo, sin trabarse.
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, useWindowDimensions } from 'react-native';
import BrandLogo from './brand/BrandLogo';
import { SPLASH_BACKGROUND } from './brand/brandColors';
import TaxiIcon, { TAXI_WIDTH } from './brand/TaxiIcon';

// cuánto se pasa el taxi al frenar antes de rebotar (en puntos)
const BRAKE_OVERSHOOT = 14;

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
            Animated.delay(600),
            Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          ]);
        } else {
          animation = Animated.sequence([
            // 1. logo
            Animated.parallel([
              Animated.timing(logoOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
              Animated.spring(logoScale, { toValue: 1, friction: 6, useNativeDriver: true }),
            ]),
            // 2. el taxi avanza y desacelera (easing out) pasándose un poco del centro
            Animated.timing(taxiX, {
              toValue: BRAKE_OVERSHOOT,
              duration: 1000,
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
            // 4. pausa corta y se desvanece la capa
            Animated.delay(350),
            Animated.timing(overlayOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
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
      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
        <BrandLogo />
      </Animated.View>
      <Animated.View style={[styles.taxi, { transform: [{ translateX: taxiX }, { rotate: tilt }] }]}>
        <TaxiIcon />
      </Animated.View>
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
  taxi: { marginTop: 28 },
});
