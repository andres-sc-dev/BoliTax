// AI-assisted: see docs/AI_LOG.md #14
// Web Checkout de Wompi dentro de un WebView.
// Cuando Wompi termina, redirige a `redirectUrl?id=<idTransacción>`. Esa URL NUNCA se carga:
// se intercepta, se lee el id y se cierra el WebView. El resultado NO se toma de la redirección:
// el padre llama al backend (verify), que consulta la transacción directamente a Wompi.
// AI-assisted: see docs/AI_LOG.md #21
// Rediseño "Damero audaz": encabezado amarillo con damero (cubre la barra de estado) y botón
// para cerrar. La lógica de interceptar la redirección no cambió.
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../theme';
import { getTransactionIdFromUrl, isRedirectUrl } from '../utils/wompiRedirect';
// AI-assisted: see docs/AI_LOG.md #22 — textos traducidos
import { useLanguage } from '../context/LanguageContext';
import YellowHeader from './ui/YellowHeader';

export default function WompiCheckoutModal({ checkoutUrl, redirectUrl, onRedirect, onClose }) {
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  // evita avisar dos veces (onShouldStartLoadWithRequest y onNavigationStateChange)
  const handledRef = useRef(false);

  // true si la URL es la redirect-url: se avisa al padre y se bloquea la carga
  const interceptRedirect = (url) => {
    if (!isRedirectUrl(url, redirectUrl)) return false;
    if (!handledRef.current) {
      handledRef.current = true;
      onRedirect(getTransactionIdFromUrl(url));
    }
    return true;
  };

  return (
    // statusBarTranslucent: el amarillo del encabezado llega hasta arriba (safeTop)
    <Modal visible animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <YellowHeader
          safeTop
          title={t('wompi.title')}
          subtitle={t('wompi.sandbox')}
          left={
            <View style={styles.badgeIcon}>
              <Ionicons name="card" size={20} color={colors.primary} />
            </View>
          }
          right={
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel={t('wompi.close')}
              hitSlop={8}
            >
              <Ionicons name="close" size={22} color={colors.primary} />
            </Pressable>
          }
        />
        <View style={styles.webViewArea}>
          <WebView
            source={{ uri: checkoutUrl }}
            // devolver false impide que el WebView cargue la redirect-url
            onShouldStartLoadWithRequest={(request) => !interceptRedirect(request.url)}
            // respaldo por si la redirección llega sin pasar por la función anterior
            onNavigationStateChange={(state) => interceptRedirect(state.url)}
            onLoadEnd={() => setLoading(false)}
            startInLoadingState
            style={styles.webView}
          />
          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webViewArea: { flex: 1 },
  // el checkout de Wompi es una página clara; mientras carga se ve el fondo oscuro
  webView: { flex: 1, backgroundColor: colors.background },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
