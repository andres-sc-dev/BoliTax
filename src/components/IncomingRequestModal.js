// AI-assisted: see docs/AI_LOG.md #10
// Solicitud entrante (sección 3 del PDF): datos del viaje, ganancia neta estimada y un
// temporizador de 15 s. Si llega a 0, la solicitud se rechaza sola.
// El padre lo monta con key={request.id}, así cada solicitud empieza con su propio temporizador.
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatCOP } from '../utils/formatCurrency';
import { REQUEST_TIMEOUT_SECONDS, secondsLeft } from '../utils/tripRequest';

const CATEGORY_LABELS = { economy: 'Económico', xl: 'XL', premium: 'Premium' };
// AI-assisted: see docs/AI_LOG.md #14 — Wompi reemplaza a Mercado Pago
const PAYMENT_LABELS = { wompi: 'Wompi (tarjeta)', cash: 'Efectivo' };

export default function IncomingRequestModal({ request, onAccept, onReject }) {
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

  return (
    <Modal visible transparent animationType="slide" onRequestClose={() => {}}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Nueva solicitud</Text>
            <Text style={[styles.timer, remaining <= 5 && styles.timerUrgent]}>{remaining} s</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>

          <Text style={styles.passenger}>{request.passengerName ?? 'Pasajero'}</Text>

          <Row label="Origen" value={request.origin?.address} />
          <Row label="Destino" value={request.destination?.address} />
          <Row
            label="Distancia y duración"
            value={`${request.distanceKm} km · ${request.durationMin} min`}
          />
          <Row label="Categoría" value={CATEGORY_LABELS[request.category] ?? request.category} />
          <Row
            label="Método de pago"
            value={PAYMENT_LABELS[request.paymentMethod] ?? request.paymentMethod}
          />

          <View style={styles.amounts}>
            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>Tarifa estimada</Text>
              <Text style={styles.amount}>{formatCOP(request.fare)}</Text>
            </View>
            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>Tu ganancia neta</Text>
              <Text style={[styles.amount, styles.earnings]}>{formatCOP(request.driverEarnings)}</Text>
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.buttons}>
            <Pressable
              style={[styles.button, styles.rejectButton]}
              onPress={handleReject}
              disabled={busy !== null}
            >
              {busy === 'reject' ? (
                <ActivityIndicator color="#c62828" />
              ) : (
                <Text style={styles.rejectText}>Rechazar</Text>
              )}
            </Pressable>
            <Pressable
              style={[styles.button, styles.acceptButton]}
              onPress={handleAccept}
              disabled={busy !== null}
            >
              {busy === 'accept' ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.acceptText}>Aceptar</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value ?? '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 28,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700' },
  timer: { fontSize: 22, fontWeight: '700', color: '#1565c0' },
  timerUrgent: { color: '#c62828' },
  progressTrack: { height: 6, backgroundColor: '#eee', borderRadius: 3, marginVertical: 12 },
  progressBar: { height: 6, backgroundColor: '#1565c0', borderRadius: 3 },
  passenger: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  row: { marginBottom: 8 },
  rowLabel: { fontSize: 12, color: '#777', textTransform: 'uppercase' },
  rowValue: { fontSize: 15, color: '#222' },
  amounts: { flexDirection: 'row', marginVertical: 12 },
  amountBox: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 10, padding: 12, marginRight: 8 },
  amountLabel: { fontSize: 12, color: '#666' },
  amount: { fontSize: 20, fontWeight: '700', marginTop: 4 },
  earnings: { color: '#2e7d32' },
  error: { color: '#c62828', textAlign: 'center', marginBottom: 8 },
  buttons: { flexDirection: 'row', marginTop: 4 },
  button: { flex: 1, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  rejectButton: { borderWidth: 2, borderColor: '#c62828', marginRight: 8 },
  acceptButton: { backgroundColor: '#2e7d32', marginLeft: 8 },
  rejectText: { color: '#c62828', fontWeight: '700', fontSize: 16 },
  acceptText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
