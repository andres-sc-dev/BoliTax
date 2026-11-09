// AI-assisted: see docs/AI_LOG.md #5
// Pestaña 3 del registro: documentos, cuenta de Mercado Pago, términos y envío.
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Checkbox from '../../components/Checkbox';
import DateField from '../../components/DateField';
import FormField from '../../components/FormField';
import PhotoField from '../../components/PhotoField';
import { PRICING } from '../../config/pricing';
import { useAuth } from '../../context/AuthContext';
import { useRegister, useTouchTabOnBlur } from '../../context/RegisterContext';
import { registerDriver } from '../../services/driverRegistration';
import { getAuthErrorMessage } from '../../utils/authErrors';
import { requiresTechnicalReview } from '../../utils/validators';

const TAB = 'documents';

// porcentaje de comisión leído de pricing.js (0.2 -> "20 %")
const COMMISSION_PERCENT = `${Math.round(PRICING.commissionRate * 100)} %`;

const TAB_NAMES = {
  personal: 'Datos personales',
  vehicle: 'Vehículo',
  documents: 'Documentos y pagos',
};

// AI-assisted: see docs/AI_LOG.md #6
// pestaña donde está cada campo que puede devolver error Firebase Auth
const FIELD_TAB_ROUTES = { email: 'PersonalData', password: 'PersonalData' };

export default function DocumentsTab({ navigation }) {
  const {
    form,
    setField,
    setAndTouch,
    touchFields,
    getError,
    tabValid,
    allValid,
    submitErrors,
    setSubmitErrors,
    submitting,
    setSubmitting,
  } = useRegister();
  const { setRegistering } = useAuth();
  useTouchTabOnBlur(navigation, TAB);

  const needsTechnicalReview = requiresTechnicalReview(form.year, new Date());
  const pendingTabs = Object.keys(TAB_NAMES).filter((tab) => !tabValid[tab]);

  const textProps = (name) => ({
    value: form[name],
    onChangeText: (text) => setField(name, text),
    onBlur: () => touchFields([name]),
    error: getError(TAB, name),
  });

  // AI-assisted: see docs/AI_LOG.md #6
  const handleSubmit = async () => {
    setSubmitErrors({});
    setSubmitting(true);
    // mientras registering sea true, la app no pasa al Drawer aunque ya exista el usuario
    setRegistering(true);
    try {
      await registerDriver(form);
      // listo: al desactivar registering, RootNavigator muestra el Drawer
      // (esta pantalla se desmonta, por eso no se actualiza más su estado)
      setRegistering(false);
    } catch (error) {
      setRegistering(false);
      setSubmitting(false);
      if (error.code === 'cloudinary/upload-failed') {
        // el mensaje ya viene en español desde cloudinary.js; el detalle técnico queda en la consola
        console.log('Error al subir fotos a Cloudinary:', error.cause);
        setSubmitErrors({ general: error.message });
        return;
      }
      const { field, message } = getAuthErrorMessage(error.code);
      setSubmitErrors({ [field]: message });
      // si el error es de un campo de otra pestaña, se lleva al usuario a esa pestaña
      if (FIELD_TAB_ROUTES[field]) {
        navigation.navigate(FIELD_TAB_ROUTES[field]);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.section}>Licencia de conducción</Text>
      <FormField
        label="Número de licencia"
        placeholder="Solo números"
        keyboardType="number-pad"
        maxLength={15}
        {...textProps('licenseNumber')}
      />
      <PhotoField
        label="Foto de la licencia"
        uri={form.licensePhotoUri}
        onChange={(uri) => setAndTouch('licensePhotoUri', uri)}
        error={getError(TAB, 'licensePhotoUri')}
      />
      <DateField
        label="Fecha de vencimiento de la licencia"
        value={form.licenseExpiry}
        onChange={(date) => setAndTouch('licenseExpiry', date)}
        error={getError(TAB, 'licenseExpiry')}
      />

      <Text style={styles.section}>SOAT</Text>
      <PhotoField
        label="Foto del SOAT"
        uri={form.soatPhotoUri}
        onChange={(uri) => setAndTouch('soatPhotoUri', uri)}
        error={getError(TAB, 'soatPhotoUri')}
      />
      <DateField
        label="Fecha de vencimiento del SOAT"
        value={form.soatExpiry}
        onChange={(date) => setAndTouch('soatExpiry', date)}
        error={getError(TAB, 'soatExpiry')}
      />

      {/* solo se muestra si el vehículo tiene 2 años o más */}
      {needsTechnicalReview ? (
        <>
          <Text style={styles.section}>Revisión técnico-mecánica</Text>
          <PhotoField
            label="Foto de la revisión técnico-mecánica"
            uri={form.technicalReviewPhotoUri}
            onChange={(uri) => setAndTouch('technicalReviewPhotoUri', uri)}
            error={getError(TAB, 'technicalReviewPhotoUri')}
          />
          <DateField
            label="Fecha de vencimiento de la revisión"
            value={form.technicalReviewExpiry}
            onChange={(date) => setAndTouch('technicalReviewExpiry', date)}
            error={getError(TAB, 'technicalReviewExpiry')}
          />
        </>
      ) : null}

      <Text style={styles.section}>Tarjeta amarilla</Text>
      <PhotoField
        label="Foto de la tarjeta amarilla"
        uri={form.yellowCardPhotoUri}
        onChange={(uri) => setAndTouch('yellowCardPhotoUri', uri)}
        error={getError(TAB, 'yellowCardPhotoUri')}
      />

      <Text style={styles.section}>Pagos</Text>
      <FormField
        label="Correo de la cuenta de Mercado Pago"
        placeholder="Donde recibirás tus pagos"
        keyboardType="email-address"
        autoCapitalize="none"
        {...textProps('mercadoPagoEmail')}
      />

      <Checkbox
        checked={form.termsAccepted}
        onChange={(value) => setAndTouch('termsAccepted', value)}
        error={getError(TAB, 'termsAccepted')}
      >
        Acepto los términos y condiciones de BoliTax, incluida una comisión del{' '}
        <Text style={styles.bold}>{COMMISSION_PERCENT}</Text> sobre la tarifa de cada viaje.
      </Checkbox>

      {pendingTabs.length > 0 ? (
        <View style={styles.pendingBox}>
          <Text style={styles.pendingText}>
            Para enviar, completa correctamente: {pendingTabs.map((tab) => TAB_NAMES[tab]).join(', ')}.
          </Text>
        </View>
      ) : null}

      {submitErrors.general ? <Text style={styles.generalError}>{submitErrors.general}</Text> : null}

      <Pressable
        style={[styles.button, (!allValid || submitting) && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!allValid || submitting}
      >
        {submitting ? (
          <View style={styles.sendingRow}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.buttonText}>  Enviando registro…</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Enviar registro</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40, backgroundColor: '#fff' },
  section: { fontSize: 17, fontWeight: '700', marginTop: 8, marginBottom: 10 },
  bold: { fontWeight: '700' },
  pendingBox: { backgroundColor: '#fff4e5', borderRadius: 8, padding: 12, marginBottom: 12 },
  pendingText: { color: '#8a5300' },
  button: {
    backgroundColor: '#111',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#999' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  sendingRow: { flexDirection: 'row', alignItems: 'center' },
  generalError: { color: '#c62828', marginBottom: 12, textAlign: 'center' },
});
