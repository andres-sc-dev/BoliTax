// AI-assisted: see docs/AI_LOG.md #14
// Tests con el runner incluido en Node (node --test), sin dependencias.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildCheckoutUrl,
  buildIntegritySignature,
  mapWompiStatus,
  toCents,
  validateTransaction,
} from './wompi.js';

test('la firma coincide con el ejemplo oficial de la documentación de Wompi', () => {
  const signature = buildIntegritySignature(
    'sk8-438k4-xmxm392-sn2m',
    2490000,
    'COP',
    'prod_integrity_Z5mMke9x0k8gpErbDqwrJXMqsI6SFli6',
  );
  assert.equal(signature, '37c8407747e595535433ef8f6a811d853cd943046624a0ec04662b17bbf33bf5');
});

test('toCents convierte pesos enteros y rechaza montos inválidos', () => {
  assert.equal(toCents(26900), 2690000);
  assert.throws(() => toCents(0));
  assert.throws(() => toCents(-100));
  assert.throws(() => toCents(10.5));
});

test('mapWompiStatus traduce los estados de Wompi', () => {
  assert.equal(mapWompiStatus('APPROVED'), 'approved');
  assert.equal(mapWompiStatus('PENDING'), 'pending');
  assert.equal(mapWompiStatus('DECLINED'), 'rejected');
  assert.equal(mapWompiStatus('VOIDED'), 'rejected');
  assert.equal(mapWompiStatus('ERROR'), 'rejected');
});

test('buildCheckoutUrl incluye los parámetros obligatorios', () => {
  const url = new URL(
    buildCheckoutUrl({
      publicKey: 'pub_test_x',
      reference: 'ref-1',
      amountInCents: 2690000,
      signature: 'abc',
      redirectUrl: 'https://example.com/bolitax/wompi-return',
    }),
  );
  assert.equal(url.origin + url.pathname, 'https://checkout.wompi.co/p/');
  assert.equal(url.searchParams.get('public-key'), 'pub_test_x');
  assert.equal(url.searchParams.get('currency'), 'COP');
  assert.equal(url.searchParams.get('amount-in-cents'), '2690000');
  assert.equal(url.searchParams.get('reference'), 'ref-1');
  assert.equal(url.searchParams.get('signature:integrity'), 'abc');
  assert.equal(url.searchParams.get('redirect-url'), 'https://example.com/bolitax/wompi-return');
});

test('validateTransaction exige referencia, monto y moneda del viaje', () => {
  const trip = { paymentReference: 'ref-1', fare: 26900, tip: 0 };
  const ok = { reference: 'ref-1', amount_in_cents: 2690000, currency: 'COP' };
  assert.equal(validateTransaction(ok, trip), null);
  assert.match(validateTransaction({ ...ok, reference: 'otra' }, trip), /referencia/);
  assert.match(validateTransaction({ ...ok, amount_in_cents: 100 }, trip), /monto/);
  assert.match(validateTransaction({ ...ok, currency: 'USD' }, trip), /moneda/);
  assert.notEqual(validateTransaction(null, trip), null);
});
