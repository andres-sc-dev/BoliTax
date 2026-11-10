// AI-assisted: see docs/AI_LOG.md #4
import { NavigationContainer } from '@react-navigation/native';
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

// AI-assisted: see docs/AI_LOG.md #19
// La splash nativa NO se oculta sola: se oculta cuando la animación ya está dibujada con el
// mismo color de fondo (ver brandColors.js y app.json). Se llama fuera de los componentes,
// como recomienda la documentación de expo-splash-screen.
SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 200, fade: true });

// respaldo: si por algún motivo la animación no termina, la app igual se muestra
const SPLASH_FALLBACK_MS = 6000;

// GestureHandlerRootView es necesario para los gestos del Drawer;
// AuthProvider comparte la sesión con todas las pantallas;
// LanguageProvider (dentro de AuthProvider) comparte el idioma elegido
export default function App() {
  // AI-assisted: see docs/AI_LOG.md #19
  const [showSplash, setShowSplash] = useState(true);

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
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </LanguageProvider>
      </AuthProvider>
      {showSplash ? <SplashAnimation onReady={hideNativeSplash} onFinish={finishSplash} /> : null}
      <StatusBar style={showSplash ? 'light' : 'auto'} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
