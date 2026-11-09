// AI-assisted: see docs/AI_LOG.md #2
// Única fuente de verdad para tarifas y comisión (sección 5 de los requisitos).
// Todos los montos son pesos colombianos enteros para evitar errores con decimales.
// Valores didácticos, no son tarifas reales.

export const PRICING = {
  // monto fijo que se cobra al iniciar cada viaje
  baseFare: 3500,
  // valor por kilómetro recorrido
  perKm: 1200,
  // valor por minuto de duración
  perMinute: 250,
  // tarifa mínima de un viaje (se aplica después del multiplicador de categoría)
  minimumFare: 6000,
  // la tarifa se redondea al múltiplo más cercano de este valor
  roundingStep: 100,
  // porcentaje de la tarifa que se queda la plataforma (20 %); la propina no entra aquí
  commissionRate: 0.2,
  // multiplicador de tarifa según la categoría del vehículo
  categoryMultipliers: {
    economy: 1.0,
    xl: 1.4,
    premium: 1.8,
  },
};
