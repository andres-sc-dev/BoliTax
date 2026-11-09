// AI-assisted: see docs/AI_LOG.md #4
// Validaciones puras de formularios. Cada función devuelve null si el valor es válido
// o un mensaje de error en español. En la Fase B se agregan las del registro.

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
