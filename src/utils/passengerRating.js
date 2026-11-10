// AI-assisted: see docs/AI_LOG.md #17
// Calificación simulada del pasajero (sección 6 del PDF: campo rating de 1 a 5).
// No existe app de pasajero, así que se simula al marcarse el viaje como pagado:
// la mayoría 4 y 5 estrellas. Función pura: `random` se recibe como parámetro para los tests.
// La comparten la app (pago en efectivo) y el backend (pago aprobado por Wompi).

// probabilidad de cada calificación (suman 1)
export const RATING_WEIGHTS = [
  [5, 0.6],
  [4, 0.25],
  [3, 0.1],
  [2, 0.03],
  [1, 0.02],
];

export function simulatePassengerRating(random = Math.random) {
  let value = random();
  for (const [stars, weight] of RATING_WEIGHTS) {
    if (value < weight) return stars;
    value -= weight;
  }
  // por redondeos de punto flotante, un valor muy cercano a 1 cae aquí
  return RATING_WEIGHTS[RATING_WEIGHTS.length - 1][0];
}
