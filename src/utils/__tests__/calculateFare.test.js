// AI-assisted: see docs/AI_LOG.md #2
import { calculateFare } from '../calculateFare';

describe('calculateFare', () => {
  // ejemplo de la sección 5: 8,5 km y 22 minutos, sin propina
  const exampleTrip = { distanceKm: 8.5, durationMin: 22 };

  test('ejemplo de la sección 5 en categoría economy', () => {
    expect(calculateFare({ ...exampleTrip, category: 'economy' })).toEqual({
      fare: 19200,
      commission: 3840,
      driverEarnings: 15360,
    });
  });

  test('ejemplo de la sección 5 en categoría xl (26.880 se redondea a 26.900)', () => {
    expect(calculateFare({ ...exampleTrip, category: 'xl' })).toEqual({
      fare: 26900,
      commission: 5380,
      driverEarnings: 21520,
    });
  });

  test('un viaje corto cobra la tarifa mínima', () => {
    // 3.500 + 1.200 + 500 = 5.200, por debajo de la mínima de 6.000
    expect(
      calculateFare({ distanceKm: 1, durationMin: 2, category: 'economy' })
    ).toEqual({
      fare: 6000,
      commission: 1200,
      driverEarnings: 4800,
    });
  });

  test('la propina va completa al conductor y no paga comisión', () => {
    expect(
      calculateFare({ ...exampleTrip, category: 'economy', tip: 2000 })
    ).toEqual({
      fare: 19200,
      commission: 3840,
      driverEarnings: 17360,
    });
  });

  test('una categoría inválida lanza un error', () => {
    expect(() => calculateFare({ ...exampleTrip, category: 'moto' })).toThrow(
      'Invalid category'
    );
  });

  test('una distancia negativa lanza un error', () => {
    expect(() =>
      calculateFare({ distanceKm: -1, durationMin: 5, category: 'economy' })
    ).toThrow('distanceKm');
  });
});
