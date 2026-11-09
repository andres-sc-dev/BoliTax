// AI-assisted: see docs/AI_LOG.md #4
// Validaciones puras de formularios. Cada función devuelve null si el valor es válido
// o un mensaje de error en español. Las que dependen de la fecha reciben `today`
// como parámetro para que los tests no cambien según el día en que se ejecuten.

// correo con texto antes de la @, un dominio y una extensión (ej: nombre@dominio.com)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// campo obligatorio: no puede ser nulo ni quedar vacío (solo espacios cuenta como vacío)
export function validateRequired(value, message = 'Este campo es obligatorio.') {
  if (value === null || value === undefined) return message;
  if (typeof value === 'string' && value.trim() === '') return message;
  return null;
}

export function validateEmail(value) {
  const requiredError = validateRequired(value);
  if (requiredError) return requiredError;
  if (!EMAIL_REGEX.test(value.trim())) return 'Ingresa un correo válido (ej: nombre@dominio.com).';
  return null;
}

// AI-assisted: see docs/AI_LOG.md #5
// ---------- utilidades internas ----------

// fecha sin hora, para comparar solo por día
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isValidDate(value) {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

// ---------- Pestaña 1: datos personales ----------

// letras (con tildes, ü y ñ) y espacios; máximo 50 caracteres
const FULL_NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/;

export function validateFullName(value) {
  const requiredError = validateRequired(value);
  if (requiredError) return requiredError;
  if (value.trim().length > 50) return 'Máximo 50 caracteres.';
  if (!FULL_NAME_REGEX.test(value.trim())) return 'Solo se permiten letras y espacios.';
  return null;
}

export function validateIdNumber(value) {
  const requiredError = validateRequired(value);
  if (requiredError) return requiredError;
  if (!/^\d{6,10}$/.test(value.trim())) return 'Debe tener entre 6 y 10 dígitos, solo números.';
  return null;
}

export function validatePhone(value) {
  const requiredError = validateRequired(value);
  if (requiredError) return requiredError;
  if (!/^\d{10}$/.test(value.trim())) return 'Debe tener exactamente 10 dígitos, solo números.';
  return null;
}

// edad cumplida a la fecha `today`
export function getAge(birthDate, today) {
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayNotReached =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
  if (birthdayNotReached) age -= 1;
  return age;
}

export function validateBirthDate(value, today) {
  if (!isValidDate(value)) return 'Selecciona tu fecha de nacimiento.';
  if (getAge(value, today) < 18) return 'Debes ser mayor de 18 años.';
  return null;
}

// valor elegido de una lista desplegable: debe ser una de las opciones permitidas
export function validateOption(value, options, message = 'Selecciona una opción.') {
  if (!options.some((option) => option.value === value)) return message;
  return null;
}

export function validatePassword(value) {
  const requiredError = validateRequired(value);
  if (requiredError) return requiredError;
  if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
  return null;
}

export function validatePasswordMatch(password, confirmation) {
  const requiredError = validateRequired(confirmation, 'Confirma tu contraseña.');
  if (requiredError) return requiredError;
  if (password !== confirmation) return 'Las contraseñas no coinciden.';
  return null;
}

// foto obligatoria: por ahora solo se valida que exista la URI local
export function validatePhoto(uri, message = 'La foto es obligatoria.') {
  return validateRequired(uri, message);
}

// ---------- Pestaña 2: vehículo ----------

// la placa se pasa a mayúsculas y sin espacios antes de validarla
export function normalizePlate(value) {
  return (value ?? '').replace(/\s/g, '').toUpperCase();
}

export function validatePlate(value) {
  const requiredError = validateRequired(value);
  if (requiredError) return requiredError;
  if (!/^[A-Z]{3}\d{3}$/.test(normalizePlate(value))) {
    return 'Formato de placa inválido (ej: ABC123).';
  }
  return null;
}

// texto obligatorio con longitud máxima (marca y modelo: 30)
export function validateText(value, maxLength) {
  const requiredError = validateRequired(value);
  if (requiredError) return requiredError;
  if (value.trim().length > maxLength) return `Máximo ${maxLength} caracteres.`;
  return null;
}

export function validateYear(value, today) {
  const requiredError = validateRequired(value);
  if (requiredError) return requiredError;
  if (!/^\d{4}$/.test(value.trim())) return 'El año debe tener 4 dígitos.';
  if (Number(value) > today.getFullYear()) return 'El año no puede ser mayor al año actual.';
  return null;
}

export function validateCapacity(value, category) {
  const requiredError = validateRequired(value);
  if (requiredError) return requiredError;
  if (!/^\d+$/.test(value.trim()) || Number(value) < 1) {
    return 'Ingresa un número de pasajeros válido.';
  }
  if (category === 'xl' && Number(value) < 6) return 'La categoría XL exige mínimo 6 pasajeros.';
  return null;
}

// ---------- Pestaña 3: documentos y pagos ----------

// fecha de vencimiento estrictamente posterior a hoy (vencer hoy no es válido)
export function validateFutureDate(value, today) {
  if (!isValidDate(value)) return 'Selecciona la fecha de vencimiento.';
  if (startOfDay(value) <= startOfDay(today)) return 'La fecha de vencimiento debe ser posterior a hoy.';
  return null;
}

// número de licencia: obligatorio y solo números (en Colombia coincide con la cédula)
export function validateLicenseNumber(value) {
  const requiredError = validateRequired(value);
  if (requiredError) return requiredError;
  if (!/^\d+$/.test(value.trim())) return 'Solo se permiten números.';
  return null;
}

// la técnico-mecánica aplica si el vehículo tiene 2 años o más (taxi, servicio público)
export function requiresTechnicalReview(year, today) {
  if (validateYear(year, today) !== null) return false;
  return today.getFullYear() - Number(year) >= 2;
}

export function validateTermsAccepted(value) {
  return value === true ? null : 'Debes aceptar los términos y condiciones.';
}

// ---------- validación por pestaña ----------
// Cada función devuelve un objeto { campo: mensaje | null } con TODOS los campos de la pestaña.

export function validatePersonalTab(form, options, today) {
  return {
    profilePhotoUri: validatePhoto(form.profilePhotoUri, 'La foto de perfil es obligatoria.'),
    fullName: validateFullName(form.fullName),
    idNumber: validateIdNumber(form.idNumber),
    phone: validatePhone(form.phone),
    birthDate: validateBirthDate(form.birthDate, today),
    gender: validateOption(form.gender, options.genders, 'Selecciona tu género.'),
    email: validateEmail(form.email),
    language: validateOption(form.language, options.languages, 'Selecciona un idioma.'),
    password: validatePassword(form.password),
    confirmPassword: validatePasswordMatch(form.password, form.confirmPassword),
  };
}

export function validateVehicleTab(form, options, today) {
  return {
    category: validateOption(form.category, options.categories, 'Selecciona una categoría.'),
    plate: validatePlate(form.plate),
    brand: validateText(form.brand, 30),
    model: validateText(form.model, 30),
    year: validateYear(form.year, today),
    color: validateOption(form.color, options.colors, 'Selecciona un color.'),
    capacity: validateCapacity(form.capacity, form.category),
    vehiclePhotoUri: validatePhoto(form.vehiclePhotoUri, 'La foto del vehículo es obligatoria.'),
  };
}

export function validateDocumentsTab(form, today) {
  const needsTechnicalReview = requiresTechnicalReview(form.year, today);
  return {
    licenseNumber: validateLicenseNumber(form.licenseNumber),
    licensePhotoUri: validatePhoto(form.licensePhotoUri, 'La foto de la licencia es obligatoria.'),
    licenseExpiry: validateFutureDate(form.licenseExpiry, today),
    soatPhotoUri: validatePhoto(form.soatPhotoUri, 'La foto del SOAT es obligatoria.'),
    soatExpiry: validateFutureDate(form.soatExpiry, today),
    // si no aplica, los campos se ocultan y no generan error
    technicalReviewPhotoUri: needsTechnicalReview
      ? validatePhoto(form.technicalReviewPhotoUri, 'La foto de la revisión es obligatoria.')
      : null,
    technicalReviewExpiry: needsTechnicalReview
      ? validateFutureDate(form.technicalReviewExpiry, today)
      : null,
    yellowCardPhotoUri: validatePhoto(
      form.yellowCardPhotoUri,
      'La foto de la tarjeta amarilla es obligatoria.',
    ),
    mercadoPagoEmail: validateEmail(form.mercadoPagoEmail),
    termsAccepted: validateTermsAccepted(form.termsAccepted),
  };
}

// true si algún campo del objeto de errores tiene mensaje
export function hasErrors(errors) {
  return Object.values(errors).some((message) => message !== null);
}
