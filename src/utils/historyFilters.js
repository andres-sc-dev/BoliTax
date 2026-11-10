// AI-assisted: see docs/AI_LOG.md #17
// Filtros del historial de carreras (sección 6 del PDF). Funciones puras, en hora de Colombia.
import { bogotaMidnight, getPeriodRange } from './earnings';

const BOGOTA_OFFSET_MS = -5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// Rango { start, end } (ms, ambos incluidos) del filtro de periodo:
// 'today' | 'week' | 'month' reutilizan getPeriodRange; 'range' usa las fechas elegidas.
// En 'range' se toma el DÍA que muestra el selector (año, mes y día del Date) y se convierte
// a ese mismo día en Colombia: del inicio del día "desde" al final del día "hasta".
// Devuelve null si el rango no es válido (falta una fecha o "desde" es posterior a "hasta").
export function getHistoryRange(filter, now = Date.now(), customRange = {}) {
  if (filter !== 'range') return getPeriodRange(filter, now);
  const { from, to } = customRange;
  if (!(from instanceof Date) || !(to instanceof Date)) return null;
  const start = bogotaMidnight(from.getFullYear(), from.getMonth(), from.getDate());
  const end = bogotaMidnight(to.getFullYear(), to.getMonth(), to.getDate()) + DAY_MS - 1;
  return start <= end ? { start, end } : null;
}

const pad = (value) => String(value).padStart(2, '0');

// "09/11/2026 14:35" en hora de Colombia, sin depender de Intl (Hermes) ni de la zona del teléfono
export function formatTripDateTime(ms) {
  if (typeof ms !== 'number' || Number.isNaN(ms)) return 'Sin fecha';
  const date = new Date(ms + BOGOTA_OFFSET_MS);
  return (
    `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/${date.getUTCFullYear()} ` +
    `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
  );
}
