// AI-assisted: see docs/AI_LOG.md #17
// Textos visibles de los campos del viaje (los valores en Firestore están en inglés).
// Los usan el panel de cobro, el historial y el detalle.

export const CATEGORY_LABELS = { economy: 'Económico', xl: 'XL', premium: 'Premium' };

export const PAYMENT_METHOD_LABELS = { wompi: 'Wompi (tarjeta)', cash: 'Efectivo' };

// estados de pago que nombra la sección 3 del PDF
export const PAYMENT_STATUS_LABELS = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  cash: 'Efectivo',
};

export const PAYMENT_STATUS_COLORS = {
  pending: '#8a5300',
  approved: '#2e7d32',
  rejected: '#c62828',
  cash: '#2e7d32',
};
