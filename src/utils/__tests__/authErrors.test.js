// AI-assisted: see docs/AI_LOG.md #4
import { getAuthErrorMessage } from '../authErrors';

describe('getAuthErrorMessage', () => {
  test('credenciales inválidas se muestran en el campo contraseña', () => {
    expect(getAuthErrorMessage('auth/invalid-credential')).toEqual({
      field: 'password',
      message: 'El correo o la contraseña son incorrectos.',
    });
  });

  test('correo inválido se muestra en el campo correo', () => {
    expect(getAuthErrorMessage('auth/invalid-email').field).toBe('email');
  });

  test('error de red se muestra como error general', () => {
    expect(getAuthErrorMessage('auth/network-request-failed').field).toBe('general');
  });

  test('un código desconocido devuelve un mensaje genérico en español', () => {
    expect(getAuthErrorMessage('auth/algo-raro')).toEqual({
      field: 'general',
      message: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
    });
  });
});
