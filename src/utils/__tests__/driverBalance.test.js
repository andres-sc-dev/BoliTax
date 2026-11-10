// AI-assisted: see docs/AI_LOG.md #15
import { calculateDriverBalance, getBalanceImpact } from '../driverBalance';

// valores del ejemplo de la sección 5 del PDF (viaje económico de 8,5 km y 22 min)
const WOMPI_PAID = {
  status: 'paid',
  paymentMethod: 'wompi',
  paymentStatus: 'approved',
  fare: 19200,
  commission: 3840,
  driverEarnings: 15360,
};
const CASH_PAID = {
  status: 'paid',
  paymentMethod: 'cash',
  paymentStatus: 'cash',
  fare: 19200,
  commission: 3840,
  driverEarnings: 15360,
};

describe('getBalanceImpact', () => {
  test('un viaje pagado por Wompi suma la ganancia neta', () => {
    expect(getBalanceImpact(WOMPI_PAID)).toBe(15360);
  });

  test('un viaje en efectivo resta la comisión', () => {
    expect(getBalanceImpact(CASH_PAID)).toBe(-3840);
  });

  test('viajes sin pagar o con el pago rechazado no cambian el saldo', () => {
    expect(getBalanceImpact({ ...WOMPI_PAID, status: 'completed', paymentStatus: 'pending' })).toBe(0);
    expect(getBalanceImpact({ ...WOMPI_PAID, status: 'completed', paymentStatus: 'rejected' })).toBe(0);
    expect(getBalanceImpact({ ...CASH_PAID, status: 'cancelled' })).toBe(0);
    expect(getBalanceImpact(null)).toBe(0);
  });
});

describe('calculateDriverBalance', () => {
  test('suma pasarela y resta comisiones de efectivo', () => {
    expect(calculateDriverBalance([WOMPI_PAID, CASH_PAID])).toBe(15360 - 3840);
  });

  test('solo efectivo deja el saldo en negativo', () => {
    expect(calculateDriverBalance([CASH_PAID, CASH_PAID])).toBe(-7680);
  });

  test('ignora viajes no pagados', () => {
    const pending = { ...WOMPI_PAID, status: 'completed', paymentStatus: 'pending' };
    expect(calculateDriverBalance([WOMPI_PAID, pending])).toBe(15360);
  });

  test('lista vacía o inválida da 0', () => {
    expect(calculateDriverBalance([])).toBe(0);
    expect(calculateDriverBalance(undefined)).toBe(0);
  });
});
