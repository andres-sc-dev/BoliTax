// AI-assisted: see docs/AI_LOG.md #18
import { translate, TRANSLATIONS } from '../translations';

describe('translate', () => {
  test('devuelve el texto en el idioma pedido', () => {
    expect(translate('es', 'drawer.home')).toBe('Inicio');
    expect(translate('en', 'drawer.home')).toBe('Home');
  });

  test('si falta en inglés usa el español', () => {
    const dictionary = { es: { 'x.only': 'Solo español' }, en: {} };
    expect(translate('en', 'x.only', {}, dictionary)).toBe('Solo español');
  });

  test('si falta en ambos idiomas devuelve la clave', () => {
    expect(translate('en', 'clave.inexistente')).toBe('clave.inexistente');
  });

  test('un idioma no soportado cae al español', () => {
    expect(translate('fr', 'drawer.history')).toBe('Historial');
  });

  test('reemplaza los valores {{nombre}}', () => {
    expect(translate('es', 'profile.passengers', { count: 4 })).toBe('4 pasajeros');
    expect(translate('en', 'profile.doc.expires', { date: '01/01/2027' })).toBe('Expires: 01/01/2027');
  });

  test('deja la marca si falta el valor', () => {
    expect(translate('es', 'profile.passengers')).toBe('{{count}} pasajeros');
  });

  test('español e inglés tienen las mismas claves', () => {
    expect(Object.keys(TRANSLATIONS.en).sort()).toEqual(Object.keys(TRANSLATIONS.es).sort());
  });
});
