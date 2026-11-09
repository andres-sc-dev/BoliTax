// AI-assisted: see docs/AI_LOG.md #7
// Mapa reutilizable: Leaflet + tiles de OpenStreetMap dentro de un WebView (sin Google Maps).
// La app no dibuja el mapa: le envía los datos (centro, marcadores, polilínea) a la página
// con injectJavaScript, y la página avisa con postMessage cuando está lista o si falló.
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

// la política de tiles de OpenStreetMap exige un User-Agent que identifique la app
const USER_AGENT = 'BoliTax-app-universitaria';
const DEFAULT_ZOOM = 16;

// HTML de la página del mapa. Leaflet 1.9.4 desde unpkg con hash de integridad (SRI),
// para que el navegador rechace el archivo si alguien lo modifica.
function buildLeafletHtml(initialCenter) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <style>html, body, #map { height: 100%; margin: 0; padding: 0; }</style>
</head>
<body>
  <div id="map"></div>
  <script>
    function send(message) {
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    }
    if (typeof L === 'undefined') {
      send({ type: 'error', message: 'No se pudo cargar el mapa.' });
    } else {
      var map = L.map('map').setView([${initialCenter.lat}, ${initialCenter.lng}], ${DEFAULT_ZOOM});
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      var markerLayer = L.layerGroup().addTo(map);
      var routeLayer = L.layerGroup().addTo(map);

      // la app llama a esta función cada vez que cambian los datos
      window.updateMap = function (data) {
        markerLayer.clearLayers();
        routeLayer.clearLayers();
        var points = [];
        data.markers.forEach(function (m) {
          // circleMarker no necesita imágenes de íconos externas
          L.circleMarker([m.lat, m.lng], {
            radius: 9, color: '#ffffff', weight: 3,
            fillColor: m.color || '#1565c0', fillOpacity: 1
          }).bindTooltip(m.label || '').addTo(markerLayer);
          points.push([m.lat, m.lng]);
        });
        if (data.polyline.length > 1) {
          var line = data.polyline.map(function (p) { return [p.lat, p.lng]; });
          L.polyline(line, { color: '#1565c0', weight: 5 }).addTo(routeLayer);
          points = points.concat(line);
        }
        if (data.fitToContent && points.length > 1) {
          map.fitBounds(points, { padding: [40, 40] });
        } else if (data.center) {
          map.setView([data.center.lat, data.center.lng], map.getZoom());
        }
      };
      send({ type: 'ready' });
    }
  </script>
</body>
</html>`;
}

export default function LeafletMap({ center, markers = [], polyline = [], fitToContent = false, style }) {
  const webViewRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // el HTML se arma una sola vez con el primer centro; los cambios posteriores van por updateMap
  const initialCenter = useRef(center ?? { lat: 6.2442, lng: -75.5812 }).current;
  const html = useMemo(() => buildLeafletHtml(initialCenter), [initialCenter]);

  // datos serializados: el efecto solo se repite cuando de verdad cambian
  const payload = JSON.stringify({ center, markers, polyline, fitToContent });

  useEffect(() => {
    if (!ready) return;
    // el "true;" final evita una advertencia del WebView en Android
    webViewRef.current?.injectJavaScript(`window.updateMap(${payload}); true;`);
  }, [ready, payload]);

  const handleMessage = (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'ready') {
        setLoadError(null);
        setReady(true);
      } else if (message.type === 'error') {
        setLoadError(message.message);
      }
    } catch {
      // mensajes que no son JSON se ignoran
    }
  };

  const reload = () => {
    setReady(false);
    setLoadError(null);
    webViewRef.current?.reload();
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html }}
        userAgent={USER_AGENT}
        onMessage={handleMessage}
        onError={() => setLoadError('No se pudo cargar el mapa. Revisa tu conexión.')}
        javaScriptEnabled
        style={styles.webView}
      />
      {!ready && !loadError ? (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" />
        </View>
      ) : null}
      {loadError ? (
        <View style={styles.overlay}>
          <Text style={styles.errorText}>{loadError}</Text>
          <Pressable style={styles.button} onPress={reload}>
            <Text style={styles.buttonText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  webView: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 24,
  },
  errorText: { color: '#c62828', textAlign: 'center', marginBottom: 12 },
  button: { backgroundColor: '#111', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
