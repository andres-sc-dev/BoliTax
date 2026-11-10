// AI-assisted: see docs/AI_LOG.md #13
// Cobro y resumen del viaje (sección 3 del PDF): tarifa final, comisión, propina, ganancia neta,
// método de pago y estado del pago.
// AI-assisted: see docs/AI_LOG.md #14
// Cobro con Wompi (sección 4): el backend crea el cobro y lo verifica con Wompi; esta pantalla
// muestra el estado del pago en tiempo real porque el viaje llega por onSnapshot (TripContext).
// AI-assisted: see docs/AI_LOG.md #15
// Efectivo, cambio de Wompi a efectivo, efecto en el saldo y salida con el pago pendiente.
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import WompiCheckoutModal from '../components/WompiCheckoutModal';
import { useTrip } from '../context/TripContext';
import { createWompiCheckout, verifyWompiPayment } from '../services/paymentsApi';
import { markCashPaid, switchToCash } from '../services/trips';
import { getBalanceImpact } from '../utils/driverBalance';
import { formatCOP } from '../utils/formatCurrency';

const PAYMENT_METHOD_LABELS = { wompi: 'Wompi (tarjeta)', cash: 'Efectivo' };
// estados de pago que nombra la sección 3 del PDF
const PAYMENT_STATUS_LABELS = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  cash: 'Efectivo',
};
const PAYMENT_STATUS_COLORS = {
  pending: '#8a5300',
  approved: '#2e7d32',
  rejected: '#c62828',
  cash: '#2e7d32',
};

// textos de las confirmaciones dentro de la pantalla (no Alert)
const CONFIRMATIONS = {
  cash: {
    message: '¿Confirmas que recibiste el pago completo en efectivo?',
    confirmLabel: 'Sí, lo recibí',
  },
  switch: {
    message: '¿El pasajero pagará en efectivo? El cobro con Wompi se cancelará para este viaje.',
    confirmLabel: 'Sí, cobrar en efectivo',
  },
  leave: {
    message:
      'El pago quedará pendiente y podrás cobrarlo más tarde. Mientras tanto seguirás recibiendo solicitudes.',
    confirmLabel: 'Volver sin cobrar',
  },
};

