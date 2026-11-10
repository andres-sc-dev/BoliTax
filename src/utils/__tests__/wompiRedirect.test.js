// AI-assisted: see docs/AI_LOG.md #14
import { getTransactionIdFromUrl, isRedirectUrl } from '../wompiRedirect';

const REDIRECT = 'https://example.com/bolitax/wompi-return';

describe('isRedirectUrl', () => {
  test('reconoce la redirect-url con el id de Wompi', () => {
    expect(isRedirectUrl(`${REDIRECT}?id=01-1531231271-19365`, REDIRECT)).toBe(true);
    expect(isRedirectUrl(REDIRECT, REDIRECT)).toBe(true);
  });

  test('no confunde las páginas del checkout ni URLs parecidas', () => {
    expect(isRedirectUrl('https://checkout.wompi.co/p/?public-key=pub_test_x', REDIRECT)).toBe(false);
    expect(isRedirectUrl(`${REDIRECT}-falsa?id=1`, REDIRECT)).toBe(false);
    expect(isRedirectUrl(undefined, REDIRECT)).toBe(false);
  });
});

describe('getTransactionIdFromUrl', () => {
  test('lee el id del ejemplo de la documentación de Wompi', () => {
    expect(getTransactionIdFromUrl(`${REDIRECT}?id=01-1531231271-19365`)).toBe('01-1531231271-19365');
  });

  test('funciona si hay otros parámetros', () => {
    expect(getTransactionIdFromUrl(`${REDIRECT}?env=test&id=abc-123&x=1`)).toBe('abc-123');
  });

  test('devuelve null si no hay id', () => {
    expect(getTransactionIdFromUrl(REDIRECT)).toBeNull();
    expect(getTransactionIdFromUrl(null)).toBeNull();
  });
});
