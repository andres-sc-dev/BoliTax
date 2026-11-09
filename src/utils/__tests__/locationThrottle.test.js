// AI-assisted: see docs/AI_LOG.md #8
import { shouldSendLocation } from '../locationThrottle';

describe('shouldSendLocation', () => {
  test('la primera ubicación siempre se envía', () => {
    expect(shouldSendLocation(null, 1000, 5000)).toBe(true);
  });

  test('no se envía si no han pasado 5 segundos desde la última', () => {
    expect(shouldSendLocation(10000, 14999, 5000)).toBe(false);
  });

  test('se envía al cumplirse exactamente el intervalo', () => {
    expect(shouldSendLocation(10000, 15000, 5000)).toBe(true);
  });

  test('usa 5 segundos como intervalo por defecto', () => {
    expect(shouldSendLocation(0, 4000)).toBe(false);
    expect(shouldSendLocation(0, 5000)).toBe(true);
  });
});
