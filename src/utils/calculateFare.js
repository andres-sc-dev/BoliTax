// AI-assisted: see docs/AI_LOG.md #1
import { PRICING } from '../config/pricing';

// lanza un error si un valor numerico falta, es negativo o no es finito
function assertNonNegativeNumber(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a non negative number`);
  }
}

// redondea un valor al multiplo mas cercano del paso configurado
function roundToStep(value, step) {
  return Math.round(value / step) * step;
}

/**
 * calcula la tarifa, la comision de la plataforma y la ganancia neta del conductor.
 * es una funcion pura: no tiene efectos secundarios y solo lee la configuracion de precios.
 *
 * @param {object} trip datos del viaje
 * @param {number} trip.distanceKm distancia del viaje en kilometros
 * @param {number} trip.durationMin duracion del viaje en minutos
 * @param {string} trip.category 'economy', 'xl' o 'premium'
 * @param {number} [trip.tip=0] propina en cop, va completa para el conductor
 * @returns {{ fare: number, commission: number, driverEarnings: number }} valores enteros en cop
 */
export function calculateFare({ distanceKm, durationMin, category, tip = 0 }) {
  assertNonNegativeNumber(distanceKm, 'distanceKm');
  assertNonNegativeNumber(durationMin, 'durationMin');
  assertNonNegativeNumber(tip, 'tip');

  const hasCategory = Object.prototype.hasOwnProperty.call(
    PRICING.categoryMultipliers,
    category
  );
  if (!hasCategory) {
    throw new Error(`unknown category: ${category}`);
  }
  const multiplier = PRICING.categoryMultipliers[category];

  // (base + km * valor por km + min * valor por minuto) * multiplicador de categoria
  const rawFare =
    (PRICING.baseFare +
      distanceKm * PRICING.perKm +
      durationMin * PRICING.perMinute) *
    multiplier;

  // se aplica la tarifa minima y luego se redondea a 100 cop antes de calcular la comision
  const fare = roundToStep(
    Math.max(PRICING.minimumFare, rawFare),
    PRICING.roundingStep
  );

  const commission = Math.round(fare * PRICING.commissionRate);
  const driverEarnings = fare - commission + Math.round(tip);

  return { fare, commission, driverEarnings };
}