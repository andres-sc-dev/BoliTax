// AI-assisted: see docs/AI_LOG.md #5
// Pestaña 2 del registro: datos del vehículo.
import { ScrollView, StyleSheet } from 'react-native';
// AI-assisted: see docs/AI_LOG.md #20 — fondo oscuro del sistema de diseño
import { colors, spacing } from '../../theme';
import FormField from '../../components/FormField';
import PhotoField from '../../components/PhotoField';
import SelectField from '../../components/SelectField';
import { REGISTER_OPTIONS } from '../../config/registerOptions';
import { useRegister, useTouchTabOnBlur } from '../../context/RegisterContext';
import { normalizePlate } from '../../utils/validators';

const TAB = 'vehicle';

export default function VehicleTab({ navigation }) {
  const { form, setField, setAndTouch, touchFields, getError } = useRegister();
  useTouchTabOnBlur(navigation, TAB);

  const textProps = (name) => ({
    value: form[name],
    onChangeText: (text) => setField(name, text),
    onBlur: () => touchFields([name]),
    error: getError(TAB, name),
  });

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <SelectField
        label="Categoría"
        value={form.category}
        options={REGISTER_OPTIONS.categories}
        onChange={(value) => setAndTouch('category', value)}
        error={getError(TAB, 'category')}
      />
      <FormField
        label="Placa"
        placeholder="ABC123"
        autoCapitalize="characters"
        maxLength={6}
        {...textProps('plate')}
        // la placa se guarda en mayúsculas mientras se escribe
        onChangeText={(text) => setField('plate', normalizePlate(text))}
      />
      <FormField label="Marca" placeholder="Ej: Hyundai" maxLength={30} {...textProps('brand')} />
      <FormField label="Modelo" placeholder="Ej: Atos" maxLength={30} {...textProps('model')} />
      <FormField
        label="Año"
        placeholder="Ej: 2020"
        keyboardType="number-pad"
        maxLength={4}
        {...textProps('year')}
      />
      <SelectField
        label="Color"
        value={form.color}
        options={REGISTER_OPTIONS.colors}
        onChange={(value) => setAndTouch('color', value)}
        error={getError(TAB, 'color')}
      />
      <FormField
        label="Capacidad de pasajeros"
        placeholder={form.category === 'xl' ? 'Mínimo 6 para XL' : 'Ej: 4'}
        keyboardType="number-pad"
        maxLength={2}
        {...textProps('capacity')}
      />
      <PhotoField
        label="Foto del vehículo"
        hint="La placa debe verse en la foto."
        uri={form.vehiclePhotoUri}
        onChange={(uri) => setAndTouch('vehiclePhotoUri', uri)}
        error={getError(TAB, 'vehiclePhotoUri')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: spacing.xxl, backgroundColor: colors.background },
});
