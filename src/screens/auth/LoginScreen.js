// AI-assisted: see docs/AI_LOG.md #4
// Pantalla de inicio de sesión con correo y contraseña.
// AI-assisted: see docs/AI_LOG.md #20
// Rediseño "Damero audaz": mitad superior amarilla con el logo grande y el wordmark BoliTAX en
// negro, franja de damero, y el formulario sobre el fondo oscuro. La lógica no cambió.
// AI-assisted: see docs/AI_LOG.md #22 — logotipo horizontal "BoliTAX" con damero (marca final)
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Logotype from '../../components/brand/Logotype';
import FormField from '../../components/FormField';
import { Button, Screen, YellowHeader } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../theme';
import { getAuthErrorMessage } from '../../utils/authErrors';
import { validateEmail, validateRequired } from '../../utils/validators';

const EMPTY_ERRORS = { email: null, password: null, general: null };

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const { width, height } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // primero se valida localmente para no llamar a Firebase con datos vacíos o mal escritos
    const validationErrors = {
      email: validateEmail(email),
      password: validateRequired(password, 'Ingresa tu contraseña.'),
      general: null,
    };
    setErrors(validationErrors);
    if (validationErrors.email || validationErrors.password) return;

    setLoading(true);
    try {
      // si funciona, AuthContext detecta la sesión y RootNavigator muestra el Drawer
      await signIn(email, password);
    } catch (error) {
      const { field, message } = getAuthErrorMessage(error.code);
      setErrors({ ...EMPTY_ERRORS, [field]: message });
      setLoading(false);
    }
  };

  return (
    // íconos oscuros en la barra de estado: va encima del amarillo
    <Screen statusBar="dark">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* mitad superior amarilla: el nombre de la app es el protagonista */}
          <YellowHeader
            safeTop
            checkerRows={3}
            contentStyle={[styles.hero, { minHeight: height * 0.42 }]}
          >
            {/* logotipo horizontal grande: ocupa casi todo el ancho */}
            <Logotype variant="onYellow" width={Math.min(width - spacing.xxl * 2, 380)} />
            <Text style={styles.tagline}>App para conductores</Text>
          </YellowHeader>

          <View style={styles.form}>
            <Text style={styles.title}>Inicia sesión</Text>
            <Text style={styles.subtitle}>Entra con el correo de tu cuenta de conductor.</Text>

            <FormField
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              placeholder="nombre@dominio.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <FormField
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              placeholder="Tu contraseña"
              secureTextEntry
              autoCapitalize="none"
            />

            {errors.general ? <Text style={styles.generalError}>{errors.general}</Text> : null}

            <Button title="Iniciar sesión" onPress={handleLogin} loading={loading} icon="log-in-outline" />

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>¿No tienes cuenta? </Text>
              <Pressable onPress={() => navigation.navigate('Register')} disabled={loading}>
                <Text style={styles.link}>Regístrate</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  hero: { alignItems: 'center', justifyContent: 'center', paddingBottom: spacing.xl },
  tagline: {
    ...typography.label,
    color: colors.onPrimaryMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
  },
  form: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  title: { ...typography.title, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xl },
  generalError: { ...typography.body, color: colors.danger, textAlign: 'center', marginBottom: spacing.sm },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  registerText: { ...typography.body, color: colors.textMuted },
  link: { ...typography.bodyStrong, color: colors.primary },
});
