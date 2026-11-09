// AI-assisted: see docs/AI_LOG.md #2
import { PRICING } from '../config/pricing';

// lanza un error si el valor no es un número finito mayor o igual a cero
function assertNonNegativeNumber(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a non-negative number`);
  }
}

// redondea un valor al múltiplo más cercano del paso indicado
function roundToStep(value, step) {
  return Math.round(value / step) * step;
}

/**
 * Calcula la tarifa, la comisión de la plataforma y la ganancia neta del conductor.
 * Es una función pura: mismo resultado para las mismas entradas y sin efectos secundarios.
 *
 * @param {object} trip datos del viaje
 * @param {number} trip.distanceKm distancia en kilómetros
 * @param {number} trip.durationMin duración en minutos
 * @param {string} trip.category 'economy', 'xl' o 'premium'
 * @param {number} [trip.tip=0] propina en COP, va completa al conductor
 * @returns {{ fare: number, commission: number, driverEarnings: number }} montos enteros en COP
 */
export function calculateFare({ distanceKm, durationMin, category, tip = 0 }) {
  assertNonNegativeNumber(distanceKm, 'distanceKm');
  assertNonNegativeNumber(durationMin, 'durationMin');
  assertNonNegativeNumber(tip, 'tip');

  // hasOwnProperty evita que nombres heredados como 'toString' pasen como categoría
  const isValidCategory = Object.prototype.hasOwnProperty.call(
    PRICING.categoryMultipliers,
    category
  );
  if (!isValidCategory) {
    throw new Error(`Invalid category: ${category}`);
  }
  const multiplier = PRICING.categoryMultipliers[category];

  // (base + distancia + tiempo) × multiplicador de categoría
  const rawFare =
    (PRICING.baseFare +
      distanceKm * PRICING.perKm +
      durationMin * PRICING.perMinute) *
    multiplier;

  // se aplica la tarifa mínima y se redondea a 100 COP ANTES de calcular la comisión
  const fare = roundToStep(
    Math.max(PRICING.minimumFare, rawFare),
    PRICING.roundingStep
  );

  const commission = Math.round(fare * PRICING.commissionRate);
  // la propina no paga comisión: se suma completa a la ganancia del conductor
  const driverEarnings = fare - commission + Math.round(tip);

  return { fare, commission, driverEarnings };
}
