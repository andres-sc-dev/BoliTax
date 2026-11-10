// AI-assisted: see docs/AI_LOG.md #20
// Paleta "Damero audaz": modo oscuro con el amarillo taxi como protagonista.
// Todas las pantallas toman los colores de aquí (no se escriben colores sueltos).

export const colors = {
  // fondos y superficies
  background: '#0B0B0F',
  surface: '#16161D',
  surfaceAlt: '#1F1F29',
  border: '#2A2A36',

  // principal: amarillo taxi; lo que va encima (texto, íconos) en negro
  primary: '#FFC72C',
  onPrimary: '#0B0B0F',

  // texto
  text: '#F5F5F7',
  textMuted: '#A1A1AA',
  // texto apagado sobre amarillo (subtítulos del encabezado)
  onPrimaryMuted: '#3D3424',

  // estados
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // fondos suaves de estado (avisos sobre el fondo oscuro)
  successSoft: 'rgba(34, 197, 94, 0.14)',
  dangerSoft: 'rgba(239, 68, 68, 0.14)',
  warningSoft: 'rgba(245, 158, 11, 0.14)',
  infoSoft: 'rgba(59, 130, 246, 0.14)',
  primarySoft: 'rgba(255, 199, 44, 0.14)',

  // capa oscura detrás de los modales
  backdrop: 'rgba(0, 0, 0, 0.65)',
};

// AI-assisted: see docs/AI_LOG.md #21
// colores del mapa oscuro (tiles de OpenStreetMap con filtro CSS): el conductor y la ruta en amarillo,
// la recogida y el destino en tonos claros para que se lean sobre el fondo negro
export const mapColors = {
  driver: colors.primary,
  driverOffline: colors.textMuted,
  pickup: colors.text,
  destination: '#7DD3FC',
  route: colors.primary,
  routeCasing: colors.background,
  markerBorder: colors.background,
};

// color de cada estado de pago (sección 3 del PDF: Aprobado, Pendiente, Rechazado, Efectivo)
export const paymentStatusColors = {
  pending: colors.warning,
  approved: colors.success,
  rejected: colors.danger,
  cash: colors.success,
};
