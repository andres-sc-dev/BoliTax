// AI-assisted: see docs/AI_LOG.md #5
// Pestaña 1 del registro: datos personales y credenciales de acceso.
import { ScrollView, StyleSheet } from 'react-native';
// AI-assisted: see docs/AI_LOG.md #20 — fondo oscuro del sistema de diseño
import { colors, spacing } from '../../theme';
import DateField from '../../components/DateField';
import FormField from '../../components/FormField';
import PhotoField from '../../components/PhotoField';
import SelectField from '../../components/SelectField';
import { REGISTER_OPTIONS } from '../../config/registerOptions';
import { useRegister, useTouchTabOnBlur } from '../../context/RegisterContext';
import { setLanguage } from '../../services/preferences';

const TAB = 'personal';

export default function PersonalDataTab({ navigation }) {
  const { form, setField, setAndTouch, touchFields, getError } = useRegister();
  useTouchTabOnBlur(navigation, TAB);

  const today = new Date();
  // fecha con la que abre el selector de nacimiento: hace 25 años
  const defaultBirthDate = new Date(today.getFullYear() - 25, 0, 1);

  // props comunes de los campos de texto: valor, cambio, error y "tocado" al salir del campo
  const textProps = (name) => ({
    value: form[name],
    onChangeText: (text) => setField(name, text),
    onBlur: () => touchFields([name]),
    error: getError(TAB, name),
  });

  const handleLanguageChange = (language) => {
    setAndTouch('language', language);
    // el idioma es una preferencia, por eso también se guarda en AsyncStorage
    setLanguage(language);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <PhotoField
        label="Foto de perfil"
        uri={form.profilePhotoUri}
        onChange={(uri) => setAndTouch('profilePhotoUri', uri)}
        error={getError(TAB, 'profilePhotoUri')}
      />
      <FormField
        label="Nombre completo"
        placeholder="Como aparece en tu documento"
        maxLength={50}
        autoCapitalize="words"
        {...textProps('fullName')}
      />
      <FormField
        label="Documento de identidad"
        placeholder="Entre 6 y 10 dígitos"
        keyboardType="number-pad"
        maxLength={10}
        {...textProps('idNumber')}
      />
      <FormField
        label="Número de celular"
        placeholder="10 dígitos"
        keyboardType="phone-pad"
        maxLength={10}
        {...textProps('phone')}
      />
      <DateField
        label="Fecha de nacimiento"
        value={form.birthDate}
        onChange={(date) => setAndTouch('birthDate', date)}
        maximumDate={today}
        initialDate={defaultBirthDate}
        error={getError(TAB, 'birthDate')}
      />
      <SelectField
        label="Género"
        value={form.gender}
        options={REGISTER_OPTIONS.genders}
        onChange={(value) => setAndTouch('gender', value)}
        error={getError(TAB, 'gender')}
      />
      <FormField
        label="Correo electrónico"
        placeholder="nombre@dominio.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        {...textProps('email')}
      />
      <SelectField
        label="Idioma"
        value={form.language}
        options={REGISTER_OPTIONS.languages}
        onChange={handleLanguageChange}
        error={getError(TAB, 'language')}
      />
      <FormField
        label="Contraseña"
        placeholder="Mínimo 6 caracteres"
        secureTextEntry
        autoCapitalize="none"
        {...textProps('password')}
      />
      <FormField
        label="Confirmar contraseña"
        placeholder="Repite la contraseña"
        secureTextEntry
        autoCapitalize="none"
        {...textProps('confirmPassword')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: spacing.xxl, backgroundColor: colors.background },
});
