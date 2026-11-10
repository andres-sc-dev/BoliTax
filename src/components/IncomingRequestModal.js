// AI-assisted: see docs/AI_LOG.md #10
// Solicitud entrante (sección 3 del PDF): datos del viaje, ganancia neta estimada y un
// temporizador de 15 s. Si llega a 0, la solicitud se rechaza sola.
// El padre lo monta con key={request.id}, así cada solicitud empieza con su propio temporizador.
// AI-assisted: see docs/AI_LOG.md #21
// Rediseño "Damero audaz": hoja inferior con borde amarillo, contador circular y barra de
// progreso amarilla de 15 s, recorrido origen → destino, montos grandes y botones
// Aceptar (amarillo) y Rechazar. La lógica del temporizador y de los botones no cambió.
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, mapColors, radius, spacing, typography } from '../theme';
import { formatCOP } from '../utils/formatCurrency';
import { REQUEST_TIMEOUT_SECONDS, secondsLeft } from '../utils/tripRequest';
import Button from './ui/Button';

const CATEGORY_LABELS = { economy: 'Económico', xl: 'XL', premium: 'Premium' };
// AI-assisted: see docs/AI_LOG.md #14 — Wompi reemplaza a Mercado Pago
const PAYMENT_LABELS = { wompi: 'Wompi (tarjeta)', cash: 'Efectivo' };
// AI-assisted: see docs/AI_LOG.md #21 — ícono de cada método de pago
const PAYMENT_ICONS = { wompi: 'card-outline', cash: 'cash-outline' };
// desde este número de segundos el contador se pone en rojo
const URGENT_SECONDS = 5;

