// AI-assisted: see docs/AI_LOG.md #18
// Formulario de "Perfil y configuración": validación y cambios. Funciones puras con tests.
// Usa las MISMAS validaciones del registro (validators.js).
import { validateEmail, validateFullName, validatePhone, validatePhoto } from './validators';

// datos editables del perfil a partir del documento del conductor
export function profileFormFromDriver(driver) {
  return {
    profilePhotoUri: driver?.profilePhotoUrl ?? null,
    fullName: driver?.fullName ?? '',
    phone: driver?.phone ?? '',
    mercadoPagoEmail: driver?.mercadoPagoEmail ?? '',
  };
}

export function validateProfileForm(form) {
  return {
    profilePhotoUri: validatePhoto(form.profilePhotoUri, 'La foto de perfil es obligatoria.'),
    fullName: validateFullName(form.fullName),
    phone: validatePhone(form.phone),
    mercadoPagoEmail: validateEmail(form.mercadoPagoEmail),
  };
}

// valores normalizados como se guardan (sin espacios sobrantes; correo en minúsculas)
function normalize(form) {
  return {
    profilePhotoUri: form.profilePhotoUri ?? null,
    fullName: (form.fullName ?? '').trim(),
    phone: (form.phone ?? '').trim(),
    mercadoPagoEmail: (form.mercadoPagoEmail ?? '').trim().toLowerCase(),
  };
}

// solo los campos que cambiaron (normalizados); {} si no hay cambios
export function getProfileChanges(original, form) {
  const before = normalize(original);
  const after = normalize(form);
  const changes = {};
  Object.keys(after).forEach((field) => {
    if (after[field] !== before[field]) changes[field] = after[field];
  });
  return changes;
}
