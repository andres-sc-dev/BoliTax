// AI-assisted: see docs/AI_LOG.md #4
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SplashAnimation from './src/components/SplashAnimation';
import { AuthProvider } from './src/context/AuthContext';
// AI-assisted: see docs/AI_LOG.md #18
import { LanguageProvider } from './src/context/LanguageContext';
import RootNavigator from './src/navigation/RootNavigator';
// AI-assisted: see docs/AI_LOG.md #20
import { colors, FONT_FILES } from './src/theme';

// AI-assisted: see docs/AI_LOG.md #19
// La splash nativa NO se oculta sola: se oculta cuando la animación ya está dibujada con el
// mismo color de fondo (ver brandColors.js y app.json). Se llama fuera de los componentes,
// como recomienda la documentación de expo-splash-screen.
SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 200, fade: true });

// respaldo: si por algún motivo la animación no termina, la app igual se muestra
// AI-assisted: see docs/AI_LOG.md #20 — 8 s porque ahora la composición queda quieta 1,7 s
const SPLASH_FALLBACK_MS = 8000;

// AI-assisted: see docs/AI_LOG.md #20
// tema oscuro de React Navigation con la paleta "Damero audaz": evita destellos blancos
// entre pantallas y colorea los encabezados y el Drawer
const NAVIGATION_THEME = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
};

// GestureHandlerRootView es necesario para los gestos del Drawer;
// AuthProvider comparte la sesión con todas las pantallas;
// LanguageProvider (dentro de AuthProvider) comparte el idioma elegido
export default function App() {
  // AI-assisted: see docs/AI_LOG.md #19
  const [showSplash, setShowSplash] = useState(true);
  // AI-assisted: see docs/AI_LOG.md #20
  // Montserrat (se carga en tiempo de ejecución; si falla, se usa la fuente del sistema)
  const [fontsLoaded, fontError] = useFonts(FONT_FILES);
  const fontsReady = fontsLoaded || Boolean(fontError);

  const hideNativeSplash = useCallback(() => {
    SplashScreen.hide();
  }, []);
  const finishSplash = useCallback(() => setShowSplash(false), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hide();
      setShowSplash(false);
    }, SPLASH_FALLBACK_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      {/* la app se monta DEBAJO de la animación: la sesión carga mientras el taxi avanza */}
      <AuthProvider>
        <LanguageProvider>
          <NavigationContainer theme={NAVIGATION_THEME}>
            <RootNavigator />
          </NavigationContainer>
        </LanguageProvider>
      </AuthProvider>
      {/* la animación espera a las fuentes (mientras tanto sigue la splash nativa, del mismo color) */}
      {showSplash && fontsReady ? (
        <SplashAnimation onReady={hideNativeSplash} onFinish={finishSplash} />
      ) : null}
      {/* fondo oscuro por defecto: íconos claros. Cada pantalla puede cambiarla (ui/Screen) */}
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
