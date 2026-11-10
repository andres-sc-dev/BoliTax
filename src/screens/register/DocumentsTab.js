// AI-assisted: see docs/AI_LOG.md #5
// Pestaña 3 del registro: documentos, correo para recibir pagos, términos y envío.
// AI-assisted: see docs/AI_LOG.md #20
// Estilo "Damero audaz": títulos de sección con acento amarillo, aviso de pestañas pendientes y
// botón primario. La lógica del envío (entrada #6) no cambió.
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Checkbox from '../../components/Checkbox';
import DateField from '../../components/DateField';
import FormField from '../../components/FormField';
import PhotoField from '../../components/PhotoField';
import { Button } from '../../components/ui';
import { PRICING } from '../../config/pricing';
import { useAuth } from '../../context/AuthContext';
import { useRegister, useTouchTabOnBlur } from '../../context/RegisterContext';
import { registerDriver } from '../../services/driverRegistration';
import { colors, radius, spacing, typography } from '../../theme';
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

// título de sección con una barra amarilla a la izquierda
function SectionTitle({ children }) {
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionBar} />
      <Text style={styles.section}>{children}</Text>
    </View>
  );
}

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
      <SectionTitle>Licencia de conducción</SectionTitle>
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

      <SectionTitle>SOAT</SectionTitle>
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
          <SectionTitle>Revisión técnico-mecánica</SectionTitle>
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

      <SectionTitle>Tarjeta amarilla</SectionTitle>
      <PhotoField
        label="Foto de la tarjeta amarilla"
        uri={form.yellowCardPhotoUri}
        onChange={(uri) => setAndTouch('yellowCardPhotoUri', uri)}
        error={getError(TAB, 'yellowCardPhotoUri')}
      />

      <SectionTitle>Pagos</SectionTitle>
      <FormField
        // AI-assisted: see docs/AI_LOG.md #14 — el campo en Firestore sigue siendo mercadoPagoEmail
        label="Correo para recibir pagos"
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

      <Button
        title={submitting ? 'Enviando registro…' : 'Enviar registro'}
        onPress={handleSubmit}
        disabled={!allValid}
        loading={submitting}
        icon="paper-plane"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: spacing.xxl, backgroundColor: colors.background },
  sectionRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.md },
  sectionBar: { width: 4, height: 20, borderRadius: 2, backgroundColor: colors.primary, marginRight: spacing.sm },
  section: { ...typography.subtitle, color: colors.text },
  bold: { fontFamily: typography.bodyStrong.fontFamily, color: colors.primary },
  pendingBox: {
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  pendingText: { ...typography.body, color: colors.warning },
  generalError: { ...typography.body, color: colors.danger, marginBottom: spacing.sm, textAlign: 'center' },
});