export default function TripSummaryScreen({ navigation }) {
  const { summaryTrip: trip, closeSummary } = useTrip();
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState(null);
  // AI-assisted: see docs/AI_LOG.md #14
  // datos del checkout abierto ({ checkoutUrl, redirectUrl }) o null si el WebView está cerrado
  const [checkout, setCheckout] = useState(null);
  // acción de pago en curso: 'checkout' | 'verify' | 'cash' | 'switch' | null
  const [paymentBusy, setPaymentBusy] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState(null);
  // AI-assisted: see docs/AI_LOG.md #15
  // confirmación abierta: 'cash' | 'switch' | 'leave' | null
  const [confirming, setConfirming] = useState(null);
  // evita dos verificaciones al mismo tiempo (por ejemplo, redirección + botón)
  const verifyInFlightRef = useRef(false);

  const paymentStatus = trip?.paymentStatus ?? 'pending';
  const isPaid = trip?.status === 'paid';

  // cuando el pago queda aprobado (o el viaje pagado), se limpian errores y avisos viejos
  useEffect(() => {
    if (paymentStatus === 'approved' || isPaid) {
      setPaymentError(null);
      setPaymentMessage(null);
      setConfirming(null);
    }
  }, [paymentStatus, isPaid]);

  const goHome = () => navigation.navigate('HomeMain');

  // el resumen llega por onSnapshot unos instantes después de finalizar
  if (!trip) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Cargando resumen del viaje…</Text>
        <Pressable style={styles.linkButton} onPress={goHome}>
          <Text style={styles.link}>Volver al inicio</Text>
        </Pressable>
      </View>
    );
  }

  // cierra el resumen (con o sin pago) y vuelve a Inicio; el conductor sigue Disponible
  const handleClose = async () => {
    setClosing(true);
    setError(null);
    try {
      await closeSummary(trip.id);
      goHome();
    } catch (closeError) {
      setError(closeError.message ?? 'No se pudo cerrar el resumen.');
      setClosing(false);
    }
  };

  // ejecuta una acción de pago mostrando el error dentro de la pantalla
  const runPaymentAction = async (name, action) => {
    setPaymentBusy(name);
    setPaymentError(null);
    setPaymentMessage(null);
    try {
      return await action();
    } catch (actionError) {
      setPaymentError(actionError.message ?? 'No se pudo completar la acción.');
      return null;
    } finally {
      setPaymentBusy(null);
    }
  };

  // AI-assisted: see docs/AI_LOG.md #14
  // pide al backend la URL del checkout (el monto lo toma el backend del viaje) y abre el WebView
  const handleCharge = async () => {
    const data = await runPaymentAction('checkout', () => createWompiCheckout(trip.id));
    if (data) setCheckout(data);
  };

  // el backend consulta la transacción a Wompi; el resultado llega al viaje por onSnapshot
  const handleVerify = async (transactionId) => {
    // AI-assisted: see docs/AI_LOG.md #15 — una sola verificación a la vez
    if (verifyInFlightRef.current) return;
    verifyInFlightRef.current = true;
    try {
      const result = await runPaymentAction('verify', () =>
        verifyWompiPayment(trip.id, transactionId),
      );
      if (result?.message) setPaymentMessage(result.message);
    } finally {
      verifyInFlightRef.current = false;
    }
  };

  // Wompi redirigió (el WebView ya se cerró): se verifica con el id de la transacción
  const handleRedirect = (transactionId) => {
    setCheckout(null);
    handleVerify(transactionId);
  };

  // se cerró el WebView sin terminar: queda "Verificar pago" (busca por la referencia)
  const handleCheckoutClosed = () => {
    setCheckout(null);
    setPaymentMessage('Si alcanzaste a pagar, toca "Verificar pago".');
  };

  // AI-assisted: see docs/AI_LOG.md #15
  // confirmación aceptada: efectivo recibido, cambio a efectivo o salir sin cobrar
  const handleConfirm = async () => {
    const action = confirming;
    if (action === 'leave') {
      setConfirming(null);
      await handleClose();
      return;
    }
    const done = await runPaymentAction(action, async () => {
      if (action === 'cash') await markCashPaid(trip.id);
      if (action === 'switch') await switchToCash(trip.id);
      return true;
    });
    if (done) setConfirming(null);
  };

  const commissionPercent = Math.round((trip.commissionRate ?? 0) * 100);
  const isWompi = trip.paymentMethod === 'wompi';
  const isCash = trip.paymentMethod === 'cash';
  // ya se abrió un checkout para este viaje (hay una referencia de cobro)
  const checkoutStarted = Boolean(trip.paymentReference);

  // qué se puede hacer según el método y el estado del pago
  const canChargeWompi = isWompi && !isPaid && paymentStatus !== 'approved';
  // "Verificar pago" solo mientras el pago está pendiente y ya se abrió un checkout
  // (no cuando ya está Rechazado o Aprobado)
  const canVerify = canChargeWompi && paymentStatus === 'pending' && checkoutStarted;
  const canSwitchToCash = canChargeWompi;
  const canMarkCash = isCash && !isPaid;

  // efecto en el saldo: el real si ya se pagó, o el que tendrá cuando se pague
  const balanceImpact = isPaid
    ? getBalanceImpact(trip)
    : getBalanceImpact({ ...trip, status: 'paid', paymentStatus: isCash ? 'cash' : 'approved' });
  const balanceText =
    balanceImpact >= 0
      ? `+${formatCOP(balanceImpact)} a tu saldo`
      : `${formatCOP(balanceImpact)} de comisión descontada de tu saldo`;

  const busy = paymentBusy !== null || closing;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Viaje finalizado</Text>
      <Text style={styles.subtitle}>{trip.passengerName}</Text>
      <Text style={styles.route}>
        {trip.origin?.address} → {trip.destination?.address}
      </Text>
      <Text style={styles.muted}>
        {trip.distanceKm} km · {trip.durationMin} min
      </Text>

      <View style={styles.card}>
        <Row label="Tarifa final" value={formatCOP(trip.fare)} strong />
        <Row label={`Comisión de la plataforma (${commissionPercent} %)`} value={`- ${formatCOP(trip.commission)}`} />
        <Row label="Propina" value={formatCOP(trip.tip ?? 0)} />
        <View style={styles.divider} />
        <Row label="Tu ganancia neta" value={formatCOP(trip.driverEarnings)} highlight />
      </View>

      <View style={styles.card}>
        <Row
          label="Método de pago"
          value={PAYMENT_METHOD_LABELS[trip.paymentMethod] ?? trip.paymentMethod}
        />
        {/* estado en tiempo real: cambia solo cuando se actualiza el viaje en Firestore */}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Estado del pago</Text>
          <Text style={[styles.status, { color: PAYMENT_STATUS_COLORS[paymentStatus] ?? '#222' }]}>
            {PAYMENT_STATUS_LABELS[paymentStatus] ?? paymentStatus}
          </Text>
        </View>

        {/* AI-assisted: see docs/AI_LOG.md #15 — cómo queda el viaje en el saldo */}
        <Text style={[styles.balance, balanceImpact < 0 && styles.balanceNegative]}>
          {isPaid ? balanceText : `Al cobrarse: ${balanceText}`}
        </Text>
        {isCash ? (
          <Text style={styles.note}>
            En efectivo recibes el dinero directamente; la comisión se descuenta de tu saldo.
          </Text>
        ) : null}

        {isPaid ? (
          <Text style={styles.approved}>
            {isWompi ? 'Pago aprobado por Wompi.' : 'Cobro en efectivo registrado.'}
          </Text>
        ) : null}
        {paymentStatus === 'rejected' && !isPaid ? (
          <Text style={styles.rejected}>
            El pago fue rechazado. Puedes reintentar con Wompi o cobrar en efectivo.
          </Text>
        ) : null}

        {confirming ? (
          // confirmación dentro de la pantalla, no en un Alert
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>{CONFIRMATIONS[confirming].message}</Text>
            <Pressable
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
              disabled={busy}
            >
              {paymentBusy === confirming || (confirming === 'leave' && closing) ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>{CONFIRMATIONS[confirming].confirmLabel}</Text>
              )}
            </Pressable>
            <Pressable style={styles.linkButton} onPress={() => setConfirming(null)} disabled={busy}>
              <Text style={styles.link}>Cancelar</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.paymentActions}>
            {canChargeWompi ? (
              <Pressable
                style={[styles.button, styles.wompiButton]}
                onPress={handleCharge}
                disabled={busy}
              >
                {paymentBusy === 'checkout' ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {paymentStatus === 'rejected' ? 'Reintentar cobro con Wompi' : 'Cobrar con Wompi'}
                  </Text>
                )}
              </Pressable>
            ) : null}
            {canVerify ? (
              <Pressable
                style={[styles.button, styles.outlineButton]}
                onPress={() => handleVerify()}
                disabled={busy}
              >
                {paymentBusy === 'verify' ? (
                  <ActivityIndicator color="#1565c0" />
                ) : (
                  <Text style={styles.outlineText}>Verificar pago</Text>
                )}
              </Pressable>
            ) : null}
            {canSwitchToCash ? (
              <Pressable
                style={[styles.button, styles.outlineCashButton]}
                onPress={() => setConfirming('switch')}
                disabled={busy}
              >
                <Text style={styles.outlineCashText}>Cobrar en efectivo</Text>
              </Pressable>
            ) : null}
            {canMarkCash ? (
              <Pressable
                style={[styles.button, styles.cashButton]}
                onPress={() => setConfirming('cash')}
                disabled={busy}
              >
                <Text style={styles.buttonText}>Cobro recibido en efectivo</Text>
              </Pressable>
            ) : null}
          </View>
        )}

        {paymentMessage && !isPaid ? <Text style={styles.note}>{paymentMessage}</Text> : null}
        {/* un error viejo nunca se muestra junto a un pago ya aprobado */}
        {paymentError && !isPaid ? <Text style={styles.error}>{paymentError}</Text> : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* AI-assisted: see docs/AI_LOG.md #15
          Con el pago resuelto se vuelve directo; sin pagar se puede salir dejando el cobro
          pendiente (con confirmación), para no bloquear al conductor si Wompi o el backend fallan. */}
      {isPaid ? (
        <Pressable style={[styles.button, styles.homeButton]} onPress={handleClose} disabled={busy}>
          {closing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Volver al inicio</Text>
          )}
        </Pressable>
      ) : confirming !== 'leave' ? (
        <Pressable style={styles.linkButton} onPress={() => setConfirming('leave')} disabled={busy}>
          <Text style={styles.leaveText}>Volver sin cobrar</Text>
        </Pressable>
      ) : null}

      {checkout ? (
        <WompiCheckoutModal
          checkoutUrl={checkout.checkoutUrl}
          redirectUrl={checkout.redirectUrl}
          onRedirect={handleRedirect}
          onClose={handleCheckoutClosed}
        />
      ) : null}
    </ScrollView>
  );
}

