// AI-assisted: see docs/AI_LOG.md #18
// Perfil y configuración (sección 3 del PDF): datos editables, vehículo, documentos, idioma y
// cierre de sesión. Las validaciones son las MISMAS del registro (validators.js).
// AI-assisted: see docs/AI_LOG.md #22
// Rediseño "Damero audaz" (mismo estilo del registro): encabezado amarillo con el botón de
// menú, campos e inputs oscuros, estado de la cuenta y de los documentos con Badge, idioma con
// chips y botones del sistema de diseño. La lógica (validar, guardar, idioma, salir) no cambió.
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FormField from '../components/FormField';
import PhotoField from '../components/PhotoField';
import {
  Badge,
  Button,
  Card,
  Chip,
  HeaderIconButton,
  Screen,
  YellowHeader,
} from '../components/ui';
import { REGISTER_OPTIONS } from '../config/registerOptions';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { updateDriverProfile } from '../services/driverProfile';
import { colors, radius, spacing, typography } from '../theme';
import { getDocumentStatus } from '../utils/documentStatus';
import { formatTripDateTime } from '../utils/historyFilters';
import { getProfileChanges, profileFormFromDriver, validateProfileForm } from '../utils/profileForm';
import { toMillis } from '../utils/tripRequest';

// AI-assisted: see docs/AI_LOG.md #22 — colores del tema para cada estado
const STATUS_COLORS = {
  expired: colors.danger,
  expiring: colors.danger,
  valid: colors.success,
  none: colors.textMuted,
};
const ACCOUNT_STATUS_COLORS = {
  approved: colors.success,
  pending: colors.warning,
  other: colors.danger,
};

// etiqueta visible de un valor de lista (categoría, color, idioma)
const labelOf = (options, value) => options.find((option) => option.value === value)?.label ?? value;