export default function IncomingRequestModal({ request, onAccept, onReject }) {
  // AI-assisted: see docs/AI_LOG.md #21 — margen inferior para la barra de navegación de Android
  const insets = useSafeAreaInsets();
  // momento en que apareció la solicitud: el temporizador cuenta desde aquí
  const [shownAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  // 'accept' | 'reject' | null: bloquea los botones mientras se procesa
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  // evita rechazar dos veces por tiempo
  const timedOutRef = useRef(false);

  // temporizador: actualiza la hora cada 250 ms; la limpieza detiene el intervalo
  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(intervalId);
  }, []);

  const remaining = secondsLeft(shownAt, now);

  // al llegar a 0 se rechaza sola (si el conductor no está aceptando en ese momento)
  useEffect(() => {
    if (remaining > 0 || busy || timedOutRef.current) return;
    timedOutRef.current = true;
    onReject(request.id, 'timeout').catch((rejectError) =>
      console.log('No se pudo rechazar por tiempo:', rejectError),
    );
  }, [remaining, busy, onReject, request.id]);

  const handleAccept = async () => {
    setBusy('accept');
    setError(null);
    try {
      await onAccept(request.id);
    } catch (acceptError) {
      setError(acceptError.message ?? 'No se pudo aceptar la solicitud.');
      setBusy(null);
    }
  };

  const handleReject = async () => {
    setBusy('reject');
    setError(null);
    try {
      await onReject(request.id, 'driver');
    } catch (rejectError) {
      setError(rejectError.message ?? 'No se pudo rechazar la solicitud.');
      setBusy(null);
    }
  };

  // barra de progreso del tiempo restante
  const progress = remaining / REQUEST_TIMEOUT_SECONDS;
  const urgent = remaining <= URGENT_SECONDS;

  return (
    // statusBarTranslucent: la capa oscura cubre también la barra de estado
    <Modal visible transparent statusBarTranslucent animationType="slide" onRequestClose={() => {}}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
          {/* encabezado: título, pasajero y contador circular */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.kicker}>Nueva solicitud</Text>
              <Text style={styles.passenger} numberOfLines={1}>
                {request.passengerName ?? 'Pasajero'}
              </Text>
            </View>
            <View
              style={[styles.timer, urgent && styles.timerUrgent]}
              accessibilityLabel={`Quedan ${remaining} segundos`}
            >
              <Text style={[styles.timerNumber, urgent && styles.timerNumberUrgent]}>
                {remaining}
              </Text>
              <Text style={styles.timerUnit}>seg</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>

          {/* recorrido: los puntos usan los mismos colores que el mapa */}
          <View style={styles.route}>
            <RoutePoint
              color={mapColors.pickup}
              label="Origen"
              value={request.origin?.address}
              showLine
            />
            <RoutePoint
              color={mapColors.destination}
              label="Destino"
              value={request.destination?.address}
            />
          </View>

          {/* distancia y duración, categoría y método de pago */}
          <View style={styles.metaRow}>
            <Meta icon="speedometer-outline" text={`${request.distanceKm} km · ${request.durationMin} min`} />
            <Meta icon="car-outline" text={CATEGORY_LABELS[request.category] ?? request.category} />
            <Meta
              icon={PAYMENT_ICONS[request.paymentMethod] ?? 'wallet-outline'}
              text={PAYMENT_LABELS[request.paymentMethod] ?? request.paymentMethod}
            />
          </View>

          <View style={styles.amounts}>
            <View style={[styles.amountBox, styles.amountBoxLeft]}>
              <Text style={styles.amountLabel}>Tarifa estimada</Text>
              <Text style={styles.fare}>{formatCOP(request.fare)}</Text>
            </View>
            <View style={[styles.amountBox, styles.earningsBox]}>
              <Text style={styles.earningsLabel}>Tu ganancia neta</Text>
              <Text style={styles.earnings}>{formatCOP(request.driverEarnings)}</Text>
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.buttons}>
            <Button
              title="Rechazar"
              variant="dangerOutline"
              onPress={handleReject}
              loading={busy === 'reject'}
              disabled={busy !== null}
              style={[styles.button, styles.rejectButton]}
            />
            <Button
              title="Aceptar"
              icon="checkmark"
              onPress={handleAccept}
              loading={busy === 'accept'}
              disabled={busy !== null}
              style={[styles.button, styles.acceptButton]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// AI-assisted: see docs/AI_LOG.md #21 — punto del recorrido (origen o destino)
function RoutePoint({ color, label, value, showLine = false }) {
  return (
    <View style={styles.point}>
      <View style={styles.pointMarker}>
        <View style={[styles.pointDot, { backgroundColor: color }]} />
        {showLine ? <View style={styles.pointLine} /> : null}
      </View>
      <View style={styles.pointText}>
        <Text style={styles.pointLabel}>{label}</Text>
        <Text style={styles.pointValue}>{value ?? '—'}</Text>
      </View>
    </View>
  );
}

// AI-assisted: see docs/AI_LOG.md #21 — dato corto con ícono
function Meta({ icon, text }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={14} color={colors.textMuted} />
      <Text style={styles.metaText}>{text ?? '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.backdrop, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  header: { flexDirection: 'row', alignItems: 'center' },
  headerText: { flex: 1, marginRight: spacing.md },
  kicker: {
    ...typography.label,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  passenger: { ...typography.title, color: colors.text, marginTop: 2 },
  // contador circular: aro amarillo (rojo en los últimos segundos)
  timer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerUrgent: { borderColor: colors.danger },
  timerNumber: { ...typography.amount, color: colors.primary, lineHeight: 24 },
  timerNumberUrgent: { color: colors.danger },
  timerUnit: { ...typography.caption, fontSize: 10, lineHeight: 12, color: colors.textMuted },
  progressTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  progressBar: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  route: { marginTop: spacing.lg },
  point: { flexDirection: 'row' },
  pointMarker: { width: 20, alignItems: 'center' },
  pointDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  pointLine: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 4 },
  pointText: { flex: 1, marginLeft: spacing.sm, paddingBottom: spacing.md },
  pointLabel: { ...typography.caption, color: colors.textMuted, textTransform: 'uppercase' },
  pointValue: { ...typography.bodyStrong, color: colors.text },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap' },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  metaText: { ...typography.label, color: colors.text, marginLeft: 6 },
  amounts: { flexDirection: 'row', marginTop: spacing.sm },
  amountBox: { flex: 1, borderRadius: radius.md, padding: spacing.md },
  amountBoxLeft: { backgroundColor: colors.surfaceAlt, marginRight: spacing.sm },
  amountLabel: { ...typography.caption, color: colors.textMuted },
  fare: { ...typography.amount, color: colors.text, marginTop: spacing.xs },
  earningsBox: { backgroundColor: colors.primary },
  earningsLabel: { ...typography.caption, color: colors.onPrimaryMuted },
  earnings: { ...typography.amount, fontSize: 26, color: colors.onPrimary, marginTop: spacing.xs },
  error: { ...typography.body, color: colors.danger, textAlign: 'center', marginTop: spacing.md },
  buttons: { flexDirection: 'row', marginTop: spacing.sm },
  // flex solo aquí: los dos botones comparten fila (ver corrección de la entrada #12)
  button: { flex: 1 },
  rejectButton: { marginRight: spacing.sm },
  acceptButton: { flex: 1.4 },
});
