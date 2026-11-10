// AI-assisted: see docs/AI_LOG.md #20
// Sistema de diseño "Damero audaz": todo en un solo lugar.
// import { colors, typography, spacing, radius } from '../theme';
// AI-assisted: see docs/AI_LOG.md #21 — mapColors (mapa oscuro)
export { colors, mapColors, paymentStatusColors } from './colors';
export { fonts, FONT_FILES, typography } from './typography';

// espaciado (múltiplos de 4)
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

// bordes redondeados
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };

// tamaño de cada cuadro del damero (CheckerStrip)
export const CHECKER_SIZE = 8;
