// AI-assisted: see docs/AI_LOG.md #17
// Textos visibles de los campos del viaje (los valores en Firestore están en inglés).
// Los usan la solicitud entrante, el panel de cobro, el historial y el detalle.
// AI-assisted: see docs/AI_LOG.md #22
// Ahora salen del diccionario (es / en): cada función recibe `t` de useLanguage().
// Si llega un valor desconocido se muestra tal cual. Los colores de los estados de pago
// están en src/theme (paymentStatusColors).

const labelFor = (prefix) => (t, value) => {
  if (!value) return '—';
  const key = `${prefix}.${value}`;
  const text = t(key);
  // translate devuelve la clave si no existe: entonces se muestra el valor original
  return text === key ? value : text;
};

// categoría del vehículo: economy | xl | premium
export const getCategoryLabel = labelFor('labels.category');

// método de pago: wompi | cash
export const getPaymentMethodLabel = labelFor('labels.method');

// estados de pago que nombra la sección 3 del PDF: pending | approved | rejected | cash
export const getPaymentStatusLabel = labelFor('labels.status');
