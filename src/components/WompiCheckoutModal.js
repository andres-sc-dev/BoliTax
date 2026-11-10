// AI-assisted: see docs/AI_LOG.md #14
// Web Checkout de Wompi dentro de un WebView.
// Cuando Wompi termina, redirige a `redirectUrl?id=<idTransacción>`. Esa URL NUNCA se carga:
// se intercepta, se lee el id y se cierra el WebView. El resultado NO se toma de la redirección:
// el padre llama al backend (verify), que consulta la transacción directamente a Wompi.
import { useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { getTransactionIdFromUrl, isRedirectUrl } from '../utils/wompiRedirect';

export default function WompiCheckoutModal({ checkoutUrl, redirectUrl, onRedirect, onClose }) {
  const [loading, setLoading] = useState(true);
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
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.header}>
        <Text style={styles.title}>Pago con Wompi (prueba)</Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Cerrar</Text>
        </Pressable>
      </View>
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
          <ActivityIndicator size="large" />
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  title: { fontSize: 17, fontWeight: '700' },
  closeButton: { padding: 6 },
  closeText: { color: '#c62828', fontWeight: '600', fontSize: 15 },
  webView: { flex: 1 },
  loading: {
    ...StyleSheet.absoluteFillObject,
    top: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
