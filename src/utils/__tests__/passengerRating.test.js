// AI-assisted: see docs/AI_LOG.md #17
import { RATING_WEIGHTS, simulatePassengerRating } from '../passengerRating';

describe('simulatePassengerRating', () => {
  test('los pesos suman 1', () => {
    const total = RATING_WEIGHTS.reduce((sum, [, weight]) => sum + weight, 0);
    expect(total).toBeCloseTo(1, 10);
  });

  test('cada tramo de random da la calificación esperada', () => {
    expect(simulatePassengerRating(() => 0)).toBe(5);
    expect(simulatePassengerRating(() => 0.59)).toBe(5);
    expect(simulatePassengerRating(() => 0.6)).toBe(4);
    expect(simulatePassengerRating(() => 0.84)).toBe(4);
    expect(simulatePassengerRating(() => 0.86)).toBe(3);
    expect(simulatePassengerRating(() => 0.96)).toBe(2);
    expect(simulatePassengerRating(() => 0.99)).toBe(1);
    expect(simulatePassengerRating(() => 0.9999999)).toBe(1);
  });

  test('siempre devuelve un entero de 1 a 5, y 4 o 5 la mayoría de las veces', () => {
    // generador determinista: recorre 0, 0.001, 0.002 ... 0.999
    const results = Array.from({ length: 1000 }, (_, i) => simulatePassengerRating(() => i / 1000));
    results.forEach((stars) => {
      expect(Number.isInteger(stars)).toBe(true);
      expect(stars).toBeGreaterThanOrEqual(1);
      expect(stars).toBeLessThanOrEqual(5);
    });
    const high = results.filter((stars) => stars >= 4).length;
    expect(high).toBe(850);
  });
});
