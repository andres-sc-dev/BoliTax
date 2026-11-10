// AI-assisted: see docs/AI_LOG.md #10
// Formato de montos en pesos colombianos enteros: 26900 -> "$26.900".
// Se hace a mano (sin Intl) para que el resultado sea igual en cualquier dispositivo.
export function formatCOP(amount) {
  const rounded = Math.round(Number(amount) || 0);
  const sign = rounded < 0 ? '-' : '';
  const digits = String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}$${digits}`;
}
