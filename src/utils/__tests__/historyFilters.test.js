// AI-assisted: see docs/AI_LOG.md #17
import { getPeriodRange } from '../earnings';
import { formatTripDateTime, getHistoryRange } from '../historyFilters';

// hora de Colombia -> instante UTC (Colombia = UTC−5)
const bogota = (year, month, day, hour = 0, minute = 0) =>
  Date.UTC(year, month - 1, day, hour + 5, minute);

describe('getHistoryRange', () => {
  const now = bogota(2026, 11, 11, 10);

  test('Hoy, Semana y Mes reutilizan los mismos rangos de Ganancias', () => {
    ['today', 'week', 'month'].forEach((period) => {
      expect(getHistoryRange(period, now)).toEqual(getPeriodRange(period, now));
    });
  });

  test('el rango va del inicio del día "desde" al final del día "hasta" en Colombia', () => {
    // el selector de fecha entrega Date locales: se usa el día que muestra
    const range = getHistoryRange('range', now, {
      from: new Date(2026, 10, 1, 15, 30),
      to: new Date(2026, 10, 3, 8, 0),
    });
    expect(range.start).toBe(bogota(2026, 11, 1, 0));
    expect(range.end).toBe(bogota(2026, 11, 4, 0) - 1);
  });

  test('un rango de un solo día incluye todo ese día', () => {
    const day = new Date(2026, 10, 5);
    const range = getHistoryRange('range', now, { from: day, to: day });
    expect(range.end - range.start).toBe(24 * 60 * 60 * 1000 - 1);
  });

  test('si falta una fecha o "desde" es posterior a "hasta" devuelve null', () => {
    expect(getHistoryRange('range', now, { from: new Date(2026, 10, 1) })).toBeNull();
    expect(
      getHistoryRange('range', now, { from: new Date(2026, 10, 10), to: new Date(2026, 10, 1) }),
    ).toBeNull();
  });
});

describe('formatTripDateTime', () => {
  test('muestra fecha y hora de Colombia', () => {
    expect(formatTripDateTime(bogota(2026, 11, 9, 14, 35))).toBe('09/11/2026 14:35');
  });

  test('a las 23:50 de Colombia sigue siendo el mismo día (ya es el siguiente en UTC)', () => {
    expect(formatTripDateTime(bogota(2026, 12, 31, 23, 50))).toBe('31/12/2026 23:50');
  });

  test('sin fecha válida', () => {
    expect(formatTripDateTime(null)).toBe('Sin fecha');
  });
});
