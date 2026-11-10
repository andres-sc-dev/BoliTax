// AI-assisted: see docs/AI_LOG.md #18
// Perfil y configuración (sección 3 del PDF): datos editables, vehículo, documentos, idioma y
// cierre de sesión. Las validaciones son las MISMAS del registro (validators.js).
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import FormField from '../components/FormField';
import PhotoField from '../components/PhotoField';
import SelectField from '../components/SelectField';
import { REGISTER_OPTIONS } from '../config/registerOptions';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { updateDriverProfile } from '../services/driverProfile';
import { getDocumentStatus } from '../utils/documentStatus';
import { formatTripDateTime } from '../utils/historyFilters';
import { getProfileChanges, profileFormFromDriver, validateProfileForm } from '../utils/profileForm';
import { toMillis } from '../utils/tripRequest';

const STATUS_COLORS = { expired: '#c62828', expiring: '#c62828', valid: '#2e7d32', none: '#555' };

// etiqueta visible de un valor de lista (categoría, color, idioma)
const labelOf = (options, value) => options.find((option) => option.value === value)?.label ?? value;

export default function ProfileScreen() {
  const { user, driver, signOut } = useAuth();
  const { t, language, setAppLanguage } = useLanguage();

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

  if (!driver) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
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
      setSaveError(error.message ?? 'No se pudieron guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const handleLanguage = async (value) => {
    setLanguageError(null);
    try {
      await setAppLanguage(value);
    } catch (error) {
      setLanguageError(error.message ?? 'No se pudo guardar el idioma.');
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
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* estado de la cuenta */}
      <View style={[styles.statusCard, driver.status === 'approved' ? styles.approved : styles.pending]}>
        <Text style={styles.statusLabel}>{t('profile.accountStatus')}</Text>
        <Text style={styles.statusValue}>{t(`profile.status.${accountStatusKey}`)}</Text>
      </View>

      {/* datos personales: editables con las validaciones del registro */}
      <Text style={styles.section}>{t('profile.personalData')}</Text>
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
      <Pressable
        style={[styles.button, (!hasChanges || hasErrors || saving) && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={!hasChanges || hasErrors || saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t('profile.save')}</Text>
        )}
      </Pressable>
      {!hasChanges && !message ? <Text style={styles.muted}>{t('profile.noChanges')}</Text> : null}

      {/* vehículo: solo lectura */}
      <Text style={styles.section}>{t('profile.vehicle')}</Text>
      <View style={styles.card}>
        {vehicle.photoUrl ? <Image source={{ uri: vehicle.photoUrl }} style={styles.vehiclePhoto} /> : null}
        <Row label={t('profile.category')} value={labelOf(REGISTER_OPTIONS.categories, vehicle.category)} />
        <Row label={t('profile.plate')} value={vehicle.plate} />
        <Row label={t('profile.brandModel')} value={`${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim()} />
        <Row label={t('profile.year')} value={vehicle.year} />
        <Row label={t('profile.color')} value={labelOf(REGISTER_OPTIONS.colors, vehicle.color)} />
        <Row label={t('profile.capacity')} value={t('profile.passengers', { count: vehicle.capacity })} />
      </View>

      {/* documentos: en rojo los vencidos o que vencen en 30 días o menos */}
      <Text style={styles.section}>{t('profile.documents')}</Text>
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
      <Text style={styles.section}>{t('profile.language')}</Text>
      <SelectField
        label={t('profile.language')}
        value={language}
        options={REGISTER_OPTIONS.languages}
        onChange={handleLanguage}
        error={languageError}
      />
      <Text style={styles.muted}>{t('profile.languageHint')}</Text>

      <Pressable style={[styles.button, styles.signOutButton]} onPress={handleSignOut}>
        <Text style={styles.signOutText}>{t('profile.signOut')}</Text>
      </Pressable>
    </ScrollView>
  );
}

function ReadOnly({ label, value, hint }) {
  return (
    <View style={styles.readOnly}>
      <Text style={styles.readOnlyLabel}>{label}</Text>
      <Text style={styles.readOnlyValue}>{value ?? '—'}</Text>
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
      <View style={styles.row}>
        <Text style={styles.docTitle}>{title}</Text>
        {status !== 'none' ? (
          <Text style={[styles.docStatus, { color: STATUS_COLORS[status] }]}>
            {t(`profile.doc.${status}`)}
          </Text>
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
  container: { padding: 16, paddingBottom: 40, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  statusCard: { borderRadius: 12, padding: 14 },
  approved: { backgroundColor: '#e8f5e9' },
  pending: { backgroundColor: '#fff4e5' },
  statusLabel: { fontSize: 13, color: '#555' },
  statusValue: { fontSize: 18, fontWeight: '700', color: '#222', marginTop: 2 },
  section: { fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 10 },
  readOnly: { marginBottom: 14 },
  readOnlyLabel: { fontSize: 14, fontWeight: '600', color: '#222' },
  readOnlyValue: { fontSize: 16, color: '#555', marginTop: 4 },
  hint: { fontSize: 12, color: '#999', marginTop: 2 },
  card: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 14 },
  vehiclePhoto: { width: '100%', height: 160, borderRadius: 10, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
  rowLabel: { fontSize: 15, color: '#444' },
  rowValue: { fontSize: 15, color: '#222', fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  docCard: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 12, marginBottom: 10 },
  docAlert: { backgroundColor: '#fdecea', borderWidth: 1, borderColor: '#f5c2c0' },
  docTitle: { fontSize: 15, fontWeight: '700', color: '#222' },
  docStatus: { fontWeight: '700' },
  muted: { color: '#666', marginTop: 4 },
  error: { color: '#c62828', marginBottom: 8, textAlign: 'center' },
  success: { color: '#2e7d32', marginBottom: 8, textAlign: 'center' },
  // sin flex: 1 (botones en columna; ver corrección de la entrada #12)
  button: {
    backgroundColor: '#111',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { backgroundColor: '#999' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  signOutButton: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#c62828', marginTop: 28 },
  signOutText: { color: '#c62828', fontWeight: '700', fontSize: 16 },
});
