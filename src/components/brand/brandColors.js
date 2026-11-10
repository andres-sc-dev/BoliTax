// AI-assisted: see docs/AI_LOG.md #19
// Colores de la marca usados por la animación de inicio.
// SPLASH_BACKGROUND debe ser IGUAL al "backgroundColor" del plugin expo-splash-screen en app.json:
// así, cuando la splash nativa se oculta, la animación ya está dibujada con el mismo fondo
// y no hay parpadeo.
// AI-assisted: see docs/AI_LOG.md #20 — ahora salen del sistema de diseño (src/theme)
import { colors } from '../../theme';

export const SPLASH_BACKGROUND = colors.background;
export const TAXI_YELLOW = colors.primary;
export const TAXI_DARK = colors.onPrimary;
