// AI-assisted: see docs/AI_LOG.md #1
// unica fuente de verdad para tarifas y comision.
// todos los valores de dinero son pesos colombianos enteros para evitar errores de decimales.
// valores de referencia para la clase, no son tarifas reales.

export const PRICING = {
  // monto fijo que se cobra al iniciar cada viaje
  baseFare: 3500,
  // precio por kilometro
  perKm: 1200,
  // precio por minuto
  perMinute: 250,
  // tarifa minima que puede tener un viaje
  minimumFare: 6000,
  // porcentaje de la tarifa que se queda la plataforma (20 %). la propina no entra aqui
  commissionRate: 0.2,
  // la tarifa se redondea al multiplo mas cercano de este valor
  roundingStep: 100,
  // multiplicador de tarifa segun la categoria del vehiculo
  categoryMultipliers: {
    economy: 1.0,
    xl: 1.4,
    premium: 1.8,
  },
};