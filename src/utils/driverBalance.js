// AI-assisted: see docs/AI_LOG.md #15
// Saldo del conductor (secciones 4 y 5 del PDF):
// - Viaje pagado por la pasarela (Wompi aprobado): la plataforma recibió el dinero y le debe al
//   conductor su ganancia neta -> +driverEarnings.
// - Viaje pagado en efectivo: el conductor ya tiene el dinero en la mano, pero la plataforma no
//   cobró su comisión -> se descuenta del saldo: -commission (el saldo puede quedar negativo).
// - Viajes sin pagar, cancelados o rechazados no afectan el saldo.
// Funciones puras: se prueban con Jest y se usarán en la pantalla de Ganancias.

// cuánto suma (o resta) un viaje al saldo del conductor
export function getBalanceImpact(trip) {
  if (!trip || trip.status !== 'paid') return 0;
  if (trip.paymentMethod === 'wompi' && trip.paymentStatus === 'approved') {
    return trip.driverEarnings ?? 0;
  }
  if (trip.paymentMethod === 'cash' && trip.paymentStatus === 'cash') {
    return -(trip.commission ?? 0);
  }
  return 0;
}

// saldo total: suma del impacto de cada viaje (pesos enteros, puede ser negativo)
export function calculateDriverBalance(trips) {
  if (!Array.isArray(trips)) return 0;
  return trips.reduce((balance, trip) => balance + getBalanceImpact(trip), 0);
}