export default function ProfileScreen({ navigation }) {
  const { user, driver, signOut } = useAuth();
  const { t, language, setAppLanguage } = useLanguage();
  // AI-assisted: see docs/AI_LOG.md #22
  const insets = useSafeAreaInsets();

  // datos guardados (lo que hay en Firestore) y formulario en edición
  const original = useMemo(() => profileFormFromDriver(driver), [driver]);
  const [form, setForm] = useState(() => profileFormFromDriver(driver));
  // campos que el usuario ya tocó: solo a esos se les muestra el error
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [languageError, setLanguageError] = useState(null);

  // si la pantalla se abrió antes de que llegara el documento del conductor, se llena al llegar
  const driverId = driver?.id;
  useEffect(() => {
    if (driverId) setForm(profileFormFromDriver(driver));
    // solo al cambiar de conductor: no se pisan los cambios que se están editando
  }, [driverId]);

  // errores y cambios se recalculan solo cuando cambia el formulario o los datos guardados
  const errors = useMemo(() => validateProfileForm(form), [form]);
  const changes = useMemo(() => getProfileChanges(original, form), [original, form]);
  const hasErrors = Object.values(errors).some(Boolean);
  const hasChanges = Object.keys(changes).length > 0;

  // AI-assisted: see docs/AI_LOG.md #22 — encabezado amarillo con el botón de menú
  const header = (
    <YellowHeader
      safeTop
      title={t('profile.title')}
      subtitle={t('profile.subtitle')}
      left={
        <HeaderIconButton
          icon="menu"
          label={t('common.openMenu')}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        />
      }
    />
  );

  if (!driver) {
    return (
      <Screen statusBar="dark">
        {header}
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  const setField = (name, value) => {
    setForm((previous) => ({ ...previous, [name]: value }));
    setTouched((previous) => ({ ...previous, [name]: true }));
    setMessage(null);
  };
  const errorOf = (name) => (touched[name] ? errors[name] : null);

  // Guardar: deshabilitado si no hay cambios o hay errores
  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setMessage(null);
    try {
      const saved = await updateDriverProfile(user.uid, driver.idNumber, changes);
      // la foto queda con la URL de Cloudinary (ya no la URI local)
      if (saved.profilePhotoUrl) {
        setForm((previous) => ({ ...previous, profilePhotoUri: saved.profilePhotoUrl }));
      }
      setTouched({});
      setMessage(t('profile.saved'));
    } catch (error) {
      setSaveError(error.message ?? t('profile.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleLanguage = async (value) => {
    setLanguageError(null);
    try {
      await setAppLanguage(value);
    } catch (error) {
      setLanguageError(error.message ?? t('profile.languageError'));
    }
  };

  const handleSignOut = () => {
    signOut().catch((error) => console.log('Error al cerrar sesión:', error));
  };

  const accountStatusKey =
    driver.status === 'approved' || driver.status === 'pending' ? driver.status : 'other';
  const vehicle = driver.vehicle ?? {};
  const documents = driver.documents ?? {};

  return (
    <Screen statusBar="dark">
      {header}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* estado de la cuenta */}
        <Card style={styles.statusCard}>
          <Text style={styles.statusLabel}>{t('profile.accountStatus')}</Text>
          <Badge
            label={t(`profile.status.${accountStatusKey}`)}
            color={ACCOUNT_STATUS_COLORS[accountStatusKey]}
          />
        </Card>

        {/* datos personales: editables con las validaciones del registro */}
        <SectionTitle icon="person-outline" title={t('profile.personalData')} />
        <PhotoField
          label={t('profile.photo')}
          uri={form.profilePhotoUri}
          onChange={(uri) => setField('profilePhotoUri', uri)}
          error={errorOf('profilePhotoUri')}
        />
        <FormField
          label={t('profile.fullName')}
          value={form.fullName}
          onChangeText={(text) => setField('fullName', text)}
          error={errorOf('fullName')}
          maxLength={50}
          autoCapitalize="words"
        />
        <FormField
          label={t('profile.phone')}
          value={form.phone}
          onChangeText={(text) => setField('phone', text)}
          error={errorOf('phone')}
          keyboardType="phone-pad"
          maxLength={10}
        />
        <FormField
          label={t('profile.paymentsEmail')}
          value={form.mercadoPagoEmail}
          onChangeText={(text) => setField('mercadoPagoEmail', text)}
          error={errorOf('mercadoPagoEmail')}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {/* documento y correo de la cuenta: se muestran pero no se editan */}
        <ReadOnly label={t('profile.idNumber')} value={driver.idNumber} hint={t('profile.notEditable')} />
        <ReadOnly label={t('profile.accountEmail')} value={driver.email} hint={t('profile.notEditable')} />

        {saveError ? <Text style={styles.error}>{saveError}</Text> : null}
        {message ? <Text style={styles.success}>{message}</Text> : null}
        <Button
          title={t('profile.save')}
          icon="save-outline"
          onPress={handleSave}
          loading={saving}
          disabled={!hasChanges || hasErrors || saving}
        />
        {!hasChanges && !message ? <Text style={styles.centerNote}>{t('profile.noChanges')}</Text> : null}

        {/* vehículo: solo lectura */}
        <SectionTitle icon="car-sport-outline" title={t('profile.vehicle')} />
        <Card style={styles.noTopMargin}>
          {vehicle.photoUrl ? <Image source={{ uri: vehicle.photoUrl }} style={styles.vehiclePhoto} /> : null}
          <Row label={t('profile.category')} value={labelOf(REGISTER_OPTIONS.categories, vehicle.category)} />
          <Row label={t('profile.plate')} value={vehicle.plate} />
          <Row label={t('profile.brandModel')} value={`${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim()} />
          <Row label={t('profile.year')} value={vehicle.year} />
          <Row label={t('profile.color')} value={labelOf(REGISTER_OPTIONS.colors, vehicle.color)} />
          <Row label={t('profile.capacity')} value={t('profile.passengers', { count: vehicle.capacity })} />
        </Card>

        {/* documentos: en rojo los vencidos o que vencen en 30 días o menos */}
        <SectionTitle icon="document-text-outline" title={t('profile.documents')} />
        <DocumentRow
          t={t}
          title={t('profile.doc.license')}
          number={documents.license?.number}
          expiry={documents.license?.expiryDate}
        />
        <DocumentRow t={t} title={t('profile.doc.soat')} expiry={documents.soat?.expiryDate} />
        {documents.technicalReview ? (
          <DocumentRow
            t={t}
            title={t('profile.doc.technicalReview')}
            expiry={documents.technicalReview.expiryDate}
          />
        ) : (
          <View style={styles.docCard}>
            <Text style={styles.docTitle}>{t('profile.doc.technicalReview')}</Text>
            <Text style={styles.muted}>{t('profile.doc.notRequired')}</Text>
          </View>
        )}
        <DocumentRow t={t} title={t('profile.doc.yellowCard')} expiry={null} />

        {/* idioma: AsyncStorage + drivers/{uid}.language */}
        <SectionTitle icon="language-outline" title={t('profile.language')} />
        <View style={styles.chips}>
          {REGISTER_OPTIONS.languages.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              active={language === option.value}
              onPress={() => handleLanguage(option.value)}
            />
          ))}
        </View>
        {languageError ? <Text style={styles.errorLeft}>{languageError}</Text> : null}
        <Text style={styles.muted}>{t('profile.languageHint')}</Text>

        <Button
          title={t('profile.signOut')}
          icon="log-out-outline"
          variant="dangerOutline"
          onPress={handleSignOut}
          style={styles.signOut}
        />
      </ScrollView>
    </Screen>
  );
}

// AI-assisted: see docs/AI_LOG.md #22 — título de sección con ícono amarillo
function SectionTitle({ icon, title }) {
  return (
    <View style={styles.section}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.sectionText}>{title}</Text>
    </View>
  );
}

function ReadOnly({ label, value, hint }) {
  return (
    <View style={styles.readOnly}>
      <Text style={styles.readOnlyLabel}>{label}</Text>
      <View style={styles.readOnlyBox}>
        <Text style={styles.readOnlyValue}>{value ?? '—'}</Text>
        <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value ?? '—'}</Text>
    </View>
  );
}

// un documento con su fecha de vencimiento y estado (vencido, vence pronto, vigente)
function DocumentRow({ t, title, number, expiry }) {
  const status = getDocumentStatus(expiry);
  const expiryMs = toMillis(expiry);
  // la hora no aplica a un vencimiento: se muestra solo la fecha
  const expiryText = expiryMs ? formatTripDateTime(expiryMs).split(' ')[0] : null;
  return (
    <View style={[styles.docCard, (status === 'expired' || status === 'expiring') && styles.docAlert]}>
      <View style={styles.docHeader}>
        <Text style={styles.docTitle}>{title}</Text>
        {status !== 'none' ? (
          <Badge label={t(`profile.doc.${status}`)} color={STATUS_COLORS[status]} />
        ) : null}
      </View>
      {number ? <Text style={styles.muted}>{t('profile.doc.number', { number })}</Text> : null}
      <Text style={[styles.muted, status !== 'none' && { color: STATUS_COLORS[status] }]}>
        {expiryText ? t('profile.doc.expires', { date: expiryText }) : t('profile.doc.noExpiry')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: spacing.lg },
  statusCard: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: { ...typography.bodyStrong, color: colors.text },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  sectionText: { ...typography.subtitle, color: colors.text, marginLeft: spacing.sm },
  readOnly: { marginBottom: spacing.lg },
  readOnlyLabel: { ...typography.label, color: colors.textMuted, marginBottom: 6 },
  readOnlyBox: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    opacity: 0.75,
  },
  readOnlyValue: { ...typography.body, color: colors.text },
  hint: { ...typography.caption, color: colors.textMuted, marginTop: 6 },
  noTopMargin: { marginTop: 0 },
  vehiclePhoto: { width: '100%', height: 170, borderRadius: radius.md, marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  rowLabel: { ...typography.body, color: colors.textMuted },
  rowValue: { ...typography.bodyStrong, color: colors.text, flexShrink: 1, textAlign: 'right' },
  docCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  docAlert: { backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.danger },
  docHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  docTitle: { ...typography.bodyStrong, color: colors.text, flexShrink: 1, marginRight: spacing.sm },
  muted: { ...typography.body, color: colors.textMuted, marginTop: spacing.xs },
  centerNote: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  error: { ...typography.body, color: colors.danger, textAlign: 'center', marginBottom: spacing.xs },
  errorLeft: { ...typography.caption, color: colors.danger },
  success: { ...typography.bodyStrong, color: colors.success, textAlign: 'center', marginBottom: spacing.xs },
  signOut: { marginTop: spacing.xxl },
});