function Row({ label, value, strong, highlight }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.strong, highlight && styles.highlight]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 32, backgroundColor: '#fff', flexGrow: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: { fontSize: 26, fontWeight: '700' },
  subtitle: { fontSize: 18, fontWeight: '600', marginTop: 4 },
  route: { fontSize: 15, color: '#333', marginTop: 8 },
  muted: { color: '#666', marginTop: 4 },
  card: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 14, marginTop: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 5 },
  rowLabel: { fontSize: 15, color: '#444', flexShrink: 1, marginRight: 8 },
  rowValue: { fontSize: 16, color: '#222' },
  status: { fontSize: 16, fontWeight: '700' },
  strong: { fontWeight: '700' },
  highlight: { fontWeight: '700', fontSize: 20, color: '#2e7d32' },
  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 6 },
  balance: { fontSize: 15, fontWeight: '700', color: '#2e7d32', marginTop: 6 },
  balanceNegative: { color: '#c62828' },
  note: { fontSize: 13, color: '#777', marginTop: 8 },
  approved: { color: '#2e7d32', fontWeight: '600', marginTop: 8 },
  rejected: { color: '#c62828', marginTop: 8 },
  paymentActions: { marginTop: 4 },
  confirmBox: { backgroundColor: '#fff4e5', borderRadius: 10, padding: 12, marginTop: 10 },
  confirmText: { color: '#5c3b00', fontWeight: '600' },
  error: { color: '#c62828', textAlign: 'center', marginTop: 12 },
  // sin flex: 1 (los botones están en una columna; ver corrección de la entrada #12)
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  wompiButton: { backgroundColor: '#1565c0' },
  cashButton: { backgroundColor: '#2e7d32' },
  confirmButton: { backgroundColor: '#8a5300' },
  outlineButton: { borderWidth: 2, borderColor: '#1565c0' },
  outlineText: { color: '#1565c0', fontWeight: '700', fontSize: 16 },
  outlineCashButton: { borderWidth: 2, borderColor: '#2e7d32' },
  outlineCashText: { color: '#2e7d32', fontWeight: '700', fontSize: 16 },
  homeButton: { backgroundColor: '#111', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkButton: { marginTop: 16, padding: 8, alignItems: 'center' },
  link: { color: '#1565c0', fontWeight: '600' },
  leaveText: { color: '#555', fontWeight: '600', textDecorationLine: 'underline' },
});
