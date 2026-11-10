// AI-assisted: see docs/AI_LOG.md #17
// Panel de cobro de un viaje, compartido por "Cobro y resumen" y el detalle del historial.
// Se extrajo de TripSummaryScreen sin cambiar su lógica (entradas #14 y #15):
// - Wompi: el backend crea el cobro y lo verifica con Wompi (nunca se confía en la redirección).
// - Efectivo, cambio de Wompi a efectivo y efecto en el saldo.
// El estado del pago se ve en tiempo real porque `trip` llega por onSnapshot desde quien lo usa.
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
} from '../config/tripLabels';
import { createWompiCheckout, verifyWompiPayment } from '../services/paymentsApi';
import { markCashPaid, switchToCash } from '../services/trips';
import { getBalanceImpact } from '../utils/driverBalance';
import { formatCOP } from '../utils/formatCurrency';
import WompiCheckoutModal from './WompiCheckoutModal';

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
};

export default function TripPaymentPanel({ trip }) {
  // datos del checkout abierto ({ checkoutUrl, redirectUrl }) o null si el WebView está cerrado
  const [checkout, setCheckout] = useState(null);
  // acción de pago en curso: 'checkout' | 'verify' | 'cash' | 'switch' | null
  const [paymentBusy, setPaymentBusy] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState(null);
  // confirmación abierta: 'cash' | 'switch' | null
  const [confirming, setConfirming] = useState(null);
  // evita dos verificaciones al mismo tiempo (por ejemplo, redirección + botón)
  const verifyInFlightRef = useRef(false);

  const paymentStatus = trip.paymentStatus ?? 'pending';
  const isPaid = trip.status === 'paid';

  // cuando el pago queda aprobado (o el viaje pagado), se limpian errores y avisos viejos
  useEffect(() => {
    if (paymentStatus === 'approved' || isPaid) {
      setPaymentError(null);
      setPaymentMessage(null);
      setConfirming(null);
    }
  }, [paymentStatus, isPaid]);

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

  // pide al backend la URL del checkout (el monto lo toma el backend del viaje) y abre el WebView
  const handleCharge = async () => {
    const data = await runPaymentAction('checkout', () => createWompiCheckout(trip.id));
    if (data) setCheckout(data);
  };

  // el backend consulta la transacción a Wompi; el resultado llega al viaje por onSnapshot
  const handleVerify = async (transactionId) => {
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

  // confirmación aceptada: efectivo recibido o cambio a efectivo
  const handleConfirm = async () => {
    const action = confirming;
    const done = await runPaymentAction(action, async () => {
      if (action === 'cash') await markCashPaid(trip.id);
      if (action === 'switch') await switchToCash(trip.id);
      return true;
    });
    if (done) setConfirming(null);
  };

  const isWompi = trip.paymentMethod === 'wompi';
  const isCash = trip.paymentMethod === 'cash';
  // ya se abrió un checkout para este viaje (hay una referencia de cobro)
  const checkoutStarted = Boolean(trip.paymentReference);

  // qué se puede hacer según el método y el estado del pago
  const canChargeWompi = isWompi && !isPaid && paymentStatus !== 'approved';
  // "Verificar pago" solo mientras está pendiente y ya se abrió un checkout
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

  const busy = paymentBusy !== null;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Método de pago</Text>
        <Text style={styles.rowValue}>
          {PAYMENT_METHOD_LABELS[trip.paymentMethod] ?? trip.paymentMethod}
        </Text>
      </View>
      {/* estado en tiempo real: cambia solo cuando se actualiza el viaje en Firestore */}
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Estado del pago</Text>
        <Text style={[styles.status, { color: PAYMENT_STATUS_COLORS[paymentStatus] ?? '#222' }]}>
          {PAYMENT_STATUS_LABELS[paymentStatus] ?? paymentStatus}
        </Text>
      </View>

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
            {paymentBusy === confirming ? (
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
        <View>
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

      {checkout ? (
        <WompiCheckoutModal
          checkoutUrl={checkout.checkoutUrl}
          redirectUrl={checkout.redirectUrl}
          onRedirect={handleRedirect}
          onClose={handleCheckoutClosed}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 14, marginTop: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 5 },
  rowLabel: { fontSize: 15, color: '#444', flexShrink: 1, marginRight: 8 },
  rowValue: { fontSize: 16, color: '#222' },
  status: { fontSize: 16, fontWeight: '700' },
  balance: { fontSize: 15, fontWeight: '700', color: '#2e7d32', marginTop: 6 },
  balanceNegative: { color: '#c62828' },
  note: { fontSize: 13, color: '#777', marginTop: 8 },
  approved: { color: '#2e7d32', fontWeight: '600', marginTop: 8 },
  rejected: { color: '#c62828', marginTop: 8 },
  confirmBox: { backgroundColor: '#fff4e5', borderRadius: 10, padding: 12, marginTop: 10 },
  confirmText: { color: '#5c3b00', fontWeight: '600' },
  error: { color: '#c62828', textAlign: 'center', marginTop: 12 },
  // sin flex: 1 (los botones están en una columna; ver corrección de la entrada #12)
  button: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  wompiButton: { backgroundColor: '#1565c0' },
  cashButton: { backgroundColor: '#2e7d32' },
  confirmButton: { backgroundColor: '#8a5300' },
  outlineButton: { borderWidth: 2, borderColor: '#1565c0' },
  outlineText: { color: '#1565c0', fontWeight: '700', fontSize: 16 },
  outlineCashButton: { borderWidth: 2, borderColor: '#2e7d32' },
  outlineCashText: { color: '#2e7d32', fontWeight: '700', fontSize: 16 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkButton: { marginTop: 12, padding: 8, alignItems: 'center' },
  link: { color: '#1565c0', fontWeight: '600' },
});
