// AI-assisted: see docs/AI_LOG.md #7
// Mapa reutilizable: Leaflet + tiles de OpenStreetMap dentro de un WebView (sin Google Maps).
// La app no dibuja el mapa: le envía los datos (centro, marcadores, polilínea) a la página
// con injectJavaScript, y la página avisa con postMessage cuando está lista o si falló.
// AI-assisted: see docs/AI_LOG.md #21
// Modo oscuro "Damero audaz": los tiles siguen siendo los de OpenStreetMap (sin llave) y se
// oscurecen con un filtro CSS aplicado SOLO a la capa de tiles (.leaflet-tile-pane). Los
// marcadores, la ruta amarilla, los tooltips y los controles están en otras capas, así que el
// filtro no los afecta. Los controles de Leaflet usan la paleta de la app.
// Cada marcador acepta además `radius` (tamaño) y `halo` (aro translúcido, para el conductor).
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
// AI-assisted: see docs/AI_LOG.md #22 — textos traducidos
import { useLanguage } from '../context/LanguageContext';
import { colors, mapColors } from '../theme';
import Button from './ui/Button';

// la política de tiles exige un User-Agent que identifique la app
const USER_AGENT = 'BoliTax-app-universitaria';
const DEFAULT_ZOOM = 16;

// AI-assisted: see docs/AI_LOG.md #21
// Tiles de OpenStreetMap (los mismos de la entrada #7): no requieren llave, solo el User-Agent.
// La atribución va sin enlaces para no navegar dentro del WebView.
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '&copy; OpenStreetMap contributors';
// Filtro que convierte el mapa claro en oscuro: invert + hue-rotate(180deg) oscurece el fondo
// sin cambiar el tono de los colores (el agua sigue azulada y los parques verdosos);
// brightness y contrast lo acercan al fondo #0B0B0F, y saturate baja los colores para que
// el amarillo de la ruta y del conductor siga siendo lo que más resalta.
const TILE_FILTER = 'invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.9) saturate(0.6)';

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
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: ${colors.background}; }
    /* controles de Leaflet en oscuro (por defecto son blancos) */
    .leaflet-container { background: ${colors.background}; font-family: sans-serif; }
    /* modo oscuro SOLO en la capa de tiles: marcadores, ruta y controles quedan intactos */
    .leaflet-tile-pane { filter: ${TILE_FILTER}; }
    .leaflet-bar a, .leaflet-bar a:hover {
      background: ${colors.surface}; color: ${colors.text}; border-bottom-color: ${colors.border};
    }
    .leaflet-bar { border: 1px solid ${colors.border} !important; }
    .leaflet-control-attribution {
      background: rgba(11, 11, 15, 0.7) !important; color: ${colors.textMuted}; font-size: 10px;
    }
    .leaflet-tooltip {
      background: ${colors.surface}; color: ${colors.text}; border: 1px solid ${colors.border};
      border-radius: 8px; box-shadow: none; font-weight: 600;
    }
    .leaflet-tooltip-top:before { border-top-color: ${colors.border}; }
  </style>
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
      L.tileLayer('${TILE_URL}', {
        maxZoom: 19,
        attribution: '${TILE_ATTRIBUTION}'
      }).addTo(map);
      // la atribución va arriba: abajo la taparían las tarjetas y la hoja del viaje
      map.attributionControl.setPosition('topright');
      var markerLayer = L.layerGroup().addTo(map);
      var routeLayer = L.layerGroup().addTo(map);

      // la app llama a esta función cada vez que cambian los datos
      window.updateMap = function (data) {
        markerLayer.clearLayers();
        routeLayer.clearLayers();
        var points = [];
        // la ruta se dibuja primero para que los marcadores queden encima
        if (data.polyline.length > 1) {
          var line = data.polyline.map(function (p) { return [p.lat, p.lng]; });
          // borde oscuro debajo de la línea amarilla: se distingue de las calles claras
          L.polyline(line, { color: '${mapColors.routeCasing}', weight: 9, opacity: 0.9 }).addTo(routeLayer);
          L.polyline(line, { color: '${mapColors.route}', weight: 5 }).addTo(routeLayer);
          points = points.concat(line);
        }
        data.markers.forEach(function (m) {
          // aro translúcido alrededor del marcador (conductor destacado)
          if (m.halo) {
            L.circleMarker([m.lat, m.lng], {
              radius: (m.radius || 9) * 2.2, stroke: false,
              fillColor: m.color || '${mapColors.pickup}', fillOpacity: 0.22, interactive: false
            }).addTo(markerLayer);
          }
          // circleMarker no necesita imágenes de íconos externas
          L.circleMarker([m.lat, m.lng], {
            radius: m.radius || 9, color: '${mapColors.markerBorder}', weight: 3,
            fillColor: m.color || '${mapColors.pickup}', fillOpacity: 1
          }).bindTooltip(m.label || '', { direction: 'top', offset: [0, -8] }).addTo(markerLayer);
          points.push([m.lat, m.lng]);
        });
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
  const { t } = useLanguage();

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
        // AI-assisted: see docs/AI_LOG.md #21 — fondo oscuro mientras carga (sin destello blanco)
        style={styles.webView}
        containerStyle={styles.webView}
      />
      {/* AI-assisted: see docs/AI_LOG.md #21 — carga y error con el estilo oscuro */}
      {!ready && !loadError ? (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : null}
      {loadError ? (
        <View style={styles.overlay}>
          {/* AI-assisted: see docs/AI_LOG.md #22 — el aviso se muestra en el idioma elegido */}
          <Text style={styles.errorText}>{t('map.loadError')}</Text>
          <Button title={t('common.retry')} icon="refresh" onPress={reload} compact />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', backgroundColor: colors.background },
  webView: { flex: 1, backgroundColor: colors.background },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  errorText: { color: colors.danger, textAlign: 'center', marginBottom: 4 },
});
