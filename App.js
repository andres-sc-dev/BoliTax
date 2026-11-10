// AI-assisted: see docs/AI_LOG.md #4
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
// AI-assisted: see docs/AI_LOG.md #18
import { LanguageProvider } from './src/context/LanguageContext';
import RootNavigator from './src/navigation/RootNavigator';

// GestureHandlerRootView es necesario para los gestos del Drawer;
// AuthProvider comparte la sesión con todas las pantallas;
// LanguageProvider (dentro de AuthProvider) comparte el idioma elegido
export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AuthProvider>
        <LanguageProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </LanguageProvider>
      </AuthProvider>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
