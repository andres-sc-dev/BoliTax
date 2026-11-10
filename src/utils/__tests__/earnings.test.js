// AI-assisted: see docs/AI_LOG.md #16
import { getPeriodRange, getTripDateMs, summarizeTrips } from '../earnings';

// hora de Colombia -> instante UTC (Colombia = UTC−5)
const bogota = (year, month, day, hour = 0, minute = 0) =>
  Date.UTC(year, month - 1, day, hour + 5, minute);
const ts = (ms) => ({ toMillis: () => ms });

describe('getPeriodRange', () => {
  test('hoy va de las 00:00 a las 23:59:59.999 en hora de Colombia', () => {
    const range = getPeriodRange('today', bogota(2026, 11, 11, 10));
    expect(range.start).toBe(bogota(2026, 11, 11, 0));
    expect(range.end).toBe(bogota(2026, 11, 12, 0) - 1);
  });

  test('a las 23:59 en Colombia (ya 04:59 UTC del día siguiente) sigue siendo el mismo día', () => {
    const range = getPeriodRange('today', bogota(2026, 11, 9, 23, 59));
    expect(range.start).toBe(bogota(2026, 11, 9, 0));
  });

  test('la semana empieza el lunes (9 de noviembre de 2026 es lunes)', () => {
    const range = getPeriodRange('week', bogota(2026, 11, 11, 10)); // miércoles
    expect(range.start).toBe(bogota(2026, 11, 9, 0));
    expect(range.end).toBe(bogota(2026, 11, 16, 0) - 1);
  });

  test('un domingo pertenece a la semana que empezó el lunes anterior', () => {
    const range = getPeriodRange('week', bogota(2026, 11, 15, 22)); // domingo
    expect(range.start).toBe(bogota(2026, 11, 9, 0));
  });

  test('el mes va del día 1 al último día, incluso en diciembre', () => {
    const november = getPeriodRange('month', bogota(2026, 11, 20, 8));
    expect(november.start).toBe(bogota(2026, 11, 1, 0));
    expect(november.end).toBe(bogota(2026, 12, 1, 0) - 1);
    const december = getPeriodRange('month', bogota(2026, 12, 31, 23));
    expect(december.end).toBe(bogota(2027, 1, 1, 0) - 1);
  });

  test('un periodo inválido lanza error', () => {
    expect(() => getPeriodRange('year', Date.now())).toThrow();
  });
});

describe('getTripDateMs', () => {
  test('usa completedAt y, si falta, createdAt', () => {
    expect(getTripDateMs({ completedAt: ts(200), createdAt: ts(100) })).toBe(200);
    expect(getTripDateMs({ completedAt: null, createdAt: ts(100) })).toBe(100);
    expect(getTripDateMs({})).toBeNull();
  });
});

describe('summarizeTrips', () => {
  const today = getPeriodRange('today', bogota(2026, 11, 11, 18));
  // valores de la sección 5 del PDF: económico 19.200 y XL 26.900
  const trips = [
    {
      status: 'paid',
      completedAt: ts(bogota(2026, 11, 11, 9)),
      fare: 19200,
      commission: 3840,
      tip: 0,
      driverEarnings: 15360,
    },
    {
      status: 'completed',
      completedAt: ts(bogota(2026, 11, 11, 15)),
      fare: 26900,
      commission: 5380,
      tip: 2000,
      driverEarnings: 23520,
    },
    // fuera del rango (ayer)
    {
      status: 'paid',
      completedAt: ts(bogota(2026, 11, 10, 23)),
      fare: 10000,
      commission: 2000,
      tip: 0,
      driverEarnings: 8000,
    },
    // cancelado: no cuenta
    {
      status: 'cancelled',
      completedAt: ts(bogota(2026, 11, 11, 12)),
      fare: 50000,
      commission: 10000,
      tip: 0,
      driverEarnings: 40000,
    },
  ];

  test('suma los viajes realizados del periodo', () => {
    expect(summarizeTrips(trips, today)).toEqual({
      count: 2,
      billed: 46100,
      commissions: 9220,
      tips: 2000,
      net: 38880,
      average: 19440,
    });
  });

  test('sin viajes todo queda en 0 y el promedio no divide por cero', () => {
    expect(summarizeTrips([], today)).toEqual({
      count: 0,
      billed: 0,
      commissions: 0,
      tips: 0,
      net: 0,
      average: 0,
    });
  });
});
