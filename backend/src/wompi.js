// AI-assisted: see docs/AI_LOG.md #14
// Funciones puras para Wompi (Web Checkout). Basadas en la documentación oficial:
// https://docs.wompi.co/docs/colombia/widget-checkout-web/
import { createHash } from 'node:crypto';

export const WOMPI_CHECKOUT_URL = 'https://checkout.wompi.co/p/';
export const CURRENCY = 'COP';
// URL a la que Wompi redirige al terminar; la app la intercepta en el WebView y NUNCA la carga.
// example.com es un dominio reservado para ejemplos.
export const WOMPI_REDIRECT_URL = 'https://example.com/bolitax/wompi-return';

// los montos de la app son pesos enteros; Wompi los recibe en centavos
export function toCents(pesos) {
  if (!Number.isInteger(pesos) || pesos <= 0) {
    throw new Error(`Monto inválido para cobrar: ${pesos}`);
  }
  return pesos * 100;
}

// firma de integridad: SHA256 (hex) de "<referencia><montoEnCentavos><moneda><secreto>".
// Se calcula SOLO en el servidor porque usa el secreto de integridad.
export function buildIntegritySignature(reference, amountInCents, currency, integritySecret) {
  return createHash('sha256')
    .update(`${reference}${amountInCents}${currency}${integritySecret}`)
    .digest('hex');
}

// URL del Web Checkout (GET) con los parámetros obligatorios y la redirect-url
export function buildCheckoutUrl({ publicKey, reference, amountInCents, signature, redirectUrl }) {
  const params = new URLSearchParams({
    'public-key': publicKey,
    currency: CURRENCY,
    'amount-in-cents': String(amountInCents),
    reference,
    'signature:integrity': signature,
    'redirect-url': redirectUrl,
  });
  return `${WOMPI_CHECKOUT_URL}?${params.toString()}`;
}

// estados de Wompi -> paymentStatus de la app (sección 3 del PDF: Aprobado, Pendiente, Rechazado)
export function mapWompiStatus(wompiStatus) {
  switch (wompiStatus) {
    case 'APPROVED':
      return 'approved';
    case 'PENDING':
      return 'pending';
    case 'DECLINED':
    case 'VOIDED':
    case 'ERROR':
      return 'rejected';
    default:
      return 'pending';
  }
}

// La transacción que devuelve Wompi debe ser la de ESTE viaje: misma referencia, monto y moneda.
// Devuelve null si coincide, o un mensaje con el motivo si no.
export function validateTransaction(transaction, trip) {
  if (!transaction) return 'Wompi no devolvió la transacción.';
  if (transaction.reference !== trip.paymentReference) {
    return 'La transacción no corresponde a este viaje (referencia distinta).';
  }
  const expectedCents = toCents(trip.fare + (trip.tip ?? 0));
  if (transaction.amount_in_cents !== expectedCents) {
    return 'El monto pagado no coincide con la tarifa del viaje.';
  }
  if (transaction.currency !== CURRENCY) return 'La moneda del pago no es COP.';
  return null;
}
