// AI-assisted: see docs/AI_LOG.md #5
// Pestaña 3 del registro: documentos, cuenta de Mercado Pago, términos y envío.
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Checkbox from '../../components/Checkbox';
import DateField from '../../components/DateField';
import FormField from '../../components/FormField';
import PhotoField from '../../components/PhotoField';
import { PRICING } from '../../config/pricing';
import { useRegister, useTouchTabOnBlur } from '../../context/RegisterContext';
import { requiresTechnicalReview } from '../../utils/validators';

const TAB = 'documents';

// porcentaje de comisión leído de pricing.js (0.2 -> "20 %")
const COMMISSION_PERCENT = `${Math.round(PRICING.commissionRate * 100)} %`;

const TAB_NAMES = {
  personal: 'Datos personales',
  vehicle: 'Vehículo',
  documents: 'Documentos y pagos',
};

export default function DocumentsTab({ navigation }) {
  const { form, setField, setAndTouch, touchFields, getError, tabValid, allValid } = useRegister();
  useTouchTabOnBlur(navigation, TAB);
  const [submitMessage, setSubmitMessage] = useState(null);

  const needsTechnicalReview = requiresTechnicalReview(form.year, new Date());
  const pendingTabs = Object.keys(TAB_NAMES).filter((tab) => !tabValid[tab]);

  const textProps = (name) => ({
    value: form[name],
    onChangeText: (text) => setField(name, text),
    onBlur: () => touchFields([name]),
    error: getError(TAB, name),
  });

  const handleSubmit = () => {
    // el envío real (Cloudinary + Firebase) se conecta en la Fase C
    setSubmitMessage('Formulario válido. El envío se conecta en la siguiente fase.');
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

      <Pressable
        style={[styles.button, !allValid && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!allValid}
      >
        <Text style={styles.buttonText}>Enviar registro</Text>
      </Pressable>
      {submitMessage && allValid ? <Text style={styles.success}>{submitMessage}</Text> : null}
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
  success: { color: '#2e7d32', marginTop: 12, textAlign: 'center' },
});
