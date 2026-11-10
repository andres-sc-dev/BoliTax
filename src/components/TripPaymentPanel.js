// AI-assisted: see docs/AI_LOG.md #17
// Panel de cobro de un viaje, compartido por "Cobro y resumen" y el detalle del historial.
// Se extrajo de TripSummaryScreen sin cambiar su lógica (entradas #14 y #15):
// - Wompi: el backend crea el cobro y lo verifica con Wompi (nunca se confía en la redirección).
// - Efectivo, cambio de Wompi a efectivo y efecto en el saldo.
// El estado del pago se ve en tiempo real porque `trip` llega por onSnapshot desde quien lo usa.
// AI-assisted: see docs/AI_LOG.md #21
// Rediseño "Damero audaz": tarjeta oscura, estado del pago con Badge de color, efecto en el
// saldo en grande y botones del sistema de diseño (Wompi en azul). La lógica no cambió.
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
// AI-assisted: see docs/AI_LOG.md #22 — textos y etiquetas traducidos
import { getPaymentMethodLabel, getPaymentStatusLabel } from '../config/tripLabels';
import { useLanguage } from '../context/LanguageContext';
import { createWompiCheckout, verifyWompiPayment } from '../services/paymentsApi';
import { markCashPaid, switchToCash } from '../services/trips';
import { colors, paymentStatusColors, radius, spacing, typography } from '../theme';
import { getBalanceImpact } from '../utils/driverBalance';
import { formatCOP } from '../utils/formatCurrency';
import { Badge, Button, Card } from './ui';
import WompiCheckoutModal from './WompiCheckoutModal';

// textos de las confirmaciones dentro de la pantalla (no Alert)
// AI-assisted: see docs/AI_LOG.md #22 — ahora son claves del diccionario
const CONFIRMATIONS = {
  cash: { message: 'payment.confirmCash', confirmLabel: 'payment.confirmCashButton' },
  switch: { message: 'payment.confirmSwitch', confirmLabel: 'payment.confirmSwitchButton' },
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
  const { t } = useLanguage();

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
      setPaymentError(actionError.message ?? t('common.actionError'));
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
    setPaymentMessage(t('payment.checkoutClosed'));
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
  // AI-assisted: see docs/AI_LOG.md #21
  // el monto va aparte (grande) y la frase debajo; el contenido es el mismo de antes
  const balanceAmount = balanceImpact >= 0 ? `+${formatCOP(balanceImpact)}` : formatCOP(balanceImpact);
  const balanceCaption =
    balanceImpact >= 0 ? t('payment.toBalance') : t('payment.commissionDeducted');

  const busy = paymentBusy !== null;

  return (
    <Card>
      {/* AI-assisted: see docs/AI_LOG.md #21 — encabezado de la tarjeta con el estado del pago */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('payment.title')}</Text>
        {/* estado en tiempo real: cambia solo cuando se actualiza el viaje en Firestore */}
        <Badge
          label={getPaymentStatusLabel(t, paymentStatus)}
          color={paymentStatusColors[paymentStatus] ?? colors.textMuted}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.methodLabel}>
          <Ionicons
            name={isCash ? 'cash-outline' : 'card-outline'}
            size={18}
            color={colors.textMuted}
          />
          <Text style={styles.rowLabel}>{t('payment.method')}</Text>
        </View>
        <Text style={styles.rowValue}>
          {getPaymentMethodLabel(t, trip.paymentMethod)}
        </Text>
      </View>

      {/* efecto en el saldo */}
      <View style={styles.balanceBox}>
        <Text style={styles.balanceCaption}>
          {isPaid ? t('payment.balanceEffect') : t('payment.whenCharged')}
        </Text>
        <Text style={[styles.balanceAmount, balanceImpact < 0 && styles.balanceNegative]}>
          {balanceAmount}
        </Text>
        <Text style={styles.balanceCaption}>{balanceCaption}</Text>
      </View>
      {isCash ? (
        <Text style={styles.note}>{t('payment.cashNote')}</Text>
      ) : null}

      {isPaid ? (
        <View style={[styles.notice, styles.noticeSuccess]}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={[styles.noticeText, { color: colors.success }]}>
            {isWompi ? t('payment.approvedWompi') : t('payment.cashRegistered')}
          </Text>
        </View>
      ) : null}
      {paymentStatus === 'rejected' && !isPaid ? (
        <View style={[styles.notice, styles.noticeDanger]}>
          <Ionicons name="close-circle" size={20} color={colors.danger} />
          <Text style={styles.noticeText}>{t('payment.rejected')}</Text>
        </View>
      ) : null}

      {confirming ? (
        // confirmación dentro de la pantalla, no en un Alert
        <View style={styles.confirmBox}>
          <Text style={styles.confirmText}>{t(CONFIRMATIONS[confirming].message)}</Text>
          <Button
            title={t(CONFIRMATIONS[confirming].confirmLabel)}
            variant="success"
            onPress={handleConfirm}
            loading={paymentBusy === confirming}
            disabled={busy}
          />
          <Button
            title={t('common.cancel')}
            variant="ghost"
            compact
            onPress={() => setConfirming(null)}
            disabled={busy}
          />
        </View>
      ) : (
        <View>
          {canChargeWompi ? (
            <Button
              title={paymentStatus === 'rejected' ? t('payment.retryWompi') : t('payment.chargeWompi')}
              variant="info"
              icon="card"
              onPress={handleCharge}
              loading={paymentBusy === 'checkout'}
              disabled={busy}
            />
          ) : null}
          {canVerify ? (
            <Button
              title={t('payment.verify')}
              variant="secondary"
              icon="refresh"
              onPress={() => handleVerify()}
              loading={paymentBusy === 'verify'}
              disabled={busy}
            />
          ) : null}
          {canSwitchToCash ? (
            <Button
              title={t('payment.chargeCash')}
              variant="secondary"
              icon="cash-outline"
              onPress={() => setConfirming('switch')}
              disabled={busy}
            />
          ) : null}
          {canMarkCash ? (
            <Button
              title={t('payment.cashReceived')}
              variant="success"
              icon="cash"
              onPress={() => setConfirming('cash')}
              disabled={busy}
            />
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
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: { ...typography.subtitle, color: colors.text },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  methodLabel: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, marginRight: spacing.sm },
  rowLabel: { ...typography.body, color: colors.textMuted, marginLeft: spacing.sm },
  rowValue: { ...typography.bodyStrong, color: colors.text },
  balanceBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  balanceCaption: { ...typography.caption, color: colors.textMuted },
  balanceAmount: { ...typography.amountLarge, color: colors.success, marginVertical: 2 },
  balanceNegative: { color: colors.danger },
  note: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  noticeSuccess: { backgroundColor: colors.successSoft, borderColor: colors.success },
  noticeDanger: { backgroundColor: colors.dangerSoft, borderColor: colors.danger },
  noticeText: { ...typography.bodyStrong, color: colors.text, flex: 1, marginLeft: spacing.sm },
  confirmBox: {
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  confirmText: { ...typography.bodyStrong, color: colors.text },
  error: { ...typography.body, color: colors.danger, textAlign: 'center', marginTop: spacing.md },
});
