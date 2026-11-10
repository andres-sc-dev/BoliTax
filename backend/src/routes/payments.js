// AI-assisted: see docs/AI_LOG.md #14
// Cobro con Wompi (Sandbox) siguiendo el flujo obligatorio de la sección 4 del PDF:
// 1. La app pide crear el cobro con el tripId; el MONTO se lee del viaje en Firestore.
// 2. El backend firma el cobro con el secreto de integridad y devuelve la URL del Web Checkout.
// 3. El pasajero paga en el checkout de Wompi (WebView en la app).
// 4. La app pide verificar: el backend consulta la transacción DIRECTAMENTE a Wompi con la
//    llave privada (nunca se confía en la redirección) y actualiza el viaje.
// 5. La app ve el cambio en tiempo real (onSnapshot del viaje).
import { Router } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { canTransition } from '../../../src/utils/tripStatus.js';
import { requireDriver } from '../authMiddleware.js';
import { db } from '../firebaseAdmin.js';
import {
  buildCheckoutUrl,
  buildIntegritySignature,
  CURRENCY,
  mapWompiStatus,
  toCents,
  validateTransaction,
  WOMPI_REDIRECT_URL,
} from '../wompi.js';

const WOMPI_TIMEOUT_MS = 10000;

export const paymentsRouter = Router();

// error con código HTTP para el manejador de errores de server.js
function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// llaves de Wompi desde backend/.env (nunca están en la app ni en Git)
function wompiConfig() {
  const { WOMPI_PUBLIC_KEY, WOMPI_PRIVATE_KEY, WOMPI_INTEGRITY_SECRET, WOMPI_API_URL } = process.env;
  if (!WOMPI_PUBLIC_KEY || !WOMPI_PRIVATE_KEY || !WOMPI_INTEGRITY_SECRET || !WOMPI_API_URL) {
    throw httpError(500, 'Faltan variables de Wompi en backend/.env.');
  }
  return {
    publicKey: WOMPI_PUBLIC_KEY,
    privateKey: WOMPI_PRIVATE_KEY,
    integritySecret: WOMPI_INTEGRITY_SECRET,
    apiUrl: WOMPI_API_URL.replace(/\/$/, ''),
  };
}

// el viaje debe existir y ser del conductor que hace la petición
function ownedTrip(snapshot, uid) {
  if (!snapshot.exists) throw httpError(404, 'El viaje no existe.');
  const trip = snapshot.data();
  if (trip.driverId !== uid) throw httpError(403, 'Este viaje no es tuyo.');
  return trip;
}

// GET a la API de Wompi con la llave privada (única forma de consultar transacciones)
async function wompiGet(config, path) {
  let response;
  try {
    response = await fetch(`${config.apiUrl}${path}`, {
      headers: { Authorization: `Bearer ${config.privateKey}` },
      signal: AbortSignal.timeout(WOMPI_TIMEOUT_MS),
    });
  } catch {
    throw httpError(502, 'No se pudo conectar con Wompi.');
  }
  if (response.status === 404) return null;
  if (!response.ok) throw httpError(502, `Wompi respondió con un error (HTTP ${response.status}).`);
  return (await response.json()).data;
}

// transacción más reciente de una referencia (cuando la app no tiene el id)
async function findTransactionByReference(config, reference) {
  const list = await wompiGet(config, `/transactions?reference=${encodeURIComponent(reference)}`);
  if (!Array.isArray(list) || list.length === 0) return null;
  return [...list].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0];
}

