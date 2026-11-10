// AI-assisted: see docs/AI_LOG.md #14
// Llamadas de la app al backend de pagos (Wompi). La app NUNCA tiene llaves de Wompi:
// solo envía el tripId; el backend lee el monto del viaje, firma el cobro y consulta a Wompi.
import { auth, getIdToken } from './firebase';

// URL del backend; en el emulador de Android es http://10.0.2.2:3000 (no es un secreto)
const API_URL = process.env.EXPO_PUBLIC_API_URL;
// AI-assisted: see docs/AI_LOG.md #15
// 20 s: la primera petición tras encender el backend inicializa firebase-admin y consulta a Wompi
const TIMEOUT_MS = 20000;

function paymentError(code, message, cause) {
  const error = new Error(message);
  error.code = code;
  error.cause = cause;
  return error;
}

// POST al backend con el ID token del conductor en el header
async function postToBackend(path, body) {
  if (!API_URL) {
    throw paymentError('payments/no-api-url', 'Falta EXPO_PUBLIC_API_URL en el archivo .env de la app.');
  }
  const user = auth.currentUser;
  if (!user) throw paymentError('payments/no-session', 'Tu sesión expiró. Vuelve a iniciar sesión.');
  const token = await getIdToken(user);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    // AI-assisted: see docs/AI_LOG.md #15
    // se distingue el tiempo agotado de una conexión fallida para saber qué pasó
    if (controller.signal.aborted) {
      throw paymentError(
        'payments/timeout',
        'El servidor de pagos tardó demasiado en responder. Toca "Verificar pago" para consultar el estado.',
        error,
      );
    }
    throw paymentError(
      'payments/network',
      'No se pudo conectar con el servidor de pagos. Revisa que el backend esté encendido.',
      error,
    );
  } finally {
    clearTimeout(timer);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw paymentError('payments/http', data.error ?? `Error del servidor de pagos (HTTP ${response.status}).`);
  }
  return data;
}

// pide al backend el cobro: { checkoutUrl, redirectUrl, reference }
export function createWompiCheckout(tripId) {
  return postToBackend('/payments/wompi/checkout', { tripId });
}

// pide al backend verificar el pago con Wompi; sin transactionId busca por la referencia del viaje
export function verifyWompiPayment(tripId, transactionId) {
  return postToBackend('/payments/wompi/verify', transactionId ? { tripId, transactionId } : { tripId });
}
