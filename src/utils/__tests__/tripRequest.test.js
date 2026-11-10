// AI-assisted: see docs/AI_LOG.md #10
import { formatCOP } from '../formatCurrency';
import { isRequestStale, pickNextRequest, secondsLeft, toMillis } from '../tripRequest';

// imita un Timestamp de Firestore
const ts = (ms) => ({ toMillis: () => ms });
const NOW = 1_000_000;

describe('toMillis', () => {
  test('acepta Timestamp de Firestore, Date y null', () => {
    expect(toMillis(ts(500))).toBe(500);
    expect(toMillis(new Date(700))).toBe(700);
    expect(toMillis(null)).toBeNull();
  });
});

describe('isRequestStale', () => {
  test('una solicitud de hace 30 s no está vencida', () => {
    expect(isRequestStale({ createdAt: ts(NOW - 30_000) }, NOW)).toBe(false);
  });

  test('una solicitud de hace 3 min está vencida', () => {
    expect(isRequestStale({ createdAt: ts(NOW - 180_000) }, NOW)).toBe(true);
  });

  test('sin createdAt (serverTimestamp pendiente) no se considera vencida', () => {
    expect(isRequestStale({ createdAt: null }, NOW)).toBe(false);
  });
});

describe('pickNextRequest', () => {
  test('elige la más antigua que no esté vencida', () => {
    const requests = [
      { id: 'nueva', createdAt: ts(NOW - 5_000) },
      { id: 'vieja', createdAt: ts(NOW - 300_000) },
      { id: 'media', createdAt: ts(NOW - 20_000) },
    ];
    expect(pickNextRequest(requests, NOW).id).toBe('media');
  });

  test('devuelve null si no hay solicitudes', () => {
    expect(pickNextRequest([], NOW)).toBeNull();
  });
});

describe('secondsLeft', () => {
  test('empieza en 15 y baja segundo a segundo', () => {
    expect(secondsLeft(NOW, NOW)).toBe(15);
    expect(secondsLeft(NOW, NOW + 1_000)).toBe(14);
    expect(secondsLeft(NOW, NOW + 14_999)).toBe(1);
  });

  test('nunca es negativo', () => {
    expect(secondsLeft(NOW, NOW + 60_000)).toBe(0);
  });
});

describe('formatCOP', () => {
  test('pesos enteros con separador de miles', () => {
    expect(formatCOP(26900)).toBe('$26.900');
    expect(formatCOP(1234567)).toBe('$1.234.567');
    expect(formatCOP(500)).toBe('$500');
    expect(formatCOP(-5380)).toBe('-$5.380');
  });
});
