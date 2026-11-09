// AI-assisted: see docs/AI_LOG.md #4
// Pantalla de inicio de sesión con correo y contraseña.
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import FormField from '../../components/FormField';
import { useAuth } from '../../context/AuthContext';
import { getAuthErrorMessage } from '../../utils/authErrors';
import { validateEmail, validateRequired } from '../../utils/validators';

const EMPTY_ERRORS = { email: null, password: null, general: null };

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
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
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>BoliTax</Text>
        <Text style={styles.subtitle}>Inicia sesión como conductor</Text>

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

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Iniciar sesión</Text>
          )}
        </Pressable>

        <View style={styles.registerRow}>
          <Text>¿No tienes cuenta? </Text>
          <Pressable onPress={() => navigation.navigate('Register')} disabled={loading}>
            <Text style={styles.link}>Regístrate</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#555', marginBottom: 32 },
  generalError: { color: '#c62828', marginBottom: 12, textAlign: 'center' },
  button: {
    backgroundColor: '#111',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  link: { color: '#1565c0', fontWeight: '600' },
});
