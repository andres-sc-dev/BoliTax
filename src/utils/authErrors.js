// AI-assisted: see docs/AI_LOG.md #4
// Traduce los códigos de error de Firebase Auth a mensajes en español
// e indica en qué campo del formulario se deben mostrar.

const AUTH_ERRORS = {
  'auth/invalid-email': { field: 'email', message: 'El correo no tiene un formato válido.' },
  'auth/user-disabled': { field: 'email', message: 'Esta cuenta está deshabilitada.' },
  'auth/user-not-found': { field: 'email', message: 'No existe una cuenta con este correo.' },
  'auth/email-already-in-use': { field: 'email', message: 'Ya existe una cuenta con este correo.' },
  'auth/wrong-password': { field: 'password', message: 'La contraseña es incorrecta.' },
  'auth/invalid-credential': { field: 'password', message: 'El correo o la contraseña son incorrectos.' },
  'auth/weak-password': { field: 'password', message: 'La contraseña debe tener al menos 6 caracteres.' },
  'auth/too-many-requests': {
    field: 'general',
    message: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
  },
  'auth/network-request-failed': {
    field: 'general',
    message: 'No hay conexión a internet. Revisa tu conexión e inténtalo de nuevo.',
  },
};

const DEFAULT_ERROR = { field: 'general', message: 'Ocurrió un error inesperado. Inténtalo de nuevo.' };

// recibe el código de Firebase (por ejemplo 'auth/invalid-email') y devuelve { field, message }
export function getAuthErrorMessage(code) {
  return AUTH_ERRORS[code] ?? DEFAULT_ERROR;
}
