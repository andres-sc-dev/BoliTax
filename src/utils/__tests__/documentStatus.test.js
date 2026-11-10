// AI-assisted: see docs/AI_LOG.md #18
import { getDocumentStatus } from '../documentStatus';

// hora de Colombia -> instante UTC (Colombia = UTC−5)
const bogota = (year, month, day, hour = 12) => Date.UTC(year, month - 1, day, hour + 5);
const ts = (ms) => ({ toMillis: () => ms });
const NOW = bogota(2026, 11, 11, 10);

describe('getDocumentStatus', () => {
  test('una fecha anterior a hoy está vencida', () => {
    expect(getDocumentStatus(ts(bogota(2026, 11, 10)), NOW)).toBe('expired');
  });

  test('vence hoy o dentro de 30 días: "vence pronto"', () => {
    expect(getDocumentStatus(ts(bogota(2026, 11, 11, 0)), NOW)).toBe('expiring');
    expect(getDocumentStatus(ts(bogota(2026, 12, 11)), NOW)).toBe('expiring'); // 30 días
  });

  test('a 31 días o más está vigente', () => {
    expect(getDocumentStatus(ts(bogota(2026, 12, 12)), NOW)).toBe('valid');
    expect(getDocumentStatus(new Date(bogota(2030, 1, 1)), NOW)).toBe('valid');
  });

  test('compara por día de Colombia: a las 23:00 de Colombia ya es el día siguiente en UTC', () => {
    // el documento vence el 11 a las 23:00 de Colombia; "hoy" sigue siendo 11 -> vence pronto
    expect(getDocumentStatus(bogota(2026, 11, 11, 23), bogota(2026, 11, 11, 23))).toBe('expiring');
  });

  test('sin fecha devuelve "none"', () => {
    expect(getDocumentStatus(null, NOW)).toBe('none');
    expect(getDocumentStatus(undefined, NOW)).toBe('none');
  });
});
