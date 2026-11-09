// AI-assisted: see docs/AI_LOG.md #4
import { validateEmail, validateRequired } from '../validators';

describe('validateRequired', () => {
  test('rechaza null, undefined, vacío y solo espacios', () => {
    expect(validateRequired(null)).not.toBeNull();
    expect(validateRequired(undefined)).not.toBeNull();
    expect(validateRequired('')).not.toBeNull();
    expect(validateRequired('   ')).not.toBeNull();
  });

  test('acepta un valor con contenido', () => {
    expect(validateRequired('Ana')).toBeNull();
  });
});

describe('validateEmail', () => {
  test('acepta un correo con @ y dominio', () => {
    expect(validateEmail('conductor@bolitax.com')).toBeNull();
  });

  test('rechaza correos sin @, sin dominio o sin extensión', () => {
    expect(validateEmail('conductorbolitax.com')).not.toBeNull();
    expect(validateEmail('conductor@')).not.toBeNull();
    expect(validateEmail('conductor@bolitax')).not.toBeNull();
  });

  test('rechaza el correo vacío con el mensaje de obligatorio', () => {
    expect(validateEmail('')).toBe('Este campo es obligatorio.');
  });
});