// POST /payments/wompi/checkout { tripId } -> { checkoutUrl, redirectUrl, reference }
paymentsRouter.post('/wompi/checkout', requireDriver, async (req, res, next) => {
  try {
    const { tripId } = req.body ?? {};
    if (typeof tripId !== 'string' || !tripId) throw httpError(400, 'Falta el tripId.');
    const config = wompiConfig();
    const tripRef = db.collection('trips').doc(tripId);
    // referencia única por intento: un reintento tras un rechazo usa una referencia nueva
    const reference = `bolitax-${tripId}-${Date.now()}`;

    const amountInCents = await db.runTransaction(async (transaction) => {
      const trip = ownedTrip(await transaction.get(tripRef), req.uid);
      if (trip.status !== 'completed') throw httpError(409, 'Solo se puede cobrar un viaje finalizado.');
      if (trip.paymentMethod !== 'wompi') throw httpError(409, 'Este viaje no se paga con Wompi.');
      if (trip.paymentStatus === 'approved') throw httpError(409, 'Este viaje ya está pagado.');
      // el monto sale del viaje guardado, NUNCA de lo que envíe el cliente
      const cents = toCents(trip.fare + (trip.tip ?? 0));
      transaction.update(tripRef, {
        paymentReference: reference,
        paymentStatus: 'pending',
        paymentRequestedAt: FieldValue.serverTimestamp(),
      });
      return cents;
    });

    const signature = buildIntegritySignature(reference, amountInCents, CURRENCY, config.integritySecret);
    res.json({
      checkoutUrl: buildCheckoutUrl({
        publicKey: config.publicKey,
        reference,
        amountInCents,
        signature,
        redirectUrl: WOMPI_REDIRECT_URL,
      }),
      redirectUrl: WOMPI_REDIRECT_URL,
      reference,
    });
  } catch (error) {
    next(error);
  }
});

// POST /payments/wompi/verify { tripId, transactionId? } -> { paymentStatus }
paymentsRouter.post('/wompi/verify', requireDriver, async (req, res, next) => {
  try {
    const { tripId, transactionId } = req.body ?? {};
    if (typeof tripId !== 'string' || !tripId) throw httpError(400, 'Falta el tripId.');
    const config = wompiConfig();
    const tripRef = db.collection('trips').doc(tripId);
    const trip = ownedTrip(await tripRef.get(), req.uid);

    // un viaje ya pagado responde su estado actual SIN error (ej: una segunda verificación)
    if (trip.status === 'paid') {
      res.json({ paymentStatus: trip.paymentStatus, alreadyPaid: true });
      return;
    }
    // AI-assisted: see docs/AI_LOG.md #15
    // si el conductor cambió el cobro a efectivo, ya no se verifica con Wompi
    if (trip.paymentMethod !== 'wompi') {
      throw httpError(409, 'Este viaje se cobra en efectivo, no con Wompi.');
    }
    if (!trip.paymentReference) throw httpError(409, 'Este viaje no tiene un cobro iniciado.');

    // se consulta a Wompi: por id (si la redirección lo trajo) o por la referencia del viaje
    const wompiTransaction = transactionId
      ? await wompiGet(config, `/transactions/${encodeURIComponent(transactionId)}`)
      : await findTransactionByReference(config, trip.paymentReference);

    if (!wompiTransaction) {
      res.json({ paymentStatus: 'pending', message: 'Todavía no hay un pago registrado para este cobro.' });
      return;
    }

    // la transacción debe ser la de este cobro: misma referencia, monto y moneda
    const invalid = validateTransaction(wompiTransaction, trip);
    if (invalid) throw httpError(422, invalid);

    const paymentStatus = mapWompiStatus(wompiTransaction.status);

    await db.runTransaction(async (transaction) => {
      const fresh = (await transaction.get(tripRef)).data();
      if (fresh.status === 'paid') return; // ya se registró (ej: dos verificaciones seguidas)
      if (fresh.paymentReference !== wompiTransaction.reference) {
        throw httpError(409, 'Hay un cobro más reciente para este viaje. Vuelve a verificar.');
      }
      const update = {
        paymentStatus,
        paymentId: wompiTransaction.id,
        wompiStatus: wompiTransaction.status,
        paymentVerifiedAt: FieldValue.serverTimestamp(),
      };
      // pago aprobado: completed -> paid (la misma regla de transiciones que usa la app)
      if (paymentStatus === 'approved') {
        if (!canTransition(fresh.status, 'paid')) {
          throw httpError(409, `El viaje no puede pasar de "${fresh.status}" a "paid".`);
        }
        update.status = 'paid';
        update.paidAt = FieldValue.serverTimestamp();
      }
      transaction.update(tripRef, update);
    });

    res.json({ paymentStatus });
  } catch (error) {
    next(error);
  }
});
