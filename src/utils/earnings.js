// AI-assisted: see docs/AI_LOG.md #16
// Agregación de ganancias por periodo (sección 5 del PDF). Funciones puras: se prueban con Jest.
//
// Zona horaria: Colombia (UTC−5, sin horario de verano). Los rangos se calculan en hora de
// Colombia SIN depender de la zona horaria del teléfono: se desplaza el reloj −5 h y se usan
// los getters UTC. La semana empieza el lunes.
import { toMillis } from './tripRequest';

const BOGOTA_OFFSET_MS = -5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// estados que cuentan como viaje realizado (con el pago resuelto o todavía pendiente)
export const EARNING_STATUSES = ['completed', 'paid'];

// año, mes, día y día de la semana (0 = domingo) de un instante, en hora de Colombia
function bogotaParts(ms) {
  const shifted = new Date(ms + BOGOTA_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(),
  };
}

// instante en que empieza (00:00) un día de Colombia; Date.UTC acepta desbordes (día 0, mes 12).
// AI-assisted: see docs/AI_LOG.md #17 — exportada para el filtro "Rango de fechas" del historial
export function bogotaMidnight(year, month, day) {
  return Date.UTC(year, month, day) - BOGOTA_OFFSET_MS;
}

// rango { start, end } en milisegundos (ambos incluidos) de 'today', 'week' o 'month'
export function getPeriodRange(period, now = Date.now()) {
  const { year, month, day, weekday } = bogotaParts(now);
  if (period === 'today') {
    const start = bogotaMidnight(year, month, day);
    return { start, end: start + DAY_MS - 1 };
  }
  if (period === 'week') {
    // días desde el lunes: lunes = 0 ... domingo = 6
    const daysSinceMonday = (weekday + 6) % 7;
    const start = bogotaMidnight(year, month, day - daysSinceMonday);
    return { start, end: start + 7 * DAY_MS - 1 };
  }
  if (period === 'month') {
    return {
      start: bogotaMidnight(year, month, 1),
      end: bogotaMidnight(year, month + 1, 1) - 1,
    };
  }
  throw new Error(`Periodo inválido: ${period}`);
}

// fecha del viaje para las ganancias: cuando terminó (o cuando se creó, si falta)
export function getTripDateMs(trip) {
  return toMillis(trip?.completedAt) ?? toMillis(trip?.createdAt);
}

// totales de los viajes realizados dentro del rango.
// net = ganancia neta (driverEarnings ya incluye la propina); average = net / viajes
export function summarizeTrips(trips, range) {
  const inRange = (Array.isArray(trips) ? trips : []).filter((trip) => {
    if (!EARNING_STATUSES.includes(trip.status)) return false;
    const date = getTripDateMs(trip);
    return date !== null && date >= range.start && date <= range.end;
  });

  const sum = (field) => inRange.reduce((total, trip) => total + (trip[field] ?? 0), 0);
  const count = inRange.length;
  const net = sum('driverEarnings');

  return {
    count,
    billed: sum('fare'),
    commissions: sum('commission'),
    tips: sum('tip'),
    net,
    // pesos enteros; sin viajes el promedio es 0 (no se divide por cero)
    average: count === 0 ? 0 : Math.round(net / count),
  };
}
