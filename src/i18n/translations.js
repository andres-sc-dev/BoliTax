// AI-assisted: see docs/AI_LOG.md #18
// Diccionario propio de textos (sin librerías). Por ahora traduce el Drawer y la pantalla
// Perfil y configuración; para traducir otra pantalla basta con agregar sus claves aquí y
// usar t('clave') con el hook useLanguage().
// Las claves se agrupan por pantalla: 'drawer.*', 'profile.*'. {{nombre}} marca un valor.

export const SUPPORTED_LANGUAGES = ['es', 'en'];
export const DEFAULT_LANGUAGE = 'es';

export const TRANSLATIONS = {
  es: {
    'drawer.home': 'Inicio',
    'drawer.history': 'Historial',
    'drawer.earnings': 'Ganancias',
    'drawer.profile': 'Perfil y configuración',
    'drawer.signOut': 'Cerrar sesión',

    'profile.accountStatus': 'Estado de la cuenta',
    'profile.status.pending': 'Pendiente de aprobación',
    'profile.status.approved': 'Aprobada',
    'profile.status.other': 'No habilitada',
    'profile.personalData': 'Datos personales',
    'profile.photo': 'Foto de perfil',
    'profile.fullName': 'Nombre completo',
    'profile.phone': 'Número de celular',
    'profile.paymentsEmail': 'Correo para recibir pagos',
    'profile.idNumber': 'Documento de identidad',
    'profile.accountEmail': 'Correo de la cuenta',
    'profile.notEditable': 'No se puede cambiar desde la app.',
    'profile.save': 'Guardar cambios',
    'profile.saving': 'Guardando…',
    'profile.saved': 'Cambios guardados.',
    'profile.noChanges': 'No hay cambios por guardar.',
    'profile.vehicle': 'Vehículo',
    'profile.category': 'Categoría',
    'profile.plate': 'Placa',
    'profile.brandModel': 'Marca y modelo',
    'profile.year': 'Año',
    'profile.color': 'Color',
    'profile.capacity': 'Capacidad',
    'profile.passengers': '{{count}} pasajeros',
    'profile.documents': 'Documentos',
    'profile.doc.license': 'Licencia de conducción',
    'profile.doc.soat': 'SOAT',
    'profile.doc.technicalReview': 'Revisión técnico-mecánica',
    'profile.doc.yellowCard': 'Tarjeta amarilla',
    'profile.doc.number': 'N.° {{number}}',
    'profile.doc.expires': 'Vence: {{date}}',
    'profile.doc.noExpiry': 'Sin fecha de vencimiento',
    'profile.doc.expired': 'Vencido',
    'profile.doc.expiring': 'Vence pronto',
    'profile.doc.valid': 'Vigente',
    'profile.doc.notRequired': 'No aplica para tu vehículo',
    'profile.language': 'Idioma',
    'profile.languageHint': 'Por ahora cambia el menú y esta pantalla.',
    'profile.signOut': 'Cerrar sesión',
  },
  en: {
    'drawer.home': 'Home',
    'drawer.history': 'Trip history',
    'drawer.earnings': 'Earnings',
    'drawer.profile': 'Profile & settings',
    'drawer.signOut': 'Sign out',

    'profile.accountStatus': 'Account status',
    'profile.status.pending': 'Pending approval',
    'profile.status.approved': 'Approved',
    'profile.status.other': 'Not enabled',
    'profile.personalData': 'Personal data',
    'profile.photo': 'Profile photo',
    'profile.fullName': 'Full name',
    'profile.phone': 'Mobile number',
    'profile.paymentsEmail': 'Email to receive payments',
    'profile.idNumber': 'ID number',
    'profile.accountEmail': 'Account email',
    'profile.notEditable': 'Cannot be changed from the app.',
    'profile.save': 'Save changes',
    'profile.saving': 'Saving…',
    'profile.saved': 'Changes saved.',
    'profile.noChanges': 'There are no changes to save.',
    'profile.vehicle': 'Vehicle',
    'profile.category': 'Category',
    'profile.plate': 'Plate',
    'profile.brandModel': 'Make and model',
    'profile.year': 'Year',
    'profile.color': 'Color',
    'profile.capacity': 'Capacity',
    'profile.passengers': '{{count}} passengers',
    'profile.documents': 'Documents',
    'profile.doc.license': "Driver's license",
    'profile.doc.soat': 'SOAT (mandatory insurance)',
    'profile.doc.technicalReview': 'Vehicle inspection',
    'profile.doc.yellowCard': 'Yellow card (taxi permit)',
    'profile.doc.number': 'No. {{number}}',
    'profile.doc.expires': 'Expires: {{date}}',
    'profile.doc.noExpiry': 'No expiration date',
    'profile.doc.expired': 'Expired',
    'profile.doc.expiring': 'Expires soon',
    'profile.doc.valid': 'Valid',
    'profile.doc.notRequired': 'Not required for your vehicle',
    'profile.language': 'Language',
    'profile.languageHint': 'For now it changes the menu and this screen.',
    'profile.signOut': 'Sign out',
  },
};

// Texto de una clave en el idioma pedido. Si falta en ese idioma usa el español; si falta
// en ambos devuelve la clave (así un texto olvidado se nota, pero la app no se rompe).
export function translate(language, key, params = {}, dictionary = TRANSLATIONS) {
  const text = dictionary[language]?.[key] ?? dictionary[DEFAULT_LANGUAGE]?.[key] ?? key;
  return text.replace(/\{\{(\w+)\}\}/g, (match, name) =>
    params[name] !== undefined ? String(params[name]) : match,
  );
}
