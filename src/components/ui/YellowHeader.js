// AI-assisted: see docs/AI_LOG.md #20
// Encabezado amarillo de las pantallas principales: título en negro, contenido opcional
// (logo, datos) y debajo la franja de damero. Si `safeTop` es true, el amarillo cubre también
// la barra de estado (la app se dibuja de borde a borde en Android).
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme';
import CheckerStrip from './CheckerStrip';

export default function YellowHeader({
  title,
  subtitle,
  children,
  left,
  right,
  safeTop = false,
  checkerRows = 2,
  style,
  contentStyle,
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={style}>
      <View
        style={[
          styles.block,
          { paddingTop: (safeTop ? insets.top : 0) + spacing.lg },
          contentStyle,
        ]}
      >
        {title || right || left ? (
          <View style={styles.titleRow}>
            {left ? <View style={styles.left}>{left}</View> : null}
            <View style={styles.titleText}>
              {title ? <Text style={styles.title}>{title}</Text> : null}
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {right}
          </View>
        ) : null}
        {children}
      </View>
      <CheckerStrip rows={checkerRows} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  left: { marginRight: spacing.md },
  titleText: { flex: 1 },
  title: { ...typography.title, color: colors.onPrimary },
  subtitle: { ...typography.body, color: colors.onPrimaryMuted, marginTop: 2 },
});
